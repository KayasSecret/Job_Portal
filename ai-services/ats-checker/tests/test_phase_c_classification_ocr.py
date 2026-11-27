"""Phase C tests for 5-way PDF document classification and optional in-memory OCR safeguards."""

import io
import pytest
from pypdf import PdfReader, PdfWriter

from app.config import Settings
from app.services import ocr_service
from app.services.pdf_parser import parse_pdf_resume
from app.utils.text_normalizer import ResumeParseError
from tests.test_parsers import build_minimal_pdf_bytes


def build_scanned_image_pdf_bytes() -> bytes:
    """Create a 1-page PDF containing an embedded 10x10 RGB /XObject /Image and zero text operators."""
    raw_rgb = b"\xff\x00\x00" * 100  # 10x10 red pixels
    content_stream = b"q 200 0 0 200 50 500 cm /Im1 Do Q"

    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n",
        f"4 0 obj\n<< /Length {len(content_stream)} >>\nstream\n".encode("latin-1")
        + content_stream
        + b"\nendstream\nendobj\n",
        f"5 0 obj\n<< /Type /XObject /Subtype /Image /Width 10 /Height 10 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length {len(raw_rgb)} >>\nstream\n".encode(
            "latin-1"
        )
        + raw_rgb
        + b"\nendstream\nendobj\n",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)
    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode("latin-1"))
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode(
            "latin-1"
        )
    )
    return bytes(pdf)


def build_hybrid_text_and_image_pdf_bytes() -> bytes:
    """Create a 2-page PDF where Page 1 has selectable text and Page 2 is an image-only scanned page."""
    page1_bytes = build_minimal_pdf_bytes(
        [
            "Vikram Patel | vikram@example.com | +91 9876543210",
            "SKILLS",
            "Python, FastAPI, React.js, PostgreSQL, Docker, AWS",
            "WORK EXPERIENCE",
            "- Engineered distributed APIs serving 15000+ daily active users.",
        ]
    )
    page2_bytes = build_scanned_image_pdf_bytes()

    writer = PdfWriter()
    r1 = PdfReader(io.BytesIO(page1_bytes))
    r2 = PdfReader(io.BytesIO(page2_bytes))
    writer.add_page(r1.pages[0])
    writer.add_page(r2.pages[0])

    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def build_encrypted_pdf_bytes() -> bytes:
    """Create an AES/RC4 password-protected PDF in memory."""
    base_pdf = build_minimal_pdf_bytes(["Secret Resume Content"])
    reader = PdfReader(io.BytesIO(base_pdf))
    writer = PdfWriter()
    writer.add_page(reader.pages[0])
    writer.encrypt("StrongPassword2026!")
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def test_classification_1_text_based_pdf():
    pdf_bytes = build_minimal_pdf_bytes(
        [
            "Kiran Rao | kiran@example.com | +91 9876543210",
            "SKILLS",
            "Python, FastAPI, Docker, MongoDB",
            "WORK EXPERIENCE",
            "- Built high-availability services reducing error rates by 30%.",
        ]
    )
    parsed = parse_pdf_resume(pdf_bytes, "text_based.pdf")
    assert parsed.document_classification == "text_based_pdf"
    assert parsed.ocr_attempted is False
    assert parsed.extraction_warnings == []


def test_classification_2_scanned_image_pdf_when_ocr_unavailable():
    scanned_bytes = build_scanned_image_pdf_bytes()
    cfg = Settings(ENABLE_OCR=False)
    with pytest.raises(ResumeParseError) as exc_info:
        parse_pdf_resume(scanned_bytes, "scanned.pdf", settings=cfg)

    assert exc_info.value.status_code == 422
    assert exc_info.value.document_classification == "scanned_image_pdf"
    assert exc_info.value.ocr_available is False
    assert "scanned image-only PDF" in exc_info.value.message


def test_classification_2_scanned_image_pdf_with_in_memory_ocr_pipeline(monkeypatch):
    """
    Verify that when OCR runtime is available, pypdfium2 renders the scanned PDF page to a PIL image
    in memory and extracts text via OCR with an explicit ATS warning.
    """
    scanned_bytes = build_scanned_image_pdf_bytes()

    monkeypatch.setattr(
        ocr_service,
        "get_ocr_runtime_status",
        lambda settings=None: ocr_service.OCRRuntimeStatus(
            enabled_in_config=True,
            binary_available=True,
            binary_path="mock_tesseract",
            reason="Verified",
        ),
    )
    # Also patch the reference imported inside pdf_parser
    from app.services import pdf_parser

    monkeypatch.setattr(
        pdf_parser,
        "get_ocr_runtime_status",
        lambda settings=None: ocr_service.OCRRuntimeStatus(
            enabled_in_config=True,
            binary_available=True,
            binary_path="mock_tesseract",
            reason="Verified",
        ),
    )

    def fake_image_to_string(pil_image, timeout=10):
        # Verify pypdfium2 genuinely rendered a grayscale PIL Image in memory
        assert pil_image.mode == "L"
        assert pil_image.width > 0 and pil_image.height > 0
        return (
            "Neha Verma\nneha@example.com | +91 9876543210\n"
            "SKILLS\nPython, FastAPI, React.js, Docker\n"
            "PROJECTS\n• Developed an automated medical imaging pipeline processing 1200+ scans."
        )

    monkeypatch.setattr(ocr_service.pytesseract, "image_to_string", fake_image_to_string)

    parsed = parse_pdf_resume(scanned_bytes, "scanned_ocr.pdf")
    assert parsed.document_classification == "scanned_image_pdf"
    assert parsed.extraction_method == "ocr_tesseract"
    assert parsed.ocr_attempted is True
    assert "Skills" in parsed.detected_sections
    assert "Projects" in parsed.detected_sections
    assert any("scanned image-only PDF and parsed via OCR" in w for w in parsed.extraction_warnings)


def test_classification_3_hybrid_pdf_without_ocr_extracts_text_pages_with_warning():
    hybrid_bytes = build_hybrid_text_and_image_pdf_bytes()
    cfg = Settings(ENABLE_OCR=False)
    parsed = parse_pdf_resume(hybrid_bytes, "hybrid.pdf", settings=cfg)

    assert parsed.document_classification == "hybrid_pdf"
    assert parsed.extraction_method == "hybrid_partial_text"
    assert "Skills" in parsed.detected_sections
    assert "Work Experience" in parsed.detected_sections
    assert any("Hybrid PDF detected" in w and "page(s) 2" in w for w in parsed.extraction_warnings)


def test_classification_4_corrupted_pdf():
    with pytest.raises(ResumeParseError) as exc_info:
        parse_pdf_resume(b"%PDF-1.4 broken binary payload without xref table", "corrupted.pdf")
    assert exc_info.value.status_code == 422
    assert exc_info.value.document_classification == "corrupted_pdf"


def test_classification_5_encrypted_pdf():
    enc_bytes = build_encrypted_pdf_bytes()
    with pytest.raises(ResumeParseError) as exc_info:
        parse_pdf_resume(enc_bytes, "encrypted.pdf")
    assert exc_info.value.status_code == 422
    assert exc_info.value.document_classification == "encrypted_pdf"
    assert "password-protected" in exc_info.value.message or "encrypted" in exc_info.value.message

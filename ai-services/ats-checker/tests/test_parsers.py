"""Unit tests for Phase 3 in-memory PDF/DOCX parsers, security guards, and section segmentation."""

import io
import zipfile
import pytest
from docx import Document

from app.services.docx_parser import parse_docx_resume
from app.services.pdf_parser import parse_pdf_resume
from app.utils.text_normalizer import ResumeParseError


def build_minimal_pdf_bytes(text_lines: list[str]) -> bytes:
    """Create a valid in-memory single-page PDF containing selectable text streams."""
    escaped_ops = ["BT", "/F1 11 Tf", "50 760 Td", "14 TL"]
    for idx, line in enumerate(text_lines):
        safe = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        if idx == 0:
            escaped_ops.append(f"({safe}) Tj")
        else:
            escaped_ops.append(f"T* ({safe}) Tj")
    escaped_ops.append("ET")
    stream_data = "\n".join(escaped_ops).encode("latin-1")

    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        f"4 0 obj\n<< /Length {len(stream_data)} >>\nstream\n".encode("latin-1")
        + stream_data
        + b"\nendstream\nendobj\n",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))

    pdf.extend(
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode(
            "latin-1"
        )
    )
    return bytes(pdf)


def build_blank_pdf_bytes() -> bytes:
    """Create a valid PDF with 1 page and zero text operators (simulates scanned image-only PDF)."""
    return build_minimal_pdf_bytes([])


def build_sample_docx_bytes() -> bytes:
    """Create a realistic multi-section DOCX resume in memory."""
    doc = Document()
    doc.add_paragraph("Aarav Sharma")
    doc.add_paragraph("aarav.sharma@example.com | +91 9876543210 | linkedin.com/in/aaravsharma | github.com/aaravsharma")
    doc.add_paragraph("Professional Summary")
    doc.add_paragraph(
        "Full Stack Software Engineer with 3+ years of experience building scalable React, Node.js, and Python microservices."
    )
    doc.add_paragraph("Technical Skills")
    doc.add_paragraph("JavaScript, TypeScript, React.js, Node.js, Express.js, Python, FastAPI, MongoDB, Docker, AWS")
    doc.add_paragraph("Work Experience")
    doc.add_paragraph("Software Engineer - HireNest Technologies (2023 - Present)")
    doc.add_paragraph("• Engineered RESTful APIs in Node.js and FastAPI serving 50,000+ monthly active users.")
    doc.add_paragraph("• Reduced database query latency by 38% by optimizing MongoDB compound indexes.")
    doc.add_paragraph("Education")
    doc.add_paragraph("B.Tech in Computer Science - National Institute of Technology (2019 - 2023)")
    doc.add_paragraph("Projects")
    doc.add_paragraph("• Built an AI-powered ATS Resume Analyzer processing PDF and DOCX files in memory.")

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


def test_parse_valid_pdf_resume_extracts_sections_and_bullets():
    lines = [
        "Priya Nair",
        "priya.nair@example.com | +1 415-555-0192 | linkedin.com/in/priyanair",
        "PROFESSIONAL SUMMARY",
        "Backend Engineer experienced in Python, FastAPI, PostgreSQL, and Docker.",
        "SKILLS",
        "Python, FastAPI, Node.js, MongoDB, Docker, Kubernetes, Git",
        "WORK EXPERIENCE",
        "- Developed high-throughput microservices handling 1200+ requests per second.",
        "- Improved automated test coverage from 55% to 92% using Pytest.",
        "EDUCATION",
        "B.S. in Computer Science, University of California",
    ]
    pdf_bytes = build_minimal_pdf_bytes(lines)
    parsed = parse_pdf_resume(pdf_bytes, "priya_resume.pdf")

    assert parsed.file_type == "PDF"
    assert parsed.word_count >= 35
    assert "Professional Summary" in parsed.detected_sections
    assert "Skills" in parsed.detected_sections
    assert "Work Experience" in parsed.detected_sections
    assert "Education" in parsed.detected_sections
    assert "Projects" in parsed.missing_sections
    assert len(parsed.bullet_lines) >= 2


def test_parse_blank_image_only_pdf_raises_422():
    blank_pdf = build_blank_pdf_bytes()
    with pytest.raises(ResumeParseError) as exc_info:
        parse_pdf_resume(blank_pdf, "scanned.pdf")
    assert exc_info.value.status_code == 422
    assert "scanned image-only PDF" in exc_info.value.message


def test_parse_corrupted_pdf_raises_422():
    with pytest.raises(ResumeParseError) as exc_info:
        parse_pdf_resume(b"%PDF-1.4 corrupted stream bytes without xref", "broken.pdf")
    assert exc_info.value.status_code == 422


def test_parse_valid_docx_resume_extracts_sections_and_bullets():
    docx_bytes = build_sample_docx_bytes()
    parsed = parse_docx_resume(docx_bytes, "aarav_resume.docx")

    assert parsed.file_type == "DOCX"
    assert parsed.word_count >= 50
    for expected in ("Professional Summary", "Skills", "Work Experience", "Education", "Projects"):
        assert expected in parsed.detected_sections
    assert len(parsed.missing_sections) == 0
    assert len(parsed.bullet_lines) >= 3


def test_parse_fake_zip_renamed_to_docx_is_rejected():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("random.txt", "This is a regular zip file, not a Word document.")
    with pytest.raises(ResumeParseError) as exc_info:
        parse_docx_resume(buf.getvalue(), "fake.docx")
    assert exc_info.value.status_code == 400
    assert "ZIP archive rather than a valid Word" in exc_info.value.message


def test_parse_docx_with_macro_payload_is_rejected():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("[Content_Types].xml", "<Types></Types>")
        zf.writestr("word/document.xml", "<w:document></w:document>")
        zf.writestr("word/vbaProject.bin", "MALICIOUS_MACRO")
    with pytest.raises(ResumeParseError) as exc_info:
        parse_docx_resume(buf.getvalue(), "macro.docx")
    assert exc_info.value.status_code == 400
    assert "Macro-enabled or executable" in exc_info.value.message

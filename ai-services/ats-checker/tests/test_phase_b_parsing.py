"""Phase B tests for PDF kerning de-concatenation, multi-column ordering, wrapped bullets, and DOCX XML bullets."""

import io
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from app.services.docx_parser import parse_docx_resume
from app.services.pdf_parser import parse_pdf_resume
from app.services.resume_analyzer import analyze_resume_structure


def _build_pdf_from_content_stream(stream_ops: list[str]) -> bytes:
    stream_data = "\n".join(stream_ops).encode("latin-1")
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
    pdf.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode("latin-1"))
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode(
            "latin-1"
        )
    )
    return bytes(pdf)


def test_problem_a_kerning_concatenated_pdf_restores_words_bullets_and_verbs():
    """
    Reproduces the exact Problem A defect:
    'DevelopedresponsiveReactinterfacesforacancerinstitutemanagementsystemcoveringappointmentworkflows'
    and verifies words, bullets, action verbs, and quantified metrics are accurately recovered.
    """
    ops = [
        "BT",
        "/F1 11 Tf",
        "50 760 Td",
        "14 TL",
        "[(Aarav)-45(Sharma)] TJ",
        "T* (aarav@example.com | +91 9876543210) Tj",
        "T* (PROJECTS) Tj",
        "T* (\x95 ) Tj [(Developed)-45(responsive)-45(React)-45(interfaces)-45(for)-45(a)-45(cancer)-45(institute)-45(management)-45(system)-45(covering)-45(appointment)-45(workflows)] TJ",
        "T* (\x95 ) Tj [(Built)-45(REST)-45(APIs)-45(serving)-45(500)-45(patients)-45(daily)-45(and)-45(reducing)-45(latency)-45(by)-45(35%)] TJ",
        "ET",
    ]
    pdf_bytes = _build_pdf_from_content_stream(ops)
    parsed = parse_pdf_resume(pdf_bytes, "problem_a_repro.pdf")
    structure = analyze_resume_structure(parsed)

    assert "Aarav Sharma" in parsed.normalized_text
    assert (
        "Developed responsive React interfaces for a cancer institute management system covering appointment workflows"
        in parsed.normalized_text
    )
    assert "Built REST APIs serving 500 patients daily and reducing latency by 35%" in parsed.normalized_text
    assert len(parsed.bullet_lines) == 2
    assert "developed" in structure.action_verbs_found
    assert "built" in structure.action_verbs_found
    assert len(structure.quantified_bullets) >= 1


def test_two_column_pdf_layout_extracts_columns_without_horizontal_interleaving():
    """
    Simulate a 2-column resume where Left Column (x=40) has SKILLS & EDUCATION
    and Right Column (x=260) has WORK EXPERIENCE on the exact same Y coordinates.
    """
    ops = [
        "BT",
        "/F1 11 Tf",
        # Top header
        "1 0 0 1 50 750 Tm (Meera Krishnan | meera@example.com | +91 9876543210) Tj",
        # Row 1: Left column heading at x=40, Right column heading at x=260 (same y=700)
        "1 0 0 1 40 700 Tm (SKILLS) Tj",
        "1 0 0 1 260 700 Tm (WORK EXPERIENCE) Tj",
        # Row 2: y=680
        "1 0 0 1 40 680 Tm (Python, FastAPI, Docker) Tj",
        "1 0 0 1 260 680 Tm (- Engineered cloud microservices serving 10000+ users.) Tj",
        # Row 3: y=660
        "1 0 0 1 40 660 Tm (EDUCATION) Tj",
        "1 0 0 1 260 660 Tm (- Optimized PostgreSQL queries reducing latency by 40%.) Tj",
        # Row 4: y=640
        "1 0 0 1 40 640 Tm (B.Tech Computer Science) Tj",
        "ET",
    ]
    pdf_bytes = _build_pdf_from_content_stream(ops)
    parsed = parse_pdf_resume(pdf_bytes, "two_column_resume.pdf")

    assert "Skills" in parsed.detected_sections
    assert "Education" in parsed.detected_sections
    assert "Work Experience" in parsed.detected_sections
    assert len(parsed.bullet_lines) == 2


def test_wrapped_multiline_pdf_bullets_merge_continuation_lines():
    """
    When a PDF bullet wraps onto a second line where the quantified metric resides,
    the continuation line must merge into the bullet so quantification is detected.
    """
    ops = [
        "BT",
        "/F1 11 Tf",
        "50 750 Td",
        "14 TL",
        "(Rohan Verma | rohan@example.com | +91 9876543210) Tj",
        "T* (WORK EXPERIENCE) Tj",
        "T* (- Architected and deployed distributed event pipelines using Apache Kafka) Tj",
        "T* (and FastAPI reducing end-to-end processing latency by 45% across 20000+ requests.) Tj",
        "ET",
    ]
    pdf_bytes = _build_pdf_from_content_stream(ops)
    parsed = parse_pdf_resume(pdf_bytes, "wrapped_bullets.pdf")
    structure = analyze_resume_structure(parsed)

    assert len(parsed.bullet_lines) == 1
    assert "reducing end-to-end processing latency by 45%" in parsed.bullet_lines[0]
    assert len(structure.quantified_bullets) == 1


def test_docx_extracts_header_contact_and_xml_numpr_bullets():
    """
    Verify that contact details placed inside a Word Document header AND bullets formatted
    via OOXML <w:numPr> on a 'Normal' style paragraph are extracted cleanly.
    """
    doc = Document()
    header = doc.sections[0].header
    header.paragraphs[0].text = "Ananya Gupta | ananya.gupta@example.com | +91 9812345678 | linkedin.com/in/ananyagupta"

    doc.add_paragraph("Projects")
    p1 = doc.add_paragraph("Developed a full-stack telemedicine portal using React.js and Node.js for 500+ patients.")
    # Attach OOXML <w:numPr> to simulate clicking the Word ribbon bullet button on a Normal paragraph
    pPr = p1._p.get_or_add_pPr()
    numPr = OxmlElement("w:numPr")
    numId = OxmlElement("w:numId")
    numId.set(qn("w:val"), "1")
    numPr.append(numId)
    pPr.append(numPr)

    doc.add_paragraph("Education")
    doc.add_paragraph("B.Tech in Information Technology (2021 - 2025)")

    buf = io.BytesIO()
    doc.save(buf)

    parsed = parse_docx_resume(buf.getvalue(), "ananya_header_numpr.docx")
    structure = analyze_resume_structure(parsed)

    assert structure.contact_checks.email is True
    assert structure.contact_checks.phone is True
    assert structure.contact_checks.linkedin is True
    assert len(parsed.bullet_lines) == 1
    assert "Developed a full-stack telemedicine portal" in parsed.bullet_lines[0]

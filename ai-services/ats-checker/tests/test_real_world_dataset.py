"""
Phase E: Comprehensive Real-World Synthetic Dataset & PDF-vs-DOCX Parity Test Suite.
Covers all 11 required document types:
1. Normal text-based PDF
2. PDF with two-column layout
3. PDF with multiple font styles (Helvetica, Helvetica-Bold, Courier)
4. PDF with diverse bullets and date formats
5. PDF with unusual spacing / tight kerning (reproducing glued words)
6. Scanned image-only PDF
7. Hybrid text + image PDF
8. Corrupted PDF
9. Encrypted PDF
10. Valid DOCX (identical content to #1 for PDF-vs-DOCX parity comparison)
11. DOCX with complex formatting (Word header contact, multi-cell tables, OOXML <w:numPr> bullets)
"""

import io
from typing import List
import pytest
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app
from app.services.docx_parser import parse_docx_resume
from app.services.keyword_analyzer import analyze_keywords
from app.services.pdf_parser import parse_pdf_resume
from app.services.resume_analyzer import analyze_resume_structure
from app.services.scoring_engine import compute_ats_scores
from app.utils.text_normalizer import ResumeParseError
from tests.test_parsers import build_minimal_pdf_bytes
from tests.test_phase_b_parsing import _build_pdf_from_content_stream
from tests.test_phase_c_classification_ocr import (
    build_encrypted_pdf_bytes,
    build_hybrid_text_and_image_pdf_bytes,
    build_scanned_image_pdf_bytes,
)

client = TestClient(app)
settings = get_settings()
VALID_HEADERS = {"X-Internal-Service-Token": settings.INTERNAL_SERVICE_SECRET}

CANONICAL_RESUME_LINES: List[str] = [
    "Karthik Subramanian",
    "karthik.subramanian@example.com | +91 9876543210 | linkedin.com/in/karthiksubramanian | github.com/karthiksubramanian | Bengaluru, India",
    "PROFESSIONAL SUMMARY",
    "Full Stack Software Engineer experienced in designing and deploying scalable cloud applications using React.js, Node.js, Python, and FastAPI.",
    "TECHNICAL SKILLS",
    "Python, JavaScript, TypeScript, React.js, Node.js, Express.js, FastAPI, MongoDB, PostgreSQL, Docker, AWS, Git, Pytest",
    "WORK EXPERIENCE",
    "Software Engineer | CloudScale Systems | Jan 2023 - Present",
    "- Engineered distributed REST APIs using FastAPI and PostgreSQL serving 25,000+ daily active users.",
    "- Optimized MongoDB aggregation pipelines reducing average query latency by 42%.",
    "- Automated CI/CD workflows with GitHub Actions and Docker cutting deployment time by 50%.",
    "EDUCATION",
    "B.Tech in Computer Science | National Institute of Technology | 2019 - 2023 | CGPA: 8.9/10",
    "PROJECTS",
    "- Developed responsive React.js interfaces for a hospital appointment management system supporting 1,200+ clinical patients.",
    "- Built an automated resume parsing microservice in Python validating PDF and DOCX documents in memory.",
]

SAMPLE_TARGET_JD = (
    "We are hiring a Full Stack Engineer proficient in Python, FastAPI, React.js, TypeScript, "
    "Node.js, PostgreSQL, MongoDB, Docker, AWS, and Git. Experience with REST APIs and CI/CD is required."
)


def build_canonical_docx_from_lines(lines: List[str]) -> bytes:
    """Construct a standard DOCX containing the exact same canonical lines as CANONICAL_RESUME_LINES."""
    doc = Document()
    for line in lines:
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def build_multi_font_pdf_bytes() -> bytes:
    """Create a PDF declaring 3 distinct Type1 fonts (/F1 Helvetica, /F2 Helvetica-Bold, /F3 Courier) and switching fonts inline."""
    ops = [
        "BT",
        "/F2 13 Tf",
        "50 760 Td",
        "14 TL",
        "(Aditi Deshmukh) Tj",
        "/F1 10 Tf",
        "T* (aditi.deshmukh@example.com | +91 9823456789 | linkedin.com/in/aditideshmukh | Pune, India) Tj",
        "/F2 11 Tf",
        "T* (SKILLS) Tj",
        "/F3 10 Tf",
        "T* (Python, FastAPI, React.js, TypeScript, PostgreSQL, Docker, Kubernetes, AWS) Tj",
        "/F2 11 Tf",
        "T* (WORK EXPERIENCE) Tj",
        "/F1 10 Tf",
        "T* (Backend Engineer - FinTech Labs | Jul 2022 - Present) Tj",
        "T* (- Architected payment settlement microservices in FastAPI processing 50,000+ daily transactions.) Tj",
        "T* (- Reduced infrastructure cost by 28% by containerizing workloads with Docker and Kubernetes.) Tj",
        "/F2 11 Tf",
        "T* (EDUCATION) Tj",
        "/F1 10 Tf",
        "T* (B.E. in Computer Science | 2018 - 2022) Tj",
        "ET",
    ]
    stream_data = "\n".join(ops).encode("latin-1")
    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj\n",
        f"4 0 obj\n<< /Length {len(stream_data)} >>\nstream\n".encode("latin-1")
        + stream_data
        + b"\nendstream\nendobj\n",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
        b"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
        b"7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n",
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


def build_complex_formatted_docx_bytes() -> bytes:
    """
    Create a complex DOCX using:
    - Word Section Header for Name & Contact Info
    - 2-Column Table for Skills & Education
    - OOXML <w:numPr> ribbon bullets for Work Experience & Projects
    """
    doc = Document()
    header = doc.sections[0].header
    header.paragraphs[0].text = (
        "pranav.kulkarni@example.com | +91 9811122233 | linkedin.com/in/pranavkulkarni | github.com/pranavkulkarni | Mumbai, India"
    )

    doc.add_paragraph("Pranav Kulkarni")

    # Table containing Skills and Education
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).paragraphs[0].text = "TECHNICAL SKILLS"
    table.cell(1, 0).paragraphs[0].text = "Python, FastAPI, React.js, Node.js, MongoDB, PostgreSQL, Docker, AWS"
    table.cell(0, 1).paragraphs[0].text = "EDUCATION"
    table.cell(1, 1).paragraphs[0].text = "B.Tech in Computer Engineering (2020 - 2024) | CGPA: 9.0/10"

    doc.add_paragraph("WORK EXPERIENCE")
    doc.add_paragraph("Software Engineer Intern | NextGen Cloud (Jan 2024 - Jun 2024)")

    for bullet_text in (
        "Developed full-stack analytics dashboards using React.js and FastAPI for 3,500+ enterprise users.",
        "Optimized PostgreSQL database indexing reducing report generation latency by 38%.",
        "Automated container builds using Docker and GitHub Actions across 8 microservices.",
    ):
        p = doc.add_paragraph(bullet_text)
        pPr = p._p.get_or_add_pPr()
        numPr = OxmlElement("w:numPr")
        numId = OxmlElement("w:numId")
        numId.set(qn("w:val"), "1")
        numPr.append(numId)
        pPr.append(numPr)

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_1_and_10_pdf_vs_docx_parity_on_identical_resume():
    """
    Document #1 (Normal text-based PDF) vs Document #10 (Valid DOCX) containing identical resume content.
    Verifies parity across extracted text, word count, section detection, bullet count,
    action verbs, skills, contact details, quantified achievements, and final scores.
    """
    pdf_bytes = build_minimal_pdf_bytes(CANONICAL_RESUME_LINES)
    docx_bytes = build_canonical_docx_from_lines(CANONICAL_RESUME_LINES)

    pdf_doc = parse_pdf_resume(pdf_bytes, "canonical_resume.pdf")
    docx_doc = parse_docx_resume(docx_bytes, "canonical_resume.docx")

    pdf_struct = analyze_resume_structure(pdf_doc)
    docx_struct = analyze_resume_structure(docx_doc)

    pdf_kw = analyze_keywords(pdf_doc.normalized_text, SAMPLE_TARGET_JD)
    docx_kw = analyze_keywords(docx_doc.normalized_text, SAMPLE_TARGET_JD)

    pdf_overall, _, _, pdf_match, _, _ = compute_ats_scores(pdf_doc, pdf_struct, pdf_kw)
    docx_overall, _, _, docx_match, _, _ = compute_ats_scores(docx_doc, docx_struct, docx_kw)

    # 1. Extracted text parity
    assert pdf_doc.normalized_text == docx_doc.normalized_text
    # 2. Word count parity
    assert pdf_doc.word_count == docx_doc.word_count
    # 3. Section detection parity
    assert pdf_doc.detected_sections == docx_doc.detected_sections == [
        "Professional Summary",
        "Skills",
        "Work Experience",
        "Education",
        "Projects",
    ]
    # 4. Bullet count parity
    assert len(pdf_doc.bullet_lines) == len(docx_doc.bullet_lines) == 5
    # 5. Action verbs parity
    assert pdf_struct.action_verbs_found == docx_struct.action_verbs_found
    for expected_verb in ("automated", "built", "developed", "engineered", "optimized"):
        assert expected_verb in pdf_struct.action_verbs_found
    # 6. Skills parity
    assert pdf_kw.detected_resume_skills == docx_kw.detected_resume_skills
    assert len(pdf_kw.detected_resume_skills) >= 12
    # 7. Contact details parity
    assert pdf_struct.contact_checks == docx_struct.contact_checks
    assert all(
        [
            pdf_struct.contact_checks.email,
            pdf_struct.contact_checks.phone,
            pdf_struct.contact_checks.linkedin,
            pdf_struct.contact_checks.github_or_portfolio,
            pdf_struct.contact_checks.location,
        ]
    )
    # 8. Quantified achievements parity
    assert len(pdf_struct.quantified_bullets) == len(docx_struct.quantified_bullets) >= 4
    # 9. Final scores parity
    assert pdf_overall == docx_overall >= 88
    assert pdf_match == docx_match >= 90


def test_2_two_column_pdf_layout():
    ops = [
        "BT",
        "/F1 11 Tf",
        "1 0 0 1 50 750 Tm (Meera Krishnan | meera@example.com | +91 9876543210 | Bengaluru) Tj",
        "1 0 0 1 40 700 Tm (SKILLS) Tj",
        "1 0 0 1 260 700 Tm (WORK EXPERIENCE) Tj",
        "1 0 0 1 40 680 Tm (Python, FastAPI, Docker, AWS) Tj",
        "1 0 0 1 260 680 Tm (- Engineered cloud microservices serving 10000+ users.) Tj",
        "1 0 0 1 40 660 Tm (EDUCATION) Tj",
        "1 0 0 1 260 660 Tm (- Optimized PostgreSQL queries reducing latency by 40%.) Tj",
        "1 0 0 1 40 640 Tm (B.Tech Computer Science 2020 - 2024) Tj",
        "ET",
    ]
    doc = parse_pdf_resume(_build_pdf_from_content_stream(ops), "doc2_two_column.pdf")
    struct = analyze_resume_structure(doc)
    assert set(doc.detected_sections) == {"Skills", "Education", "Work Experience"}
    assert len(doc.bullet_lines) == 2
    assert len(struct.quantified_bullets) == 2


def test_3_multi_font_pdf_document():
    doc = parse_pdf_resume(build_multi_font_pdf_bytes(), "doc3_multi_font.pdf")
    struct = analyze_resume_structure(doc)
    kw = analyze_keywords(doc.normalized_text, None)
    assert set(doc.detected_sections) == {"Skills", "Work Experience", "Education"}
    assert struct.contact_checks.email is True
    assert struct.contact_checks.phone is True
    assert len(struct.quantified_bullets) == 2
    assert "FastAPI" in kw.detected_resume_skills
    assert "Kubernetes" in kw.detected_resume_skills


def test_4_pdf_with_diverse_bullets_and_dates():
    lines = [
        "Arjun Nair | arjun.nair@example.com | +91 9876501234",
        "WORK EXPERIENCE",
        "Senior Engineer | Jan 2021 - Present",
        "\x95 Spearheaded migration of legacy monolith to FastAPI microservices for 40,000+ users.",
        "* Automated regression testing using Pytest improving coverage from 48% to 91%.",
        "1. Reduced production deployment failures by 60% through Docker containerization.",
        "EDUCATION",
        "B.Tech Computer Science | Aug 2016 - May 2020",
        "SKILLS",
        "Python, FastAPI, Docker, Pytest, PostgreSQL, Git",
    ]
    doc = parse_pdf_resume(build_minimal_pdf_bytes(lines), "doc4_bullets_dates.pdf")
    struct = analyze_resume_structure(doc)
    assert len(doc.bullet_lines) == 3
    assert len(struct.quantified_bullets) == 3
    assert struct.date_ranges_found >= 2


def test_5_pdf_with_unusual_spacing_and_tight_kerning():
    ops = [
        "BT",
        "/F1 11 Tf",
        "50 760 Td",
        "14 TL",
        "[(Aarav)-45(Sharma)] TJ",
        "T* (aarav@example.com | +91 9876543210) Tj",
        "T* (SKILLS) Tj",
        "T* (React.js, FastAPI, Python, PostgreSQL, Docker) Tj",
        "T* (EDUCATION) Tj",
        "T* (B.Tech Computer Science 2020 - 2024) Tj",
        "T* (PROJECTS) Tj",
        "T* (\x95 ) Tj [(Developed)-45(responsive)-45(React)-45(interfaces)-45(for)-45(a)-45(cancer)-45(institute)-45(management)-45(system)-45(covering)-45(appointment)-45(workflows)] TJ",
        "T* (\x95 ) Tj [(Built)-45(REST)-45(APIs)-45(serving)-45(500)-45(patients)-45(daily)-45(and)-45(reducing)-45(latency)-45(by)-45(35%)] TJ",
        "ET",
    ]
    doc = parse_pdf_resume(_build_pdf_from_content_stream(ops), "doc5_kerning.pdf")
    struct = analyze_resume_structure(doc)
    assert "Developed responsive React interfaces for a cancer institute management system covering appointment workflows" in doc.normalized_text
    assert len(doc.bullet_lines) == 2
    assert len(struct.quantified_bullets) == 1
    assert len(struct.qualitative_impact_bullets) == 1
    assert "developed" in struct.action_verbs_found and "built" in struct.action_verbs_found


def test_6_7_8_9_scanned_hybrid_corrupted_and_encrypted_pdfs():
    cfg_no_ocr = Settings(ENABLE_OCR=False)

    # #6 Scanned image-only PDF
    with pytest.raises(ResumeParseError) as exc_scanned:
        parse_pdf_resume(build_scanned_image_pdf_bytes(), "doc6_scanned.pdf", settings=cfg_no_ocr)
    assert exc_scanned.value.document_classification == "scanned_image_pdf"

    # #7 Hybrid text + image PDF
    hybrid_doc = parse_pdf_resume(build_hybrid_text_and_image_pdf_bytes(), "doc7_hybrid.pdf", settings=cfg_no_ocr)
    assert hybrid_doc.document_classification == "hybrid_pdf"
    assert len(hybrid_doc.extraction_warnings) >= 1

    # #8 Corrupted PDF
    with pytest.raises(ResumeParseError) as exc_corrupt:
        parse_pdf_resume(b"%PDF-1.4 truncated corrupted stream", "doc8_corrupted.pdf", settings=cfg_no_ocr)
    assert exc_corrupt.value.document_classification == "corrupted_pdf"

    # #9 Encrypted PDF
    with pytest.raises(ResumeParseError) as exc_enc:
        parse_pdf_resume(build_encrypted_pdf_bytes(), "doc9_encrypted.pdf", settings=cfg_no_ocr)
    assert exc_enc.value.document_classification == "encrypted_pdf"


def test_11_docx_with_complex_formatting():
    docx_bytes = build_complex_formatted_docx_bytes()
    doc = parse_docx_resume(docx_bytes, "doc11_complex.docx")
    struct = analyze_resume_structure(doc)
    kw = analyze_keywords(doc.normalized_text, None)
    overall, _, _, _, _, _ = compute_ats_scores(doc, struct, kw)

    assert struct.contact_checks.email is True
    assert struct.contact_checks.phone is True
    assert struct.contact_checks.linkedin is True
    assert struct.contact_checks.github_or_portfolio is True
    assert set(doc.detected_sections) == {"Skills", "Education", "Work Experience"}
    assert len(doc.bullet_lines) == 3
    assert len(struct.quantified_bullets) >= 3
    assert overall >= 80

"""Phase 4 unit and integration tests for the ATS Intelligence Engine and /api/v1/ats/analyze."""

from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from tests.test_parsers import (
    build_blank_pdf_bytes,
    build_minimal_pdf_bytes,
    build_sample_docx_bytes,
)

client = TestClient(app)
settings = get_settings()
VALID_HEADERS = {"X-Internal-Service-Token": settings.INTERNAL_SERVICE_SECRET}


def test_full_docx_analysis_without_job_description():
    """When no JD is provided, overall_score is computed and job_match_score is strictly None."""
    docx_bytes = build_sample_docx_bytes()
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={
            "resume_file": (
                "aarav_sharma_resume.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["has_job_description"] is False
    assert data["job_match_score"] is None
    assert data["job_match_label"] is None
    assert 65 <= data["overall_score"] <= 100

    # Verify all 5 core sections were detected
    for sec in ("Professional Summary", "Skills", "Work Experience", "Education", "Projects"):
        assert sec in data["detected_sections"]
    assert data["missing_sections"] == []

    # Verify contact checks
    assert data["contact_checks"]["email"] is True
    assert data["contact_checks"]["phone"] is True
    assert data["contact_checks"]["linkedin"] is True
    assert data["contact_checks"]["github_or_portfolio"] is True

    # Verify detected canonical skills via spaCy PhraseMatcher
    detected_skills = data["keyword_analysis"]["detected_resume_skills"]
    for skill in ("React.js", "Node.js", "Python", "FastAPI", "MongoDB", "Docker", "AWS"):
        assert skill in detected_skills


def test_full_docx_analysis_with_job_description_computes_separate_match_score():
    """When a JD is provided, both overall_score and job_match_score are returned with matched/missing keywords."""
    docx_bytes = build_sample_docx_bytes()
    jd_text = (
        "We are hiring a Senior Full Stack Engineer skilled in React.js, TypeScript, Node.js, "
        "Python, FastAPI, MongoDB, Docker, AWS, Kubernetes, and GraphQL. "
        "Experience building microservices and CI/CD pipelines is required."
    )
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={
            "resume_file": (
                "aarav_sharma_resume.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
        data={"job_description": jd_text},
    )
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["has_job_description"] is True
    assert data["job_match_score"] is not None
    assert 50 <= data["job_match_score"] <= 100
    assert data["job_match_label"] in ("High Job Alignment", "Moderate Job Alignment", "Low Job Alignment")

    kw = data["keyword_analysis"]
    assert "React.js" in kw["matched_keywords"]
    assert "FastAPI" in kw["matched_keywords"]
    assert "MongoDB" in kw["matched_keywords"]
    # GraphQL is not in the resume and not in an ecosystem family with resume skills -> missing
    assert "GraphQL" in kw["missing_keywords"]
    # Kubernetes is in the Docker DevOps family -> partial match
    assert "Kubernetes" in kw["partial_keywords"] or "Kubernetes" in kw["missing_keywords"]


def test_weak_sparse_pdf_resume_flags_critical_issues_and_recommendations():
    """A sparse resume lacking contact phone, core sections, and metrics receives actionable issues."""
    sparse_pdf = build_minimal_pdf_bytes(
        [
            "John Doe",
            "WORK EXPERIENCE",
            "- Responsible for working on web pages and helping with various tasks.",
            "- Helped with database tables and fixed bugs for the team.",
        ]
    )
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={"resume_file": ("sparse.pdf", sparse_pdf, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["overall_score"] < 55
    assert "Skills" in data["missing_sections"]
    assert "Education" in data["missing_sections"]
    assert data["contact_checks"]["email"] is False
    assert data["contact_checks"]["phone"] is False

    issue_ids = {item["id"] for item in data["issues"]}
    assert "issue_missing_primary_contact" in issue_ids
    assert "issue_low_quantified_impact" in issue_ids
    assert "issue_weak_passive_phrasing" in issue_ids
    assert len(data["recommendations"]) >= 3


def test_endpoint_returns_422_on_scanned_image_only_pdf():
    blank_pdf = build_blank_pdf_bytes()
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={"resume_file": ("scanned_image.pdf", blank_pdf, "application/pdf")},
    )
    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert "scanned image-only PDF" in body["message"]

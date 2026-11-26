"""Phase 2 foundation tests for health check, internal token security, and file header guards."""

from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from tests.test_parsers import build_minimal_pdf_bytes

client = TestClient(app)
settings = get_settings()
VALID_HEADERS = {"X-Internal-Service-Token": settings.INTERNAL_SERVICE_SECRET}


def test_health_endpoint_returns_sanitized_status():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body == {
        "status": "healthy",
        "service": "hirenest-ats-checker",
        "version": "1.0.0",
    }
    assert "INTERNAL_SERVICE_SECRET" not in str(body)


def test_analyze_rejects_missing_internal_token():
    response = client.post(
        "/api/v1/ats/analyze",
        files={"resume_file": ("resume.pdf", b"%PDF-1.4 sample content", "application/pdf")},
    )
    assert response.status_code == 403
    assert response.json()["success"] is False


def test_analyze_rejects_wrong_internal_token():
    response = client.post(
        "/api/v1/ats/analyze",
        headers={"X-Internal-Service-Token": "wrong-token"},
        files={"resume_file": ("resume.pdf", b"%PDF-1.4 sample content", "application/pdf")},
    )
    assert response.status_code == 403
    assert response.json()["success"] is False


def test_analyze_rejects_unsupported_extension():
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={"resume_file": ("resume.txt", b"Plain text resume", "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["message"]


def test_analyze_rejects_fake_pdf_magic_bytes():
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={"resume_file": ("resume.pdf", b"NOT_A_PDF_HEADER", "application/pdf")},
    )
    assert response.status_code == 400
    assert "Invalid PDF file header" in response.json()["message"]


def test_analyze_accepts_valid_pdf_with_valid_token():
    pdf_bytes = build_minimal_pdf_bytes(
        [
            "Rohan Verma",
            "rohan.verma@example.com | +91 9876543210 | linkedin.com/in/rohanverma",
            "SKILLS",
            "Python, FastAPI, React.js, Node.js, MongoDB, Docker",
            "WORK EXPERIENCE",
            "- Engineered scalable microservices serving 25,000+ daily users.",
        ]
    )
    response = client.post(
        "/api/v1/ats/analyze",
        headers=VALID_HEADERS,
        files={"resume_file": ("candidate_resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_description": "Full Stack Engineer with React.js, Node.js, and Python experience."},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["resume_stats"]["file_type"] == "PDF"
    assert body["data"]["has_job_description"] is True
    assert isinstance(body["data"]["overall_score"], int)
    assert isinstance(body["data"]["job_match_score"], int)

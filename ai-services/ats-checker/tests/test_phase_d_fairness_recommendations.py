"""Phase D unit tests for verb morphology, qualitative impact, fresher scoring fairness, and zero fabricated metrics."""

from app.services.keyword_analyzer import analyze_keywords
from app.services.pdf_parser import parse_pdf_resume
from app.services.recommendation_engine import generate_issues_and_recommendations
from app.services.resume_analyzer import analyze_resume_structure
from app.services.scoring_engine import compute_ats_scores
from tests.test_parsers import build_minimal_pdf_bytes


def test_fresher_student_resume_with_projects_and_no_work_experience_is_scored_fairly():
    """
    A fresher/student resume with Education, Skills, and strong Projects (but no Work Experience
    and no Professional Summary) must not be flagged for critical missing Work Experience
    and must receive a fair Section Completeness score (>= 18/20).
    """
    lines = [
        "Divya Menon",
        "divya.menon@example.com | +91 9876543210 | github.com/divyamenon",
        "EDUCATION",
        "B.Tech in Computer Science - Vellore Institute of Technology (2021 - 2025) | CGPA: 9.1/10",
        "TECHNICAL SKILLS",
        "JavaScript, TypeScript, React.js, Node.js, Express.js, Python, FastAPI, MongoDB, PostgreSQL, Docker, Git",
        "PROJECTS",
        "- Developed responsive React interfaces for a cancer institute management system covering appointment workflows and clinical dashboards.",
        "- Engineered a modular backend API using FastAPI and PostgreSQL supporting role-based access control for hospital staff.",
        "- Automated deployment pipelines using GitHub Actions and Docker containers for multi-service testing.",
    ]
    pdf_bytes = build_minimal_pdf_bytes(lines)
    doc = parse_pdf_resume(pdf_bytes, "fresher_resume.pdf")
    structure = analyze_resume_structure(doc)
    keywords = analyze_keywords(doc.normalized_text, None)
    overall_score, _, _, job_match_score, _, cat_scores = compute_ats_scores(doc, structure, keywords)
    issues, recs, _ = generate_issues_and_recommendations(doc, structure, keywords)

    assert structure.is_fresher_or_student_profile is True
    assert cat_scores.section_completeness.score >= 18
    # Email + Phone + GitHub = 13/15 (>= 86%, strong)
    assert cat_scores.contact_checks if hasattr(cat_scores, "contact_checks") else True
    assert cat_scores.contact_info.score >= 13
    # Standalone keyword score without JD must NEVER be 20/20 (100%)
    assert cat_scores.keyword_optimization.score <= 17
    assert job_match_score is None

    # Qualitative impact bullets must be recognized even when bullets don't all contain numbers
    assert len(structure.qualitative_impact_bullets) >= 2
    assert len(structure.quantified_bullets) >= 1  # CGPA: 9.1/10 or bullet metrics
    assert cat_scores.experience_impact.score >= 12
    assert overall_score >= 70

    # Ensure no critical issue for missing Work Experience when Projects is present
    issue_ids = {i.id for i in issues}
    assert "issue_missing_section_work_experience" not in issue_ids


def test_recommendations_never_contain_fabricated_numbers_or_fake_metrics():
    """
    Verify Problem E fix: recommendation examples must preserve the candidate's actual bullet facts
    and use explicit bracketed placeholders ([...]) rather than inventing '35%', '10,000+ daily requests', or '12 REST APIs'.
    """
    lines = [
        "Siddharth Roy",
        "siddharth@example.com | +91 9876543210",
        "EDUCATION",
        "B.E. in Computer Engineering (2020 - 2024)",
        "SKILLS",
        "React.js, JavaScript, HTML5, CSS3",
        "PROJECTS",
        "- Developed responsive React interfaces for a cancer institute management system covering appointment workflows.",
        "- Responsible for building user authentication forms using React.js.",
    ]
    pdf_bytes = build_minimal_pdf_bytes(lines)
    doc = parse_pdf_resume(pdf_bytes, "no_fabrication.pdf")
    structure = analyze_resume_structure(doc)
    keywords = analyze_keywords(doc.normalized_text, None)
    _, recs, _ = generate_issues_and_recommendations(doc, structure, keywords)

    all_examples_text = "\n".join(r.example or "" for r in recs)

    # Must NEVER contain the old hardcoded fabricated claims
    assert "35%" not in all_examples_text
    assert "10,000+ daily requests" not in all_examples_text
    assert "12 REST APIs" not in all_examples_text

    # The quantify recommendation must quote the candidate's actual cancer institute bullet and use bracketed placeholders
    quant_rec = next(r for r in recs if r.id == "rec_quantify_bullets")
    assert "cancer institute management system" in (quant_rec.example or "")
    assert "[" in (quant_rec.example or "") and "]" in (quant_rec.example or "")

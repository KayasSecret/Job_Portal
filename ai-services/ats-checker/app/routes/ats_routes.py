"""FastAPI routes for the HireNest ATS Checker microservice."""

import os
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile, status

from app.config import Settings, get_settings
from app.schemas.ats_schema import (
    ATSAnalysisData,
    ATSAnalysisResponse,
    ResumeStats,
)
from app.services.docx_parser import parse_docx_resume
from app.services.keyword_analyzer import analyze_keywords
from app.services.pdf_parser import parse_pdf_resume
from app.services.recommendation_engine import generate_issues_and_recommendations
from app.services.resume_analyzer import analyze_resume_structure
from app.services.scoring_engine import compute_ats_scores
from app.utils.text_normalizer import ResumeParseError

router = APIRouter(prefix="/api/v1/ats", tags=["ATS Checker"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}


def verify_internal_service_token(
    x_internal_service_token: Optional[str] = Header(default=None, alias="X-Internal-Service-Token"),
    settings: Settings = Depends(get_settings),
) -> None:
    """Verify the shared secret token sent by the Node.js Express backend."""
    expected = settings.INTERNAL_SERVICE_SECRET
    if not x_internal_service_token or not secrets.compare_digest(
        x_internal_service_token.encode("utf-8"),
        expected.encode("utf-8"),
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: invalid or missing internal service token.",
        )


def validate_upload_metadata_and_bytes(
    filename: str,
    content_type: Optional[str],
    raw_bytes: bytes,
    settings: Settings,
) -> str:
    """Validate extension, MIME type, non-empty size, 5 MB limit, and magic header bytes."""
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume filename provided.",
        )

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF (.pdf) or Word (.docx) resume.",
        )

    if content_type and content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file content type. Only PDF and DOCX files are accepted.",
        )

    if not raw_bytes or len(raw_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded resume file is empty.",
        )

    if len(raw_bytes) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Resume file exceeds the {settings.MAX_FILE_SIZE_MB} MB size limit.",
        )

    if ext == ".pdf":
        if not raw_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file header. Please upload a genuine PDF document.",
            )
        return "PDF"

    if ext == ".docx":
        if not raw_bytes.startswith(b"PK\x03\x04"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX file header. Please upload a valid .docx Word document.",
            )
        return "DOCX"

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported resume file format.",
    )


@router.post(
    "/analyze",
    response_model=ATSAnalysisResponse,
    dependencies=[Depends(verify_internal_service_token)],
)
async def analyze_resume_endpoint(
    resume_file: UploadFile = File(...),
    job_description: Optional[str] = Form(default=None),
    settings: Settings = Depends(get_settings),
) -> ATSAnalysisResponse:
    """
    Protected internal endpoint that parses a PDF/DOCX resume in memory,
    evaluates ATS Readiness and optional Job Match scores, and returns structured recommendations.
    """
    raw_bytes = await resume_file.read()
    await resume_file.close()

    safe_filename = os.path.basename(resume_file.filename or "resume")
    file_type = validate_upload_metadata_and_bytes(
        filename=safe_filename,
        content_type=resume_file.content_type,
        raw_bytes=raw_bytes,
        settings=settings,
    )

    cleaned_jd = (job_description or "").strip()
    if len(cleaned_jd) > settings.MAX_JOB_DESCRIPTION_CHARS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job description cannot exceed {settings.MAX_JOB_DESCRIPTION_CHARS} characters.",
        )

    try:
        if file_type == "PDF":
            parsed_doc = parse_pdf_resume(raw_bytes, file_name=safe_filename, settings=settings)
        else:
            parsed_doc = parse_docx_resume(raw_bytes, file_name=safe_filename)
    except ResumeParseError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    structure = analyze_resume_structure(parsed_doc)
    keyword_analysis = analyze_keywords(
        resume_text=parsed_doc.normalized_text,
        job_description=cleaned_jd if cleaned_jd else None,
    )

    (
        overall_score,
        score_label,
        score_summary,
        job_match_score,
        job_match_label,
        category_scores,
    ) = compute_ats_scores(
        doc=parsed_doc,
        structure=structure,
        keywords=keyword_analysis,
    )

    issues, recommendations, checklist = generate_issues_and_recommendations(
        doc=parsed_doc,
        structure=structure,
        keywords=keyword_analysis,
    )

    resume_stats = ResumeStats(
        file_name=parsed_doc.file_name,
        file_type=parsed_doc.file_type,
        file_size_kb=parsed_doc.file_size_kb,
        page_or_section_count=parsed_doc.page_or_section_count,
        word_count=parsed_doc.word_count,
        bullet_count=len(parsed_doc.bullet_lines),
        quantified_bullet_count=len(structure.quantified_bullets),
        action_verb_count=len(structure.action_verbs_found),
        document_classification=parsed_doc.document_classification,
        extraction_method=parsed_doc.extraction_method,
        ocr_attempted=parsed_doc.ocr_attempted,
        ocr_available=parsed_doc.ocr_available,
        extraction_warnings=parsed_doc.extraction_warnings,
    )

    analysis_data = ATSAnalysisData(
        overall_score=overall_score,
        score_label=score_label,
        score_summary=score_summary,
        job_match_score=job_match_score,
        job_match_label=job_match_label,
        has_job_description=bool(cleaned_jd),
        category_scores=category_scores,
        contact_checks=structure.contact_checks,
        detected_sections=parsed_doc.detected_sections,
        missing_sections=parsed_doc.missing_sections,
        keyword_analysis=keyword_analysis,
        issues=issues,
        recommendations=recommendations,
        checklist=checklist,
        resume_stats=resume_stats,
    )

    return ATSAnalysisResponse(
        success=True,
        message="Resume ATS analysis completed successfully.",
        data=analysis_data,
    )

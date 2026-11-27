"""Pydantic response and validation schemas for the ATS Checker service."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Sanitized health response without exposing secrets or environment config."""

    status: Literal["healthy"] = "healthy"
    service: str = "hirenest-ats-checker"
    version: str = "1.0.0"


class ContactChecks(BaseModel):
    email: bool = False
    phone: bool = False
    linkedin: bool = False
    github_or_portfolio: bool = False
    location: bool = False


class CategoryScoreItem(BaseModel):
    score: int = Field(..., ge=0)
    max_score: int = Field(..., ge=1)
    percentage: int = Field(..., ge=0, le=100)
    label: str
    status: Literal["strong", "moderate", "needs_work"]
    feedback: str


class CategoryScores(BaseModel):
    contact_info: CategoryScoreItem
    section_completeness: CategoryScoreItem
    keyword_optimization: CategoryScoreItem
    experience_impact: CategoryScoreItem
    formatting_readability: CategoryScoreItem
    content_quality: CategoryScoreItem


class KeywordAnalysis(BaseModel):
    has_job_description: bool = False
    matched_keywords: List[str] = Field(default_factory=list)
    partial_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    detected_resume_skills: List[str] = Field(default_factory=list)
    target_jd_keywords: List[str] = Field(default_factory=list)
    match_percentage: Optional[int] = Field(default=None, ge=0, le=100)


class IssueItem(BaseModel):
    id: str
    severity: Literal["critical", "important", "optional"]
    category: str
    title: str
    explanation: str
    suggestion: str


class RecommendationItem(BaseModel):
    id: str
    priority: Literal["high", "medium", "low"]
    category: str
    title: str
    action: str
    example: Optional[str] = None


class ChecklistItem(BaseModel):
    id: str
    label: str
    passed: bool
    detail: str


class ResumeStats(BaseModel):
    file_name: str
    file_type: Literal["PDF", "DOCX"]
    file_size_kb: float
    page_or_section_count: int
    word_count: int
    bullet_count: int
    quantified_bullet_count: int
    action_verb_count: int
    document_classification: str = "text_based_document"
    extraction_method: str = "native_text"
    ocr_attempted: bool = False
    ocr_available: bool = False
    extraction_warnings: List[str] = Field(default_factory=list)


class ATSAnalysisData(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    score_label: str
    score_summary: str
    job_match_score: Optional[int] = Field(default=None, ge=0, le=100)
    job_match_label: Optional[str] = None
    has_job_description: bool = False
    category_scores: CategoryScores
    contact_checks: ContactChecks
    detected_sections: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    keyword_analysis: KeywordAnalysis
    issues: List[IssueItem] = Field(default_factory=list)
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    checklist: List[ChecklistItem] = Field(default_factory=list)
    resume_stats: ResumeStats


class ATSAnalysisResponse(BaseModel):
    success: bool = True
    message: str = "Resume ATS analysis completed."
    data: ATSAnalysisData

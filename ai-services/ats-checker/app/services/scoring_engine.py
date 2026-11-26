"""Fair, evidence-backed ATS scoring engine with non-overlapping categories and fresher support."""

from typing import Optional, Tuple

from app.schemas.ats_schema import CategoryScoreItem, CategoryScores, KeywordAnalysis
from app.services.resume_analyzer import StructuralAnalysisResult
from app.utils.text_normalizer import ParsedResumeDocument


def _status_for_percentage(pct: int) -> str:
    if pct >= 80:
        return "strong"
    if pct >= 55:
        return "moderate"
    return "needs_work"


def score_label_for_overall(score: int) -> Tuple[str, str]:
    """Return human-readable badge label and executive summary for the overall ATS Readiness score."""
    if score >= 85:
        return (
            "ATS Ready",
            "Your resume has strong machine parseability, clear section structure, concrete technical impact, and well-defined skill coverage.",
        )
    if score >= 70:
        return (
            "Strong Foundation",
            "Your resume parses cleanly and meets core ATS criteria, with targeted opportunities to strengthen quantification or role-specific keywords.",
        )
    if score >= 50:
        return (
            "Needs Optimization",
            "An ATS can extract your basic profile, but missing core headings, sparse technical context, or keyword gaps could lower your ranking.",
        )
    return (
        "High ATS Risk",
        "Critical contact, section, or text-extraction gaps were detected that may prevent automated screening systems from indexing your resume accurately.",
    )


def job_match_label_for_score(match_score: Optional[int]) -> Optional[str]:
    if match_score is None:
        return None
    if match_score >= 80:
        return "High Job Alignment"
    if match_score >= 55:
        return "Moderate Job Alignment"
    return "Low Job Alignment"


def compute_ats_scores(
    doc: ParsedResumeDocument,
    structure: StructuralAnalysisResult,
    keywords: KeywordAnalysis,
) -> Tuple[int, str, str, Optional[int], Optional[str], CategoryScores]:
    """
    Compute two strictly distinct evaluations without duplicate cross-category penalties:
    1. Resume ATS Readiness Score (0-100) across 6 transparent, non-overlapping categories.
    2. Job Match Score (0-100 or None when no Job Description was supplied) based purely on JD alignment.
    """
    # -------------------------------------------------------------------------
    # 1. Contact Information (Max 15 pts)
    # Mandatory ATS identifiers: Email (7 pts) + Phone (5 pts) = 12/15 (80% -> "strong").
    # Optional profile enrichments: LinkedIn (1 pt), GitHub/Portfolio (1 pt), Location (1 pt).
    # -------------------------------------------------------------------------
    c = structure.contact_checks
    contact_pts = 0
    found_channels = []
    missing_mandatory = []
    missing_optional = []

    if c.email:
        contact_pts += 7
        found_channels.append("email")
    else:
        missing_mandatory.append("email address")

    if c.phone:
        contact_pts += 5
        found_channels.append("phone")
    else:
        missing_mandatory.append("phone number")

    if c.linkedin:
        contact_pts += 1
        found_channels.append("LinkedIn")
    else:
        missing_optional.append("LinkedIn URL")

    if c.github_or_portfolio:
        contact_pts += 1
        found_channels.append("GitHub/portfolio")
    else:
        missing_optional.append("GitHub/portfolio link")

    if c.location:
        contact_pts += 1
        found_channels.append("location")

    contact_pct = int(round((contact_pts / 15) * 100))
    if not missing_mandatory and not missing_optional:
        contact_feedback = f"Detected all contact elements ({', '.join(found_channels)})."
    elif not missing_mandatory:
        contact_feedback = (
            f"Core contact channels ({', '.join(found_channels)}) are present. "
            f"Optional additions: {', '.join(missing_optional)}."
        )
    else:
        contact_feedback = (
            f"Missing primary contact field(s): {', '.join(missing_mandatory)}. "
            f"Detected: {', '.join(found_channels) if found_channels else 'none'}."
        )

    # -------------------------------------------------------------------------
    # 2. Section Completeness (Max 20 pts — Fresher & Student Fair)
    # Core pillars:
    # - Hands-on Experience (Work Experience OR Projects): 8 pts
    # - Technical/Domain Skills section: 5 pts
    # - Education section: 5 pts
    # - Depth bonus (both Experience & Projects, OR Summary/Certifications/Achievements): 2 pts
    # -------------------------------------------------------------------------
    sec_pts = 0
    has_hands_on = structure.has_experience_section or structure.has_projects_section
    if has_hands_on:
        sec_pts += 8
    if structure.has_skills_section:
        sec_pts += 5
    if structure.has_education_section:
        sec_pts += 5

    has_bonus_section = (
        (structure.has_experience_section and structure.has_projects_section)
        or structure.has_summary_section
        or ("Certifications" in doc.detected_sections)
        or ("Achievements" in doc.detected_sections)
    )
    if has_bonus_section:
        sec_pts += 2

    sec_pts = min(20, sec_pts)
    sec_pct = int(round((sec_pts / 20) * 100))

    if sec_pts >= 18:
        if structure.is_fresher_or_student_profile:
            sec_feedback = (
                f"Detected {len(doc.detected_sections)} standard sections ({', '.join(doc.detected_sections)}). "
                "Your Projects and Education sections satisfy hands-on experience structure for a student/fresher profile."
            )
        else:
            sec_feedback = f"Detected {len(doc.detected_sections)} standard ATS sections ({', '.join(doc.detected_sections)})."
    else:
        essential_missing = [
            s
            for s in ("Skills", "Education")
            if s in doc.missing_sections
        ]
        if not has_hands_on:
            essential_missing.append("Work Experience or Projects")
        sec_feedback = (
            f"Detected: {', '.join(doc.detected_sections) if doc.detected_sections else 'no standard headings'}. "
            f"Recommended standard heading(s) to add: {', '.join(essential_missing) if essential_missing else ', '.join(doc.missing_sections)}."
        )

    # -------------------------------------------------------------------------
    # 3. Keyword & Skill Coverage (Max 20 pts)
    # Without a JD: measures General Skill Breadth + Contextualization, capped at 17/20 (85%)
    # so it never falsely claims 100% job keyword optimization without a target job description.
    # -------------------------------------------------------------------------
    detected_skill_count = len(keywords.detected_resume_skills)
    exp_and_proj_text = "\n".join(
        doc.sections.get("Work Experience", []) + doc.sections.get("Projects", [])
    ).lower()
    contextualized_skills = [
        sk for sk in keywords.detected_resume_skills if sk.lower() in exp_and_proj_text
    ]

    if keywords.has_job_description and keywords.match_percentage is not None:
        kw_label = "Role Keyword & Skill Coverage"
        breadth_pts = min(6, int(round((min(detected_skill_count, 8) / 8) * 6)))
        jd_pts = int(round((keywords.match_percentage / 100) * 14))
        kw_pts = min(20, breadth_pts + jd_pts)
        kw_feedback = (
            f"Matched {len(keywords.matched_keywords)} exact and {len(keywords.partial_keywords)} partial keywords "
            f"out of {len(keywords.target_jd_keywords)} target job keywords ({keywords.match_percentage}% alignment)."
        )
    else:
        kw_label = "General Skill & Keyword Breadth"
        # Up to 13 pts for 10+ detected skills, plus up to 4 pts for demonstrating skills inside Experience/Project bullets (max 17/20 = 85%)
        base_skill_pts = min(13, int(round((min(detected_skill_count, 10) / 10) * 13)))
        context_pts = min(4, len(contextualized_skills))
        kw_pts = min(17, base_skill_pts + context_pts)
        kw_feedback = (
            f"Extracted {detected_skill_count} canonical skills ({len(contextualized_skills)} demonstrated inside experience/project bullets). "
            "Standalone skill score is capped at 17/20 (85%) when no target Job Description is provided."
        )
    kw_pct = int(round((kw_pts / 20) * 100))

    # -------------------------------------------------------------------------
    # 4. Experience & Project Impact (Max 20 pts)
    # Recognizes both Quantified Achievements AND Qualitative Technical Impact bullets.
    # Does NOT assume every bullet must contain a number.
    # -------------------------------------------------------------------------
    quant_count = len(structure.quantified_bullets)
    qual_impact_count = len(structure.qualitative_impact_bullets)
    meaningful_bullets = quant_count + qual_impact_count
    total_bullets = len(doc.bullet_lines)

    # Up to 13 pts for meaningful technical/project impact bullets (quantified or qualitative)
    if meaningful_bullets >= 4:
        scope_pts = 13
    elif meaningful_bullets == 3:
        scope_pts = 11
    elif meaningful_bullets == 2:
        scope_pts = 9
    elif meaningful_bullets == 1:
        scope_pts = 6
    elif total_bullets >= 2:
        scope_pts = 4
    else:
        scope_pts = 0

    # Up to 7 pts for measurable quantification (1 quantified bullet = 3 pts, 2 = 5 pts, 3+ = 7 pts)
    if quant_count >= 3:
        quant_pts = 7
    elif quant_count == 2:
        quant_pts = 5
    elif quant_count == 1:
        quant_pts = 3
    else:
        quant_pts = 0

    exp_pts = min(20, scope_pts + quant_pts)
    exp_pct = int(round((exp_pts / 20) * 100))
    exp_feedback = (
        f"Identified {quant_count} quantified metric bullet(s) and {qual_impact_count} qualitative technical-outcome bullet(s) "
        f"across {total_bullets} total bullet point(s)."
    )

    # -------------------------------------------------------------------------
    # 5. ATS Document Readability & Parseability (Max 15 pts)
    # Evaluates native text layer, word count balance, bullet readability, and chronology.
    # -------------------------------------------------------------------------
    fmt_pts = 0
    if doc.document_classification in ("text_based_pdf", "word_docx", "text_based_document"):
        fmt_pts += 6
    elif doc.document_classification == "hybrid_pdf":
        fmt_pts += 3
    else:
        fmt_pts += 2

    if 150 <= doc.word_count <= 1100:
        fmt_pts += 4
    elif 90 <= doc.word_count < 150 or 1100 < doc.word_count <= 1400:
        fmt_pts += 2
    else:
        fmt_pts += 1

    if total_bullets >= 2 and structure.long_bullets_count == 0:
        fmt_pts += 3
    elif total_bullets >= 1:
        fmt_pts += 2

    if structure.date_ranges_found >= 1:
        fmt_pts += 2

    fmt_pts = min(15, fmt_pts)
    fmt_pct = int(round((fmt_pts / 15) * 100))
    fmt_feedback = (
        f"Classification: {doc.document_classification} ({doc.extraction_method}). "
        f"Extracted {doc.word_count} words, {total_bullets} bullet(s), and {structure.date_ranges_found} date indicator(s)."
    )

    # -------------------------------------------------------------------------
    # 6. Writing & Action Verb Quality (Max 10 pts)
    # Scored exclusively here (no duplicate action-verb deduction in other categories).
    # -------------------------------------------------------------------------
    verb_count = len(structure.action_verbs_found)
    weak_count = len(structure.weak_phrases_found)

    if verb_count >= 5:
        verb_quality_pts = 5
    elif verb_count >= 3:
        verb_quality_pts = 4
    elif verb_count >= 1:
        verb_quality_pts = 2
    else:
        verb_quality_pts = 0

    cliche_free_pts = max(0, 5 - (weak_count * 2))
    qual_pts = max(1, min(10, verb_quality_pts + cliche_free_pts))
    qual_pct = int(round((qual_pts / 10) * 100))

    if weak_count == 0:
        qual_feedback = (
            f"Detected {verb_count} distinct strong action verb(s) ({', '.join(structure.action_verbs_found[:6]) if structure.action_verbs_found else 'none'}) "
            "with zero passive filler clichés."
        )
    else:
        qual_feedback = (
            f"Detected {verb_count} strong action verb(s), but found {weak_count} passive phrase(s) "
            f"({', '.join(structure.weak_phrases_found[:3])})."
        )

    category_scores = CategoryScores(
        contact_info=CategoryScoreItem(
            score=contact_pts,
            max_score=15,
            percentage=contact_pct,
            label="Contact Information",
            status=_status_for_percentage(contact_pct),
            feedback=contact_feedback,
        ),
        section_completeness=CategoryScoreItem(
            score=sec_pts,
            max_score=20,
            percentage=sec_pct,
            label="Section Completeness",
            status=_status_for_percentage(sec_pct),
            feedback=sec_feedback,
        ),
        keyword_optimization=CategoryScoreItem(
            score=kw_pts,
            max_score=20,
            percentage=kw_pct,
            label=kw_label,
            status=_status_for_percentage(kw_pct),
            feedback=kw_feedback,
        ),
        experience_impact=CategoryScoreItem(
            score=exp_pts,
            max_score=20,
            percentage=exp_pct,
            label="Experience & Project Impact",
            status=_status_for_percentage(exp_pct),
            feedback=exp_feedback,
        ),
        formatting_readability=CategoryScoreItem(
            score=fmt_pts,
            max_score=15,
            percentage=fmt_pct,
            label="ATS Document Readability",
            status=_status_for_percentage(fmt_pct),
            feedback=fmt_feedback,
        ),
        content_quality=CategoryScoreItem(
            score=qual_pts,
            max_score=10,
            percentage=qual_pct,
            label="Writing & Action Verb Quality",
            status=_status_for_percentage(qual_pct),
            feedback=qual_feedback,
        ),
    )

    overall_score = max(
        0,
        min(
            100,
            contact_pts + sec_pts + kw_pts + exp_pts + fmt_pts + qual_pts,
        ),
    )
    score_label, score_summary = score_label_for_overall(overall_score)

    # -------------------------------------------------------------------------
    # Separate Job Match Score (0-100 or None)
    # Strictly evaluates alignment with the target Job Description without mixing in formatting points.
    # -------------------------------------------------------------------------
    job_match_score: Optional[int] = None
    if keywords.has_job_description and keywords.match_percentage is not None:
        matched_in_context = sum(
            1 for kw in keywords.matched_keywords if kw.lower() in exp_and_proj_text
        )
        context_bonus = (
            min(8, int(round((matched_in_context / max(1, len(keywords.matched_keywords))) * 8)))
            if keywords.matched_keywords
            else 0
        )
        job_match_score = max(0, min(100, keywords.match_percentage + context_bonus))

    job_match_label = job_match_label_for_score(job_match_score)

    return (
        overall_score,
        score_label,
        score_summary,
        job_match_score,
        job_match_label,
        category_scores,
    )

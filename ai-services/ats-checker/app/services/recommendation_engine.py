"""Fact-preserving issue detector, non-fabricated recommendation generator, and ATS readiness checklist."""

from typing import List, Tuple

from app.schemas.ats_schema import (
    ChecklistItem,
    IssueItem,
    KeywordAnalysis,
    RecommendationItem,
)
from app.services.resume_analyzer import StructuralAnalysisResult
from app.utils.text_normalizer import ParsedResumeDocument


def _build_fact_preserving_bullet_template(original_bullet: str) -> str:
    """
    Create a rewrite suggestion that preserves the candidate's exact original statement
    and appends clearly labeled bracketed placeholders ([...]) rather than inventing fake numbers.
    """
    cleaned = original_bullet.strip().rstrip(".")
    return (
        f"[Template using your original bullet — replace bracketed placeholders only with your real metrics]:\n"
        f"• {cleaned}, supporting [number of users / records / modules] and improving [specific workflow or performance metric] by [actual % or outcome]."
    )


def generate_issues_and_recommendations(
    doc: ParsedResumeDocument,
    structure: StructuralAnalysisResult,
    keywords: KeywordAnalysis,
) -> Tuple[List[IssueItem], List[RecommendationItem], List[ChecklistItem]]:
    """
    Generate evidence-backed issues, prioritized non-fabricated recommendations, and a pass/fail ATS checklist.
    Never invents performance percentages, user counts, revenue, or skills not present in the resume.
    """
    issues: List[IssueItem] = []
    recommendations: List[RecommendationItem] = []
    checklist: List[ChecklistItem] = []

    # 0. Surface any PDF classification / hybrid / OCR extraction warnings first
    for idx, warn_msg in enumerate(doc.extraction_warnings):
        issues.append(
            IssueItem(
                id=f"issue_extraction_warning_{idx + 1}",
                severity="important",
                category="ATS Document Readability",
                title="Document Text Layer / Image Page Warning",
                explanation=warn_msg,
                suggestion="Export your resume directly from Microsoft Word, Google Docs, or LaTeX as a standard selectable-text PDF or upload a .docx file.",
            )
        )

    c = structure.contact_checks

    # 1. Contact checks (Mandatory vs Optional)
    if not c.email or not c.phone:
        missing_parts = []
        if not c.email:
            missing_parts.append("email address")
        if not c.phone:
            missing_parts.append("phone number")
        issues.append(
            IssueItem(
                id="issue_missing_primary_contact",
                severity="critical",
                category="Contact Information",
                title=f"Missing {' and '.join(missing_parts)} in extracted text",
                explanation="ATS parsers require a standard email and 10+ digit phone number in selectable text to create or update a candidate record.",
                suggestion="Place your email and phone number in plain selectable text at the top of page 1.",
            )
        )

    if not c.linkedin or not c.github_or_portfolio:
        issues.append(
            IssueItem(
                id="issue_missing_profile_links",
                severity="optional",
                category="Contact Information",
                title="Optional LinkedIn or GitHub/Portfolio URL not detected",
                explanation="Including visible text URLs (e.g., linkedin.com/in/[your-handle] or github.com/[your-username]) helps recruiters verify your projects and background quickly.",
                suggestion="Write out the visible text URL rather than embedding links behind icons or anchor labels.",
            )
        )

    # 2. Missing Core Sections (Fresher-fair: Projects satisfies hands-on experience if Work Experience is absent)
    has_hands_on = structure.has_experience_section or structure.has_projects_section

    if not has_hands_on:
        issues.append(
            IssueItem(
                id="issue_missing_section_experience_or_projects",
                severity="critical",
                category="Section Completeness",
                title="Neither 'Work Experience' nor 'Projects' section heading was detected",
                explanation="ATS parsers look for a dedicated 'Work Experience' or 'Projects' section to evaluate your hands-on technical work.",
                suggestion="Add a standalone heading titled 'Work Experience' (for internships/jobs) or 'Projects' (for academic/personal builds).",
            )
        )
        recommendations.append(
            RecommendationItem(
                id="rec_add_section_experience_or_projects",
                priority="high",
                category="Section Structure",
                title="Add a clearly labeled 'Work Experience' or 'Projects' section",
                action="Insert a standalone section heading on its own line so ATS parsers index your hands-on work accurately.",
                example="[Template]:\nPROJECTS (or WORK EXPERIENCE)\n• [Action Verb] [system/feature you built] using [technologies you used] to [actual purpose or outcome].",
            )
        )

    for required_sec in ("Skills", "Education"):
        if required_sec in doc.missing_sections:
            issues.append(
                IssueItem(
                    id=f"issue_missing_section_{required_sec.lower()}",
                    severity="critical",
                    category="Section Completeness",
                    title=f"Standard '{required_sec}' section heading not detected",
                    explanation=f"ATS parsers rely on a recognizable standalone '{required_sec}' heading to categorize your qualifications.",
                    suggestion=f"Add a dedicated '{required_sec}' heading on its own line using standard terminology.",
                )
            )
            recommendations.append(
                RecommendationItem(
                    id=f"rec_add_section_{required_sec.lower()}",
                    priority="high",
                    category="Section Structure",
                    title=f"Add a dedicated '{required_sec}' section",
                    action=f"Insert a standalone heading titled '{required_sec}' so automated parsers index your {required_sec.lower()} details.",
                    example=f"[Template]:\n{required_sec.upper()}\n• [List your actual {required_sec.lower()} entries here]",
                )
            )

    # 3. Measurable & Qualitative Impact (Never fabricates numbers!)
    quant_count = len(structure.quantified_bullets)
    qual_impact_count = len(structure.qualitative_impact_bullets)
    total_bullets = len(doc.bullet_lines)

    if quant_count < 2:
        severity = "optional" if qual_impact_count >= 2 else "important"
        issues.append(
            IssueItem(
                id="issue_low_quantified_impact",
                severity=severity,
                category="Experience & Project Impact",
                title=f"{quant_count} quantified metric bullet(s) detected ( alongside {qual_impact_count} qualitative impact bullet(s) )",
                explanation=(
                    "Your bullets describe technical actions, and adding real scope or outcome metrics where available "
                    "(such as team size, dataset/user scale, modules covered, or measured improvements) helps recruiters gauge scale."
                ),
                suggestion="Where you have real numbers from your work or projects, add concrete scope or outcome indicators—never invent metrics.",
            )
        )
        source_bullet = (
            structure.unquantified_bullets[0]
            if structure.unquantified_bullets
            else (
                doc.bullet_lines[0]
                if doc.bullet_lines
                else "[Action Verb] [your project or feature] using [your tech stack]"
            )
        )
        recommendations.append(
            RecommendationItem(
                id="rec_quantify_bullets",
                priority="medium" if qual_impact_count >= 2 else "high",
                category="Measurable Impact",
                title="Add real scope or outcome metrics to your bullets where applicable",
                action=(
                    f"Based on your bullet (\"{source_bullet[:90]}...\"), keep your factual technical description "
                    "and add真实/real scope indicators (e.g., modules covered, users/records supported, or measured speedup) if applicable."
                ),
                example=_build_fact_preserving_bullet_template(source_bullet),
            )
        )

    # 4. Keyword Optimization & Job Description Gaps
    if keywords.has_job_description and keywords.missing_keywords:
        top_missing = keywords.missing_keywords[:8]
        issues.append(
            IssueItem(
                id="issue_missing_jd_keywords",
                severity="important",
                category="Keyword Alignment",
                title=f"{len(keywords.missing_keywords)} target Job Description keyword(s) not found in resume",
                explanation=f"The target Job Description mentions {', '.join(top_missing)}, which were not detected in your resume.",
                suggestion="Only add skills from this list that you have genuinely studied or used in projects/work.",
            )
        )
        existing_sample = (
            ", ".join(keywords.matched_keywords[:4])
            if keywords.matched_keywords
            else (
                ", ".join(keywords.detected_resume_skills[:4])
                if keywords.detected_resume_skills
                else "[Your existing skills]"
            )
        )
        recommendations.append(
            RecommendationItem(
                id="rec_bridge_jd_keywords",
                priority="high",
                category="Job Description Alignment",
                title="Include relevant target keywords that match your actual experience",
                action=f"If you have hands-on familiarity with any of ({', '.join(top_missing[:5])}), list their canonical names in your Skills section and mention where you used them.",
                example=(
                    f"[Template — include only skills you genuinely possess]:\n"
                    f"Skills: {existing_sample}, [add applicable skill from: {', '.join(top_missing[:3])}]"
                ),
            )
        )

    if keywords.has_job_description and keywords.partial_keywords:
        top_partial = keywords.partial_keywords[:5]
        recommendations.append(
            RecommendationItem(
                id="rec_convert_partial_keywords",
                priority="medium",
                category="Keyword Precision",
                title="Align terminology for partial/ecosystem keyword matches",
                action=f"Your resume shows related ecosystem experience for {', '.join(top_partial)}. If you have used these exact tools, include the exact phrasing from the job description.",
                example=f"[Template]: Pair your existing skills with exact job posting terms (e.g., {', '.join(top_partial[:3])}) where factually accurate.",
            )
        )

    if not keywords.has_job_description and len(keywords.detected_resume_skills) < 6:
        issues.append(
            IssueItem(
                id="issue_low_skill_density",
                severity="important",
                category="General Skill & Keyword Breadth",
                title=f"Only {len(keywords.detected_resume_skills)} canonical technical/domain skills detected",
                explanation="Listing your specific languages, frameworks, libraries, databases, and tools helps ATS index your core competencies.",
                suggestion="Organize the technologies you have used in your coursework, projects, or roles into clear categories.",
            )
        )
        current_skills_str = (
            ", ".join(keywords.detected_resume_skills)
            if keywords.detected_resume_skills
            else "[Your primary languages/tools]"
        )
        recommendations.append(
            RecommendationItem(
                id="rec_expand_skills_taxonomy",
                priority="high",
                category="Keyword Coverage",
                title="Group and expand your Skills section with specific tool names",
                action="Build on the skills already detected in your resume by listing all libraries, databases, and developer tools you used across your projects.",
                example=(
                    f"[Template based on your detected skills]:\n"
                    f"Detected in your resume: {current_skills_str}\n"
                    f"Add categories for: Languages: [your languages] | Frameworks/Libraries: [your frameworks] | Databases & Tools: [your tools]"
                ),
            )
        )

    # 5. Weak phrases / action verbs (No fabricated replacement numbers!)
    if structure.weak_phrases_found:
        weak_phrase = structure.weak_phrases_found[0]
        issues.append(
            IssueItem(
                id="issue_weak_passive_phrasing",
                severity="optional",
                category="Writing & Action Verb Quality",
                title="Passive or filler phrasing detected",
                explanation=f"Found passive phrasing ({', '.join(structure.weak_phrases_found)}) that can obscure your direct technical contribution.",
                suggestion="Start bullet points with a direct action verb (such as Developed, Built, Engineered, Implemented, or Designed).",
            )
        )
        # Find the actual line in the resume containing the weak phrase if possible
        matching_line = next(
            (b for b in doc.bullet_lines if weak_phrase in b.lower()),
            f"{weak_phrase.capitalize()} [your feature or system]",
        )
        recommendations.append(
            RecommendationItem(
                id="rec_replace_weak_phrases",
                priority="medium",
                category="Writing Quality",
                title="Replace passive openers with direct action verbs",
                action=f"In your line (\"{matching_line[:85]}...\"), replace '{weak_phrase}' with the specific engineering action you performed.",
                example=(
                    f"[Hypothetical structure — preserve your own project facts]:\n"
                    f"Instead of: \"{matching_line}\"\n"
                    f"Use: \"[Strong Action Verb: e.g., Developed / Implemented / Configured] [the exact module, interface, or workflow from your original bullet].\""
                ),
            )
        )

    # 6. Word count balance
    if doc.word_count < 140:
        issues.append(
            IssueItem(
                id="issue_low_word_count",
                severity="important",
                category="ATS Document Readability",
                title=f"Resume text is brief ({doc.word_count} words extracted)",
                explanation="Very brief resumes (< 140 words) may not provide enough technical context across your projects, skills, and education for ATS keyword matching.",
                suggestion="Add 2–4 descriptive bullets under each Project or Work Experience entry explaining what you built and which tools you used.",
            )
        )
    elif doc.word_count > 1150:
        issues.append(
            IssueItem(
                id="issue_high_word_count",
                severity="optional",
                category="ATS Document Readability",
                title=f"Resume is lengthy ({doc.word_count} words)",
                explanation="Resumes exceeding 1,150 words can dilute your primary skill focus during rapid recruiter reviews.",
                suggestion="Condense older or repetitive bullets so your strongest projects and roles stand out.",
            )
        )

    if not recommendations:
        recommendations.append(
            RecommendationItem(
                id="rec_tailor_per_application",
                priority="low",
                category="Continuous Optimization",
                title="Compare your resume against a specific Job Description before applying",
                action="Your resume structure and readability are solid. Paste the target job posting into the Job Description box to check role-specific keyword alignment.",
                example=None,
            )
        )

    # 7-Point Transparent Pass/Fail Checklist
    checklist.extend(
        [
            ChecklistItem(
                id="chk_parseable_text",
                label="Machine-Readable Text Layer",
                passed=doc.document_classification in ("text_based_pdf", "word_docx", "text_based_document") and doc.word_count >= 50,
                detail=f"Extracted {doc.word_count} words ({doc.document_classification} via {doc.extraction_method}).",
            ),
            ChecklistItem(
                id="chk_contact_complete",
                label="Email & Phone Detectable",
                passed=bool(c.email and c.phone),
                detail="Both email and phone number found."
                if (c.email and c.phone)
                else "Missing email or 10+ digit phone number in selectable text.",
            ),
            ChecklistItem(
                id="chk_profile_links",
                label="Profile Links (LinkedIn / GitHub)",
                passed=bool(c.linkedin or c.github_or_portfolio),
                detail="Professional profile link detected."
                if (c.linkedin or c.github_or_portfolio)
                else "Optional: add visible linkedin.com/in/... or github.com/... URL.",
            ),
            ChecklistItem(
                id="chk_core_sections",
                label="Core Sections (Skills, Education & Experience/Projects)",
                passed=bool(structure.has_skills_section and structure.has_education_section and has_hands_on),
                detail="All essential sections (Skills, Education, and Experience/Projects) detected."
                if (structure.has_skills_section and structure.has_education_section and has_hands_on)
                else "Ensure Skills, Education, and either Work Experience or Projects headings are present.",
            ),
            ChecklistItem(
                id="chk_meaningful_impact",
                label="Action & Outcome Bullets",
                passed=(quant_count + qual_impact_count) >= 2,
                detail=f"{quant_count} quantified bullet(s) and {qual_impact_count} qualitative technical-outcome bullet(s) detected.",
            ),
            ChecklistItem(
                id="chk_action_verbs",
                label="Strong Action Verbs (3+)",
                passed=len(structure.action_verbs_found) >= 3,
                detail=f"{len(structure.action_verbs_found)} distinct strong action verb(s) detected.",
            ),
            ChecklistItem(
                id="chk_optimal_length",
                label="Balanced Resume Length (140–1,100 words)",
                passed=140 <= doc.word_count <= 1100,
                detail=f"Current word count: {doc.word_count} words across {total_bullets} bullet point(s).",
            ),
        ]
    )

    return issues, recommendations, checklist

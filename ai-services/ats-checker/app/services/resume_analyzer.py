"""Resume structural, contact, action verb, and quantitative + qualitative impact analyzer."""

import re
from dataclasses import dataclass, field
from typing import Dict, List, Set

from app.schemas.ats_schema import ContactChecks
from app.utils.text_normalizer import ParsedResumeDocument

EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")
PHONE_REGEX = re.compile(
    r"(?:(?:\+?\d{1,3}[\s\-\.]?)?(?:\(?\d{3,5}\)?[\s\-\.]?)\d{3,4}[\s\-\.]?\d{3,4})"
)
LINKEDIN_REGEX = re.compile(r"(?:linkedin\.com/in/[A-Za-z0-9\-_%]+)", re.IGNORECASE)
GITHUB_PORTFOLIO_REGEX = re.compile(
    r"(?:github\.com/[A-Za-z0-9\-_]+|gitlab\.com/[A-Za-z0-9\-_]+|bitbucket\.org/[A-Za-z0-9\-_]+|[A-Za-z0-9\-]+\.(?:dev|io|me|tech|app|vercel\.app|netlify\.app|github\.io|onrender\.com)\b)",
    re.IGNORECASE,
)
LOCATION_REGEX = re.compile(
    r"\b(?:India|USA|United States|UK|Canada|Germany|Singapore|Australia|Remote|Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Pune|Chennai|Kolkata|Noida|Gurgaon|Gurugram|Ahmedabad|Jaipur|Kochi|Indore|Bhopal|Chandigarh|Coimbatore|Lucknow|Bhubaneswar|New York|San Francisco|Seattle|Austin|London|Toronto|Berlin|[A-Z][a-zA-Z]+,\s*[A-Z]{2})\b",
    re.IGNORECASE,
)

DATE_RANGE_REGEX = re.compile(
    r"\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\s*(?:[\-\–\—]|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:(?:19|20)\d{2}|Present|Current|Now|Ongoing)\b|\b(?:19|20)\d{2}\b",
    re.IGNORECASE,
)

# Recognizes percentages, currency, multipliers (2x), academic GPA/CGPA/ranks, durations,
# and numbers followed (within 0-2 modifier words) by scale/domain nouns
QUANTIFIED_METRIC_REGEX = re.compile(
    r"(?:"
    r"\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|\+)"
    r"|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:[A-Za-z\-]+\s+){0,2}(?:percent|x|ms|sec|seconds|mins?|minutes?|hours?|days?|weeks?|months?|years?|users?|clients?|customers?|patients?|students?|candidates?|employees?|visitors?|learners?|subscribers?|members?|requests?|rps|qps|tps|gb|tb|mb|kb|million|billion|endpoints?|microservices?|services?|pipelines?|projects?|applications?|apps?|modules?|components?|screens?|pages?|dashboards?|tables?|schemas?|engineers?|developers?|tests?|queries|apis?|records?|transactions?|servers?|containers?|datasets?|models?|scans?|workflows?|tickets?|bugs?|issues?|features?|institutions?|hospitals?|clinics?|companies?)\b"
    r"|\$\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[KkMmBb]?"
    r"|\b(?:Rs\.?|INR|USD|EUR)\s*\d+(?:,\d{3})*(?:\.\d+)?"
    r"|\b(?:CGPA|GPA)\s*[\:\-]?\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?"
    r"|\b(?:reduced|increased|improved|accelerated|decreased|grew|scaled|saved|cut|boosted|lowered|shortened)\b[^\.]{0,45}\b\d+(?:\.\d+)?\s*(?:%|x|\+|hours?|mins?|ms|sec|days?)?"
    r"|\bfrom\s+\d+(?:\.\d+)?%?\s+to\s+\d+(?:\.\d+)?%?"
    r"|\btop\s+\d+(?:\.\d+)?%?"
    r")",
    re.IGNORECASE,
)

# Canonical action verb roots mapped to their common past, present, and gerund inflections
ACTION_VERB_FAMILIES: Dict[str, List[str]] = {
    "accelerated": ["accelerate", "accelerated", "accelerating", "accelerates"],
    "achieved": ["achieve", "achieved", "achieving", "achieves"],
    "analyzed": ["analyze", "analyzed", "analyzing", "analyses"],
    "architected": ["architect", "architected", "architecting", "re-architected"],
    "automated": ["automate", "automated", "automating", "automates"],
    "built": ["build", "built", "building", "builds"],
    "collaborated": ["collaborate", "collaborated", "collaborating"],
    "configured": ["configure", "configured", "configuring"],
    "consolidated": ["consolidate", "consolidated", "consolidating"],
    "containerized": ["containerize", "containerized", "containerizing"],
    "contributed": ["contribute", "contributed", "contributing"],
    "coordinated": ["coordinate", "coordinated", "coordinating"],
    "created": ["create", "created", "creating", "creates"],
    "debugged": ["debug", "debugged", "debugging"],
    "decreased": ["decrease", "decreased", "decreasing"],
    "delivered": ["deliver", "delivered", "delivering"],
    "deployed": ["deploy", "deployed", "deploying", "deploys"],
    "designed": ["design", "designed", "designing", "designs", "redesigned"],
    "developed": ["develop", "developed", "developing", "develops", "co-developed"],
    "directed": ["direct", "directed", "directing"],
    "documented": ["document", "documented", "documenting"],
    "eliminated": ["eliminate", "eliminated", "eliminating"],
    "engineered": ["engineer", "engineered", "engineering"],
    "enhanced": ["enhance", "enhanced", "enhancing"],
    "established": ["establish", "established", "establishing"],
    "evaluated": ["evaluate", "evaluated", "evaluating"],
    "executed": ["execute", "executed", "executing"],
    "expanded": ["expand", "expanded", "expanding"],
    "facilitated": ["facilitate", "facilitated", "facilitating"],
    "formulated": ["formulate", "formulated", "formulating"],
    "generated": ["generate", "generated", "generating"],
    "guided": ["guide", "guided", "guiding"],
    "identified": ["identify", "identified", "identifying"],
    "implemented": ["implement", "implemented", "implementing", "implements"],
    "improved": ["improve", "improved", "improving", "improves"],
    "increased": ["increase", "increased", "increasing"],
    "initiated": ["initiate", "initiated", "initiating"],
    "integrated": ["integrate", "integrated", "integrating", "integrates"],
    "introduced": ["introduce", "introduced", "introducing"],
    "launched": ["launch", "launched", "launching"],
    "led": ["lead", "led", "leading", "spearhead", "spearheaded", "spearheading"],
    "maintained": ["maintain", "maintained", "maintaining"],
    "managed": ["manage", "managed", "managing"],
    "mentored": ["mentor", "mentored", "mentoring"],
    "migrated": ["migrate", "migrated", "migrating"],
    "modernized": ["modernize", "modernized", "modernizing"],
    "monitored": ["monitor", "monitored", "monitoring"],
    "optimized": ["optimize", "optimized", "optimizing", "optimizes"],
    "orchestrated": ["orchestrate", "orchestrated", "orchestrating"],
    "overhauled": ["overhaul", "overhauled", "overhauling"],
    "pioneered": ["pioneer", "pioneered", "pioneering"],
    "planned": ["plan", "planned", "planning"],
    "produced": ["produce", "produced", "producing"],
    "programmed": ["program", "programmed", "programming"],
    "published": ["publish", "published", "publishing"],
    "reduced": ["reduce", "reduced", "reducing", "reduces"],
    "refactored": ["refactor", "refactored", "refactoring"],
    "resolved": ["resolve", "resolved", "resolving"],
    "revamped": ["revamp", "revamped", "revamping"],
    "scaled": ["scale", "scaled", "scaling"],
    "secured": ["secure", "secured", "securing"],
    "simplified": ["simplify", "simplified", "simplifying"],
    "standardized": ["standardize", "standardized", "standardizing"],
    "streamlined": ["streamline", "streamlined", "streamlining"],
    "strengthened": ["strengthen", "strengthened", "strengthening"],
    "structured": ["structure", "structured", "structuring"],
    "supervised": ["supervise", "supervised", "supervising"],
    "tested": ["test", "tested", "testing"],
    "trained": ["train", "trained", "training"],
    "transformed": ["transform", "transformed", "transforming"],
    "troubleshot": ["troubleshoot", "troubleshot", "troubleshooting"],
    "upgraded": ["upgrade", "upgraded", "upgrading"],
    "validated": ["validate", "validated", "validating"],
}

SURFACE_TO_CANONICAL_VERB: Dict[str, str] = {
    surface.lower(): canonical
    for canonical, forms in ACTION_VERB_FAMILIES.items()
    for surface in forms
}

QUALITATIVE_OUTCOME_MARKER_REGEX = re.compile(
    r"\b(?:using|with|via|for|covering|supporting|enabling|to\s+enable|to\s+automate|to\s+streamline|to\s+improve|to\s+reduce|to\s+manage|integrating|featuring|powered\s+by|built\s+on|deployed\s+on)\b",
    re.IGNORECASE,
)

WEAK_PHRASES = [
    "responsible for",
    "duties included",
    "worked on",
    "helped with",
    "assisted in",
    "hardworking",
    "hard worker",
    "team player",
    "go-getter",
    "synergy",
    "references available upon request",
]


@dataclass
class StructuralAnalysisResult:
    """Detailed findings from inspecting the parsed resume's structure and language."""

    contact_checks: ContactChecks
    quantified_bullets: List[str] = field(default_factory=list)
    qualitative_impact_bullets: List[str] = field(default_factory=list)
    unquantified_bullets: List[str] = field(default_factory=list)
    action_verbs_found: List[str] = field(default_factory=list)
    weak_phrases_found: List[str] = field(default_factory=list)
    date_ranges_found: int = 0
    avg_bullet_words: float = 0.0
    long_bullets_count: int = 0
    short_bullets_count: int = 0
    has_summary_section: bool = False
    has_skills_section: bool = False
    has_experience_section: bool = False
    has_education_section: bool = False
    has_projects_section: bool = False
    is_fresher_or_student_profile: bool = False


def analyze_resume_structure(doc: ParsedResumeDocument) -> StructuralAnalysisResult:
    """Inspect contact completeness, bullet quantification, qualitative achievements, action verbs, and structural health."""
    full_text = doc.normalized_text

    has_email = bool(EMAIL_REGEX.search(full_text))
    phone_candidates = PHONE_REGEX.findall(full_text)
    has_phone = any(len(re.sub(r"\D", "", candidate)) >= 10 for candidate in phone_candidates)
    has_linkedin = bool(LINKEDIN_REGEX.search(full_text))
    has_github_or_portfolio = bool(GITHUB_PORTFOLIO_REGEX.search(full_text))
    has_location = bool(LOCATION_REGEX.search(full_text))

    contact_checks = ContactChecks(
        email=has_email,
        phone=has_phone,
        linkedin=has_linkedin,
        github_or_portfolio=has_github_or_portfolio,
        location=has_location,
    )

    quantified_bullets: List[str] = []
    qualitative_impact_bullets: List[str] = []
    unquantified_bullets: List[str] = []
    bullet_word_counts: List[int] = []
    long_bullets_count = 0
    short_bullets_count = 0
    action_verbs_set: Set[str] = set()

    for bullet in doc.bullet_lines:
        words = bullet.split()
        w_count = len(words)
        bullet_word_counts.append(w_count)

        if w_count > 38:
            long_bullets_count += 1
        elif w_count < 5:
            short_bullets_count += 1

        # Check first 3 words of the bullet for an action verb (handles adverbs like "Successfully deployed...")
        bullet_has_action_verb = False
        for w in words[:3]:
            cleaned_w = re.sub(r"[^a-zA-Z\-]", "", w).lower()
            if cleaned_w in SURFACE_TO_CANONICAL_VERB:
                action_verbs_set.add(SURFACE_TO_CANONICAL_VERB[cleaned_w])
                bullet_has_action_verb = True

        is_quantified = bool(QUANTIFIED_METRIC_REGEX.search(bullet))
        if is_quantified:
            quantified_bullets.append(bullet)
        else:
            unquantified_bullets.append(bullet)
            if (
                bullet_has_action_verb
                and w_count >= 7
                and QUALITATIVE_OUTCOME_MARKER_REGEX.search(bullet)
            ):
                qualitative_impact_bullets.append(bullet)

    # Also check non-bullet lines inside Education, Achievements, Projects, and Work Experience for quantified metrics (e.g. CGPA: 9.1/10, Top 1%)
    bullet_set = set(doc.bullet_lines)
    for sec_name in ("Work Experience", "Projects", "Achievements", "Education"):
        for sec_line in doc.sections.get(sec_name, []):
            clean_sec_line = sec_line.lstrip("• ").strip()
            if clean_sec_line in bullet_set:
                continue
            if QUANTIFIED_METRIC_REGEX.search(clean_sec_line):
                quantified_bullets.append(clean_sec_line)

    # Scan all document tokens for strong action verbs
    for token in re.findall(r"\b[A-Za-z\-]{3,}\b", full_text):
        lower_tok = token.lower()
        if lower_tok in SURFACE_TO_CANONICAL_VERB:
            action_verbs_set.add(SURFACE_TO_CANONICAL_VERB[lower_tok])

    lower_text = full_text.lower()
    weak_found = [phrase for phrase in WEAK_PHRASES if phrase in lower_text]
    date_ranges = len(DATE_RANGE_REGEX.findall(full_text))

    avg_bullet_words = (
        round(sum(bullet_word_counts) / len(bullet_word_counts), 1)
        if bullet_word_counts
        else 0.0
    )

    detected_set = set(doc.detected_sections)
    has_exp = "Work Experience" in detected_set
    has_proj = "Projects" in detected_set
    has_edu = "Education" in detected_set

    # A candidate with Projects and/or Education but no formal Work Experience section is evaluated fairly as a fresher/student profile
    is_fresher = (not has_exp) and (has_proj or has_edu)

    return StructuralAnalysisResult(
        contact_checks=contact_checks,
        quantified_bullets=quantified_bullets,
        qualitative_impact_bullets=qualitative_impact_bullets,
        unquantified_bullets=unquantified_bullets,
        action_verbs_found=sorted(action_verbs_set),
        weak_phrases_found=weak_found,
        date_ranges_found=date_ranges,
        avg_bullet_words=avg_bullet_words,
        long_bullets_count=long_bullets_count,
        short_bullets_count=short_bullets_count,
        has_summary_section="Professional Summary" in detected_set,
        has_skills_section="Skills" in detected_set,
        has_experience_section=has_exp,
        has_education_section=has_edu,
        has_projects_section=has_proj,
        is_fresher_or_student_profile=is_fresher,
    )

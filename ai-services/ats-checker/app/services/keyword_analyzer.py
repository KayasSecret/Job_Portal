"""NLP keyword and skill extraction engine powered by spaCy PhraseMatcher and RapidFuzz."""

from functools import lru_cache
import re
from typing import Dict, List, Set, Tuple
import spacy
from spacy.matcher import PhraseMatcher
from rapidfuzz import fuzz

from app.schemas.ats_schema import KeywordAnalysis

# Curated canonical skill taxonomy with common aliases and surface forms
SKILL_TAXONOMY: Dict[str, List[str]] = {
    # Programming Languages
    "Python": ["python", "python3", "py"],
    "JavaScript": ["javascript", "js", "ecmascript", "es6"],
    "TypeScript": ["typescript", "ts"],
    "Java": ["java", "core java", "java 17", "java 11", "java 8"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp", ".net c#"],
    "Go": ["golang", "go language"],
    "Rust": ["rust"],
    "SQL": ["sql", "T-SQL".lower(), "pl/sql"],
    "PHP": ["php"],
    "Ruby": ["ruby"],
    "Kotlin": ["kotlin"],
    "Swift": ["swift"],
    "R": ["r programming"],
    "Bash / Shell": ["bash", "shell scripting", "powershell"],
    # Frontend
    "React.js": ["react", "react.js", "reactjs", "react 18", "react 19"],
    "Next.js": ["next.js", "nextjs"],
    "Vue.js": ["vue", "vue.js", "vuejs"],
    "Angular": ["angular", "angularjs"],
    "Redux": ["redux", "redux toolkit", "rtk"],
    "HTML5": ["html", "html5"],
    "CSS3": ["css", "css3"],
    "Tailwind CSS": ["tailwind", "tailwind css", "tailwindcss"],
    "Bootstrap": ["bootstrap"],
    "SASS / SCSS": ["sass", "scss"],
    "Vite": ["vite"],
    "Webpack": ["webpack"],
    # Backend & APIs
    "Node.js": ["node", "node.js", "nodejs"],
    "Express.js": ["express", "express.js", "expressjs"],
    "FastAPI": ["fastapi", "fast api"],
    "Django": ["django", "django rest framework", "drf"],
    "Flask": ["flask"],
    "Spring Boot": ["spring boot", "springboot", "spring framework"],
    "ASP.NET Core": ["asp.net", "asp.net core", ".net core", "dotnet"],
    "GraphQL": ["graphql", "apollo graphql"],
    "REST APIs": ["rest api", "rest apis", "restful api", "restful apis", "restful services", "restful"],
    "gRPC": ["grpc"],
    "WebSockets": ["websocket", "websockets", "socket.io"],
    "Microservices": ["microservice", "microservices", "microservices architecture"],
    "JWT / OAuth": ["jwt", "json web token", "oauth", "oauth2", "openid connect", "authentication"],
    # Databases & Caching
    "MongoDB": ["mongodb", "mongo", "mongoose"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MySQL": ["mysql"],
    "Redis": ["redis"],
    "SQLite": ["sqlite"],
    "Oracle DB": ["oracle database", "oracle db"],
    "DynamoDB": ["dynamodb", "aws dynamodb"],
    "Elasticsearch": ["elasticsearch", "elastic search", "elk stack"],
    "Firebase": ["firebase", "firestore"],
    "Supabase": ["supabase"],
    "Prisma": ["prisma", "prisma orm"],
    # Cloud, DevOps & Infrastructure
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "Google Cloud (GCP)": ["gcp", "google cloud", "google cloud platform"],
    "Microsoft Azure": ["azure", "microsoft azure"],
    "Docker": ["docker", "containerization", "dockerfile", "docker compose"],
    "Kubernetes": ["kubernetes", "k8s", "helm"],
    "CI/CD": ["ci/cd", "cicd", "continuous integration", "continuous deployment", "continuous delivery"],
    "GitHub Actions": ["github actions"],
    "Jenkins": ["jenkins"],
    "GitLab CI": ["gitlab ci"],
    "Terraform": ["terraform", "infrastructure as code", "iac"],
    "Linux": ["linux", "ubuntu", "unix"],
    "Nginx": ["nginx"],
    "Git": ["git", "github", "gitlab", "version control"],
    "Kafka": ["kafka", "apache kafka"],
    "RabbitMQ": ["rabbitmq"],
    # Data Science, AI & ML
    "Machine Learning": ["machine learning", "ml", "supervised learning", "unsupervised learning"],
    "Deep Learning": ["deep learning", "neural networks"],
    "Natural Language Processing": ["nlp", "natural language processing", "spacy", "nltk"],
    "PyTorch": ["pytorch"],
    "TensorFlow": ["tensorflow", "keras"],
    "Scikit-Learn": ["scikit-learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Data Analysis": ["data analysis", "data analytics", "exploratory data analysis"],
    "Tableau": ["tableau"],
    "Power BI": ["power bi", "powerbi"],
    "Apache Spark": ["apache spark", "pyspark"],
    "LLM / Generative AI": ["llm", "large language models", "generative ai", "rag", "langchain", "openai"],
    # Testing, Quality & Practices
    "Unit Testing": ["unit testing", "test-driven development", "tdd"],
    "Pytest": ["pytest"],
    "Jest": ["jest", "vitest"],
    "Cypress": ["cypress"],
    "Playwright": ["playwright"],
    "Selenium": ["selenium"],
    "Postman": ["postman"],
    "System Design": ["system design", "distributed systems", "scalability", "high availability"],
    "Data Structures & Algorithms": ["data structures", "algorithms", "dsa", "object-oriented programming", "oop"],
    "Agile / Scrum": ["agile", "scrum", "kanban", "jira", "sprint planning"],
}

# Ecosystem families used to recognize related partial competencies
ECOSYSTEM_FAMILIES: List[Set[str]] = [
    {"React.js", "Next.js", "Redux", "JavaScript", "TypeScript"},
    {"Node.js", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot"},
    {"PostgreSQL", "MySQL", "SQL", "SQLite", "Oracle DB"},
    {"MongoDB", "DynamoDB", "Redis", "Firebase"},
    {"AWS", "Google Cloud (GCP)", "Microsoft Azure"},
    {"Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Terraform"},
    {"Pytest", "Jest", "Unit Testing", "Cypress", "Playwright", "Selenium"},
    {"Machine Learning", "Deep Learning", "Natural Language Processing", "PyTorch", "TensorFlow", "Scikit-Learn"},
]


@lru_cache(maxsize=1)
def get_nlp_matcher() -> Tuple[spacy.Language, PhraseMatcher, Dict[str, str]]:
    """Build and cache the spaCy blank('en') pipeline and PhraseMatcher over all canonical skills."""
    nlp = spacy.blank("en")
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    alias_to_canonical: Dict[str, str] = {}

    for canonical, aliases in SKILL_TAXONOMY.items():
        patterns = [nlp.make_doc(canonical.lower())]
        alias_to_canonical[canonical.lower()] = canonical
        for alias in aliases:
            lower_alias = alias.lower()
            alias_to_canonical[lower_alias] = canonical
            patterns.append(nlp.make_doc(lower_alias))
        matcher.add(canonical, patterns)

    return nlp, matcher, alias_to_canonical


def extract_canonical_skills(text: str) -> List[str]:
    """Extract canonical skills from text using spaCy PhraseMatcher + regex boundary verification."""
    if not text or not text.strip():
        return []

    nlp, matcher, _ = get_nlp_matcher()
    doc = nlp(text)
    matches = matcher(doc)

    found_ordered: List[str] = []
    seen: Set[str] = set()

    for match_id, _, _ in matches:
        canonical = nlp.vocab.strings[match_id]
        if canonical not in seen:
            seen.add(canonical)
            found_ordered.append(canonical)

    # Supplement with direct boundary regex check for special-punctuation tokens like C++, C#, .NET, CI/CD, Node.js, React.js
    lower_text = text.lower()
    for canonical, aliases in SKILL_TAXONOMY.items():
        if canonical in seen:
            continue
        for alias in aliases:
            escaped = re.escape(alias.lower())
            pattern = rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"
            if re.search(pattern, lower_text):
                seen.add(canonical)
                found_ordered.append(canonical)
                break

    return found_ordered


def extract_additional_jd_terms(jd_text: str, existing_canonical: List[str]) -> List[str]:
    """
    Extract any domain-specific capitalized technical terms from the JD that aren't in the base taxonomy,
    so custom tools/frameworks mentioned in a JD are still evaluated.
    """
    STOP_CAPITALIZED = {
        "The", "And", "For", "With", "You", "Our", "Are", "Will", "Have", "This",
        "That", "From", "Your", "Work", "Team", "Role", "Job", "About", "Experience",
        "Skills", "Required", "Preferred", "Qualifications", "Responsibilities",
        "Must", "Nice", "Plus", "Years", "Degree", "Bachelor", "Master", "Computer",
        "Science", "Engineering", "Software", "Developer", "Engineer", "Full", "Stack",
        "Senior", "Junior", "Lead", "Intern", "Company", "Candidate", "Strong",
        "Good", "Excellent", "Ability", "Knowledge", "Understanding", "Working",
        "Building", "Designing", "Developing", "Using", "Looking", "Join", "What",
        "Who", "Why", "How", "Where", "When", "We", "In", "On", "At", "To", "Of", "As",
    }
    existing_lower = {s.lower() for s in existing_canonical}
    for s in existing_canonical:
        for alias in SKILL_TAXONOMY.get(s, []):
            existing_lower.add(alias.lower())

    extra_terms: List[str] = []
    # Look for camelCase / PascalCase / tech tokens like GraphQL, Fastify, Zustand, Tailwind, Snowflake, Databricks
    candidates = re.findall(r"\b[A-Z][A-Za-z0-9\.\+#]{2,18}\b", jd_text)
    for token in candidates:
        clean_tok = token.rstrip(".")
        if clean_tok in STOP_CAPITALIZED or len(clean_tok) < 3:
            continue
        if clean_tok.lower() in existing_lower:
            continue
        existing_lower.add(clean_tok.lower())
        extra_terms.append(clean_tok)
        if len(extra_terms) >= 8:
            break

    return extra_terms


def is_in_same_ecosystem(target_skill: str, resume_skills_set: Set[str]) -> bool:
    """Check if the resume contains a closely related technology from the same ecosystem family."""
    for family in ECOSYSTEM_FAMILIES:
        if target_skill in family and len(family.intersection(resume_skills_set)) > 0:
            return True
    return False


def analyze_keywords(resume_text: str, job_description: str | None = None) -> KeywordAnalysis:
    """
    Analyze resume keywords and, when a Job Description is provided, compute
    exact matches, RapidFuzz/ecosystem partial matches, missing keywords, and match percentage.
    """
    resume_skills = extract_canonical_skills(resume_text)
    resume_skills_set = set(resume_skills)
    cleaned_jd = (job_description or "").strip()

    if not cleaned_jd:
        return KeywordAnalysis(
            has_job_description=False,
            matched_keywords=resume_skills,
            partial_keywords=[],
            missing_keywords=[],
            detected_resume_skills=resume_skills,
            target_jd_keywords=[],
            match_percentage=None,
        )

    jd_canonical_skills = extract_canonical_skills(cleaned_jd)
    extra_jd_terms = extract_additional_jd_terms(cleaned_jd, jd_canonical_skills)
    target_jd_keywords = jd_canonical_skills + extra_jd_terms

    # Extract distinct tokens/phrases from the resume for RapidFuzz similarity comparison
    resume_tokens = set(re.findall(r"\b[A-Za-z0-9\.\+#\-]{3,}\b", resume_text.lower()))
    resume_lower = resume_text.lower()

    matched: List[str] = []
    partial: List[str] = []
    missing: List[str] = []

    for jd_kw in target_jd_keywords:
        if jd_kw in resume_skills_set:
            matched.append(jd_kw)
            continue

        # Direct case-insensitive substring check for extra JD terms
        escaped_kw = re.escape(jd_kw.lower())
        if re.search(rf"(?<![a-z0-9]){escaped_kw}(?![a-z0-9])", resume_lower):
            matched.append(jd_kw)
            continue

        # Check RapidFuzz similarity against detected resume skills and tokens
        best_fuzzy = 0.0
        for r_skill in resume_skills:
            score = fuzz.token_sort_ratio(jd_kw.lower(), r_skill.lower())
            if score > best_fuzzy:
                best_fuzzy = score

        if best_fuzzy < 80:
            for r_tok in resume_tokens:
                if abs(len(r_tok) - len(jd_kw)) <= 3:
                    score = fuzz.ratio(jd_kw.lower(), r_tok)
                    if score > best_fuzzy:
                        best_fuzzy = score

        if best_fuzzy >= 78 or is_in_same_ecosystem(jd_kw, resume_skills_set):
            partial.append(jd_kw)
        else:
            missing.append(jd_kw)

    if len(target_jd_keywords) > 0:
        weighted_hits = len(matched) + (0.5 * len(partial))
        match_pct = int(round((weighted_hits / len(target_jd_keywords)) * 100))
        match_pct = max(0, min(100, match_pct))
    else:
        match_pct = 100 if len(resume_skills) >= 5 else 50

    return KeywordAnalysis(
        has_job_description=True,
        matched_keywords=matched,
        partial_keywords=partial,
        missing_keywords=missing,
        detected_resume_skills=resume_skills,
        target_jd_keywords=target_jd_keywords,
        match_percentage=match_pct,
    )

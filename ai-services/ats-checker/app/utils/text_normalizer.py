"""Layout-aware text normalization, glued-word recovery, bullet merging, and section segmentation."""

from functools import lru_cache
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple


class ResumeParseError(Exception):
    """Domain exception raised when a resume cannot be parsed or lacks readable text."""

    def __init__(
        self,
        message: str,
        status_code: int = 422,
        document_classification: str = "unreadable_document",
        ocr_available: bool = False,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.document_classification = document_classification
        self.ocr_available = ocr_available


# Map typographic ligatures, WinAnsi bullets (\x95), and Private Use Area Wingdings/Symbol bullets BEFORE control-char stripping
PRE_CONTROL_CHAR_MAP = {
    "\ufb00": "ff",
    "\ufb01": "fi",
    "\ufb02": "fl",
    "\ufb03": "ffi",
    "\ufb04": "ffl",
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u00a0": " ",
    "\u200b": "",
    "\u200c": "",
    "\u200d": "",
    "\ufeff": "",
    "\x95": "• ",
    "\u0095": "• ",
    "\uf0b7": "• ",
    "\uf0a7": "• ",
    "\uf076": "• ",
    "\uf0d8": "• ",
    "\uf0fc": "• ",
    "\uf0e0": "• ",
}

BULLET_PREFIX_PATTERN = re.compile(
    r"^\s*(?:[\u2022\u2023\u25e6\u2043\u2219\u25cf\u25cb\u25aa\u25ab\u25b8\u25ba\u25c6\u25c7\u27a2\u2794\u2713\-\*\+]|(?:\d{1,2}[\.\)]))\s*"
)

PAGE_ARTIFACT_PATTERN = re.compile(
    r"^(?:page\s+\d+\s*(?:of|\/)\s*\d+|\d+\s*\/\s*\d+)$",
    re.IGNORECASE,
)

# Protected mixed-case / alphanumeric tokens that must never be split at internal case/digit transitions
PROTECTED_CASE_TOKENS: Dict[str, str] = {
    s.lower(): s
    for s in [
        "JavaScript", "TypeScript", "MongoDB", "PostgreSQL", "MySQL", "SQLite",
        "FastAPI", "GraphQL", "GitHub", "GitLab", "BitBucket", "LinkedIn",
        "PyTorch", "TensorFlow", "Scikit-Learn", "NumPy", "DevOps", "PowerShell",
        "WebSockets", "WebSocket", "Microservices", "TailwindCSS", "Next.js",
        "React.js", "ReactJS", "Node.js", "NodeJS", "Vue.js", "VueJS",
        "Express.js", "ExpressJS", "AngularJS", "NestJS", "Three.js",
        "DynamoDB", "MariaDB", "CouchDB", "InfluxDB", "ClickHouse",
        "RabbitMQ", "ActiveMQ", "ZeroMQ", "OpenAI", "LangChain", "LlamaIndex",
        "HuggingFace", "DeepSeek", "WordPress", "WooCommerce", "Salesforce",
        "ServiceNow", "PowerBI", "QuickBooks", "HubSpot", "CloudWatch",
        "CloudFront", "Route53", "AutoScaling", " SageMaker".strip(),
        "AppService", "CosmosDB", "BigQuery", "DataFlow", "PubSub",
        " Kubernetes".strip(), "DockerFile", "GitOps", "MLOps", "DataOps",
        "CyberSecurity", "InfoSec", "OAuth", "OAuth2", "OpenID", "WebRTC",
        "gRPC", "cURL", "iOS", "macOS", "watchOS", "tvOS", "iPadOS",
        " HireNest".strip(), "LeetCode", "HackerRank", "CodeForces", "CodeChef",
        "GeeksforGeeks", "StackOverflow", "YouTube", "WhatsApp", "WeChat",
        "HTML5", "CSS3", "EC2", "S3", "ES6", "ES2015", "IPv4", "IPv6",
        "Win32", "x86", "x64", "ARM64", "Base64", "SHA256", "MD5",
    ]
}

# Core vocabulary for dynamic-programming recovery of PDF kerning-glued words
RESUME_SEGMENTATION_VOCAB: Set[str] = {
    # Common function words & prepositions
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
    "in", "into", "is", "it", "its", "of", "on", "or", "our", "over", "per", "that",
    "the", "their", "this", "through", "to", "under", "up", "using", "via", "was",
    "we", "were", "with", "within", "without", "across", "after", "against", "all",
    "along", "also", "among", "any", "around", "before", "between", "both", "but",
    "can", "during", "each", "more", "most", "new", "no", "non", "not", "only",
    "other", "out", "same", "so", "some", "such", "than", "then", "there", "these",
    "they", "those", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "first", "second", "third", "high", "low", "full", "end", "real", "time",
    "base", "based", "level", "scale", "large", "small", "multi", "cross", "open",
    # Action verbs (base, past, gerund)
    "achieve", "achieved", "achieving", "accelerate", "accelerated", "accelerating",
    "analyze", "analyzed", "analyzing", "architect", "architected", "architecting",
    "assist", "assisted", "assisting", "automate", "automated", "automating",
    "build", "built", "building", "collaborate", "collaborated", "collaborating",
    "configure", "configured", "configuring", "consolidate", "consolidated",
    "containerize", "containerized", "contribute", "contributed", "contributing",
    "Coordinate".lower(), "coordinated", "create", "created", "creating",
    "debug", "debugged", "debugging", "decrease", "decreased", "decreasing",
    "deliver", "delivered", "delivering", "deploy", "deployed", "deploying",
    "design", "designed", "designing", "develop", "developed", "developing",
    "direct", "directed", "directing", "document", "documented", "documenting",
    "drive", "drove", "driving", "eliminate", "eliminated", "eliminating",
    "enable", "enabled", "enabling", "engineer", "engineered", "engineering",
    "enhance", "enhanced", "enhancing", "ensure", "ensured", "ensuring",
    "establish", "established", "establishing", "evaluate", "evaluated",
    "execute", "executed", "executing", "expand", "expanded", "expanding",
    "facilitate", "facilitated", "formulate", "formulated", "generate", "generated",
    "guide", "guided", "handle", "handled", "handling", "help", "helped", "helping",
    "identify", "identified", "identifying", "implement", "implemented", "implementing",
    "improve", "improved", "improving", "increase", "increased", "increasing",
    "initiate", "initiated", "integrate", "integrated", "integrating",
    "introduce", "introduced", "launch", "launched", "launching", "lead", "led",
    "leading", "leverage", "leveraged", "leveraging", "maintain", "maintained",
    "maintaining", "manage", "managed", "managing", "mentor", "mentored", "mentoring",
    "migrate", "migrated", "migrating", "modernize", "modernized", "monitor",
    "monitored", "monitoring", "optimize", "optimized", "optimizing", "orchestrate",
    "orchestrated", "overhaul", "overhauled", "participate", "participated",
    "perform", "performed", "performing", "pioneer", "pioneered", "plan", "planned",
    "planning", "prepare", "prepared", "present", "presented", "process", "processed",
    "processing", "produce", "produced", "program", "programmed", "provide", "provided",
    "providing", "publish", "published", "rearchitect", "redesign", "redesigned",
    "reduce", "reduced", "reducing", "refactor", "refactored", "refactoring",
    "resolve", "resolved", "resolving", "revamp", "revamped", "review", "reviewed",
    "scale", "scaled", "scaling", "secure", "secured", "securing", "serve", "served",
    "serving", "simplify", "simplified", "spearhead", "spearheaded", "standardize",
    "standardized", "streamline", "streamlined", "streamlining", "strengthen",
    "strengthened", "structure", "structured", "supervise", "supervised", "support",
    "supported", "supporting", "test", "tested", "testing", "train", "trained",
    "transform", "transformed", "troubleshoot", "troubleshot", "upgrade", "upgraded",
    "utilize", "utilized", "utilizing", "validate", "validated", "verify", "verified",
    "work", "worked", "working", "write", "wrote", "writing", "cover", "covered",
    "covering", "connect", "connected", "connecting", "track", "tracked", "tracking",
    # Common resume, engineering, healthcare, finance & domain nouns/adjectives
    "access", "account", "accounts", "accuracy", "active", "activity", "admin",
    "administration", "administrative", "advanced", "agile", "ai", "algorithm",
    "algorithms", "analysis", "analytics", "analyzer", "android", "angular", "api",
    "apis", "app", "application", "applications", "appointment", "appointments",
    "architecture", "assessment", "assistant", "associate", "async", "asynchronous",
    "ats", "audit", "auth", "authentication", "authorization", "automated",
    "automation", "availability", "average", "aws", "azure", "bachelor", "backend",
    "background", "backup", "balance", "balancing", "bank", "banking", "batch",
    "benchmark", "billing", "biomedical", "board", "boot", "bootstrap", "bot",
    "branch", "browser", "bug", "bugs", "business", "cache", "caching", "call",
    "calls", "campaign", "campaigns", "cancer", "candidate", "candidates",
    "capacity", "career", "care", "case", "cases", "catalog", "category", "center",
    "central", "certificate", "certification", "certifications", "channel",
    "channels", "chart", "charts", "chat", "check", "checker", "checking", "ci",
    "cd", "clean", "client", "clients", "clinical", "cloud", "cluster", "clusters",
    "code", "codebase", "coding", "collaboration", "Collaborative".lower(),
    "collection", "college", "column", "command", "commerce", "commercial",
    "communication", "communications", "community", "companies", "company",
    "compatibility", "competitive", "compiler", "complete", "completed",
    "completeness", "complex", "compliance", "component", "components",
    "comprehensive", "computer", "computing", "concept", "concepts", "concurrent",
    "configuration", "connection", "connections", "console", "consistency",
    "consistent", "consumer", "contact", "container", "containers", "content",
    "context", "continuous", "contract", "control", "controller", "controllers",
    "conversion", "core", "corporate", "cost", "costs", "Count".lower(), "course",
    "courses", "coverage", "cpu", "credential", "credentials", "credit", "critical",
    "crm", "crud", "crypto", "css", "custom", "customer", "customers", "cycle",
    "daily", "dashboard", "dashboards", "data", "database", "databases", "dataset",
    "datasets", "date", "dates", "day", "days", "deadline", "deadlines", "decision",
    "decisions", "deep", "defect", "defects", "degree", "delivery", "department",
    "dependencies", "dependency", "deployment", "deployments", "description",
    "desktop", "detail", "details", "detection", "developer", "developers",
    "development", "device", "devices", "devops", "diagnostic", "diagnostics",
    "digital", "direct", "directory", "discovery", "disk", "display", "distributed",
    "distribution", "django", "doc", "docker", "docs", "document", "documentation",
    "documents", "domain", "domains", "download", "downloads", "driven", "driver",
    "dynamic", "e-commerce", "ecommerce", "ecosystem", "edge", "edition", "editor",
    "education", "educational", "effective", "efficiency", "efficient", "elastic",
    "elasticsearch", "electronic", "element", "elements", "email", "emails",
    "embedded", "employee", "employees", "employment", "encryption", "endpoint",
    "endpoints", "engine", "engineer", "engineering", "engineers", "enterprise",
    "entities", "entity", "entries", "entry", "environment", "environments", "error",
    "errors", "essential", "event", "events", "evidence", "exam", "example",
    "examples", "exception", "exceptions", "exchange", "execution", "executive",
    "existing", "experience", "experienced", "experiment", "experiments", "expert",
    "expertise", "export", "express", "extension", "extensions", "external",
    "extraction", "facility", "factor", "failure", "failures", "fast", "fastapi",
    "fault", "feature", "features", "feedback", "field", "fields", "file", "files",
    "filter", "filtering", "filters", "final", "finance", "financial", "firebase",
    "firewall", "firm", "firmware", "flask", "flexible", "flow", "flows", "folder",
    "font", "fonts", "footer", "forecast", "forecasting", "form", "format",
    "formatting", "forms", "foundation", "framework", "frameworks", "front",
    "frontend", "full", "fullstack", "function", "functional", "functionality",
    "functions", "future", "game", "gateway", "general", "generation", "generator",
    "generic", "git", "github", "gitlab", "global", "goal", "goals", "golang",
    "google", "government", "gpa", "cgpa", "grade", "graduate", "graph", "graphics",
    "graphql", "grid", "group", "groups", "growth", "guard", "guidance", "guide",
    "hackathon", "handler", "handlers", "hardware", "header", "headers", "health",
    "healthcare", "help", "helper", "high", "higher", "history", "hospital",
    "host", "hosting", "hour", "hours", "html", "http", "https", "hub", "human",
    "hybrid", "IAM".lower(), "icon", "icons", "id", "ide", "idea", "identification",
    "identity", "image", "images", "impact", "implementation", "import",
    "improvement", "improvements", "incident", "incidents", "index", "indexes",
    "indexing", "indicator", "indicators", "individual", "industrial", "industry",
    "info", "information", "infrastructure", "ingestion", "initial", "initiative",
    "initiatives", "input", "inputs", "inquiry", "insight", "insights", "inspection",
    "install", "installation", "instance", "instances", "institute", "institution",
    "instruction", "instructions", "instrument", "insurance", "intake",
    "integration", "integrations", "integrity", "intelligence", "intelligent",
    "interactive", "interface", "interfaces", "internal", "international",
    "internet", "internship", "internships", "interview", "interviews", "inventory",
    "investment", "invoice", "io", "ios", "iot", "ip", "issue", "issues", "item",
    "items", "iteration", "java", "javascript", "jenkins", "jest", "jira", "job",
    "jobs", "join", "journal", "js", "json", "junior", "jwt", "kafka", "kanban",
    "kernel", "key", "keyword", "keywords", "kit", "knowledge", "kotlin",
    "kubernetes", "lab", "label", "labels", "laboratory", "lambda", "landing",
    "language", "languages", "large", "latency", "launch", "layer", "layers",
    "layout", "layouts", "lead", "leader", "leadership", "learning", "legacy",
    "legal", "length", "less", "level", "levels", "libraries", "library", "license",
    "lifecycle", "light", "lightweight", "limit", "limits", "line", "linear",
    "lines", "link", "linkedin", "links", "linux", "list", "lists", "live", "load",
    "loading", "local", "location", "locations", "lock", "log", "logging", "logic",
    "logical", "login", "logs", "long", "look", "lookup", "loop", "low", "machine",
    "mail", "main", "maintenance", "major", "management", "manager", "managers",
    "managing", "manual", "manufacturing", "map", "mapping", "maps", "market",
    "marketing", "marketplace", "master", "match", "matcher", "matching", "material",
    "materials", "math", "matrix", "max", "maximum", "mean", "measurable",
    "measure", "measurement", "mechanism", "media", "medical", "medicine", "medium",
    "meeting", "meetings", "member", "members", "memory", "mentor", "mentorship",
    "menu", "merge", "message", "messages", "messaging", "meta", "metadata",
    "method", "methodology", "methods", "metric", "metrics", "micro",
    "microservice", "microservices", "microsoft", "middleware", "migration",
    "milestone", "million", "min", "minimum", "mining", "minute", "minutes",
    "missing", "mission", "ml", "mobile", "mode", "model", "modeling", "models",
    "modern", "modification", "modular", "module", "modules", "mongo", "mongodb",
    "monitor", "monitoring", "monolith", "month", "monthly", "months", "multiple",
    "mvc", "mysql", "name", "names", "national", "native", "natural", "navigation",
    "need", "needs", "net", "network", "networking", "networks", "neural", "next",
    "nginx", "nlp", "node", "nodes", "normal", "normalization", "nosql", "note",
    "notes", "notification", "notifications", "number", "numbers", "numeric",
    "numpy", "oauth", "object", "objective", "objectives", "objects", "observability",
    "office", "official", "offline", "onboarding", "online", "open", "openai",
    "operating", "operation", "operational", "operations", "operator", "operators",
    "opportunity", "optical", "optimal", "optimization", "optimizations", "option",
    "optional", "options", "oracle", "order", "orders", "organization",
    "organizational", "organizations", "original", "orm", "os", "outcome",
    "outcomes", "output", "outputs", "overall", "overhead", "overview", "owner",
    "ownership", "package", "packages", "packaging", "page", "pages", "pagination",
    "pair", "pandas", "panel", "paper", "paragraph", "paragraphs", "parallel",
    "parameter", "parameters", "parse", "parser", "parsers", "parsing", "part",
    "partial", "participant", "participants", "partner", "partners", "party",
    "pass", "password", "path", "paths", "patient", "patients", "pattern",
    "patterns", "payload", "payloads", "payment", "payments", "pdf", "peer",
    "pending", "people", "percent", "percentage", "performance", "period",
    "permission", "permissions", "persistent", "personal", "personalized", "phase",
    "phases", "phone", "photo", "photos", "php", "physical", "pipeline", "pipelines",
    "plan", "planning", "plans", "platform", "platforms", "playwright", "plugin",
    "plugins", "plus", "point", "points", "policies", "policy", "pool", "portal",
    "portfolio", "position", "positions", "positive", "postgres", "postgresql",
    "post", "postman", "posts", "power", "powered", "practice", "practices",
    "precision", "prediction", "predictions", "predictive", "preference",
    "preferences", "preferred", "preparation", "presence", "presentation",
    "presentations", "president", "prevent", "prevention", "preview", "previous",
    "price", "pricing", "primary", "principal", "principle", "principles", "print",
    "prior", "priority", "prisma", "privacy", "private", "pro", " proactive".strip(),
    "problem", "problems", "procedure", "procedures", "process", "processes",
    "processing", "processor", "product", "production", "productivity", "products",
    "professional", "professionals", "profile", "profiles", "profit", "program",
    "programmer", "programming", "programs", "progress", "project", "projects",
    "prompt", "prompts", "proof", "properties", "property", "proposal", "protected",
    "protection", "protocol", "protocols", "prototype", "prototypes", "provider",
    "providers", "proxy", "public", "publication", "publications", "publish",
    "publishing", "pull", "purchase", "purpose", "push", "py", "pytest", "python",
    "pytorch", "qa", "qualifications", "qualified", "quality", "quantified",
    "quantitative", "quantities", "quantity", "quarter", "quarterly", "queries",
    "query", "queue", "queues", "quick", "quiz", "quota", "quote", "rabbit",
    "rabbitmq", "rag", "rail", "rails", "random", "range", "ranges", "rank",
    "ranking", "rapid", "rate", "rates", "rating", "ratings", "ratio", "raw",
    "react", "reactive", "read", "readability", "readable", "reader", "readiness",
    "reading", "ready", "real", "realtime", "reason", "reasoning", "receipt",
    "receive", "received", "recent", "recognition", "recommendation",
    "recommendations", "record", "recording", "records", "recovery", "recruiter",
    "recruiters", "recruiting", "recruitment", "redesign", "redis", "reduction",
    "redux", "reference", "references", "referral", "REGIONAL".lower(), "register",
    "registration", "registry", "regression", "regular", "regulation", "relational",
    "relationship", "relationships", "release", "releases", "relevance", "relevant",
    "reliability", "reliable", "remote", "removal", "render", "rendering", "repair",
    "repeat", "replace", "replacement", "replica", "replication", "reply", "report",
    "Collider".lower(), "reporting", "reports", "repositories", "repository",
    "representation", "representative", "request", "requests", "required",
    "requirement", "requirements", "research", "researcher", "reservation",
    "reset", "resilience", "resilient", "resolution", "resource", "resources",
    "response", "responses", "responsibilities", "responsibility", "responsible",
    "responsive", "rest", "restful", "restore", "result", "results", "resume",
    "resumes", "retail", "retention", "retrieval", "return", "returns", "usable",
    "reusable", "reuse", "revenue", "review", "reviews", "revision", "rich",
    "right", "rights", "risk", "risks", "road", "roadmap", "robot", "robotics",
    "robust", "role", "roles", "rollback", "room", "root", "roster", "rotation",
    "route", "router", "routes", "routing", "row", "rows", "rpc", "rps", "ruby",
    "rule", "rules", "run", "runner", "running", "runtime", "rust", "saas", "safe",
    "safety", "sale", "sales", "sample", "samples", "sandbox", "sass", "satisfaction",
    "save", "saved", "saving", "savings", "scalability", "scalable", "scale",
    "scaling", "scan", "scanned", "scanner", "scanning", "scenario", "scenarios",
    "schedule", "scheduled", "scheduler", "schedules", "scheduling", "schema",
    "schemas", "scheme", "school", "science", "scientific", "scientist", "scikit",
    "scope", "score", "scores", "scoring", "screen", "screening", "screens",
    "script", "scripting", "scripts", "scrum", "sdk", "search", "searching",
    "season", "seat", "sec", "second", "secondary", "seconds", "secret", "secrets",
    "section", "sections", "sector", "secure", "security", "seed", "segment",
    "segmentation", "segments", "select", "selected", "selection", "selenium",
    "self", "semantic", "semester", "semi", "senior", "sensor", "sensors",
    "sentence", "sentences", "sentiment", "separate", "separation", "sequence",
    "series", "server", "serverless", "servers", "service", "services", "session",
    "sessions", "set", "sets", "setting", "settings", "setup", "several",
    "severity", "share", "shared", "sharing", "sheet", "sheets", "shell", "shift",
    "ship", "shipping", "shop", "shopping", "short", "shortcut", "shortlist",
    "show", "side", "signal", "signals", "signature", "signatures", "significant",
    "similar", "similarity", "simple", "simulation", "single", "site", "sites",
    "situation", "size", "sizes", "skill", "skilled", "skills", "skip", "sla",
    "slack", "slice", "slide", "slides", "slow", "small", "smart", "smooth",
    "snapshot", "snowflake", "soap", "social", "socket", "sockets", "soft",
    "software", "solid", "solution", "solutions", "solve", "solver", "solving",
    "sort", "sorting", "sound", "source", "sources", "space", "spaces", "spacing",
    "spacy", "span", "spark", "sparse", "spatial", "spec", "special", "specialist",
    "specialized", "specific", "specification", "specifications", "specs", "speech",
    "speed", "spend", "spending", "sphere", "split", "spring", "sprint", "sprints",
    "sql", "sqlite", "squad", "square", "stability", "stable", "stack", "staff",
    "stage", "stages", "staging", "stakeholder", "stakeholders", "stand",
    "standalone", "standard", "standards", "star", "start", "starter", "startup",
    "state", "statement", "statements", "states", "static", "station", "statistic",
    "statistical", "statistics", "stats", "status", "step", "steps", "stock",
    "stop", "storage", "store", "stored", "stores", "stories", "story",
    "strategic", "strategies", "strategy", "stream", "streaming", "streams",
    "strength", "stress", "strict", "string", "strings", "strong", "structural",
    "structure", "structured", "structures", "student", "students", "studies",
    "studio", "study", "style", "styles", "styling", "sub", "subject",
    "submission", "submissions", "submit", "subscription", "subscriptions",
    "subset", "success", "successful", "successfully", "suite", "summaries",
    "summary", "summer", "super", "SUPERVISOR".lower(), "supply", "support",
    "supported", "supporting", "surface", "survey", "surveys", "swagger", "swarm",
    "swift", "switch", "switching", "symbol", "symbols", "sync", "synchronization",
    "synchronous", "syntax", "synthesis", "synthetic", "system", "systematic",
    "systems", "tab", "table", "tableau", "tables", "tablet", "tabs", "tag",
    "tagging", "tags", "tailwind", "talent", "talk", "target", "targeted",
    "targets", "task", "tasks", "tax", "taxonomy", "team", "teams", "teamwork",
    "tech", "technical", "technique", "techniques", "technologies", "technology",
    "telemetry", "telephone", "template", "templates", "temporary", "tenant",
    "tenants", "tensor", "tensorflow", "term", "terminal", "terminology", "terms",
    "terraform", "test", "tested", "tester", "testing", "tests", "text", "texts",
    "textual", "theme", "themes", "theory", "thesis", "third", "thread", "threads",
    "threat", "threats", "threshold", "throughput", "ticket", "tickets", "tier",
    "time", "timeline", "timer", "times", "timeout", "timing", "tip", "tips",
    "title", "titles", "token", "tokenizer", "tokens", "tolerance", "tool",
    "High-Throughput".lower(), "toolbar", "toolkit", "tools", "top", "topic",
    "topics", "total", "touch", "tour", "trace", "tracing", "track", "tracker",
    "tracking", "trade", "trading", "traditional", "traffic", "trail", "train",
    "trained", "trainer", "training", "transaction", "transactions", "transcript",
    "transfer", "transform", "transformation", "transformations", "transformer",
    "transformers", "transition", "transitions", "translation", "transmission",
    "transparent", "transport", "travel", "tree", "trend", "trends", "trial",
    "trigger", "triggers", "troubleshooting", "true", "trust", "trusted", "tuning",
    "tunnel", "turn", "tutorial", "type", "typed", "types", "typescript", "typical",
    "typography", "ubuntu", "ui", "ultimate", "unable", "unauthenticated",
    "unavailable", "under", "UNDERGRADUATE".lower(), "understanding", "unified",
    "uniform", "union", "unique", "unit", "united", "units", "universal",
    "universities", "university", "unix", "unknown", "unlimited", "unlock",
    "unprotected", "unquantified", "unreadable", "unsupported", "unsupervised",
    "update", "updated", "updates", "updating", "upgrade", "upgraded", "upgrades",
    "upload", "uploaded", "uploading", "uploads", "upper", "upstream", "uptime",
    "urban", "uri", "url", "urls", "usability", "usable", "usage", "use", "used",
    "useful", "user", "users", "uses", "using", "usual", "utilities", "utility",
    "utilization", "ux", "v1", "v2", "v3", "valid", "validation", "validations",
    "validator", "valuable", "value", "values", "variable", "variables", "variant",
    "variants", "variation", "various", "vault", "vector", "vectors", "vendor",
    "vendors", "verbal", "verification", "verified", "verifier", "verify",
    "verifying", "version", "versioning", "versions", "vertical", "via", "video",
    "videos", "view", "viewer", "views", "virtual", "virtualization", "visibility",
    "visible", "vision", "visit", "visitor", "visitors", "visual", "visualization",
    "visualizations", "vital", "vite", "vitest", "vocabulary", "voice", "volume",
    "volunteer", "volunteering", "vote", "vulnerabilities", "vulnerability", "vue",
    "wait", "waiting", "walkthrough", "wallet", "warehouse", "warehousing",
    "warning", "warnings", "watch", "watcher", "water", "wave", "way", "ways",
    "weak", "wealth", "weather", "web", "webcam", "webhook", "webhooks", "webpack",
    "websocket", "websockets", "website", "websites", "webview", "week", "weekly",
    "weeks", "weight", "weighted", "weights", "welcome", "well", "west", "wide",
    "widget", "widgets", "width", "wifi", "wiki", "win", "window", "windows",
    "winter", "wire", "wireframe", "wireless", "wiring", "wise", "wizard", "word",
    "words", "work", "workbench", "worker", "workers", "workflow", "workflows",
    "working", "workload", "workloads", "Workplace".lower(), "works", "workshop",
    "workshops", "workspace", "workspaces", "world", "worldwide", "wrap",
    "wrapped", "wrapper", "wrapping", "write", "writer", "writing", "written",
    "wrong", "xml", "xray", "yaml", "year", "yearly", "years", "yield", "zero",
    "zip", "zone", "zones", "zoom",
}

# Canonical ATS sections and exact heading patterns (matched only against short standalone heading lines)
SECTION_PATTERNS: List[Tuple[str, re.Pattern]] = [
    (
        "Professional Summary",
        re.compile(
            r"^(?:professional\s+summary|executive\s+summary|career\s+summary|summary\s+of\s+qualifications|summary|profile|professional\s+profile|career\s+objective|objective|about\s+me)$",
            re.IGNORECASE,
        ),
    ),
    (
        "Skills",
        re.compile(
            r"^(?:technical\s+skills|core\s+competencies|skills\s*(?:&|and)\s*technologies|skills\s*(?:&|and)\s*tools|key\s+skills|skills|technologies|tech\s+stack|areas\s+of\s+expertise|competencies|technical\s+proficiencies)$",
            re.IGNORECASE,
        ),
    ),
    (
        "Work Experience",
        re.compile(
            r"^(?:work\s+experience|professional\s+experience|employment\s+history|experience|relevant\s+experience|career\s+history|internships?|work\s+history|industrial\s+training)$",
            re.IGNORECASE,
        ),
    ),
    (
        "Education",
        re.compile(
            r"^(?:education|academic\s+background|educational\s+qualifications|academics|education\s*(?:&|and)\s*training|academic\s+qualifications)$",
            re.IGNORECASE,
        ),
    ),
    (
        "Projects",
        re.compile(
            r"^(?:projects|key\s+projects|technical\s+projects|personal\s+projects|academic\s+projects|selected\s+projects|featured\s+projects)$",
            re.IGNORECASE,
        ),
    ),
    (
        "Certifications",
        re.compile(
            r"^(?:certifications?|licenses?\s*(?:&|and)\s*certifications?|professional\s+certifications?|certificates?\s*(?:&|and)?\s*courses?|training\s*(?:&|and)\s*certifications?)$",
            re.IGNORECASE,
        ),
    ),
    (
        "Achievements",
        re.compile(
            r"^(?:achievements?|awards?\s*(?:&|and)\s*achievements?|honors?\s*(?:&|and)\s*awards?|awards?|accomplishments?|publications?|extracurricular\s+activities|leadership|positions?\s+of\s+responsibility)$",
            re.IGNORECASE,
        ),
    ),
]

CORE_EXPECTED_SECTIONS: List[str] = [
    "Professional Summary",
    "Skills",
    "Work Experience",
    "Education",
    "Projects",
]


@dataclass
class ParsedResumeDocument:
    """Normalized in-memory representation of an extracted resume."""

    file_name: str
    file_type: str  # "PDF" or "DOCX"
    file_size_kb: float
    page_or_section_count: int
    raw_text: str
    normalized_text: str
    lines: List[str] = field(default_factory=list)
    bullet_lines: List[str] = field(default_factory=list)
    sections: Dict[str, List[str]] = field(default_factory=dict)
    detected_sections: List[str] = field(default_factory=list)
    missing_sections: List[str] = field(default_factory=list)
    word_count: int = 0
    extraction_method: str = "native_text"
    document_classification: str = "text_based_document"
    ocr_attempted: bool = False
    ocr_available: bool = False
    extraction_warnings: List[str] = field(default_factory=list)


def _is_known_vocab_word(word: str) -> bool:
    """Check if a lowercase alphabetic token is in the resume vocabulary or is a valid morphological inflection."""
    w = word.lower()
    if w in RESUME_SEGMENTATION_VOCAB or w in PROTECTED_CASE_TOKENS:
        return True
    # Common morphological suffixes
    for suffix, min_stem in (
        ("ing", 3),
        ("ed", 3),
        ("es", 3),
        ("s", 3),
        ("ly", 3),
        ("tion", 3),
        ("ment", 3),
        ("ness", 3),
        ("able", 3),
        ("ible", 3),
        ("er", 3),
        ("or", 3),
        ("ist", 3),
        ("al", 3),
        ("ive", 3),
    ):
        if w.endswith(suffix) and len(w) - len(suffix) >= min_stem:
            stem = w[: -len(suffix)]
            if (
                stem in RESUME_SEGMENTATION_VOCAB
                or (stem + "e") in RESUME_SEGMENTATION_VOCAB
                or (len(stem) >= 4 and stem[-1] == stem[-2] and stem[:-1] in RESUME_SEGMENTATION_VOCAB)
            ):
                return True
    return False


@lru_cache(maxsize=2048)
def deconcatenate_glued_token(token: str) -> str:
    """
    Recover word boundaries from a long PDF kerning-glued alphabetic token
    (e.g., 'DevelopedresponsiveReactinterfacesforacancerinstitutemanagementsystem')
    using dynamic programming over RESUME_SEGMENTATION_VOCAB + case-transition hints.
    Leaves legitimate single words, URLs, emails, and identifiers untouched.
    """
    if len(token) < 12 or not token.isalpha():
        return token

    lower_tok = token.lower()
    if lower_tok in PROTECTED_CASE_TOKENS:
        return PROTECTED_CASE_TOKENS[lower_tok]
    if _is_known_vocab_word(lower_tok):
        return token

    n = len(token)
    # dp[i] = (best_cost, prev_index) to segment token[:i]
    INF = 10**9
    dp: List[Tuple[int, int]] = [(INF, -1)] * (n + 1)
    dp[0] = (0, 0)

    for i in range(1, n + 1):
        best_cost = INF
        best_prev = -1
        # Candidate word lengths from 1 to 22
        start_min = max(0, i - 22)
        for j in range(start_min, i):
            prev_cost = dp[j][0]
            if prev_cost >= INF:
                continue

            sub_orig = token[j:i]
            sub_lower = lower_tok[j:i]
            length = i - j

            if _is_known_vocab_word(sub_lower):
                # Prefer longer valid dictionary words so 'interfaces' beats 'inter' + 'faces'
                if length == 1 and sub_lower not in ("a", "i"):
                    word_cost = 45
                elif length == 1:
                    word_cost = 14
                elif length == 2:
                    word_cost = 10
                else:
                    # Reward longer matched dictionary words
                    word_cost = max(2, 12 - length)
            else:
                # Unknown chunk: only allow at an explicit Capitalized boundary or penalize heavily
                if sub_orig[0].isupper() and sub_orig[1:].islower() and length >= 3:
                    word_cost = 18 + length
                else:
                    word_cost = 55 + (length * 4)

            # Bonus when a split aligns with a lower->Upper or Upper->UpperLower case transition
            if j > 0 and token[j].isupper() and token[j - 1].islower():
                word_cost = max(1, word_cost - 5)

            total_cost = prev_cost + word_cost
            if total_cost < best_cost:
                best_cost = total_cost
                best_prev = j

        dp[i] = (best_cost, best_prev)

    # Reconstruct segments
    segments: List[str] = []
    curr = n
    while curr > 0:
        prev = dp[curr][1]
        if prev < 0 or prev == curr:
            return token
        segments.append(token[prev:curr])
        curr = prev
    segments.reverse()

    if len(segments) <= 1:
        return token

    # Verify that at least 70% of recovered characters belong to recognized vocabulary words
    recognized_chars = sum(
        len(seg) for seg in segments if _is_known_vocab_word(seg.lower()) or (seg[0].isupper() and len(seg) >= 3)
    )
    if recognized_chars / n < 0.72:
        return token

    # Restore canonical casing for protected tech tokens
    restored = [
        PROTECTED_CASE_TOKENS.get(seg.lower(), seg) for seg in segments
    ]
    return " ".join(restored)


def repair_line_word_boundaries(line: str) -> str:
    """
    Layout-aware word boundary recovery for lines extracted from PDFs with tight kerning.
    1. Protects URLs, emails, and known CamelCase technical identifiers (JavaScript, FastAPI, MongoDB, etc.).
    2. Separates unspaced camel/Pascal transitions (e.g. 'AaravSharma' -> 'Aarav Sharma', 'BuiltRESTAPIs' -> 'Built REST APIs').
    3. Separates letter-digit concatenations ('serving500patients' -> 'serving 500 patients') except technical tokens (HTML5, CSS3, S3, EC2, OAuth2, 3x).
    4. Applies vocabulary-guided DP segmentation to remaining glued alphabetic runs >= 13 chars.
    """
    if not line:
        return line

    tokens = line.split(" ")
    repaired_tokens: List[str] = []

    for tok in tokens:
        if not tok:
            continue

        # Never alter URLs, emails, or paths
        if (
            "@" in tok
            or "http://" in tok.lower()
            or "https://" in tok.lower()
            or "linkedin.com" in tok.lower()
            or "github.com" in tok.lower()
            or "gitlab.com" in tok.lower()
        ):
            repaired_tokens.append(tok)
            continue

        # Check if exact token (stripped of trailing punctuation) is a protected technical term
        lead_punct = ""
        trail_punct = ""
        core = tok
        while core and not core[0].isalnum():
            lead_punct += core[0]
            core = core[1:]
        while core and not core[-1].isalnum() and core[-1] not in ("+", "#", "%"):
            trail_punct = core[-1] + trail_punct
            core = core[:-1]

        if not core:
            repaired_tokens.append(tok)
            continue

        if core.lower() in PROTECTED_CASE_TOKENS:
            repaired_tokens.append(
                f"{lead_punct}{PROTECTED_CASE_TOKENS[core.lower()]}{trail_punct}"
            )
            continue

        # Protect known tokens inside composite strings by temporarily replacing them with placeholders
        working = core
        placeholders: Dict[str, str] = {}
        for idx, (lower_prot, canonical_prot) in enumerate(
            sorted(PROTECTED_CASE_TOKENS.items(), key=lambda kv: -len(kv[0]))
        ):
            if len(lower_prot) >= 4 and lower_prot in working.lower():
                ph = f"__P{idx}__"
                pattern = re.compile(re.escape(lower_prot), re.IGNORECASE)
                if pattern.search(working):
                    working = pattern.sub(f" {ph} ", working)
                    placeholders[ph] = canonical_prot

        # Split letter-to-digit and digit-to-letter transitions for multi-digit numbers (e.g. 'serving500patients' -> 'serving 500 patients')
        working = re.sub(r"([A-Za-z]{2,})(\d{2,}[+%$]?)", r"\1 \2", working)
        working = re.sub(r"(\d+[+%$]?)([A-Za-z]{3,})", r"\1 \2", working)

        # Split UPPERCASE acronym followed by Lowercase word (e.g. 'RESTAPIsserving' -> 'REST APIs serving', 'PDFfiles' -> 'PDF files')
        working = re.sub(r"([A-Z]{2,})(APIs?|SDKs?|UI|UX|DB)([a-z]{2,})", r"\1 \2 \3", working)
        working = re.sub(r"([A-Z]{2,})([A-Z][a-z]{2,})", r"\1 \2", working)

        # Split lowerCase followed immediately by UpperCase (e.g. 'AaravSharma' -> 'Aarav Sharma', 'DevelopedReact' -> 'Developed React')
        working = re.sub(r"([a-z]{2,})([A-Z][a-z]+)", r"\1 \2", working)
        working = re.sub(r"([a-z]{2,})([A-Z]{2,})", r"\1 \2", working)

        # Restore placeholders and run DP segmentation on any remaining long alphabetic token
        sub_parts: List[str] = []
        for part in working.split():
            if part in placeholders:
                sub_parts.append(placeholders[part])
            elif len(part) >= 13 and part.isalpha():
                sub_parts.append(deconcatenate_glued_token(part))
            else:
                sub_parts.append(part)

        repaired_core = " ".join(sub_parts)
        repaired_tokens.append(f"{lead_punct}{repaired_core}{trail_punct}")

    return re.sub(r"\s+", " ", " ".join(repaired_tokens)).strip()


def match_section_heading(line: str) -> Optional[str]:
    """
    Determine if a line is a section heading.
    Only short standalone lines (<= 55 chars, <= 6 words, not ending with a period) are candidates.
    """
    stripped = line.lstrip("•-* ").strip()
    candidate = re.sub(r"[\:\|\-\–\—]+$", "", stripped).strip()

    if not candidate or len(candidate) > 55 or candidate.endswith("."):
        return None

    words = candidate.split()
    if len(words) > 6:
        return None

    for canonical_name, pattern in SECTION_PATTERNS:
        if pattern.match(candidate):
            return canonical_name

    return None


def _looks_like_entry_header(line: str) -> bool:
    """
    Heuristic to detect job/project/degree title lines (e.g., 'Software Engineer - HireNest (2023 - Present)')
    so they are not merged as wrapped continuation lines of a previous bullet.
    """
    if "|" in line:
        return True
    if re.search(r"\b(?:19|20)\d{2}\s*(?:[\-\–\—]|to)\s*(?:(?:19|20)\d{2}|Present|Current)\b", line, re.IGNORECASE):
        return True
    words = line.split()
    if len(words) <= 5 and line.endswith(":"):
        return True
    return False


def normalize_resume_text(raw_text: str) -> Tuple[str, List[str], List[str]]:
    """
    Normalize raw extracted text while preserving line structure, recovering glued PDF words,
    and merging wrapped multi-line bullets.
    Returns (normalized_text, non_empty_lines, bullet_lines).
    """
    if not raw_text:
        return "", [], []

    text = raw_text
    for src, target in PRE_CONTROL_CHAR_MAP.items():
        text = text.replace(src, target)

    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    cleaned_lines: List[str] = []
    bullet_lines: List[str] = []
    last_line_was_bullet = False

    for raw_line in text.split("\n"):
        # Remove non-printable control chars except tab
        line = "".join(
            ch for ch in raw_line if ch == "\t" or unicodedata.category(ch)[0] != "C"
        )
        line = re.sub(r"[ \t]+", " ", line).strip()
        if not line:
            last_line_was_bullet = False
            continue

        # Skip standalone page number artifacts like "Page 1 of 2"
        if PAGE_ARTIFACT_PATTERN.match(line):
            continue

        is_explicit_bullet = bool(BULLET_PREFIX_PATTERN.match(line))
        if is_explicit_bullet:
            cleaned_bullet = BULLET_PREFIX_PATTERN.sub("", line).strip()
            cleaned_bullet = repair_line_word_boundaries(cleaned_bullet)
            if cleaned_bullet:
                bullet_lines.append(cleaned_bullet)
                cleaned_lines.append(f"• {cleaned_bullet}")
                last_line_was_bullet = True
            continue

        repaired_line = repair_line_word_boundaries(line)
        if not repaired_line:
            continue

        # Check if this line is a section heading or an entry header
        if match_section_heading(repaired_line) or _looks_like_entry_header(repaired_line):
            cleaned_lines.append(repaired_line)
            last_line_was_bullet = False
            continue

        # If the immediately preceding line was a bullet that did not end with terminal punctuation
        # (or this line starts with a lowercase word/conjunction/number continuation), merge it into the bullet!
        if (
            last_line_was_bullet
            and bullet_lines
            and (
                not bullet_lines[-1].endswith((".", ";", "!"))
                or repaired_line[0].islower()
                or repaired_line.lower().startswith(("and ", "or ", "to ", "by ", "for ", "with ", "across ", "serving ", "reducing ", "increasing ", "improving "))
            )
        ):
            bullet_lines[-1] = f"{bullet_lines[-1]} {repaired_line}".strip()
            cleaned_lines[-1] = f"• {bullet_lines[-1]}"
            last_line_was_bullet = not bullet_lines[-1].endswith(".")
            continue

        cleaned_lines.append(repaired_line)
        last_line_was_bullet = False

    normalized_text = "\n".join(cleaned_lines)
    return normalized_text, cleaned_lines, bullet_lines


def segment_resume_sections(lines: List[str]) -> Tuple[Dict[str, List[str]], List[str], List[str]]:
    """
    Segment normalized resume lines into canonical ATS sections.
    Lines before the first heading are stored under 'Header / Contact'.
    """
    sections: Dict[str, List[str]] = {"Header / Contact": []}
    current_section = "Header / Contact"
    detected_order: List[str] = []

    for line in lines:
        matched_heading = match_section_heading(line)
        if matched_heading:
            current_section = matched_heading
            if matched_heading not in sections:
                sections[matched_heading] = []
            if matched_heading not in detected_order:
                detected_order.append(matched_heading)
            continue

        sections.setdefault(current_section, []).append(line)

    non_empty_detected = [
        sec for sec in detected_order if len(sections.get(sec, [])) > 0
    ]

    missing_sections = [
        sec for sec in CORE_EXPECTED_SECTIONS if sec not in non_empty_detected
    ]

    return sections, non_empty_detected, missing_sections


def build_parsed_resume_document(
    file_name: str,
    file_type: str,
    file_size_bytes: int,
    page_or_section_count: int,
    raw_text: str,
    extraction_method: str = "native_text",
    document_classification: str = "text_based_document",
    ocr_attempted: bool = False,
    ocr_available: bool = False,
    extraction_warnings: Optional[List[str]] = None,
) -> ParsedResumeDocument:
    """Validate minimum readable content and construct a ParsedResumeDocument."""
    normalized_text, lines, bullet_lines = normalize_resume_text(raw_text)
    words = re.findall(r"[A-Za-z0-9\+\#\.]{2,}", normalized_text)

    if len(normalized_text) < 25 or len(words) < 5:
        if file_type == "PDF":
            raise ResumeParseError(
                "No selectable text could be extracted from this PDF. It appears to be a scanned image-only PDF. Please export a text-based PDF or upload a DOCX resume.",
                status_code=422,
                document_classification=document_classification,
                ocr_available=ocr_available,
            )
        raise ResumeParseError(
            "The uploaded document does not contain enough readable resume text to analyze.",
            status_code=422,
            document_classification=document_classification,
            ocr_available=ocr_available,
        )

    sections, detected_sections, missing_sections = segment_resume_sections(lines)

    # Heuristic fallback: if bullets were not prefixed with explicit bullet glyphs,
    # capture action-oriented lines inside Work Experience / Projects / Achievements
    if not bullet_lines:
        for sec_name in ("Work Experience", "Projects", "Achievements"):
            for sec_line in sections.get(sec_name, []):
                if _looks_like_entry_header(sec_line):
                    continue
                if len(sec_line.split()) >= 5:
                    bullet_lines.append(sec_line.lstrip("• ").strip())

    return ParsedResumeDocument(
        file_name=file_name,
        file_type=file_type,
        file_size_kb=round(file_size_bytes / 1024, 2),
        page_or_section_count=max(1, page_or_section_count),
        raw_text=raw_text,
        normalized_text=normalized_text,
        lines=lines,
        bullet_lines=bullet_lines,
        sections=sections,
        detected_sections=detected_sections,
        missing_sections=missing_sections,
        word_count=len(words),
        extraction_method=extraction_method,
        document_classification=document_classification,
        ocr_attempted=ocr_attempted,
        ocr_available=ocr_available,
        extraction_warnings=list(extraction_warnings or []),
    )

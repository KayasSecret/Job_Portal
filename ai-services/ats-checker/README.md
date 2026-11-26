# HireNest — ATS Resume Score Checker Microservice

Independent Python + FastAPI microservice powering HireNest's **AI-Powered ATS Resume Score Checker** for Job Seekers.

## Architecture & Security Principles
- **Loopback Binding Only:** Runs on `127.0.0.1:8001` and is accessed exclusively through the Node.js/Express backend proxy (`/api/v1/ats/*`).
- **Internal Service Authentication:** Protected endpoints require the `X-Internal-Service-Token` header validated via constant-time `secrets.compare_digest`.
- **In-Memory Processing:** Resumes (`.pdf` and `.docx`, max 5 MB) are parsed and analyzed completely in memory (`BytesIO`) without writing temporary files to disk or logging raw resume PII.
- **Transparent Dual Scoring:**
  - **Resume ATS Readiness Score (`0–100`):** Evaluates structural parseability, contact completeness, essential sections, measurable impact, action verbs, and keyword coverage.
  - **Job Match Score (`0–100` or `null`):** Evaluates alignment against a user-supplied target Job Description when provided.

## Local Setup (Windows PowerShell)

```powershell
cd ai-services/ats-checker
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## Running Tests

```powershell
cd ai-services/ats-checker
.\.venv\Scripts\pytest -v
```

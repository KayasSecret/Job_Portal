import path from "path";

const DEFAULT_ATS_SERVICE_URL = "http://127.0.0.1:8001";
const DEFAULT_ATS_SERVICE_SECRET =
  "hirenest_internal_ats_secret_dev_9f8e7d6c5b4a3210";
const MAX_JD_CHARS = 10000;

const getAtsConfig = () => ({
  serviceUrl: (process.env.ATS_SERVICE_URL || DEFAULT_ATS_SERVICE_URL).replace(
    /\/+$/,
    ""
  ),
  serviceSecret:
    process.env.ATS_SERVICE_SECRET || DEFAULT_ATS_SERVICE_SECRET,
});

/**
 * Verify PDF (%PDF-) or DOCX (PK\x03\x04) magic header bytes in memory
 * before forwarding the buffer to the Python microservice.
 */
const hasValidMagicHeader = (buffer, originalname) => {
  if (!buffer || buffer.length < 5) return false;
  const ext = path.extname(originalname || "").toLowerCase();

  if (ext === ".pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (ext === ".docx") {
    return (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    );
  }

  return false;
};

/**
 * GET /api/v1/ats/health
 * Authenticated Job Seeker check to verify the ATS analysis engine is reachable.
 */
export const checkAtsServiceHealth = async (req, res) => {
  const { serviceUrl } = getAtsConfig();

  try {
    const response = await fetch(`${serviceUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(503).json({
        success: false,
        message: "ATS analysis engine is currently unavailable.",
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      status: data.status || "healthy",
      service: data.service || "hirenest-ats-checker",
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message:
        "ATS analysis engine is currently offline. Please try again shortly.",
    });
  }
};

/**
 * POST /api/v1/ats/analyze
 * Authenticated Job Seeker endpoint that validates the uploaded resume in memory
 * and proxies it over loopback to the Python FastAPI ATS microservice.
 */
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF (.pdf) or Word (.docx) resume to analyze.",
      });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    if (size === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded resume file is empty.",
      });
    }

    if (!hasValidMagicHeader(buffer, originalname)) {
      return res.status(400).json({
        success: false,
        message:
          "The uploaded file signature does not match a valid PDF or DOCX document.",
      });
    }

    const rawJobDescription =
      req.body?.jobDescription ?? req.body?.job_description ?? "";
    const jobDescription =
      typeof rawJobDescription === "string" ? rawJobDescription.trim() : "";

    if (jobDescription.length > MAX_JD_CHARS) {
      return res.status(400).json({
        success: false,
        message: `Job description cannot exceed ${MAX_JD_CHARS.toLocaleString()} characters.`,
      });
    }

    const { serviceUrl, serviceSecret } = getAtsConfig();

    const formData = new FormData();
    const fileBlob = new Blob([buffer], { type: mimetype });
    formData.append("resume_file", fileBlob, path.basename(originalname));

    if (jobDescription) {
      formData.append("job_description", jobDescription);
    }

    const response = await fetch(`${serviceUrl}/api/v1/ats/analyze`, {
      method: "POST",
      headers: {
        "X-Internal-Service-Token": serviceSecret,
      },
      body: formData,
      signal: AbortSignal.timeout(30000),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const statusCode =
        response.status >= 400 && response.status < 600 ? response.status : 502;
      return res.status(statusCode).json({
        success: false,
        message:
          payload?.message ||
          payload?.detail ||
          "Unable to complete resume ATS analysis.",
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message:
          "Resume analysis timed out. Please try again with a standard text-based PDF or DOCX resume.",
      });
    }

    return res.status(503).json({
      success: false,
      message:
        "ATS analysis engine is temporarily unreachable. Please ensure the AI service is running and try again.",
    });
  }
};

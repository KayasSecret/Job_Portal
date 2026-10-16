import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Allowed image types (Avatars, Company Logos, Event Banners)
const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Allowed resume types (Candidate Resumes)
const RESUME_MIME_TYPES = ["application/pdf"];
const RESUME_EXTENSIONS = [".pdf"];

// 1. Image Filter (Max 5MB)
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isMimeValid = IMAGE_MIME_TYPES.includes(file.mimetype);
  const isExtValid = IMAGE_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    const error = new Error(
      "Invalid image format. Only JPEG, PNG, and WebP images are allowed."
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

// 2. Resume Filter (Max 10MB)
const resumeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isMimeValid = RESUME_MIME_TYPES.includes(file.mimetype);
  const isExtValid = RESUME_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    const error = new Error(
      "Invalid document format. Only PDF resumes are allowed."
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

const rawImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFileFilter,
}).single("file");

const rawResumeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (aligned with frontend)
  fileFilter: resumeFileFilter,
}).single("file");

/**
 * Middleware for image uploads (Profile photos, Company logos, Event banners)
 * Enforces 5MB limit and JPEG, PNG, WebP only.
 */
export const imageUpload = (req, res, next) => {
  rawImageUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Image file size exceeds the 5MB limit.",
          success: false,
        });
      }
      return res.status(400).json({
        message: err.message || "Image upload error.",
        success: false,
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        message: err.message || "Invalid image upload.",
        success: false,
      });
    }
    next();
  });
};

/**
 * Middleware for PDF resume uploads
 * Enforces 10MB limit and PDF documents only.
 */
export const resumeUpload = (req, res, next) => {
  rawResumeUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Resume file size exceeds the 10MB limit.",
          success: false,
        });
      }
      return res.status(400).json({
        message: err.message || "Resume upload error.",
        success: false,
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        message: err.message || "Invalid resume upload.",
        success: false,
      });
    }
    next();
  });
};

// Backward-compatible alias for existing imports
export const singleUpload = imageUpload;
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    const error = new Error(
      "Invalid file format. Only JPEG, PNG, WEBP images and PDF documents are allowed."
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
}).single("file");

export const singleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size exceeds the 5MB limit.",
          success: false,
        });
      }
      return res.status(400).json({
        message: err.message || "File upload error.",
        success: false,
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        message: err.message || "Invalid file upload.",
        success: false,
      });
    }
    next();
  });
};
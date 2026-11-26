import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { atsResumeUpload } from "../middlewares/multer.js";
import {
  analyzeResume,
  checkAtsServiceHealth,
} from "../controllers/ats.controller.js";

const router = express.Router();

// Strictly restricted to authenticated Job Seekers ("student" role)
router.get(
  "/health",
  isAuthenticated,
  authorizeRole("student"),
  checkAtsServiceHealth
);

router.post(
  "/analyze",
  isAuthenticated,
  authorizeRole("student"),
  atsResumeUpload,
  analyzeResume
);

export default router;

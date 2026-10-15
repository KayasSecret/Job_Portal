import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import { applyJob, getApplicants, getAppliedJobs, updateStatus, getAllRecruiterApplicants } from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, authorizeRole("student"), applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/recruiter/all").get(isAuthenticated, authorizeRole("recruiter"), getAllRecruiterApplicants);
router.route("/:id/applicants").get(isAuthenticated, authorizeRole("recruiter"), getApplicants);
router.route("/status/:id/update").post(isAuthenticated, authorizeRole("recruiter"), updateStatus);

export default router;
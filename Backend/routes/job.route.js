import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import {
    postJob,
    getAllJobs,
    getAdminJobs,
    getJobById,
    deleteJob
} from "../controllers/job.controller.js";

const router = express.Router();

// Only recruiters can post jobs or view their admin job list
router.route("/post").post(isAuthenticated, authorizeRole("recruiter"), postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, authorizeRole("recruiter"), getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/delete/:id").delete(isAuthenticated, authorizeRole("recruiter"), deleteJob);

export default router;
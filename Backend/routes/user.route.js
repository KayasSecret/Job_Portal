import express from "express";
import { register, login, logout, getUserProfile, updateProfile, updateProfilePhoto, saveJob, unsaveJob, getSavedJobs } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { imageUpload, resumeUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(imageUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout).post(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").post(isAuthenticated, resumeUpload, updateProfile);
router.route("/profile/photo").post(isAuthenticated, imageUpload, updateProfilePhoto);
router.route("/savejob/:jobId").post(isAuthenticated, saveJob);
router.route("/savejob/:jobId").delete(isAuthenticated, unsaveJob);
router.route("/unsavejob/:jobId").post(isAuthenticated, unsaveJob);
router.route("/savedjobs").get(isAuthenticated, getSavedJobs);

export default router;
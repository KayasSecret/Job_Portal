import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { getCompany, getCompanyById, registerCompany, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import { imageUpload } from "../middlewares/multer.js";

const router = express.Router();

// Only recruiters can register, update, or delete companies
router.route("/register").post(isAuthenticated, authorizeRole("recruiter"), imageUpload, registerCompany);
router.route("/get").get(isAuthenticated, authorizeRole("recruiter"), getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
router.route("/update/:id").put(isAuthenticated, authorizeRole("recruiter"), imageUpload, updateCompany);
router.route("/delete/:id").delete(isAuthenticated, authorizeRole("recruiter"), deleteCompany);

export default router;
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminEvents,
} from "../controllers/event.controller.js";

const router = express.Router();

// Only recruiters can create, update, delete events or view their admin event list
router.post("/", isAuthenticated, authorizeRole("recruiter"), createEvent);

// Public: anyone can view events
router.get("/", getAllEvents);

// Recruiter admin events (must be before /:id)
router.get("/admin", isAuthenticated, authorizeRole("recruiter"), getAdminEvents);

// Public: anyone can view a single event
router.get("/:id", getEventById);

// Only recruiters can update or delete events
router.put("/:id", isAuthenticated, authorizeRole("recruiter"), updateEvent);
router.delete("/:id", isAuthenticated, authorizeRole("recruiter"), deleteEvent);

export default router;
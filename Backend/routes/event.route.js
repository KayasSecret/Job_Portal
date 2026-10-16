import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRole from "../middlewares/authorizeRole.js";
import { imageUpload } from "../middlewares/multer.js";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminEvents,
  registerForEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

// Only recruiters can create events (supports multipart image upload and JSON)
router.post(
  "/",
  isAuthenticated,
  authorizeRole("recruiter"),
  imageUpload,
  createEvent
);

// Public: anyone can view published events
router.get("/", getAllEvents);

// Recruiter admin events (must be declared before /:id)
router.get(
  "/admin",
  isAuthenticated,
  authorizeRole("recruiter"),
  getAdminEvents
);

// Public / Authenticated: view single event details
router.get("/:id", getEventById);

// Only owner recruiter can update event (supports multipart image upload and JSON)
router.put(
  "/:id",
  isAuthenticated,
  authorizeRole("recruiter"),
  imageUpload,
  updateEvent
);

// Only owner recruiter can delete event
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRole("recruiter"),
  deleteEvent
);

// Authenticated user (student/attendee) can register / RSVP for an event
router.post("/:id/register", isAuthenticated, registerForEvent);

export default router;
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminEvents,
} from "../controllers/event.controller.js";

const router = express.Router();

// Create Event
router.post("/", isAuthenticated, createEvent);

// Get All Events
router.get("/", getAllEvents);

// Get Admin Events (must be before /:id)
router.get("/admin", isAuthenticated, getAdminEvents);

// Get Single Event
router.get("/:id", getEventById);

// Update Event
router.put("/:id", isAuthenticated, updateEvent);

// Delete Event
router.delete("/:id", isAuthenticated, deleteEvent);

export default router;
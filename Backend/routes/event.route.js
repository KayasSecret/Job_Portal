import express from "express";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

// Create Event
router.post("/", createEvent);

// Get All Events
router.get("/", getAllEvents);

// Get Single Event
router.get("/:id", getEventById);

// Update Event
router.put("/:id", updateEvent);

// Delete Event
router.delete("/:id", deleteEvent);

export default router;
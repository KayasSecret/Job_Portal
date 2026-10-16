import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary, { deleteCloudinaryAsset } from "../utils/cloudinary.js";

// Helper to safely parse JSON or comma-separated arrays
const parseArrayField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, treat as comma-separated
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

// Helper to safely parse agenda
const parseAgendaField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
};

// ==========================================
// 1. CREATE EVENT (Recruiter only)
// ==========================================
export const createEvent = async (req, res) => {
  try {
    const userId = req.id;
    const body = req.body || {};

    let bannerUrl = body.banner || "";
    let bannerPublicId = "";

    // If an image file was uploaded via multer, upload to Cloudinary
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          folder: "hirenest/event-banners",
          resource_type: "image",
        });
        if (cloudResponse && cloudResponse.secure_url) {
          bannerUrl = cloudResponse.secure_url;
          bannerPublicId = cloudResponse.public_id;
        }
      } catch (uploadError) {
        console.error("Event image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload cover image. Please check file format and size.",
        });
      }
    }

    // Resolve organizer name fallback
    let organizer = body.organizer?.trim();
    if (!organizer) {
      const currentUser = await User.findById(userId);
      organizer = currentUser?.fullName || "Verified Tech Host";
    }

    // Validate title and description
    if (!body.title?.trim() || !body.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required fields.",
      });
    }

    // Validate date
    if (!body.eventDate) {
      return res.status(400).json({
        success: false,
        message: "Start date/time is required.",
      });
    }

    const eventDate = new Date(body.eventDate);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date format.",
      });
    }

    // Format location based on mode
    const mode = body.mode || "Online";
    let location = body.location?.trim() || "";
    if (mode === "Online" && !location) {
      location = "Online / Virtual";
    } else if ((mode === "In-Person" || mode === "Offline") && !location) {
      location = [body.venueName, body.city, body.address].filter(Boolean).join(", ") || "In-Person Venue";
    } else if (mode === "Hybrid" && !location) {
      location = [body.venueName, body.city].filter(Boolean).join(", ") || "Hybrid (Virtual & In-Person)";
    }

    const totalSeats = Number(body.totalSeats) || 100;
    const isUnlimited = body.isUnlimitedCapacity === true || body.isUnlimitedCapacity === "true";
    const price = Number(body.price) || 0;

    const eventData = {
      title: body.title.trim(),
      summary: body.summary?.trim() || "",
      description: body.description.trim(),
      organizer,
      speaker: body.speaker?.trim() || "",
      category: body.category || "Workshop",
      mode,
      location,
      venueName: body.venueName?.trim() || "",
      address: body.address?.trim() || "",
      city: body.city?.trim() || "",
      meetingLink: body.meetingLink?.trim() || "",
      isMeetingLinkPublic: body.isMeetingLinkPublic === undefined ? true : (body.isMeetingLinkPublic === true || body.isMeetingLinkPublic === "true"),
      eventDate,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      startTime: body.startTime || "10:00",
      endTime: body.endTime || "12:00",
      timezone: body.timezone || "Asia/Kolkata (IST)",
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : eventDate,
      registrationLink: body.registrationLink?.trim() || "",
      banner: bannerUrl,
      bannerPublicId,
      coverImageAlt: body.coverImageAlt?.trim() || body.title.trim(),
      tags: parseArrayField(body.tags),
      agenda: parseAgendaField(body.agenda),
      price,
      currency: body.currency || "INR",
      totalSeats: isUnlimited ? 999999 : totalSeats,
      seatsLeft: isUnlimited ? 999999 : (Number(body.seatsLeft) || totalSeats),
      isUnlimitedCapacity: isUnlimited,
      isRegistrationEnabled: body.isRegistrationEnabled === undefined ? true : (body.isRegistrationEnabled === true || body.isRegistrationEnabled === "true"),
      status: body.status || "Published",
      createdBy: userId,
      attendees: [],
    };

    const newEvent = await Event.create(eventData);

    // If registrationLink wasn't explicitly given, point to student event view
    if (!newEvent.registrationLink) {
      newEvent.registrationLink = `/events/${newEvent._id}`;
      await newEvent.save();
    }

    return res.status(201).json({
      success: true,
      message: `Event ${newEvent.status === "Draft" ? "saved as draft" : "published"} successfully`,
      event: newEvent,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// ==========================================
// 2. GET ADMIN RECRUITER EVENTS
// ==========================================
export const getAdminEvents = async (req, res) => {
  try {
    const adminId = req.id;
    const events = await Event.find({ createdBy: adminId })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get admin events error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recruiter events",
    });
  }
};

// ==========================================
// 3. GET ALL PUBLIC / STUDENT EVENTS
// ==========================================
export const getAllEvents = async (req, res) => {
  try {
    // Only return Published events (or legacy events where status doesn't exist)
    const events = await Event.find({
      $or: [{ status: "Published" }, { status: { $exists: false } }],
    })
      .populate("createdBy", "fullName email")
      .sort({ eventDate: 1 });

    // Protect private meeting links: if isMeetingLinkPublic is false, mask the link
    const sanitizedEvents = events.map((event) => {
      const obj = event.toObject();
      if (!obj.isMeetingLinkPublic) {
        obj.meetingLink = "";
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      events: sanitizedEvents,
    });
  } catch (error) {
    console.error("Get all events error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve events",
    });
  }
};

// ==========================================
// 4. GET SINGLE EVENT BY ID
// ==========================================
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "fullName email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // If event is Draft or Cancelled, only allow creator or admin
    if (event.status === "Draft") {
      const currentUserId = req.id; // from isAuthenticated if passed or decoded
      if (!currentUserId || event.createdBy?._id?.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: "This event is currently a private draft",
        });
      }
    }

    const eventObj = event.toObject();
    // Protect private meeting link if not public and viewer is not creator
    if (!eventObj.isMeetingLinkPublic) {
      const currentUserId = req.id;
      const isCreator = currentUserId && event.createdBy?._id?.toString() === currentUserId;
      const isAttendee = currentUserId && event.attendees?.some((a) => a.user?.toString() === currentUserId);
      if (!isCreator && !isAttendee) {
        eventObj.meetingLink = "";
      }
    }

    return res.status(200).json({
      success: true,
      event: eventObj,
    });
  } catch (error) {
    console.error("Get event by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve event details",
    });
  }
};

// ==========================================
// 5. UPDATE EVENT (Recruiter owner only)
// ==========================================
export const updateEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Strict ownership verification
    if (existingEvent.createdBy && existingEvent.createdBy.toString() !== req.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this event",
      });
    }

    const body = req.body || {};
    const updateData = { ...body };

    // Handle cover image file upload if provided
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          folder: "hirenest/event-banners",
          resource_type: "image",
        });
        if (cloudResponse && cloudResponse.secure_url) {
          if (existingEvent.bannerPublicId) {
            await deleteCloudinaryAsset(existingEvent.bannerPublicId, "image");
          }
          updateData.banner = cloudResponse.secure_url;
          updateData.bannerPublicId = cloudResponse.public_id;
        }
      } catch (uploadError) {
        console.error("Update event banner error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload updated cover image.",
        });
      }
    }

    // Parse array and nested fields if strings
    if (body.tags !== undefined) {
      updateData.tags = parseArrayField(body.tags);
    }
    if (body.agenda !== undefined) {
      updateData.agenda = parseAgendaField(body.agenda);
    }
    if (body.isUnlimitedCapacity !== undefined) {
      const isUnlimited = body.isUnlimitedCapacity === true || body.isUnlimitedCapacity === "true";
      updateData.isUnlimitedCapacity = isUnlimited;
      if (isUnlimited) {
        updateData.totalSeats = 999999;
        updateData.seatsLeft = 999999;
      }
    }
    if (body.isRegistrationEnabled !== undefined) {
      updateData.isRegistrationEnabled = body.isRegistrationEnabled === true || body.isRegistrationEnabled === "true";
    }
    if (body.isMeetingLinkPublic !== undefined) {
      updateData.isMeetingLinkPublic = body.isMeetingLinkPublic === true || body.isMeetingLinkPublic === "true";
    }
    if (body.totalSeats !== undefined && !updateData.isUnlimitedCapacity) {
      updateData.totalSeats = Number(body.totalSeats) || 100;
    }
    if (body.price !== undefined) {
      updateData.price = Number(body.price) || 0;
    }

    // Auto-compute location if needed
    if (body.mode && !body.location) {
      if (body.mode === "Online") {
        updateData.location = "Online / Virtual";
      } else if (body.mode === "In-Person" || body.mode === "Offline") {
        updateData.location = [body.venueName, body.city, body.address].filter(Boolean).join(", ") || existingEvent.location;
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

// ==========================================
// 6. DELETE EVENT (Recruiter owner only)
// ==========================================
export const deleteEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (existingEvent.createdBy && existingEvent.createdBy.toString() !== req.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    if (existingEvent.bannerPublicId) {
      await deleteCloudinaryAsset(existingEvent.bannerPublicId, "image");
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};

// ==========================================
// 7. REGISTER / RSVP FOR EVENT (Student / Public user)
// ==========================================
export const registerForEvent = async (req, res) => {
  try {
    const userId = req.id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "Published") {
      return res.status(400).json({
        success: false,
        message: "This event is not currently open for registration.",
      });
    }

    if (!event.isRegistrationEnabled) {
      return res.status(400).json({
        success: false,
        message: "Registration is disabled for this event.",
      });
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline for this session has passed.",
      });
    }

    // Check if user already registered
    const alreadyRegistered = event.attendees.some(
      (a) => a.user && a.user.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for this event.",
      });
    }

    // Check capacity if not unlimited
    if (!event.isUnlimitedCapacity && event.seatsLeft <= 0) {
      return res.status(400).json({
        success: false,
        message: "All seats for this session are fully booked.",
      });
    }

    const user = await User.findById(userId);

    // Add attendee record
    event.attendees.push({
      user: userId,
      name: user?.fullName || "Student Attendee",
      email: user?.email || "",
      registeredAt: new Date(),
      status: "registered",
    });

    if (!event.isUnlimitedCapacity && event.seatsLeft > 0) {
      event.seatsLeft -= 1;
    }

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Successfully registered for the event! Check your dashboard for details.",
      event,
    });
  } catch (error) {
    console.error("Register for event error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete event registration",
    });
  }
};
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    organizer: {
      type: String,
      required: true,
      trim: true,
    },

    speaker: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Workshop",
        "Hackathon",
        "Seminar",
        "Bootcamp",
        "Conference",
        "Webinar",
        "Career Fair",
        "Networking",
        "Other",
      ],
      required: true,
      default: "Workshop",
    },

    mode: {
      type: String,
      enum: ["Online", "Offline", "In-Person", "Hybrid"],
      required: true,
      default: "Online",
    },

    location: {
      type: String,
      required: true,
      trim: true,
      default: "Online / Virtual",
    },

    venueName: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    isMeetingLinkPublic: {
      type: Boolean,
      default: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    startTime: {
      type: String,
      default: "10:00",
    },

    endTime: {
      type: String,
      default: "12:00",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata (IST)",
    },

    registrationDeadline: {
      type: Date,
    },

    registrationLink: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    bannerPublicId: {
      type: String,
      default: "",
    },

    coverImageAlt: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    agenda: [
      {
        time: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    totalSeats: {
      type: Number,
      default: 100,
    },

    seatsLeft: {
      type: Number,
      default: 100,
    },

    isUnlimitedCapacity: {
      type: Boolean,
      default: false,
    },

    isRegistrationEnabled: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Completed"],
      default: "Published",
    },

    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "attended", "cancelled"],
          default: "registered",
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("Event", eventSchema);
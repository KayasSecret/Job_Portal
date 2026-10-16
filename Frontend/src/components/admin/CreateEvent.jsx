import React, { useState, useEffect } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CalendarDays,
  Clock,
  MapPin,
  Laptop,
  Users,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  ImageIcon,
  X,
  Plus,
  Trash2,
  Building2,
  Mic,
  Tag,
  ShieldCheck,
  AlertCircle,
  Eye,
  Layers,
  Globe,
  Loader2,
  FileText,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import EventLivePreview from "./EventLivePreview";

const CATEGORIES = [
  "Workshop",
  "Hackathon",
  "Webinar",
  "Conference",
  "Career Fair",
  "Networking",
  "Seminar",
  "Bootcamp",
  "Other",
];

const TIMEZONES = [
  "Asia/Kolkata (IST)",
  "UTC",
  "America/New_York (EST)",
  "America/Los_Angeles (PST)",
  "Europe/London (GMT)",
  "Europe/Berlin (CET)",
  "Asia/Singapore (SGT)",
  "Asia/Tokyo (JST)",
];

const PRESET_BANNERS = [
  {
    name: "Cyber Neon",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  },
  {
    name: "AI & Neural",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  },
  {
    name: "Code & Build",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  },
  {
    name: "Tech Summit",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",
  },
];

const WIZARD_STEPS = [
  { id: 1, title: "Basic Information", desc: "Title, Category & Cover" },
  { id: 2, title: "Schedule & Location", desc: "Format, Date & Venue" },
  { id: 3, title: "Registration & Capacity", desc: "RSVPs, Pricing & Agenda" },
  { id: 4, title: "Review & Publish", desc: "Live Simulation & Launch" },
];

const CreateEvent = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const params = useParams();
  const eventId = params?.id;

  const { user } = useSelector((store) => store.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(isEdit || eventId));

  // Tag input temporary state
  const [tagInput, setTagInput] = useState("");

  // Agenda temporary item state
  const [agendaTime, setAgendaTime] = useState("");
  const [agendaTitle, setAgendaTitle] = useState("");
  const [agendaDesc, setAgendaDesc] = useState("");

  // Cover image file state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Master Form State
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    description: "",
    category: "Workshop",
    organizer: user?.profile?.company?.name || user?.fullName || "Verified Tech Host",
    speaker: "",
    tags: ["React", "Engineering"],
    coverImageAlt: "",
    banner: PRESET_BANNERS[0].url,

    // Step 2
    mode: "Online",
    eventDate: "",
    endDate: "",
    startTime: "10:00",
    endTime: "12:00",
    timezone: "Asia/Kolkata (IST)",
    venueName: "",
    address: "",
    city: "",
    meetingLink: "",
    isMeetingLinkPublic: true,

    // Step 3
    isRegistrationEnabled: true,
    isUnlimitedCapacity: false,
    totalSeats: 100,
    registrationDeadline: "",
    registrationLink: "",
    priceType: "free", // "free" | "paid"
    price: 0,
    currency: "INR",
    agenda: [],
  });

  const [errors, setErrors] = useState({});

  // Pre-populate if editing
  useEffect(() => {
    if ((isEdit || eventId) && eventId) {
      const fetchExistingEvent = async () => {
        try {
          setInitialLoading(true);
          const res = await axios.get(`${EVENT_API_ENDPOINT}/${eventId}`, {
            withCredentials: true,
          });

          if (res.data.success && res.data.event) {
            const e = res.data.event;
            setFormData({
              title: e.title || "",
              summary: e.summary || "",
              description: e.description || "",
              category: e.category || "Workshop",
              organizer: e.organizer || "",
              speaker: e.speaker || "",
              tags: e.tags || [],
              coverImageAlt: e.coverImageAlt || "",
              banner: e.banner || PRESET_BANNERS[0].url,

              mode: e.mode || "Online",
              eventDate: e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 10) : "",
              endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : "",
              startTime: e.startTime || "10:00",
              endTime: e.endTime || "12:00",
              timezone: e.timezone || "Asia/Kolkata (IST)",
              venueName: e.venueName || "",
              address: e.address || "",
              city: e.city || "",
              meetingLink: e.meetingLink || "",
              isMeetingLinkPublic: e.isMeetingLinkPublic !== undefined ? e.isMeetingLinkPublic : true,

              isRegistrationEnabled: e.isRegistrationEnabled !== undefined ? e.isRegistrationEnabled : true,
              isUnlimitedCapacity: Boolean(e.isUnlimitedCapacity),
              totalSeats: e.totalSeats || 100,
              registrationDeadline: e.registrationDeadline ? new Date(e.registrationDeadline).toISOString().slice(0, 10) : "",
              registrationLink: e.registrationLink || "",
              priceType: e.price > 0 ? "paid" : "free",
              price: e.price || 0,
              currency: e.currency || "INR",
              agenda: e.agenda || [],
            });
            if (e.banner) {
              setCoverPreview(e.banner);
            }
          }
        } catch (err) {
          console.error("Failed to load event for editing:", err);
          toast.error("Could not load event data for editing");
          navigate("/admin/events");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchExistingEvent();
    }
  }, [isEdit, eventId, navigate]);

  // Handle Cover File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      setCoverFile(file);
      const objectUrl = URL.createObjectURL(file);
      setCoverPreview(objectUrl);
      setFormData((prev) => ({ ...prev, banner: "" }));
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !formData.tags.includes(trimmed)) {
      if (formData.tags.length >= 8) {
        toast.error("Maximum 8 tags allowed per event");
        return;
      }
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Add Agenda Item
  const handleAddAgendaItem = () => {
    if (!agendaTitle.trim()) {
      toast.error("Please enter a title for the agenda session");
      return;
    }
    const newItem = {
      time: agendaTime.trim() || "TBA",
      title: agendaTitle.trim(),
      description: agendaDesc.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, newItem],
    }));
    setAgendaTime("");
    setAgendaTitle("");
    setAgendaDesc("");
  };

  const handleRemoveAgendaItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, idx) => idx !== index),
    }));
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Event title is required";
      } else if (formData.title.trim().length < 5) {
        newErrors.title = "Title must be at least 5 characters";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Detailed description is required";
      } else if (formData.description.trim().length < 20) {
        newErrors.description = "Description should be at least 20 characters";
      }
      if (!formData.organizer.trim()) {
        newErrors.organizer = "Host/Organizer name is required";
      }
    }

    if (step === 2) {
      if (!formData.eventDate) {
        newErrors.eventDate = "Start event date is required";
      }
      if (formData.endDate && formData.eventDate && new Date(formData.endDate) < new Date(formData.eventDate)) {
        newErrors.endDate = "End date cannot be earlier than start date";
      }
      if (formData.mode === "In-Person" && !formData.city.trim() && !formData.venueName.trim()) {
        newErrors.location = "Please provide venue name or city for in-person events";
      }
      if (formData.mode === "Online" && formData.meetingLink && !/^https?:\/\//i.test(formData.meetingLink)) {
        newErrors.meetingLink = "Meeting link must start with http:// or https://";
      }
    }

    if (step === 3) {
      if (formData.priceType === "paid" && (!formData.price || Number(formData.price) <= 0)) {
        newErrors.price = "Please specify a ticket price greater than 0";
      }
      if (!formData.isUnlimitedCapacity && (!formData.totalSeats || Number(formData.totalSeats) <= 0)) {
        newErrors.totalSeats = "Please specify maximum attendee capacity";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in all required fields before proceeding");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Handler: Saves as Draft or Publishes
  const handleSubmit = async (targetStatus = "Published") => {
    // If saving as Draft, only title is required
    if (targetStatus === "Draft") {
      if (!formData.title.trim()) {
        toast.error("Please provide at least an event title to save as draft");
        return;
      }
    } else {
      // Validate all steps for Published launch
      if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
        toast.error("Please resolve validation errors in previous steps");
        return;
      }
    }

    try {
      setSubmitting(true);

      const computedLocation =
        formData.mode === "Online"
          ? "Online / Virtual"
          : [formData.venueName, formData.city, formData.address].filter(Boolean).join(", ") || "In-Person Venue";

      const effectiveEventDate =
        formData.eventDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
      const effectiveDescription =
        formData.description.trim() || "Draft event outline - further details to be added.";

      const submissionPayload = new FormData();
      submissionPayload.append("title", formData.title.trim());
      submissionPayload.append("summary", formData.summary.trim());
      submissionPayload.append("description", effectiveDescription);
      submissionPayload.append("category", formData.category);
      submissionPayload.append("organizer", formData.organizer.trim());
      submissionPayload.append("speaker", formData.speaker.trim());
      submissionPayload.append("mode", formData.mode);
      submissionPayload.append("location", computedLocation);
      submissionPayload.append("venueName", formData.venueName.trim());
      submissionPayload.append("address", formData.address.trim());
      submissionPayload.append("city", formData.city.trim());
      submissionPayload.append("meetingLink", formData.meetingLink.trim());
      submissionPayload.append("isMeetingLinkPublic", formData.isMeetingLinkPublic);
      submissionPayload.append("eventDate", effectiveEventDate);
      if (formData.endDate) submissionPayload.append("endDate", formData.endDate);
      submissionPayload.append("startTime", formData.startTime);
      submissionPayload.append("endTime", formData.endTime);
      submissionPayload.append("timezone", formData.timezone);
      if (formData.registrationDeadline) {
        submissionPayload.append("registrationDeadline", formData.registrationDeadline);
      }
      submissionPayload.append("registrationLink", formData.registrationLink.trim());
      submissionPayload.append("coverImageAlt", formData.coverImageAlt.trim() || formData.title.trim());
      submissionPayload.append("tags", JSON.stringify(formData.tags));
      submissionPayload.append("agenda", JSON.stringify(formData.agenda));
      submissionPayload.append("price", formData.priceType === "paid" ? Number(formData.price) : 0);
      submissionPayload.append("currency", formData.currency);
      submissionPayload.append("totalSeats", formData.isUnlimitedCapacity ? 999999 : Number(formData.totalSeats));
      submissionPayload.append("isUnlimitedCapacity", formData.isUnlimitedCapacity);
      submissionPayload.append("isRegistrationEnabled", formData.isRegistrationEnabled);
      submissionPayload.append("status", targetStatus);

      if (coverFile) {
        submissionPayload.append("file", coverFile);
      } else if (formData.banner) {
        submissionPayload.append("banner", formData.banner);
      }

      let res;
      if (isEdit || eventId) {
        res = await axios.put(`${EVENT_API_ENDPOINT}/${eventId}`, submissionPayload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(EVENT_API_ENDPOINT, submissionPayload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        toast.success(
          isEdit
            ? "Event updated successfully!"
            : targetStatus === "Draft"
            ? "Event saved to your drafts!"
            : "Event published! It is now live on the Student Portal."
        );
        navigate("/admin/events");
      }
    } catch (err) {
      console.error("Event submit error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to save event. Please check inputs and retry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#6A38C2] mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500">Loading Event Details...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-6 sm:py-10 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Top Breadcrumb & Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                to="/admin/events"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 mb-2 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Recruiter Events</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
                <span>{isEdit ? "Edit Tech Event" : "Create & Host Tech Event"}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-bold">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Pro Wizard</span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Design an attractive tech session, seminar, or coding hackathon with real-time student discovery.
              </p>
            </div>

            {/* Quick Actions (Draft / Cancel) */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/events")}
                className="h-10 px-4 rounded-xl border-purple-200 text-xs font-bold text-gray-600 hover:bg-purple-50"
              >
                Discard & Exit
              </Button>
              <Button
                variant="secondary"
                disabled={submitting}
                onClick={() => handleSubmit("Draft")}
                className="h-10 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6A38C2] text-xs font-bold border border-purple-200/80 shadow-2xs"
              >
                Save as Draft
              </Button>
            </div>
          </div>

          {/* ================= STEPPER PROGRESS BAR ================= */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-100 shadow-[0_4px_20px_-4px_rgba(106,56,194,0.06)] p-3 sm:p-5 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {WIZARD_STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isPassed = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep || validateStep(currentStep)) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-100/70 border border-purple-300/80 shadow-xs"
                        : isPassed
                        ? "bg-purple-50/40 hover:bg-purple-50 border border-transparent"
                        : "opacity-60 hover:opacity-100 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isPassed
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] text-white shadow-xs"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : step.id}
                    </div>

                    <div className="min-w-0">
                      <span className="block text-xs font-black text-gray-900 truncate">
                        {step.title}
                      </span>
                      <span className="text-[10.5px] font-medium text-gray-500 truncate hidden sm:block">
                        {step.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= MAIN WIZARD BODY (2 Columns: Form & Live Preview) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Form Steps */}
            <div className="lg:col-span-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-purple-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8">
              {/* ================= STEP 1: BASIC INFORMATION ================= */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-purple-50 pb-4">
                    <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
                      <FileText size={18} className="text-[#6A38C2]" />
                      <span>1. Event Overview & Branding</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter the primary title, category, description, and cover image for student discovery.
                    </p>
                  </div>

                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-black text-gray-900">
                        Event Title <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-[11px] font-bold text-gray-400">
                        {formData.title.length}/100
                      </span>
                    </div>
                    <Input
                      maxLength={100}
                      placeholder="e.g. Next-Gen Full Stack Architecture Workshop 2026"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className={`h-11 rounded-xl text-sm font-semibold border-purple-100 focus-visible:ring-[#6A38C2] ${
                        errors.title ? "border-rose-400 bg-rose-50/20" : ""
                      }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-rose-500 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{errors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* Short Summary */}
                  <div>
                    <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                      Short Summary / Tagline
                    </Label>
                    <Input
                      maxLength={160}
                      placeholder="A punchy 1-sentence teaser displayed on student discovery cards..."
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                    />
                  </div>

                  {/* Category & Host Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        Category <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, category: val }))
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl border-purple-100 font-bold text-xs sm:text-sm">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-purple-100 bg-white">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Host / Organizer */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        Host / Company Organizer <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. HireNest Engineering, Google Developer Group"
                        value={formData.organizer}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, organizer: e.target.value }))
                        }
                        className={`h-11 rounded-xl text-xs sm:text-sm border-purple-100 ${
                          errors.organizer ? "border-rose-400 bg-rose-50/20" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Speaker */}
                  <div>
                    <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                      Featured Speaker / Instructor (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. Dr. Jane Smith, VP of Engineering at DeepMind"
                      value={formData.speaker}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, speaker: e.target.value }))
                      }
                      className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-black text-gray-900">
                        Detailed Description <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-[11px] font-bold text-gray-400">
                        Markdown & line breaks supported
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Outline session learning objectives, prerequisites, target student audience, and what attendees will take away..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className={`w-full p-3 rounded-xl border border-purple-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#6A38C2]/40 leading-relaxed ${
                        errors.description ? "border-rose-400 bg-rose-50/20" : ""
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-rose-500 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{errors.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Technology Tags */}
                  <div>
                    <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                      Technology & Skill Tags (Max 8)
                    </Label>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Input
                        placeholder="Add tag (e.g. Next.js, Docker, WebAssembly)..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="h-10 rounded-xl text-xs border-purple-100"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="h-10 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6A38C2] font-bold text-xs shrink-0"
                      >
                        Add Tag
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-[#6A38C2] border border-purple-100 text-xs font-bold"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cover Image Upload / Selection */}
                  <div className="pt-2">
                    <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                      Cover Banner Image
                    </Label>

                    {/* Preset Picker */}
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-gray-400 block mb-1.5">
                        Choose a high-res tech preset or upload your own:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_BANNERS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setCoverFile(null);
                              setCoverPreview(preset.url);
                              setFormData((prev) => ({
                                ...prev,
                                banner: preset.url,
                              }));
                            }}
                            className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                              formData.banner === preset.url && !coverFile
                                ? "border-[#6A38C2] ring-2 ring-[#6A38C2]/30 scale-102"
                                : "border-purple-100 hover:border-purple-300 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10.5px] font-black text-white px-1 text-center">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="relative border-2 border-dashed border-purple-200 hover:border-[#6A38C2] rounded-2xl p-5 text-center transition-all bg-purple-50/20">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud
                        size={28}
                        className="text-[#6A38C2] mx-auto mb-1.5"
                      />
                      <span className="text-xs font-bold text-gray-900 block">
                        Upload Custom Event Banner (PNG, JPG, WEBP)
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Recommended 16:9 ratio (1200x675) • Max 5MB
                      </span>
                      {coverFile && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <CheckCircle2 size={13} />
                          <span>Selected: {coverFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 2: SCHEDULE & LOCATION ================= */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-purple-50 pb-4">
                    <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
                      <CalendarDays size={18} className="text-[#6A38C2]" />
                      <span>2. Schedule, Timezone & Venue</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure your event format, calendar dates, timezone, and virtual link or physical venue.
                    </p>
                  </div>

                  {/* Format Selector Cards */}
                  <div>
                    <Label className="text-xs font-black text-gray-900 mb-2 block">
                      Event Format <span className="text-rose-500">*</span>
                    </Label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "Online",
                          label: "Online / Virtual",
                          icon: Laptop,
                          desc: "Zoom, Google Meet, YouTube Live stream",
                        },
                        {
                          id: "In-Person",
                          label: "In-Person",
                          icon: MapPin,
                          desc: "Physical venue, campus hall, or office",
                        },
                        {
                          id: "Hybrid",
                          label: "Hybrid Session",
                          icon: Layers,
                          desc: "Both in-person attendance & online stream",
                        },
                      ].map((fmt) => {
                        const Icon = fmt.icon;
                        const isSelected = formData.mode === fmt.id;

                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, mode: fmt.id }))
                            }
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-100/70 border-[#6A38C2] shadow-sm ring-2 ring-[#6A38C2]/20"
                                : "border-purple-100 hover:border-purple-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`p-1.5 rounded-xl ${
                                  isSelected
                                    ? "bg-[#6A38C2] text-white"
                                    : "bg-purple-50 text-[#6A38C2]"
                                }`}
                              >
                                <Icon size={16} />
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-gray-950">
                                {fmt.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 block leading-normal">
                              {fmt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        Start Event Date <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, eventDate: e.target.value }))
                        }
                        className={`h-11 rounded-xl text-xs sm:text-sm border-purple-100 ${
                          errors.eventDate ? "border-rose-400 bg-rose-50/20" : ""
                        }`}
                      />
                      {errors.eventDate && (
                        <p className="text-xs text-rose-500 mt-1 font-semibold">
                          {errors.eventDate}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        End Date (Optional)
                      </Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        min={formData.eventDate || undefined}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                        className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                      />
                      {errors.endDate && (
                        <p className="text-xs text-rose-500 mt-1 font-semibold">
                          {errors.endDate}
                        </p>
                      )}
                    </div>

                    {/* Start Time */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                        className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                        className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                      />
                    </div>
                  </div>

                  {/* Timezone Selector */}
                  <div>
                    <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                      Timezone
                    </Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, timezone: val }))
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl border-purple-100 font-bold text-xs sm:text-sm">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-purple-100 bg-white">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Format Fields: Online Meeting Link */}
                  {(formData.mode === "Online" || formData.mode === "Hybrid") && (
                    <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <Laptop size={16} className="text-cyan-600" />
                        <span className="font-bold text-xs sm:text-sm text-gray-900">
                          Virtual Access Details
                        </span>
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-gray-700 mb-1.5 block">
                          Meeting / Stream URL (Zoom, Google Meet, Teams, YouTube)
                        </Label>
                        <Input
                          placeholder="https://meet.google.com/xyz-abc or https://zoom.us/j/..."
                          value={formData.meetingLink}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              meetingLink: e.target.value,
                            }))
                          }
                          className="h-10 rounded-xl bg-white border-cyan-200 text-xs sm:text-sm"
                        />
                        {errors.meetingLink && (
                          <p className="text-xs text-rose-500 mt-1 font-semibold">
                            {errors.meetingLink}
                          </p>
                        )}
                      </div>

                      {/* Public vs Registered Attendees Only Toggle */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">
                            Public Meeting Access
                          </span>
                          <span className="text-[11px] text-gray-500 block">
                            If disabled, link is only revealed to registered candidates.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.isMeetingLinkPublic}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isMeetingLinkPublic: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-[#6A38C2] rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Format Fields: In-Person Physical Venue */}
                  {(formData.mode === "In-Person" || formData.mode === "Hybrid") && (
                    <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-600" />
                        <span className="font-bold text-xs sm:text-sm text-gray-900">
                          Physical Venue Location
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-bold text-gray-700 mb-1.5 block">
                            Venue / Auditorium Name
                          </Label>
                          <Input
                            placeholder="e.g. Main Auditorium, Tech Hub 4th Floor"
                            value={formData.venueName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                venueName: e.target.value,
                              }))
                            }
                            className="h-10 rounded-xl bg-white border-emerald-200 text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-bold text-gray-700 mb-1.5 block">
                            City / Metro Area
                          </Label>
                          <Input
                            placeholder="e.g. Bengaluru, Mumbai, Pune, Remote"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className="h-10 rounded-xl bg-white border-emerald-200 text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-gray-700 mb-1.5 block">
                          Street Address / Campus Landmark
                        </Label>
                        <Input
                          placeholder="e.g. Electronic City Phase 1, Near Metro Station"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="h-10 rounded-xl bg-white border-emerald-200 text-xs sm:text-sm"
                        />
                      </div>

                      {errors.location && (
                        <p className="text-xs text-rose-500 font-semibold">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= STEP 3: REGISTRATION & CAPACITY ================= */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-purple-50 pb-4">
                    <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
                      <Users size={18} className="text-[#6A38C2]" />
                      <span>3. Registration, Capacity & Agenda</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Set capacity limits, RSVP deadlines, ticket pricing, and session schedule timeline.
                    </p>
                  </div>

                  {/* Enable Registration Switch */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                        Accept Student Registrations (RSVP)
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Allow students to register for this event with 1-click on the HireNest portal.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isRegistrationEnabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isRegistrationEnabled: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-[#6A38C2] rounded cursor-pointer"
                    />
                  </div>

                  {/* Capacity & Deadline Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Capacity */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs font-black text-gray-900">
                          Maximum Capacity (Seats)
                        </Label>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-purple-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isUnlimitedCapacity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                isUnlimitedCapacity: e.target.checked,
                              }))
                            }
                            className="w-3.5 h-3.5 accent-[#6A38C2] rounded"
                          />
                          <span>Unlimited</span>
                        </label>
                      </div>

                      <Input
                        type="number"
                        min={1}
                        disabled={formData.isUnlimitedCapacity}
                        value={formData.isUnlimitedCapacity ? "" : formData.totalSeats}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            totalSeats: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder={formData.isUnlimitedCapacity ? "No seat limit" : "100"}
                        className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                      />
                    </div>

                    {/* Deadline */}
                    <div>
                      <Label className="text-xs font-black text-gray-900 mb-1.5 block">
                        Registration Deadline
                      </Label>
                      <Input
                        type="date"
                        value={formData.registrationDeadline}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            registrationDeadline: e.target.value,
                          }))
                        }
                        className="h-11 rounded-xl text-xs sm:text-sm border-purple-100"
                      />
                    </div>
                  </div>

                  {/* Pricing: Free vs Paid */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                    <Label className="text-xs font-black text-gray-900 block">
                      Event Pricing Model
                    </Label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            priceType: "free",
                            price: 0,
                          }))
                        }
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.priceType === "free"
                            ? "bg-emerald-500 text-white border-emerald-600 font-black shadow-xs"
                            : "bg-white text-gray-700 border-amber-200 font-bold"
                        }`}
                      >
                        100% Free Entry
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            priceType: "paid",
                            price: prev.price || 499,
                          }))
                        }
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.priceType === "paid"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 font-black shadow-xs"
                            : "bg-white text-gray-700 border-amber-200 font-bold"
                        }`}
                      >
                        Paid Ticket
                      </button>
                    </div>

                    {formData.priceType === "paid" && (
                      <div className="pt-2">
                        <Label className="text-xs font-bold text-gray-700 mb-1.5 block">
                          Ticket Price in INR (₹)
                        </Label>
                        <div className="relative max-w-xs">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                            ₹
                          </span>
                          <Input
                            type="number"
                            min={1}
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: Number(e.target.value) || 0,
                              }))
                            }
                            className="pl-8 h-10 rounded-xl bg-white border-amber-300 font-bold"
                          />
                        </div>
                        <p className="text-[11px] text-amber-900/80 mt-1.5 leading-normal">
                          Notice: Paid registration fees are billed to verified campus or sponsor accounts. No checkout simulation or fake payment gateways are used.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Agenda / Schedule Builder */}
                  <div>
                    <Label className="text-xs font-black text-gray-900 mb-2 block">
                      Event Schedule / Program Agenda
                    </Label>

                    {/* Add Agenda Item Inputs */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2.5 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          placeholder="Time (e.g. 10:00 AM)"
                          value={agendaTime}
                          onChange={(e) => setAgendaTime(e.target.value)}
                          className="h-9 rounded-xl bg-white text-xs"
                        />
                        <Input
                          placeholder="Session Title (e.g. Keynote)"
                          value={agendaTitle}
                          onChange={(e) => setAgendaTitle(e.target.value)}
                          className="h-9 rounded-xl bg-white text-xs sm:col-span-2"
                        />
                      </div>
                      <Input
                        placeholder="Brief overview of topic or speaker (optional)..."
                        value={agendaDesc}
                        onChange={(e) => setAgendaDesc(e.target.value)}
                        className="h-9 rounded-xl bg-white text-xs"
                      />
                      <Button
                        type="button"
                        onClick={handleAddAgendaItem}
                        className="h-8 px-3 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-bold w-full sm:w-auto"
                      >
                        <Plus size={13} className="mr-1" />
                        <span>Add Agenda Item</span>
                      </Button>
                    </div>

                    {/* Existing Agenda Items */}
                    {formData.agenda.length > 0 ? (
                      <div className="space-y-2">
                        {formData.agenda.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-purple-100 flex items-start justify-between gap-3 text-xs shadow-2xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="font-bold text-[#6A38C2] shrink-0 bg-purple-50 px-2 py-0.5 rounded-md">
                                {item.time}
                              </span>
                              <div>
                                <span className="font-bold text-gray-900 block">
                                  {item.title}
                                </span>
                                {item.description && (
                                  <span className="text-gray-500 block text-[11px] mt-0.5">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAgendaItem(idx)}
                              className="text-gray-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No agenda items added yet. You can add topics, lunch breaks, and Q&A sessions.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 4: REVIEW & PUBLISH ================= */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-purple-50 pb-4">
                    <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <span>4. Pre-Launch Verification</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Review all configured event parameters before publishing live to the student portal.
                    </p>
                  </div>

                  {/* Checklist Card */}
                  <div className="rounded-2xl bg-purple-50/40 border border-purple-100 p-5 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-900">
                      Pre-Launch Checklist
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className={formData.title ? "text-emerald-500" : "text-gray-300"}
                        />
                        <span className="font-semibold text-gray-700">
                          Title & Description
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className={formData.eventDate ? "text-emerald-500" : "text-gray-300"}
                        />
                        <span className="font-semibold text-gray-700">
                          Scheduled Event Date
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className={
                            formData.mode === "Online"
                              ? "text-emerald-500"
                              : formData.city || formData.venueName
                              ? "text-emerald-500"
                              : "text-amber-500"
                          }
                        />
                        <span className="font-semibold text-gray-700">
                          {formData.mode} Venue / Stream
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className={formData.tags.length > 0 ? "text-emerald-500" : "text-gray-300"}
                        />
                        <span className="font-semibold text-gray-700">
                          Technology Tags ({formData.tags.length})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Publication Scope Information */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-black text-blue-950">
                      <Globe size={15} />
                      <span>Publication Scope & Student Visibility</span>
                    </div>
                    <p className="leading-relaxed">
                      Publishing this event will instantly make it discoverable on the main student Events page (`/events`), searchable by category, date, and keyword filters, and accessible to all verified students.
                    </p>
                  </div>

                  {/* Primary Publish CTA Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      disabled={submitting}
                      onClick={() => handleSubmit("Draft")}
                      className="h-11 px-5 rounded-2xl border-purple-200 text-[#6A38C2] font-bold text-xs hover:bg-purple-50"
                    >
                      Save as Private Draft
                    </Button>

                    <Button
                      disabled={submitting}
                      onClick={() => handleSubmit("Published")}
                      className="h-11 px-7 rounded-2xl bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Publishing to Portal...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-amber-300" />
                          <span>{isEdit ? "Update & Publish Event" : "Publish Event Live 🚀"}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Bottom Wizard Stepper Navigation */}
              <div className="mt-8 pt-6 border-t border-purple-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={currentStep === 1 || submitting}
                  onClick={handlePrevStep}
                  className="h-10 px-4 rounded-xl border-purple-200 text-xs font-bold text-gray-700 hover:bg-purple-50"
                >
                  <ArrowLeft size={14} className="mr-1.5" />
                  <span>Previous</span>
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={handleNextStep}
                    className="h-10 px-5 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs"
                  >
                    <span>Next: {WIZARD_STEPS[currentStep].title}</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    disabled={submitting}
                    onClick={() => handleSubmit("Published")}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] text-white text-xs font-black shadow-xs"
                  >
                    <span>Publish Event</span>
                    <Sparkles size={14} className="ml-1.5 text-amber-300" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Live Student Discovery Preview */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-purple-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                <EventLivePreview
                  formData={formData}
                  bannerPreview={coverPreview}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;

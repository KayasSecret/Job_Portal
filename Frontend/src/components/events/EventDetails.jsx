import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  MapPin,
  Users,
  Laptop,
  IndianRupee,
  ArrowLeft,
  Sparkles,
  Building2,
  Mic,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Layers,
  Globe,
  Loader2,
  AlertCircle,
  Video,
} from "lucide-react";
import { Button } from "../ui/button";
import Navbar from "../shared/Navbar";
import CountdownTimer from "./CountdownTimer";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * EventDetails
 * Ultra-premium, futuristic single-event command dashboard.
 * Supports direct RSVP/registration, dynamic seat countdowns,
 * agenda timeline, technology tags, and verified host logistics.
 */
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${EVENT_API_ENDPOINT}/${id}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setEvent(res.data.event);
        }
      } catch (error) {
        console.error("Fetch event details error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const isUserRegistered = Boolean(
    user &&
      event?.attendees?.some(
        (a) =>
          (typeof a.user === "object" ? a.user?._id : a.user)?.toString() ===
          (user?._id || user?.id)?.toString()
      )
  );

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register for this event");
      navigate("/login");
      return;
    }

    if (isUserRegistered) {
      toast.info("You are already registered for this event!");
      return;
    }

    try {
      setRegistering(true);
      const res = await axios.post(
        `${EVENT_API_ENDPOINT}/${id}/register`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setEvent(res.data.event);
        toast.success(
          "🎉 You're successfully registered! We look forward to seeing you."
        );

        // If external link exists, open it in background
        if (
          event?.registrationLink &&
          /^https?:\/\//i.test(event.registrationLink) &&
          !event.registrationLink.includes("/events/")
        ) {
          window.open(event.registrationLink, "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("Event registration error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to complete registration"
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-3 border-purple-200 border-t-[#6A38C2] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500">
            Loading Event Telemetry...
          </p>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The requested session could not be located or may have been archived.
          </p>
          <Button
            onClick={() => navigate("/events")}
            className="rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] text-white font-bold"
          >
            Back to All Events
          </Button>
        </div>
      </>
    );
  }

  const isFree = !event?.price || Number(event.price) === 0;
  const isFull = !event.isUnlimitedCapacity && (event?.seatsLeft ?? 100) <= 0;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Top Breadcrumb */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Tech Events</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6A38C2] border border-purple-100 text-xs font-bold">
              <Sparkles size={12} className="text-amber-500" />
              <span>{event?.category || "Workshop"}</span>
            </span>
          </div>

          {/* Hero Banner Media Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-100"
          >
            <img
              src={
                event.banner ||
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80"
              }
              alt={event.coverImageAlt || event.title}
              className="w-full h-[320px] sm:h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent" />

            {/* Banner Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-xs border border-white/20">
                    <Sparkles size={12} className="text-amber-300" />
                    <span>{event?.mode || "Online Session"}</span>
                  </span>

                  {event.timezone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-purple-200 text-xs font-semibold border border-white/10">
                      <Globe size={11} />
                      <span>{event.timezone}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {event.title}
                </h1>

                {event.summary && (
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl line-clamp-2">
                    {event.summary}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-black shadow-xl ${
                    isFree
                      ? "bg-emerald-500 text-white"
                      : "bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950"
                  }`}
                >
                  {isFree ? "FREE ENTRY" : `₹ ${event.price}`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Registration Countdown Timer */}
          <CountdownTimer eventDate={event.eventDate} />

          {/* Event Content & Parameter Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Description, Tags, Agenda & CTA */}
            <div className="lg:col-span-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-6">
              {/* About Session */}
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                  <span>About This Session</span>
                  <Sparkles size={16} className="text-[#6A38C2]" />
                </h2>

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Technology Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="pt-4 border-t border-purple-50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
                    <Tag size={13} className="text-[#6A38C2]" />
                    <span>Focus Technologies & Topics</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-purple-50 text-[#6A38C2] border border-purple-100 text-xs font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Program Agenda Timeline */}
              {event.agenda && event.agenda.length > 0 && (
                <div className="pt-4 border-t border-purple-50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#6A38C2]" />
                    <span>Program Schedule & Agenda</span>
                  </h3>
                  <div className="space-y-3">
                    {event.agenda.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3"
                      >
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-100 text-[#6A38C2] font-black text-xs shrink-0 shadow-2xs">
                          {item.time}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-gray-950">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-normal">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Virtual Access Link (if online & public or registered) */}
              {event.meetingLink && (
                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
                      <Video size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-950 block">
                        Live Virtual Meeting Room
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Direct video stream access for attendees.
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(event.meetingLink, "_blank", "noopener,noreferrer")
                    }
                    className="h-9 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shrink-0"
                  >
                    <span>Join Meeting</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Button>
                </div>
              )}

              {/* Call to Action Button */}
              <div className="mt-8 pt-6 border-t border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">
                    Seats remaining
                  </span>
                  <span className="text-lg font-black text-gray-900">
                    {event.isUnlimitedCapacity
                      ? "Unlimited Capacity Available"
                      : `${event?.seatsLeft ?? 100} of ${event?.totalSeats ?? 100} Available`}
                  </span>
                </div>

                {isUserRegistered ? (
                  <div className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl font-black text-sm bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                    <CheckCircle2 size={18} />
                    <span>You're Registered ✓</span>
                  </div>
                ) : isFull ? (
                  <Button
                    size="lg"
                    disabled
                    className="h-12 px-8 rounded-2xl font-black text-sm bg-gray-200 text-gray-500 cursor-not-allowed"
                  >
                    <span>Event Fully Booked</span>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={registering}
                    onClick={handleRegister}
                    className="h-12 px-8 rounded-2xl font-black text-sm bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    {registering ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Confirming RSVP...</span>
                      </>
                    ) : (
                      <>
                        <span>{isFree ? "RSVP / Register Free" : "Register Now"}</span>
                        <ExternalLink size={16} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column: Key Event Telemetry Parameters */}
            <div className="lg:col-span-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 mb-4">
                Event Logistics
              </h3>

              {event?.organizer && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-[#6A38C2] shrink-0 border border-purple-100">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block uppercase">
                      Host Organizer
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {event.organizer}
                    </span>
                  </div>
                </div>
              )}

              {event?.speaker && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-50 text-pink-600 shrink-0 border border-pink-100">
                    <Mic size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block uppercase">
                      Featured Speaker
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {event.speaker}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 shrink-0 border border-cyan-100">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">
                    Event Date & Time
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-gray-500 font-medium block mt-0.5">
                    {event.startTime || "10:00"} {event.endTime ? `- ${event.endTime}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">
                    Location / Venue
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                    {event.location}
                  </span>
                  {event.address && (
                    <span className="text-xs text-gray-500 block mt-0.5">
                      {event.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">
                    Registration Deadline
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {event.registrationDeadline
                      ? new Date(event.registrationDeadline).toLocaleDateString()
                      : "Open until session starts"}
                  </span>
                </div>
              </div>

              {/* Attendee Count */}
              <div className="flex items-start gap-3 pt-2 border-t border-purple-50">
                <div className="p-2 rounded-xl bg-purple-50 text-[#6A38C2] shrink-0 border border-purple-100">
                  <Users size={16} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">
                    Registered Candidates
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {event.attendees?.length || 0} Registered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
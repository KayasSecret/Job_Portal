import React from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  ArrowUpRight,
  Laptop,
  Building2,
  Mic,
  Sparkles,
  Tag,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * EventCard
 * Ultra-premium glassmorphic event card featuring:
 * - 3D elevation and holographic light sheen sweep on hover
 * - Distinct badges for Online, Offline, Hybrid, Free, and Paid events
 * - Clear organizer, speaker, date, location, and seat availability metadata
 * - Fluid details navigation and direct registration CTA
 */
const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Format date cleanly
  const formattedDate = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBA";

  // Relative urgency text
  const getUrgencyText = (dateStr) => {
    if (!dateStr) return null;
    const diffDays = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return { label: "Concluded", color: "text-gray-400 bg-gray-100" };
    if (diffDays === 0) return { label: "Today!", color: "text-rose-700 bg-rose-50 border-rose-200" };
    if (diffDays === 1) return { label: "Tomorrow", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (diffDays <= 7) return { label: `In ${diffDays} Days`, color: "text-purple-700 bg-purple-50 border-purple-200" };
    return { label: `In ${diffDays} Days`, color: "text-blue-700 bg-blue-50 border-blue-200" };
  };

  const urgency = getUrgencyText(event?.eventDate);

  const fallbackBanner =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

  const isFree = !event?.price || Number(event.price) === 0;

  const handleRegister = (e) => {
    e.stopPropagation();
    if (event?.registrationLink) {
      window.open(event.registrationLink, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/events/${event?._id}`);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => navigate(`/events/${event?._id}`)}
      className="group relative rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-[0_10px_30px_-8px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(106,56,194,0.22)] hover:border-purple-300 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Dynamic Holographic Light Sweep Sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20" />

      {/* Top Banner Media Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-900">
        <img
          src={event?.banner || fallbackBanner}
          alt={event?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient Dark Gradient Vignette for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />

        {/* Top Floating Badge Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Category Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#6A38C2] font-black text-[11px] shadow-md border border-purple-100">
            <Sparkles size={11} className="text-amber-500" />
            <span>{event?.category || "Tech Session"}</span>
          </span>

          {/* Mode Pill: Online / Offline / Hybrid */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10.5px] backdrop-blur-md border shadow-xs ${
              event?.mode === "Online"
                ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/35"
                : event?.mode === "Offline"
                ? "bg-amber-500/25 text-amber-200 border-amber-400/35"
                : "bg-purple-500/25 text-purple-200 border-purple-400/35"
            }`}
          >
            {event?.mode === "Online" ? (
              <Laptop size={11} className="text-cyan-300" />
            ) : (
              <MapPin size={11} className="text-amber-300" />
            )}
            <span>{event?.mode || "Online"}</span>
          </span>
        </div>

        {/* Bottom Banner Pill: Price Indicator */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[11px]">
            <Clock size={11} className="text-purple-300" />
            <span>{formattedDate}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-md ${
              isFree
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950 font-black shadow-amber-500/30"
            }`}
          >
            {isFree ? "FREE ENTRY" : `₹ ${event.price}`}
          </span>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Urgency Badge if near */}
          {urgency && (
            <div className="mb-2.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${urgency.color}`}
              >
                <Clock size={11} />
                <span>{urgency.label}</span>
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug group-hover:text-[#6A38C2] transition-colors line-clamp-2">
            {event?.title}
          </h3>

          {/* Organizer & Speaker Info */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium">
            {event?.organizer && (
              <span className="flex items-center gap-1 text-gray-700 font-semibold truncate">
                <Building2 size={13} className="text-[#6A38C2] shrink-0" />
                <span>{event.organizer}</span>
              </span>
            )}
            {event?.speaker && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-gray-600 truncate">
                  <Mic size={12} className="text-pink-600 shrink-0" />
                  <span>{event.speaker}</span>
                </span>
              </>
            )}
          </div>

          {/* Description Preview */}
          <p className="text-xs sm:text-sm text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">
            {event?.description || "Explore cutting-edge workflows, live code demos, and community networking."}
          </p>

          {/* Event Telemetry Row */}
          <div className="mt-4 pt-3 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <MapPin size={13} className="text-[#6A38C2] shrink-0" />
              <span className="truncate">{event?.location || "Virtual"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/80">
              <Users size={12} className="text-[#6A38C2]" />
              <span>{event?.seatsLeft ?? 50} Seats Left</span>
            </div>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="mt-5 pt-3 border-t border-purple-100 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event?._id}`);
            }}
            className="h-9 px-3 rounded-xl text-xs font-bold text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Details</span>
            <ArrowUpRight size={14} className="text-[#6A38C2]" />
          </Button>

          <Button
            type="button"
            onClick={handleRegister}
            className="h-9 px-4 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white shadow-md shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Register</span>
            <ArrowRight size={13} className="text-purple-200" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
import React from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Laptop,
  Building2,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Globe,
  Tag,
  AlertCircle,
  Share2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * AdminEventCard
 * Professional recruiter event card with status indicators,
 * attendee counts, format badges, and administrative actions.
 */
const AdminEventCard = ({
  event,
  onDelete,
  onTogglePublish,
  openPopoverId,
  setOpenPopoverId,
}) => {
  const navigate = useNavigate();

  const isDraft = event?.status === "Draft";
  const isCancelled = event?.status === "Cancelled";
  const isPublished = event?.status === "Published" || !event?.status;
  const isCompleted = event?.status === "Completed";

  const attendeesCount = event?.attendees?.length || 0;
  const totalCapacity = event?.isUnlimitedCapacity
    ? "Unlimited"
    : event?.totalSeats || 100;

  const isFree = !event?.price || Number(event.price) === 0;

  // Format date and time
  const formattedDate = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBA";

  const timeString = event?.startTime
    ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""} ${event.timezone ? `(${event.timezone.split(" ")[0]})` : ""}`
    : "Time TBA";

  // Mode badge icon & text
  const getModeInfo = (mode) => {
    switch (mode) {
      case "Online":
        return { label: "Online", icon: Laptop, color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
      case "In-Person":
      case "Offline":
        return { label: "In-Person", icon: MapPin, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "Hybrid":
        return { label: "Hybrid", icon: Layers, color: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: mode || "Online", icon: Globe, color: "bg-gray-50 text-gray-700 border-gray-200" };
    }
  };

  const modeInfo = getModeInfo(event?.mode);
  const ModeIcon = modeInfo.icon;

  const fallbackBanner =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

  const handleShare = (e) => {
    e.stopPropagation();
    const eventUrl = `${window.location.origin}/events/${event?._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(eventUrl);
      toast.success("Event link copied to clipboard!");
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-3xl bg-white/95 backdrop-blur-xl border shadow-[0_4px_20px_-4px_rgba(106,56,194,0.06)] hover:shadow-[0_16px_36px_-8px_rgba(106,56,194,0.18)] transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isDraft
          ? "border-amber-200/90 bg-amber-50/15"
          : isCancelled
          ? "border-rose-200/80 opacity-80"
          : "border-purple-100 hover:border-purple-300"
      }`}
    >
      {/* Top Media Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
        <img
          src={event?.banner || fallbackBanner}
          alt={event?.coverImageAlt || event?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Status Badge */}
          {isPublished && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/95 backdrop-blur-md text-white font-black text-[10.5px] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Published</span>
            </span>
          )}
          {isDraft && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/95 backdrop-blur-md text-white font-black text-[10.5px] shadow-sm">
              <Clock size={11} />
              <span>Draft</span>
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/95 backdrop-blur-md text-white font-black text-[10.5px] shadow-sm">
              <AlertCircle size={11} />
              <span>Cancelled</span>
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/95 backdrop-blur-md text-white font-black text-[10.5px] shadow-sm">
              <CheckCircle2 size={11} />
              <span>Completed</span>
            </span>
          )}

          {/* Quick Action Popover */}
          <Popover
            open={openPopoverId === event?._id}
            onOpenChange={(open) => setOpenPopoverId(open ? event?._id : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Event Options"
              >
                <MoreVertical size={16} />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-52 p-1.5 rounded-2xl bg-white border border-purple-100 shadow-[0_12px_36px_-6px_rgba(106,56,194,0.18)] z-50 text-xs"
            >
              <button
                type="button"
                onClick={() => {
                  setOpenPopoverId(null);
                  navigate(`/events/${event?._id}`);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] font-semibold transition-colors cursor-pointer"
              >
                <Eye size={14} className="text-[#6A38C2]" />
                <span>View Student Page</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenPopoverId(null);
                  navigate(`/admin/events/${event?._id}/edit`);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] font-semibold transition-colors cursor-pointer"
              >
                <Edit size={14} className="text-[#6A38C2]" />
                <span>Edit Event</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] font-semibold transition-colors cursor-pointer"
              >
                <Share2 size={14} className="text-blue-600" />
                <span>Copy Public Link</span>
              </button>

              <div className="my-1 border-t border-purple-50" />

              {/* Publish / Unpublish Toggle */}
              {isPublished ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpenPopoverId(null);
                    onTogglePublish(event, "Draft");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-amber-700 hover:bg-amber-50 font-semibold transition-colors cursor-pointer"
                >
                  <Clock size={14} className="text-amber-600" />
                  <span>Unpublish (To Draft)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpenPopoverId(null);
                    onTogglePublish(event, "Published");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Publish Event Now</span>
                </button>
              )}

              {/* Cancel Event */}
              {!isCancelled && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenPopoverId(null);
                    onTogglePublish(event, "Cancelled");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-orange-700 hover:bg-orange-50 font-semibold transition-colors cursor-pointer"
                >
                  <AlertCircle size={14} className="text-orange-600" />
                  <span>Mark as Cancelled</span>
                </button>
              )}

              <div className="my-1 border-t border-purple-50" />

              {/* Delete Event */}
              <button
                type="button"
                onClick={() => {
                  setOpenPopoverId(null);
                  onDelete(event);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Event</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Bottom Banner Info */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
            <Sparkles size={11} className="text-amber-400" />
            <span>{event?.category || "Workshop"}</span>
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full font-black ${
              isFree
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-400 text-gray-950 shadow-sm"
            }`}
          >
            {isFree ? "FREE" : `₹${event.price}`}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Format & Schedule Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold border ${modeInfo.color}`}
            >
              <ModeIcon size={12} />
              <span>{modeInfo.label}</span>
            </span>

            <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
              <CalendarDays size={12} className="text-[#6A38C2]" />
              <span>{formattedDate} • {timeString}</span>
            </span>
          </div>

          {/* Title */}
          <h2
            onClick={() => navigate(`/events/${event?._id}`)}
            className="text-base font-black text-gray-900 group-hover:text-[#6A38C2] transition-colors line-clamp-1 cursor-pointer tracking-tight"
            title={event?.title}
          >
            {event?.title}
          </h2>

          {/* Summary / Description */}
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {event?.summary || event?.description}
          </p>

          {/* Tags */}
          {event?.tags && event.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-purple-50 text-[10px] font-semibold text-purple-700 border border-purple-100"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[10px] text-gray-400 font-bold self-center">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Metrics Bar */}
        <div className="mt-4 pt-3.5 border-t border-purple-50 flex items-center justify-between text-xs">
          {/* Registration telemetry */}
          <div className="flex items-center gap-1.5 text-gray-700">
            <div className="p-1 rounded-lg bg-purple-50 text-[#6A38C2]">
              <Users size={13} />
            </div>
            <div>
              <span className="font-black text-gray-950 text-sm">
                {attendeesCount}
              </span>
              <span className="text-[11px] text-gray-400 font-medium ml-1">
                / {totalCapacity} RSVPs
              </span>
            </div>
          </div>

          {/* Manage Button */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/events/${event?._id}/edit`)}
              className="h-8 px-3 rounded-xl border-purple-200 text-[#6A38C2] hover:bg-purple-50 font-bold text-xs"
            >
              <span>Edit</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/events/${event?._id}`)}
              className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs shadow-xs"
            >
              <span>View</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminEventCard;

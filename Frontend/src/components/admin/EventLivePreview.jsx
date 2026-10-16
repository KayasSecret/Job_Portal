import React from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Laptop,
  Building2,
  Sparkles,
  ExternalLink,
  Clock,
  Layers,
  Globe,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

/**
 * EventLivePreview
 * Renders an exact real-time simulation of both:
 * 1. Student Event Discovery Card (how it renders in the grid on /events)
 * 2. Detailed Event Telemetry Preview
 */
const EventLivePreview = ({ formData, bannerPreview }) => {
  const isFree = formData.priceType === "free" || !formData.price || Number(formData.price) === 0;

  const fallbackBanner =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

  const bannerSrc = bannerPreview || formData.banner || fallbackBanner;

  const formattedDate = formData.eventDate
    ? new Date(formData.eventDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select date in Step 2";

  const totalSeats = formData.isUnlimitedCapacity
    ? "Unlimited"
    : formData.totalSeats || 100;

  return (
    <div className="space-y-6">
      {/* Simulation Label */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#6A38C2]">
          <Sparkles size={14} className="text-amber-400" />
          <span>Live Student Discovery Simulation</span>
        </div>
        <span className="text-[11px] font-bold text-gray-400">
          Real-time Preview
        </span>
      </div>

      {/* 1. Student Discovery Card Simulation */}
      <div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Grid Card Appearance (on /events)
        </span>

        <div className="rounded-3xl bg-white border border-purple-200/90 shadow-[0_10px_30px_-8px_rgba(106,56,194,0.12)] overflow-hidden flex flex-col justify-between max-w-sm mx-auto">
          {/* Card Image */}
          <div className="relative h-44 w-full overflow-hidden bg-gray-900">
            <img
              src={bannerSrc}
              alt="Cover Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#6A38C2] font-black text-[11px] shadow-sm">
                <Sparkles size={11} className="text-amber-500" />
                <span>{formData.category || "Workshop"}</span>
              </span>

              <span
                className={`px-3 py-1 rounded-full font-black text-xs ${
                  isFree
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-400 text-gray-950"
                }`}
              >
                {isFree ? "FREE" : `₹ ${formData.price}`}
              </span>
            </div>

            {/* Mode on Bottom of Image */}
            <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white text-xs font-bold">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                {formData.mode === "Online" ? (
                  <Laptop size={12} className="text-cyan-300" />
                ) : formData.mode === "Hybrid" ? (
                  <Layers size={12} className="text-purple-300" />
                ) : (
                  <MapPin size={12} className="text-emerald-300" />
                )}
                <span>{formData.mode || "Online"} Session</span>
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 mb-1.5">
                <CalendarDays size={12} className="text-[#6A38C2]" />
                <span>{formattedDate}</span>
                {formData.startTime && <span>• {formData.startTime}</span>}
              </div>

              <h4 className="text-base font-black text-gray-900 line-clamp-1">
                {formData.title || "Your Event Title Will Appear Here"}
              </h4>

              <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {formData.summary ||
                  formData.description ||
                  "A concise summary of your workshop or webinar that highlights key takeaways for students."}
              </p>

              {/* Tags */}
              {formData.tags && formData.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {formData.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-[10px] font-bold text-purple-700 border border-purple-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Meta */}
            <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Users size={12} className="text-[#6A38C2]" />
                <span className="font-bold">0 / {totalSeats}</span>
                <span className="text-gray-400 text-[11px]">Seats</span>
              </div>

              <span className="font-bold text-[#6A38C2] text-xs">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Parameter Summary */}
      <div className="rounded-2xl bg-purple-50/50 border border-purple-100 p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium text-gray-400">Host Organizer:</span>
          <span className="font-bold text-gray-900">
            {formData.organizer || "Verified Host"}
          </span>
        </div>
        {formData.speaker && (
          <div className="flex items-center justify-between text-gray-600">
            <span className="font-medium text-gray-400">Speaker:</span>
            <span className="font-bold text-gray-900">{formData.speaker}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium text-gray-400">Location:</span>
          <span className="font-bold text-gray-900 truncate max-w-[200px]">
            {formData.mode === "Online"
              ? "Virtual Session"
              : formData.city || formData.venueName || "Venue Specified"}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium text-gray-400">Timezone:</span>
          <span className="font-bold text-gray-900">{formData.timezone}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium text-gray-400">Registration:</span>
          <span
            className={`font-bold ${
              formData.isRegistrationEnabled
                ? "text-emerald-600"
                : "text-amber-600"
            }`}
          >
            {formData.isRegistrationEnabled ? "Open & Active" : "Disabled"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventLivePreview;

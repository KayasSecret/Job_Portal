import React from "react";
import {
  CalendarDays,
  Sparkles,
  Laptop,
  ShieldCheck,
  Tag,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { motion } from "framer-motion";
import EventHologramSphere from "./EventHologramSphere";

/**
 * EventHero
 * Cinematic, ultra-premium tech-event discovery hero banner.
 * Preserves the exact core content:
 * - Discover Events badge
 * - "Level Up Your Career With Amazing Tech Events 🚀" heading
 * - Comprehensive description
 * - All 4 statistic cards & telemetry HUD metrics
 * - 3D Holographic Event Sphere canvas
 * Matched to the exact desktop height of the Saved Jobs hero box.
 */
const EventHero = ({ allEvents = [] }) => {
  const totalCount = allEvents.length;
  const onlineCount = allEvents.filter((e) => e?.mode === "Online").length;
  const freeCount = allEvents.filter(
    (e) => !e?.price || Number(e.price) === 0
  ).length;

  return (
    <div>
      {/* 1. Global Navbar */}
      <Navbar />

      {/* 2. Hero Container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6">
        <motion.div
          id="events-hero"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative rounded-3xl px-6 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 mb-8 overflow-hidden bg-gradient-to-br from-[#1A0B3B] via-[#2A0E60] to-[#1E3A8A] text-white shadow-2xl"
        >
          {/* Volumetric Atmosphere Lighting Orbs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#8B5CF6]/35 blur-3xl animate-pulse"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#06B6D4]/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#EC4899]/20 blur-[100px]"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Heading, Description & Telemetry */}
            <div className="lg:col-span-8 flex flex-col justify-center">
              {/* Discover Events Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-3.5 self-start shadow-xs">
                <CalendarDays size={13} className="text-cyan-300" />
                <span className="tracking-wide">Discover the Latest Tech Events</span>
                <Sparkles size={13} className="text-amber-300 animate-spin" style={{ animationDuration: "12s" }} />
              </div>

              {/* Main Heading */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                Level Up Your Career{" "}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                  With Amazing Tech Events 🚀
                </span>
              </h1>

              {/* Description */}
              <p className="mt-2.5 text-xs sm:text-sm text-purple-100/80 max-w-2xl leading-relaxed">
                Join workshops, hackathons, coding contests, webinars, conferences and networking events from top tech companies and developer communities.
              </p>

              {/* Live Event Telemetry Metrics */}
              <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-semibold">
                    <CalendarDays size={12} className="text-cyan-400" />
                    <span>Total Events</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-none">
                    {totalCount}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-semibold">
                    <Laptop size={12} className="text-emerald-400" />
                    <span>Online Sessions</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 leading-none">
                    {onlineCount}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-semibold">
                    <Tag size={12} className="text-amber-400" />
                    <span>Free Access</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 leading-none">
                    {freeCount}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-semibold">
                    <ShieldCheck size={12} className="text-pink-400" />
                    <span>Verified Hosts</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-0.5 leading-none">
                    100%
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Event Sphere */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <EventHologramSphere eventCount={totalCount} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventHero;
import React from "react";
import EventCard from "./EventCard";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Sparkles, Compass, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

/**
 * EventList
 * Renders the main event collection with:
 * - Staggered Framer Motion entrance animations
 * - Responsive grid or list layouts
 * - Glassmorphic loading skeleton state
 * - Polished empty state with action triggers
 */
const EventList = ({
  events = [],
  loading = false,
  resetFilters = () => {},
  hasActiveFilters = false,
  viewMode = "grid",
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white/80 border border-purple-100 p-0 overflow-hidden space-y-4 animate-pulse shadow-sm"
          >
            <div className="h-52 bg-purple-100/70 w-full" />
            <div className="p-5 space-y-3">
              <div className="w-24 h-5 bg-purple-100/80 rounded-full" />
              <div className="w-4/5 h-6 bg-purple-100/90 rounded-md" />
              <div className="w-full h-12 bg-purple-50/70 rounded-md" />
              <div className="flex justify-between pt-3 border-t border-purple-50">
                <div className="w-20 h-8 bg-purple-100/60 rounded-xl" />
                <div className="w-24 h-8 bg-purple-200/80 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100 p-8 sm:p-14 text-center shadow-[0_20px_50px_-15px_rgba(106,56,194,0.1)] relative overflow-hidden"
      >
        {/* Ambient Atmosphere Accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-200/35 blur-3xl"
        />

        <div className="relative z-10 max-w-md mx-auto">
          {/* 3D Floating Calendar Icon with Halo */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/25 via-purple-500/20 to-pink-500/25 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200/90 shadow-lg flex items-center justify-center text-[#6A38C2]">
              <CalendarDays size={38} className="animate-bounce" style={{ animationDuration: "3s" }} />
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {hasActiveFilters ? "No Matching Tech Events" : "No Upcoming Events"}
          </h3>

          <p className="mt-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {hasActiveFilters
              ? "We couldn't find any sessions matching your filter criteria. Try resetting your search or broadening your category parameters."
              : "New tech workshops, conferences, and hackathons will be published soon. Check back shortly to reserve your seat."}
          </p>

          {/* Action Button */}
          {hasActiveFilters && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={resetFilters}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08 },
        },
      }}
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "grid grid-cols-1 md:grid-cols-2 gap-6"
      }
    >
      <AnimatePresence mode="popLayout">
        {events.map((event) => (
          <motion.div
            key={event._id}
            layout
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
          >
            <EventCard event={event} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventList;
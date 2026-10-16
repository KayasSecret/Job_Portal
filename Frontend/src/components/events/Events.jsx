import React, { useState, useMemo } from "react";
import useGetAllEvents from "@/hooks/useGetAllEvents";
import { useSelector } from "react-redux";
import EventHero from "./EventHero";
import EventSearch from "./EventSearch";
import EventFilter from "./EventFilter";
import EventList from "./EventList";
import { Radio } from "lucide-react";

/**
 * Events
 * Master page for tech event discovery across workshops, hackathons,
 * bootcamps, conferences, and webinars.
 *
 * Connected Features:
 * - 3D Holographic Event Sphere hero canvas
 * - Multi-criteria reactive filtering (Category, Mode, Price)
 * - Multi-field sorting (Date, Title, Seats)
 * - Real-time keyword search
 * - Grid and compact view modes
 */
const Events = () => {
  // Fetch all events from backend and store in Redux
  useGetAllEvents();

  const { allEvents = [] } = useSelector((store) => store.event);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortBy, setSortBy] = useState("soonest");
  const [viewMode, setViewMode] = useState("grid");

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedMode("All");
    setSelectedPrice("All");
    setSortBy("soonest");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "All" ||
    selectedMode !== "All" ||
    selectedPrice !== "All" ||
    sortBy !== "soonest";

  // Comprehensive Filter & Sort Pipeline
  const filteredEvents = useMemo(() => {
    let result = [...allEvents];

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((event) => {
        const titleMatch = event?.title?.toLowerCase()?.includes(q);
        const descMatch = event?.description?.toLowerCase()?.includes(q);
        const orgMatch = event?.organizer?.toLowerCase()?.includes(q);
        const speakerMatch = event?.speaker?.toLowerCase()?.includes(q);
        const locMatch = event?.location?.toLowerCase()?.includes(q);
        const catMatch = event?.category?.toLowerCase()?.includes(q);
        const tagMatch = event?.tags?.some((t) => t?.toLowerCase()?.includes(q));
        return titleMatch || descMatch || orgMatch || speakerMatch || locMatch || catMatch || tagMatch;
      });
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (event) =>
          event?.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Mode Filter (Online, Offline, Hybrid)
    if (selectedMode !== "All") {
      result = result.filter((event) => {
        const m = event?.mode?.toLowerCase() || "";
        if (selectedMode.toLowerCase() === "offline") {
          return m === "offline" || m === "in-person";
        }
        return m === selectedMode.toLowerCase();
      });
    }

    // 4. Price Filter (Free vs Paid)
    if (selectedPrice === "Free") {
      result = result.filter(
        (event) => !event?.price || Number(event.price) === 0
      );
    } else if (selectedPrice === "Paid") {
      result = result.filter(
        (event) => event?.price && Number(event.price) > 0
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === "later") {
        return new Date(b?.eventDate || 0) - new Date(a?.eventDate || 0);
      }
      if (sortBy === "title") {
        return (a?.title || "").localeCompare(b?.title || "");
      }
      if (sortBy === "seats") {
        return (b?.seatsLeft ?? 0) - (a?.seatsLeft ?? 0);
      }
      // Default: "soonest"
      return new Date(a?.eventDate || 0) - new Date(b?.eventDate || 0);
    });

    return result;
  }, [allEvents, searchQuery, selectedCategory, selectedMode, selectedPrice, sortBy]);

  return (
    <div className="min-h-screen bg-transparent pb-16">
      {/* 1. Cinematic Hero Section with 3D Holographic Event Sphere */}
      <EventHero allEvents={allEvents} />

      {/* 2. Main Content Container */}
      <div
        id="events-catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-12 sm:pb-16"
      >
        {/* All Events Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-bold mb-2 shadow-2xs">
              <Radio size={13} className="text-emerald-500 animate-pulse" />
              <span>Live Tech Repertoire</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>All Upcoming Events</span>
              <span className="text-[#6A38C2] text-xl sm:text-2xl font-black">
                ({filteredEvents.length})
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Explore hands-on workshops, hackathons, webinars, developer conferences and bootcamps.
            </p>
          </div>
        </div>

        {/* Interactive Search Bar */}
        <EventSearch
          search={searchQuery}
          setSearch={setSearchQuery}
          totalResults={filteredEvents.length}
        />

        {/* Filter, Sort & View Controls Toolbar */}
        <EventFilter
          category={selectedCategory}
          setCategory={setSelectedCategory}
          mode={selectedMode}
          setMode={setSelectedMode}
          price={selectedPrice}
          setPrice={setSelectedPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetFilters={handleResetFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Events Grid / List Collection */}
        <EventList
          events={filteredEvents}
          loading={false}
          resetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default Events;
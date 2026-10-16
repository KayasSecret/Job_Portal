import React from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

/**
 * EventSearch
 * Ultra-premium search bar for filtering tech events by title, organizer, speaker, or location.
 */
const EventSearch = ({
  search = "",
  setSearch = () => {},
  totalResults = null,
}) => {
  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="relative flex items-center bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-[0_8px_25px_-8px_rgba(106,56,194,0.08)] focus-within:border-purple-400 focus-within:shadow-[0_12px_30px_-8px_rgba(106,56,194,0.18)] rounded-2xl p-1.5 sm:p-2 mb-4 transition-all duration-300">
      {/* Search Icon */}
      <div className="pl-3 pr-2 text-[#6A38C2] shrink-0">
        <Search size={18} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search workshops, hackathons, conferences, organizers, or topics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none font-medium pr-2 h-9 sm:h-10"
      />

      {/* Results Count Pill if searching */}
      {search && totalResults !== null && (
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100 mr-2 shrink-0">
          {totalResults} {totalResults === 1 ? "Result" : "Results"}
        </span>
      )}

      {/* Clear Button */}
      {search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="h-8 w-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-purple-50 shrink-0 cursor-pointer"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
};

export default EventSearch;
import React from "react";
import {
  Filter,
  RotateCcw,
  Layers,
  Laptop,
  Tag,
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

/**
 * EventFilter
 * Modern, responsive filter panel with category, mode, price, sorting, and view toggle.
 */
const EventFilter = ({
  category = "All",
  setCategory = () => {},
  mode = "All",
  setMode = () => {},
  price = "All",
  setPrice = () => {},
  sortBy = "soonest",
  setSortBy = () => {},
  resetFilters = () => {},
  viewMode = "grid",
  setViewMode = () => {},
  categoriesList = [
    "Workshop",
    "Hackathon",
    "Webinar",
    "Conference",
    "Career Fair",
    "Networking",
    "Seminar",
    "Bootcamp",
    "Other",
  ],
}) => {
  const hasActiveFilters =
    category !== "All" || mode !== "All" || price !== "All" || sortBy !== "soonest";

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-purple-100/90 shadow-[0_8px_25px_-8px_rgba(106,56,194,0.06)] p-3 sm:p-4 mb-8 transition-all">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Filter Header Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6A38C2] text-xs font-bold border border-purple-100 shrink-0">
            <Filter size={14} />
            <span>Filters</span>
          </div>

          {/* Category Dropdown */}
          <div className="min-w-[140px] sm:min-w-[160px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 rounded-xl border-purple-100 bg-white text-xs font-semibold focus:ring-purple-400">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-purple-100 shadow-xl">
                <SelectItem value="All" className="text-xs font-medium">All Categories</SelectItem>
                {categoriesList.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs font-medium">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode Dropdown */}
          <div className="min-w-[125px] sm:min-w-[140px]">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="h-9 rounded-xl border-purple-100 bg-white text-xs font-semibold focus:ring-purple-400">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-purple-100 shadow-xl">
                <SelectItem value="All" className="text-xs font-medium">All Modes</SelectItem>
                <SelectItem value="Online" className="text-xs font-medium">Online Virtual</SelectItem>
                <SelectItem value="Offline" className="text-xs font-medium">In-Person Offline</SelectItem>
                <SelectItem value="Hybrid" className="text-xs font-medium">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Dropdown */}
          <div className="min-w-[115px] sm:min-w-[130px]">
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger className="h-9 rounded-xl border-purple-100 bg-white text-xs font-semibold focus:ring-purple-400">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-purple-100 shadow-xl">
                <SelectItem value="All" className="text-xs font-medium">All Prices</SelectItem>
                <SelectItem value="Free" className="text-xs font-medium">Free Access</SelectItem>
                <SelectItem value="Paid" className="text-xs font-medium">Paid Admission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-3 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Right Sort & View Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-50">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-purple-100 rounded-xl px-2.5 py-1 shadow-2xs">
            <ArrowUpDown size={13} className="text-[#6A38C2] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-transparent outline-none cursor-pointer pr-1 h-7"
            >
              <option value="soonest">Date: Soonest First</option>
              <option value="later">Date: Later First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="seats">Most Seats Available</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-purple-50/80 p-0.5 rounded-xl border border-purple-100">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#6A38C2] shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Compact View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#6A38C2] shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilter;
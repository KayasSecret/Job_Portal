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
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-purple-100/90 shadow-[0_8px_25px_-8px_rgba(106,56,194,0.06)] p-3 sm:p-4 mb-6 sm:mb-8 transition-all">
      {/* Mobile-Only Top Bar: Filters Header, Reset & Grid/List View Toggle */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-purple-100/80 sm:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-purple-50 text-[#6A38C2] text-xs font-bold border border-purple-100 shrink-0">
            <Filter size={13} />
            <span>Filters</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-8 px-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile View Toggle */}
        <div className="inline-flex items-center h-8 bg-purple-50/80 p-0.5 rounded-xl border border-purple-100 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            title="Grid View"
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-[#6A38C2] shadow-2xs font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            title="Compact View"
            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white text-[#6A38C2] shadow-2xs font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Filter Controls: 2x2 Uniform Grid on Mobile, Flex Row on Tablet/Desktop */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {/* Desktop Filter Header Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6A38C2] text-xs font-bold border border-purple-100 shrink-0">
            <Filter size={14} />
            <span>Filters</span>
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[160px] min-w-0">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-9 rounded-xl border-purple-100 bg-gray-50/70 sm:bg-white text-xs font-semibold focus:ring-purple-400">
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
          <div className="w-full sm:w-auto sm:min-w-[140px] min-w-0">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full h-9 rounded-xl border-purple-100 bg-gray-50/70 sm:bg-white text-xs font-semibold focus:ring-purple-400">
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
          <div className="w-full sm:w-auto sm:min-w-[130px] min-w-0">
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger className="w-full h-9 rounded-xl border-purple-100 bg-gray-50/70 sm:bg-white text-xs font-semibold focus:ring-purple-400">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-purple-100 shadow-xl">
                <SelectItem value="All" className="text-xs font-medium">All Prices</SelectItem>
                <SelectItem value="Free" className="text-xs font-medium">Free Access</SelectItem>
                <SelectItem value="Paid" className="text-xs font-medium">Paid Admission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Date Sorting Dropdown (4th cell of 2x2 grid on mobile) */}
          <div className="flex sm:hidden items-center gap-1.5 w-full h-9 bg-gray-50/70 border border-purple-100 rounded-xl px-2.5 shadow-2xs min-w-0">
            <ArrowUpDown size={13} className="text-[#6A38C2] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full min-w-0 text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer truncate h-full"
            >
              <option value="soonest">Date: Soonest First</option>
              <option value="later">Date: Later First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="seats">Most Seats Available</option>
            </select>
          </div>

          {/* Desktop Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="hidden sm:flex h-9 px-3 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Desktop/Tablet Right Sort & View Controls */}
        <div className="hidden sm:flex items-center justify-end gap-2.5">
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
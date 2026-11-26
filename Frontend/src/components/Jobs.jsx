import React, { useEffect, useState, useMemo } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  Building2,
  Sparkles,
  TrendingUp,
  RotateCcw,
  X,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Layers,
  MapPin,
  IndianRupee,
} from "lucide-react";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { setSearchedQuery } from "@/redux/jobSlice";
import { Button } from "./ui/button";

const JOBS_PER_PAGE = 9;
const MOBILE_JOBS_PER_PAGE = 4;

const Jobs = () => {
  useGetAllJobs();
  const dispatch = useDispatch();

  const { allJobs = [], searchedQuery = "" } = useSelector(
    (store) => store.job
  );
  const { user } = useSelector((store) => store.auth);

  // Search input state
  const [searchInput, setSearchInput] = useState(searchedQuery || "");

  // Advanced Filter States
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");

  // Sorting state: "latest" | "salary-high" | "salary-low" | "openings"
  const [sortBy, setSortBy] = useState("latest");

  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_JOBS_PER_PAGE);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleMediaChange = (e) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Sync searchedQuery from Redux to local searchInput
  useEffect(() => {
    setSearchInput(searchedQuery || "");
  }, [searchedQuery]);

  // Reset mobile pagination when filters or search change
  useEffect(() => {
    setMobileVisibleCount(MOBILE_JOBS_PER_PAGE);
  }, [
    searchedQuery,
    selectedLocation,
    selectedIndustry,
    selectedSalary,
    selectedJobType,
    sortBy,
  ]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    dispatch(setSearchedQuery(searchInput.trim()));
    setVisibleCount(JOBS_PER_PAGE);
    setMobileVisibleCount(MOBILE_JOBS_PER_PAGE);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSelectedLocation("");
    setSelectedIndustry("");
    setSelectedSalary("");
    setSelectedJobType("");
    setSortBy("latest");
    dispatch(setSearchedQuery(""));
    setVisibleCount(JOBS_PER_PAGE);
    setMobileVisibleCount(MOBILE_JOBS_PER_PAGE);
  };

  // User's saved jobs list for fast lookup
  const userSavedJobIds = useMemo(() => {
    if (!user || !user.savedJobs) return new Set();
    return new Set(
      user.savedJobs.map((item) =>
        typeof item === "string" ? item : item?._id?.toString()
      )
    );
  }, [user]);

  // Comprehensive Filtering Pipeline
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // 1. Text Search (searchedQuery)
    if (searchedQuery) {
      const q = searchedQuery.toLowerCase();
      result = result.filter((job) => {
        const titleMatch = job?.title?.toLowerCase().includes(q);
        const descMatch = job?.description?.toLowerCase().includes(q);
        const locMatch = job?.location?.toLowerCase().includes(q);
        const compMatch = job?.company?.name?.toLowerCase().includes(q);
        const typeMatch = job?.jobType?.toLowerCase().includes(q);
        return titleMatch || descMatch || locMatch || compMatch || typeMatch;
      });
    }

    // 2. Location Filter
    if (selectedLocation) {
      const locTarget = selectedLocation.toLowerCase();
      result = result.filter((job) =>
        job?.location?.toLowerCase().includes(locTarget)
      );
    }

    // 3. Industry / Role Filter
    if (selectedIndustry) {
      const indTarget = selectedIndustry.toLowerCase();
      result = result.filter(
        (job) =>
          job?.title?.toLowerCase().includes(indTarget) ||
          job?.description?.toLowerCase().includes(indTarget)
      );
    }

    // 4. Job Type Filter
    if (selectedJobType) {
      const typeTarget = selectedJobType.toLowerCase();
      result = result.filter((job) =>
        job?.jobType?.toLowerCase().includes(typeTarget)
      );
    }

    // 5. Salary Range Filter
    if (selectedSalary) {
      result = result.filter((job) => {
        const sal = Number(job?.salary) || 0;
        if (selectedSalary === "0 - 3 LPA") return sal >= 0 && sal <= 3;
        if (selectedSalary === "3 - 6 LPA") return sal > 3 && sal <= 6;
        if (selectedSalary === "6 - 12 LPA") return sal > 6 && sal <= 12;
        if (selectedSalary === "12 - 20 LPA") return sal > 12 && sal <= 20;
        if (selectedSalary === "20+ LPA") return sal > 20;
        return true;
      });
    }

    // 6. Sorting Pipeline
    result.sort((a, b) => {
      if (sortBy === "salary-high") {
        return (Number(b?.salary) || 0) - (Number(a?.salary) || 0);
      }
      if (sortBy === "salary-low") {
        return (Number(a?.salary) || 0) - (Number(b?.salary) || 0);
      }
      if (sortBy === "openings") {
        return (Number(b?.position) || 0) - (Number(a?.position) || 0);
      }
      // Default: "latest"
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    return result;
  }, [
    allJobs,
    searchedQuery,
    selectedLocation,
    selectedIndustry,
    selectedJobType,
    selectedSalary,
    sortBy,
  ]);

  const isJobSeeker = !user || user.role?.toLowerCase() === "student";
  const shouldUseMobileLimit = isMobile && isJobSeeker;
  const activeVisibleCount = shouldUseMobileLimit
    ? mobileVisibleCount
    : visibleCount;
  const displayedJobs = filteredJobs.slice(0, activeVisibleCount);
  const hasMoreJobs = activeVisibleCount < filteredJobs.length;

  const activeFiltersCount =
    (selectedLocation ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (selectedSalary ? 1 : 0) +
    (selectedJobType ? 1 : 0) +
    (searchedQuery ? 1 : 0);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-5 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ================= HERO & SEARCH HEADER ================= */}
          <motion.div
            id="jobs-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl sm:rounded-3xl px-4 py-4 sm:px-8 sm:py-7 md:px-10 md:py-8 mb-5 sm:mb-8 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-lg sm:shadow-2xl"
          >
            {/* Ambient Lighting Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#8B5CF6]/30 blur-3xl animate-pulse"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#EC4899]/25 blur-3xl"
            />

            <div className="relative z-10 max-w-3xl">
              <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-2 self-start shadow-xs">
                <Sparkles size={12} className="text-amber-300" />
                <span>Next-Generation Career Explorer</span>
              </div>

              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                Explore Verified{" "}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  Tech Openings
                </span>
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-purple-100/85 max-w-xl leading-relaxed">
                Search verified engineering and product roles from top companies and apply in one click.
              </p>

              {/* Integrated Search Input */}
              <form onSubmit={handleSearchSubmit} className="mt-3 sm:mt-3.5">
                <div className="relative flex items-center bg-white rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-md sm:shadow-lg border border-white/20 max-w-2xl">
                  <div className="pl-2.5 sm:pl-3.5 pr-2 text-purple-600 shrink-0">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by job title, skills, or company..."
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none font-medium pr-2 min-w-0"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        dispatch(setSearchedQuery(""));
                      }}
                      className="p-1 mr-1 text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <Button
                    type="submit"
                    className="h-8 px-3.5 sm:px-5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-xs shadow-md shrink-0 cursor-pointer"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Live Stats Row inside Hero (Desktop & Tablet only) */}
            <div className="hidden md:grid relative z-10 mt-4 pt-4 border-t border-white/10 grid-cols-4 gap-4">
              <div>
                <div className="text-xl font-black text-white leading-none">
                  {allJobs.length}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/80 uppercase tracking-wider mt-1">
                  Available Roles
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-white leading-none">
                  {filteredJobs.length}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/80 uppercase tracking-wider mt-1">
                  Matching Query
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-white leading-none">
                  100%
                </div>
                <div className="text-[11px] font-semibold text-purple-200/80 uppercase tracking-wider mt-1">
                  Verified Recruiters
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-white leading-none">
                  24 hrs
                </div>
                <div className="text-[11px] font-semibold text-purple-200/80 uppercase tracking-wider mt-1">
                  Average Response
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= ACTIVE FILTER TAGS & CONTROLS ================= */}
          <div className="mb-6 sm:mb-8 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-white/95 sm:bg-transparent border border-purple-100/90 sm:border-0 shadow-xs sm:shadow-none">
              {/* Left: Filters Button + Showing Opportunities Count */}
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl bg-purple-50/80 sm:bg-white border border-purple-200/90 text-xs font-bold text-[#6A38C2] sm:text-gray-800 shadow-2xs hover:bg-purple-100/70 transition-all shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal size={14} className="text-[#6A38C2] shrink-0" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#6A38C2] text-white text-[10px] font-black flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Showing{" "}
                  <span className="text-[#6A38C2] font-black">
                    {filteredJobs.length}
                  </span>{" "}
                  {filteredJobs.length === 1 ? "Opportunity" : "Opportunities"}
                </span>
              </div>

              {/* Right: Sort Dropdown */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-purple-50 sm:border-t-0">
                <span className="text-xs text-gray-500 sm:text-gray-400 font-semibold sm:font-medium whitespace-nowrap inline-flex items-center gap-1.5">
                  <ArrowUpDown size={13} className="text-[#6A38C2] sm:hidden shrink-0" />
                  <span>Sort by:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-gray-50/80 sm:bg-white border border-purple-100 text-xs font-bold sm:font-semibold text-gray-800 sm:text-gray-700 focus:outline-none focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/15 shadow-2xs sm:shadow-xs cursor-pointer flex-1 sm:flex-initial max-w-[200px] sm:max-w-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                  <option value="openings">Most Openings</option>
                </select>
              </div>
            </div>

            {/* Active Filter Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {selectedIndustry && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold">
                    <span>{selectedIndustry}</span>
                    <X
                      size={13}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => {
                        setSelectedIndustry("");
                        dispatch(setSearchedQuery(""));
                      }}
                    />
                  </span>
                )}

                {selectedLocation && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    <span>{selectedLocation}</span>
                    <X
                      size={13}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => setSelectedLocation("")}
                    />
                  </span>
                )}

                {selectedSalary && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    <span>{selectedSalary}</span>
                    <X
                      size={13}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => setSelectedSalary("")}
                    />
                  </span>
                )}

                {selectedJobType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                    <span>{selectedJobType}</span>
                    <X
                      size={13}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => setSelectedJobType("")}
                    />
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* ================= MAIN CONTENT LAYOUT ================= */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Left Sidebar Filter Card */}
            <div className="hidden lg:block w-[300px] shrink-0 sticky top-24">
              <FilterCard
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
                selectedSalary={selectedSalary}
                setSelectedSalary={setSelectedSalary}
                selectedJobType={selectedJobType}
                setSelectedJobType={setSelectedJobType}
                onResetFilters={handleResetFilters}
                totalResultsCount={filteredJobs.length}
              />
            </div>

            {/* Right Job Cards Grid */}
            <div className="flex-1 w-full">
              {displayedJobs.length <= 0 ? (
                <div className="text-center py-20 px-6 rounded-3xl bg-white border border-dashed border-purple-200 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#6A38C2] flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    No Matching Jobs Found
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                    Try adjusting your keyword, removing location filters, or resetting filters to explore all available positions.
                  </p>
                  <Button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-6 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-md"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedJobs.map((job) => (
                      <Job
                        key={job._id}
                        job={job}
                        isSaved={userSavedJobIds.has(job._id?.toString())}
                      />
                    ))}
                  </div>

                  {/* More Jobs / Load More Button */}
                  {hasMoreJobs && (
                    <div className="mt-8 sm:mt-12 flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          if (shouldUseMobileLimit) {
                            setMobileVisibleCount(
                              (prev) => prev + MOBILE_JOBS_PER_PAGE
                            );
                          } else {
                            setVisibleCount((prev) => prev + JOBS_PER_PAGE);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-white border border-purple-200 text-[#6A38C2] hover:bg-purple-50 text-xs sm:text-sm font-bold shadow-sm sm:shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <span className="md:hidden">More Jobs</span>
                        <span className="hidden md:inline">
                          Load More Jobs ({filteredJobs.length - activeVisibleCount} remaining)
                        </span>
                        <ChevronDown size={15} />
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE FILTER DRAWER ================= */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl p-6 overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#6A38C2]" />
                  <h3 className="font-bold text-base text-gray-900">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <FilterCard
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
                selectedSalary={selectedSalary}
                setSelectedSalary={setSelectedSalary}
                selectedJobType={selectedJobType}
                setSelectedJobType={setSelectedJobType}
                onResetFilters={handleResetFilters}
                totalResultsCount={filteredJobs.length}
              />

              <div className="mt-6 pt-4 border-t border-purple-100">
                <Button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full h-11 rounded-xl bg-[#6A38C2] text-white font-semibold text-xs"
                >
                  Apply Filters ({filteredJobs.length} jobs)
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Jobs;
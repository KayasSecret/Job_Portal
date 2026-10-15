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

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync searchedQuery from Redux to local searchInput
  useEffect(() => {
    setSearchInput(searchedQuery || "");
  }, [searchedQuery]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    dispatch(setSearchedQuery(searchInput.trim()));
    setVisibleCount(JOBS_PER_PAGE);
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

  const displayedJobs = filteredJobs.slice(0, visibleCount);
  const hasMoreJobs = visibleCount < filteredJobs.length;

  const activeFiltersCount =
    (selectedLocation ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (selectedSalary ? 1 : 0) +
    (selectedJobType ? 1 : 0) +
    (searchedQuery ? 1 : 0);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-8 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ================= HERO & SEARCH HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl px-5 py-3.5 sm:px-7 sm:py-4 md:px-8 md:py-4 mb-5 sm:mb-6 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-2xl"
          >
            {/* Ambient Lighting Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -left-16 w-60 h-60 rounded-full bg-[#8B5CF6]/30 blur-3xl animate-pulse"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-[#EC4899]/25 blur-3xl"
            />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10.5px] font-semibold text-purple-200 mb-1.5">
                <Sparkles size={11} className="text-amber-300" />
                <span>Next-Generation Career Explorer</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight leading-tight">
                Explore Verified{" "}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  Tech Openings
                </span>
              </h1>

              <p className="mt-0.5 text-[11.5px] sm:text-xs text-purple-100/80 max-w-xl leading-normal">
                Connect directly with hiring managers across startups and Fortune 500 innovators with 1-click apply.
              </p>

              {/* Integrated Search Input */}
              <form onSubmit={handleSearchSubmit} className="mt-2.5 sm:mt-3">
                <div className="relative flex items-center bg-white rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-lg border border-white/20 max-w-2xl">
                  <div className="pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 text-purple-600">
                    <Search size={15} />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by job title, skills, or company..."
                    className="w-full h-8 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none font-medium pr-2"
                  />
                  <Button
                    type="submit"
                    className="h-7 sm:h-8 px-3.5 sm:px-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-[11px] sm:text-xs shadow-md shrink-0 cursor-pointer"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Live Stats Row inside Hero */}
            <div className="relative z-10 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div>
                <div className="text-base sm:text-lg font-black text-white leading-none">
                  {allJobs.length}
                </div>
                <div className="text-[9.5px] sm:text-[10px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5">
                  Available Roles
                </div>
              </div>

              <div>
                <div className="text-base sm:text-lg font-black text-white leading-none">
                  {filteredJobs.length}
                </div>
                <div className="text-[9.5px] sm:text-[10px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5">
                  Matching Query
                </div>
              </div>

              <div>
                <div className="text-base sm:text-lg font-black text-white leading-none">
                  100%
                </div>
                <div className="text-[9.5px] sm:text-[10px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5">
                  Verified Recruiters
                </div>
              </div>

              <div>
                <div className="text-base sm:text-lg font-black text-white leading-none">
                  24 hrs
                </div>
                <div className="text-[9.5px] sm:text-[10px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5">
                  Average Response
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= ACTIVE FILTER TAGS & CONTROLS ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-purple-200 text-xs font-semibold text-gray-800 shadow-xs hover:bg-purple-50"
              >
                <SlidersHorizontal size={14} className="text-[#6A38C2]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#6A38C2] text-white text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                Showing <span className="text-[#6A38C2] font-black">{filteredJobs.length}</span> Opportunities
              </span>

              {/* Active Filter Pills */}
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

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors ml-1"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-gray-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-purple-100 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#6A38C2] shadow-xs cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="salary-high">Salary: High to Low</option>
                <option value="salary-low">Salary: Low to High</option>
                <option value="openings">Most Openings</option>
              </select>
            </div>
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

                  {/* Load More Button */}
                  {hasMoreJobs && (
                    <div className="mt-12 text-center">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() =>
                          setVisibleCount((prev) => prev + JOBS_PER_PAGE)
                        }
                        className="px-8 py-3.5 rounded-2xl bg-white border border-purple-200 text-[#6A38C2] hover:bg-purple-50 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        Load More Jobs ({filteredJobs.length - visibleCount} remaining)
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
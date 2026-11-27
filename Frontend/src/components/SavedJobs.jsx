import React, { useEffect, useState, useMemo } from "react";
import Navbar from "./shared/Navbar";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck,
  Bookmark,
  Sparkles,
  TrendingUp,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  IndianRupee,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import SavedJobsHologramVault from "./saved-jobs/SavedJobsHologramVault";
import SavedJobCard from "./saved-jobs/SavedJobCard";

/**
 * SavedJobs
 * Ultra-premium, futuristic career dashboard for saved/bookmarked jobs.
 * Features:
 * - 3D Holographic Career Vault hero canvas with mathematical perspective projection
 * - Telemetry HUD metrics & real-time collection statistics
 * - Live search, category filtering & multi-field sorting
 * - Staggered entrance animations with Framer Motion
 * - Glassmorphic card surfaces with dynamic lighting sweep
 * - Production-quality remove-from-saved interaction
 * - Polished empty state with 1-click navigation to explore jobs
 */
const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch saved jobs from backend
  const getSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${USER_API_ENDPOINT}/savedjobs`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setSavedJobs(res.data.savedJobs || []);
      }
    } catch (error) {
      console.error("Fetch saved jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSavedJobs();
  }, []);

  // Remove card from local list optimistically
  const handleRemoveSuccess = (jobId) => {
    setSavedJobs((prev) => prev.filter((j) => (j?._id || j) !== jobId));
  };

  // Filter & Sort pipeline
  const filteredJobs = useMemo(() => {
    let result = [...savedJobs];

    // 1. Text Search (Role, Company, Location)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((job) => {
        const titleMatch = job?.title?.toLowerCase()?.includes(q);
        const compMatch = job?.company?.name?.toLowerCase()?.includes(q);
        const locMatch = job?.location?.toLowerCase()?.includes(q);
        const descMatch = job?.description?.toLowerCase()?.includes(q);
        return titleMatch || compMatch || locMatch || descMatch;
      });
    }

    // 2. Job Type Filter
    if (selectedJobType !== "All") {
      result = result.filter(
        (job) => job?.jobType?.toLowerCase() === selectedJobType.toLowerCase()
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "highest-salary") {
        return (Number(b?.salary) || 0) - (Number(a?.salary) || 0);
      }
      if (sortBy === "company") {
        const compA = a?.company?.name || "";
        const compB = b?.company?.name || "";
        return compA.localeCompare(compB);
      }
      // Default: "latest"
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    return result;
  }, [savedJobs, searchQuery, selectedJobType, sortBy]);

  // Aggregate telemetry statistics
  const totalSaved = savedJobs.length;
  const maxSalary = useMemo(() => {
    if (!savedJobs.length) return 0;
    return Math.max(...savedJobs.map((j) => Number(j?.salary) || 0));
  }, [savedJobs]);

  const uniqueCompaniesCount = useMemo(() => {
    const set = new Set();
    savedJobs.forEach((j) => {
      if (j?.company?.name) set.add(j.company.name);
    });
    return set.size;
  }, [savedJobs]);

  const jobTypeOptions = ["All", "Full-Time", "Part-Time", "Internship", "Contract"];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-5 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ==============================================================
              1. HERO SECTION: 3D HOLOGRAPHIC CAREER VAULT COMMAND CENTER
              ============================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative rounded-2xl sm:rounded-3xl p-4 sm:px-8 sm:py-7 md:px-10 md:py-8 mb-5 sm:mb-8 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-xl sm:shadow-2xl"
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

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
              {/* Left Column: Heading, Description & Telemetry Chips */}
              <div className="lg:col-span-8 flex flex-col justify-center min-w-0">
                {/* Vault Badge Pill (Desktop/Tablet only to keep mobile hero clean) */}
                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-3 self-start shadow-xs">
                  <Sparkles size={13} className="text-amber-300 animate-spin" style={{ animationDuration: "10s" }} />
                  <span className="tracking-wide">Curated Opportunity Vault • Student Collection</span>
                  <ShieldCheck size={13} className="text-emerald-400" />
                </div>

                {/* Hero Title */}
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug sm:leading-tight">
                  Your Saved{" "}
                  <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                    Opportunities
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-purple-100/85 max-w-2xl leading-relaxed">
                  Review, compare, and fast-track applications for your bookmarked high-impact positions across verified enterprise and high-growth startup innovators.
                </p>

                {/* Live Vault Telemetry Metrics */}
                <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-white/10">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-purple-300 text-[10px] sm:text-[11px] font-semibold">
                      <Bookmark size={11} className="text-pink-400 shrink-0" />
                      <span className="truncate">Saved Roles</span>
                    </div>
                    <div className="text-base sm:text-2xl font-black text-white mt-0.5 leading-none">
                      {totalSaved}
                    </div>
                  </div>

                  <div className="hidden sm:block bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-semibold">
                      <TrendingUp size={12} className="text-emerald-400 shrink-0" />
                      <span>Ready to Apply</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 leading-none">
                      100%
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-white/10">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-purple-300 text-[10px] sm:text-[11px] font-semibold">
                      <IndianRupee size={11} className="text-amber-400 shrink-0" />
                      <span className="truncate">Top Package</span>
                    </div>
                    <div className="text-base sm:text-2xl font-black text-white mt-0.5 leading-none truncate">
                      {maxSalary > 0 ? `₹${maxSalary} LPA` : "—"}
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-white/10">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-purple-300 text-[10px] sm:text-[11px] font-semibold">
                      <Building2 size={11} className="text-cyan-400 shrink-0" />
                      <span className="truncate">Employers</span>
                    </div>
                    <div className="text-base sm:text-2xl font-black text-white mt-0.5 leading-none">
                      {uniqueCompaniesCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Holographic Career Vault Canvas */}
              <div className="lg:col-span-4 flex items-center justify-center pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
                <SavedJobsHologramVault savedCount={totalSaved} />
              </div>
            </div>
          </motion.div>

          {/* ==============================================================
              2. SEARCH, FILTER & SORT TOOLBAR
              ============================================================== */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-purple-100/90 shadow-[0_10px_30px_-10px_rgba(106,56,194,0.06)] p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-3">
              {/* Search Field */}
              <div className="relative w-full md:flex-1 md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-500">
                  <Search size={15} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by role, company, or location..."
                  className="w-full h-10 md:h-auto pl-9 pr-8 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-purple-50/50 rounded-xl border border-purple-100 focus:outline-none focus:border-purple-400 focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills & Sort Dropdown */}
              <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2.5 md:gap-2">
                {/* Job Type Filter Chips: 6-col Segmented Grid on Mobile, Inline Row on Tablet/Desktop */}
                <div className="grid grid-cols-6 gap-1.5 p-1.5 w-full bg-purple-50/70 rounded-xl border border-purple-100/90 md:w-auto md:flex md:items-center md:gap-1 md:p-0 md:bg-transparent md:border-0">
                  {jobTypeOptions.map((type, idx) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedJobType(type)}
                      className={`${
                        idx < 3 ? "col-span-2" : "col-span-3"
                      } flex items-center justify-center h-8.5 md:h-auto px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                        selectedJobType === type
                          ? "bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] text-white shadow-purple-500/20"
                          : "bg-white hover:bg-purple-50 text-gray-600 hover:text-[#6A38C2] border border-purple-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Sort Selector */}
                <div className="relative flex items-center justify-between md:justify-start gap-2 md:gap-1.5 w-full md:w-auto h-9 md:h-auto bg-gray-50/80 md:bg-white border border-purple-100 rounded-xl px-3 md:px-2.5 py-1.5 shadow-2xs">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 md:hidden shrink-0">
                    <ArrowUpDown size={13} className="text-[#6A38C2] shrink-0" />
                    <span>Sort by:</span>
                  </span>
                  <ArrowUpDown size={13} className="hidden md:block text-[#6A38C2] shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold text-gray-700 bg-transparent outline-none cursor-pointer pr-1 flex-1 md:flex-initial"
                  >
                    <option value="latest">Latest Saved</option>
                    <option value="highest-salary">Highest Salary</option>
                    <option value="company">Company Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Query Status Indicator */}
            {(searchQuery || selectedJobType !== "All") && (
              <div className="mt-2.5 pt-2 border-t border-purple-100/60 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing <strong className="text-gray-800">{filteredJobs.length}</strong> of {totalSaved} saved opportunities
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedJobType("All");
                  }}
                  className="text-[#6A38C2] hover:text-[#5B21B6] font-bold hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ==============================================================
              3. CONTENT STATE: LOADING, GRID, OR EMPTY STATE
              ============================================================== */}
          {loading ? (
            /* Futuristic Loading Skeleton State */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white/80 border border-purple-100 p-6 space-y-4 animate-pulse shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100/80" />
                    <div className="space-y-2 flex-1">
                      <div className="w-32 h-4 bg-purple-100/80 rounded-md" />
                      <div className="w-20 h-3 bg-purple-50 rounded-md" />
                    </div>
                  </div>
                  <div className="w-48 h-5 bg-purple-100/80 rounded-md" />
                  <div className="w-full h-10 bg-purple-50/70 rounded-md" />
                  <div className="flex gap-2">
                    <div className="w-16 h-6 bg-purple-100/60 rounded-lg" />
                    <div className="w-20 h-6 bg-purple-100/60 rounded-lg" />
                    <div className="w-20 h-6 bg-purple-100/60 rounded-lg" />
                  </div>
                  <div className="pt-4 border-t border-purple-50 flex justify-between">
                    <div className="w-20 h-8 bg-purple-100/60 rounded-xl" />
                    <div className="w-24 h-8 bg-purple-200/80 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            /* Populated Saved Jobs Grid */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job?._id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
                    }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                  >
                    <SavedJobCard
                      job={job}
                      onRemoveSuccess={handleRemoveSuccess}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Futuristic Polished Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100 p-6 sm:p-14 text-center shadow-[0_20px_50px_-15px_rgba(106,56,194,0.1)] relative overflow-hidden"
            >
              {/* Ambient Atmosphere Accent Behind Empty State */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-200/40 blur-3xl"
              />

              <div className="relative z-10 max-w-md mx-auto">
                {/* 3D Floating Geometric Bookmark Icon with Halo */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/25 via-violet-400/20 to-pink-400/25 blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 border border-purple-200/90 shadow-lg flex items-center justify-center text-[#6A38C2]">
                    <BookmarkCheck className="w-8 h-8 sm:w-[38px] sm:h-[38px] animate-bounce" style={{ animationDuration: "3s" }} />
                  </div>
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {savedJobs.length === 0
                    ? "Your Career Vault is Empty"
                    : "No Matching Saved Roles"}
                </h3>

                <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {savedJobs.length === 0
                    ? "Discover verified engineering, AI, and design openings from top recruiters and bookmark them to organize and fast-track your applications here."
                    : "No saved opportunities match your current search or filter parameters. Try clearing your filters to view all your bookmarked roles."}
                </p>

                {/* Action Buttons */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
                  {savedJobs.length === 0 ? (
                    <Button
                      onClick={() => navigate("/jobs")}
                      className="w-full sm:w-auto justify-center h-11 px-6 rounded-xl bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <Compass size={16} className="shrink-0" />
                      <span>Explore Verified Jobs</span>
                      <ArrowRight size={15} className="shrink-0" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedJobType("All");
                      }}
                      className="w-full sm:w-auto justify-center h-10 px-5 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                    >
                      <span>Reset Filters</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedJobs;
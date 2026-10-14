import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Flame,
  Search,
} from "lucide-react";
import LatestJobCards from "./LatestJobCards";

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);
  const navigate = useNavigate();

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/80 text-[#6A38C2] text-xs font-semibold mb-3">
              <Flame size={14} className="text-orange-500" />
              <span>Handpicked & Hot Openings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Featured &{" "}
              <span className="bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#EC4899] bg-clip-text text-transparent">
                Latest Openings
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-xl">
              Fresh roles added directly by verified recruiters. Apply instantly with your profile.
            </p>
          </div>

          <Link to="/jobs">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#6A38C2] font-semibold text-xs sm:text-sm border border-purple-200/80 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Explore All Jobs</span>
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </div>

        {/* Jobs Grid */}
        {allJobs && allJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {allJobs.slice(0, 6).map((job) => (
              <LatestJobCards key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-purple-50/50 border border-dashed border-purple-200">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#6A38C2] flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              No Job Openings Live Right Now
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Check back shortly or browse through our complete job catalog to find active listings.
            </p>
            <button
              type="button"
              onClick={() => navigate("/browse")}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6A38C2] text-white text-xs font-semibold shadow-md hover:bg-[#5B21B6] transition-all"
            >
              <Search size={14} />
              <span>Browse All Roles</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestJobs;
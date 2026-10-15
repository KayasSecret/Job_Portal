import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Building2,
  Zap,
} from "lucide-react";
import { setSearchedQuery } from "@/redux/jobSlice";

const POPULAR_COMPANIES = [
  { name: "Google", color: "from-blue-500 to-emerald-500" },
  { name: "Microsoft", color: "from-blue-600 to-cyan-500" },
  { name: "Amazon", color: "from-amber-500 to-orange-500" },
  { name: "Netflix", color: "from-red-600 to-rose-500" },
  { name: "Adobe", color: "from-red-500 to-pink-500" },
  { name: "Meta", color: "from-indigo-600 to-blue-500" },
  { name: "Apple", color: "from-gray-700 to-gray-900" },
];

const QUICK_TAGS = [
  "Frontend",
  "Full Stack",
  "DevOps",
  "React",
  "Node",
  "AI Engineer",
  "Remote",
];

const STATS = [
  {
    value: "5,000+",
    label: "Verified Job Openings",
    icon: Briefcase,
    gradient: "from-[#6A38C2] to-[#7C3AED]",
    shadow: "shadow-purple-500/20",
  },
  {
    value: "1,200+",
    label: "Top Hiring Companies",
    icon: Building2,
    gradient: "from-fuchsia-600 to-pink-600",
    shadow: "shadow-pink-500/20",
  },
  {
    value: "1-Click",
    label: "Direct Recruiter Apply",
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-orange-500/20",
  },
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (searchTarget) => {
    const targetQuery = typeof searchTarget === "string" ? searchTarget : query;
    if (targetQuery.trim()) {
      dispatch(setSearchedQuery(targetQuery.trim()));
      navigate("/jobs");
    } else {
      navigate("/jobs");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchJobHandler(query);
    }
  };

  return (
    <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10 text-center">
        {/* Top Floating Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-purple-200/80 backdrop-blur-xl shadow-xs"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-3 ring-emerald-500/25 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-[#4C1D95] via-[#6A38C2] to-fuchsia-600 bg-clip-text text-transparent">
            Next-Gen AI Career Discovery Engine
          </span>
          <Sparkles size={13} className="text-amber-500" />
        </motion.div>

        {/* Main Cinematic Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black mt-5 tracking-tight leading-[1.12] text-slate-900"
        >
          Discover, Apply & Launch Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
              Dream Career
            </span>
            {/* Subtle glow underline accent */}
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute -bottom-1 left-0 h-[4px] rounded-full bg-gradient-to-r from-[#6A38C2] via-[#9333EA] to-[#EC4899] opacity-80"
            />
          </span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Connect with vetted tech employers, explore verified high-growth opportunities,
          and accelerate your hiring journey with smart role matching.
        </motion.p>

        {/* Search Bar Container with Balanced SaaS Depth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-8 max-w-3xl mx-auto"
        >
          <div className="relative group p-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-blue-500/20 shadow-[0_16px_40px_-12px_rgba(106,56,194,0.18)] focus-within:shadow-[0_20px_50px_-10px_rgba(106,56,194,0.28)] transition-all duration-300">
            <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-[14px] border border-purple-100/90 overflow-hidden px-3.5 py-1.5 sm:py-2">
              <div className="pl-1 pr-3 text-[#6A38C2] shrink-0">
                <Search size={20} />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Job title, keywords, tech stack, or company name..."
                className="w-full h-11 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none font-medium"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => searchJobHandler(query)}
                className="hidden sm:inline-flex items-center gap-1.5 px-5 h-10 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer shrink-0"
              >
                <span>Find Jobs</span>
                <ArrowRight size={14} />
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Button */}
          <div className="sm:hidden mt-2.5">
            <Button
              onClick={() => searchJobHandler(query)}
              className="w-full h-11 rounded-xl bg-[#6A38C2] text-white font-semibold text-xs shadow-md"
            >
              <Search size={15} className="mr-2" />
              Search Opportunities
            </Button>
          </div>

          {/* Quick Trending Tags */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp size={12} className="text-[#6A38C2]" /> Popular:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => searchJobHandler(tag)}
                className="px-2.5 py-0.5 rounded-lg bg-purple-50/80 hover:bg-purple-100 text-purple-700 font-medium text-[11px] transition-colors cursor-pointer border border-purple-100"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Popular Hiring Partners Ribbon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-6 border-t border-purple-100/70"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Trusted by candidates hired at world-class innovators
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {POPULAR_COMPANIES.map((company) => (
              <motion.button
                key={company.name}
                whileHover={{ y: -2, scale: 1.03 }}
                type="button"
                onClick={() => searchJobHandler(company.name)}
                className="px-3.5 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-sm text-xs font-semibold text-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${company.color}`}
                />
                <span>{company.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Live Network Snapshot Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100/90 shadow-[0_8px_24px_-8px_rgba(106,56,194,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(106,56,194,0.16)] transition-all flex items-center gap-3.5"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-md ${stat.shadow} shrink-0`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
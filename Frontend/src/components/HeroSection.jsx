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
  ShieldCheck,
  Briefcase,
  Building2,
  MapPin,
  CheckCircle2,
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

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (searchTarget) => {
    const targetQuery = typeof searchTarget === "string" ? searchTarget : query;
    if (targetQuery.trim()) {
      dispatch(setSearchedQuery(targetQuery.trim()));
      navigate("/browse");
    } else {
      navigate("/browse");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchJobHandler(query);
    }
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Background Cinematic Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-purple-500/20 via-fuchsia-500/15 to-transparent blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-blue-500/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-pink-500/15 blur-[120px]"
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10 text-center">
        {/* Top Floating Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-purple-500/10 border border-purple-200/80 backdrop-blur-xl shadow-xs"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-[#6A38C2] via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
            Next-Gen AI Career Discovery Engine
          </span>
          <Sparkles size={14} className="text-amber-500" />
        </motion.div>

        {/* Main Cinematic Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mt-6 tracking-tight leading-[1.12] text-gray-900"
        >
          Discover, Apply & Launch Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#6A38C2] via-[#9333EA] to-[#EC4899] bg-clip-text text-transparent">
              Dream Career
            </span>
            {/* Subtle glow underline accent */}
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-1 left-0 h-[5px] rounded-full bg-gradient-to-r from-[#6A38C2] via-[#9333EA] to-[#EC4899] opacity-80"
            />
          </span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Connect with top tier companies, explore verified high-growth opportunities,
          and accelerate your journey with smart role matching.
        </motion.p>

        {/* Search Bar Container with Glowing Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <div className="relative group p-1 rounded-3xl bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-blue-500/20 shadow-[0_20px_50px_-15px_rgba(106,56,194,0.22)] focus-within:shadow-[0_25px_60px_-10px_rgba(106,56,194,0.32)] transition-all duration-300">
            <div className="relative flex items-center bg-white rounded-[22px] border border-purple-100 overflow-hidden px-4 py-2 sm:py-2.5">
              <div className="pl-2 pr-3 text-purple-600">
                <Search size={22} />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Job title, keywords, tech stack, or company name..."
                className="w-full h-12 text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none font-medium"
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => searchJobHandler(query)}
                className="hidden sm:inline-flex items-center gap-2 px-6 h-12 rounded-2xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
              >
                <span>Find Jobs</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Button */}
          <div className="sm:hidden mt-3">
            <Button
              onClick={() => searchJobHandler(query)}
              className="w-full h-12 rounded-2xl bg-[#6A38C2] text-white font-semibold shadow-md"
            >
              <Search size={16} className="mr-2" />
              Search Opportunities
            </Button>
          </div>

          {/* Quick Trending Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <TrendingUp size={13} className="text-[#6A38C2]" /> Popular:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => searchJobHandler(tag)}
                className="px-2.5 py-1 rounded-lg bg-purple-50/70 hover:bg-purple-100 text-purple-700 font-medium transition-colors cursor-pointer border border-purple-100/60"
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
          transition={{ delay: 0.55 }}
          className="mt-14 pt-8 border-t border-purple-100/70"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Trusted by candidates hired at world-class innovators
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {POPULAR_COMPANIES.map((company) => (
              <motion.button
                key={company.name}
                whileHover={{ y: -3, scale: 1.05 }}
                type="button"
                onClick={() => searchJobHandler(company.name)}
                className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md text-xs sm:text-sm font-semibold text-gray-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${company.color}`}
                />
                <span>{company.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Live Network Snapshot Cards (Interactive 3D-feel floating badges) */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <motion.div
            whileHover={{ y: -6 }}
            className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100 shadow-[0_10px_30px_-10px_rgba(106,56,194,0.08)] flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">5,000+</div>
              <div className="text-xs font-medium text-gray-500">
                Verified Job Openings
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100 shadow-[0_10px_30px_-10px_rgba(106,56,194,0.08)] flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Building2 size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">1,200+</div>
              <div className="text-xs font-medium text-gray-500">
                Top Hiring Companies
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100 shadow-[0_10px_30px_-10px_rgba(106,56,194,0.08)] flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Zap size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">1-Click</div>
              <div className="text-xs font-medium text-gray-500">
                Direct Recruiter Application
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
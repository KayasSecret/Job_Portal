import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  ArrowUpRight,
  GraduationCap,
  Briefcase,
} from "lucide-react";

/**
 * HireNestAuthBrandPanel
 * Left-side hero / ambient branding panel for the premium split-screen authentication experience.
 * Features animated ambient glow, interactive showcase badges, live stats, and branding highlights.
 */
const HireNestAuthBrandPanel = ({ mode = "login" }) => {
  const isLogin = mode === "login";

  return (
    <div className="relative hidden lg:flex flex-col justify-between w-full lg:w-[48%] xl:w-[46%] p-10 xl:p-14 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white select-none">
      {/* Ambient Lighting & Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#8B5CF6]/25 blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EC4899]/20 blur-3xl animate-pulse"
        style={{ animationDuration: "10s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#6A38C2]/30 blur-2xl"
      />

      {/* Decorative Grid Pattern Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Top Header / Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-purple-200 shadow-sm">
          <Sparkles size={14} className="text-amber-300 animate-spin" style={{ animationDuration: "12s" }} />
          <span>{isLogin ? "Welcome Back to HireNest" : "Join the Elite Network"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-purple-200/80 font-medium">
          <ShieldCheck size={15} className="text-emerald-400" />
          <span>Verified Opportunities</span>
        </div>
      </div>

      {/* Center Hero Content */}
      <div className="relative z-10 my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            {isLogin ? (
              <>
                Unlock your career with{" "}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  opportunities that match your ambition.
                </span>
              </>
            ) : (
              <>
                Launch your future with{" "}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  top companies & fast-growing teams.
                </span>
              </>
            )}
          </h2>

          <p className="mt-4 text-sm xl:text-base text-purple-100/80 leading-relaxed max-w-md">
            {isLogin
              ? "Access curated tech positions, direct recruiter connections, and application tracking designed for fast-track careers."
              : "Create your student or recruiter account in seconds. Post high-impact roles or apply with 1-click verified resumes."}
          </p>
        </motion.div>

        {/* Dynamic Feature Cards */}
        <div className="mt-8 space-y-3.5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6A38C2] flex items-center justify-center text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
              <GraduationCap size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                For Students & Seekers
                <ArrowUpRight size={14} className="text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-purple-200/70 truncate">
                Smart skill matching, direct resume uploads & real-time status alerts.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-pink-900/40 group-hover:scale-105 transition-transform">
              <Briefcase size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                For Recruiters & Hiring Managers
                <ArrowUpRight size={14} className="text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-purple-200/70 truncate">
                Post roles under verified companies, review applicants & manage events.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
          <div>
            <div className="text-xl xl:text-2xl font-black text-white">5,000+</div>
            <div className="text-[11px] font-medium text-purple-200/70 uppercase tracking-wider mt-0.5">
              Active Jobs
            </div>
          </div>
          <div>
            <div className="text-xl xl:text-2xl font-black text-white">1,200+</div>
            <div className="text-[11px] font-medium text-purple-200/70 uppercase tracking-wider mt-0.5">
              Companies
            </div>
          </div>
          <div>
            <div className="text-xl xl:text-2xl font-black text-white">98%</div>
            <div className="text-[11px] font-medium text-purple-200/70 uppercase tracking-wider mt-0.5">
              Placement Rate
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Quote / Trust Indicator */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2E1065] bg-purple-300" />
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2E1065] bg-pink-300" />
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2E1065] bg-amber-300" />
          </div>
          <span>Trusted by 25,000+ top talents & recruiters</span>
        </div>
        <span className="font-semibold text-purple-100">HireNest 2.0</span>
      </div>
    </div>
  );
};

export default HireNestAuthBrandPanel;

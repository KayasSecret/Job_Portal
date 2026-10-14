import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  Target,
  FileCheck,
  Building,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "AI-Powered Smart Matching",
    description:
      "Our neural matching algorithm pairs your verified skills and resume with high-relevance openings with 95% accuracy.",
    icon: Bot,
    color: "from-purple-500 to-indigo-600",
  },
  {
    title: "Verified Direct Recruiters",
    description:
      "Skip third-party filters. Every company account and recruiter profile is vetted before posting job opportunities.",
    icon: ShieldCheck,
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "1-Click Accelerated Apply",
    description:
      "Apply in seconds with cloud-stored resumes and dynamic skill tags without repetitive form-filling.",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "Real-Time Application Tracking",
    description:
      "Monitor your review, shortlisted, or accepted status live as hiring managers evaluate your credentials.",
    icon: Target,
    color: "from-emerald-500 to-teal-600",
  },
];

const FuturisticCareerShowcase = () => {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white via-purple-50/40 to-white">
      {/* Background Neon Glow Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-200/30 blur-[140px]"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-[#6A38C2] text-xs font-semibold mb-4">
            <Sparkles size={14} className="text-amber-500" />
            <span>The HireNest Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Engineered for{" "}
            <span className="bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#EC4899] bg-clip-text text-transparent">
              High-Impact Career Growth
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Everything you need to showcase your talent, connect directly with decision-makers,
            and secure the compensation you deserve.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;

            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative p-7 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100/90 shadow-[0_10px_30px_-10px_rgba(106,56,194,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(106,56,194,0.22)] transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Card Glow */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-purple-100/40 blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-lg shadow-purple-900/15 group-hover:scale-110 transition-transform duration-300 mb-6`}
                  >
                    <Icon size={26} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#6A38C2] transition-colors leading-snug">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mt-2.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-50 flex items-center text-xs font-semibold text-[#6A38C2] group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <ArrowRight size={13} className="ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Talent & Recruiter Split CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Lighting Orbs inside Banner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200">
                ⚡ Ready to Transform Your Hiring or Career?
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">
                Join HireNest today and step into the future of recruitment.
              </h3>
              <p className="text-xs sm:text-sm text-purple-100/80 mt-2 max-w-lg">
                Whether you are seeking your next high-impact role or building an elite engineering team, HireNest delivers verified results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <Link to="/signup" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-[#4C1D95] font-bold text-xs sm:text-sm shadow-xl hover:bg-purple-50 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign Up as Candidate</span>
                  <ArrowRight size={15} />
                </button>
              </Link>

              <Link to="/browse" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Browse Jobs</span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FuturisticCareerShowcase;

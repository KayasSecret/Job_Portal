import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  Target,
  ArrowRight,
} from "lucide-react";

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
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Background Neon Glow Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-200/25 blur-[140px]"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-[#6A38C2] text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-amber-500" />
            <span>The HireNest Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Engineered for{" "}
            <span className="bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#EC4899] bg-clip-text text-transparent">
              High-Impact Career Growth
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
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
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative p-6 sm:p-7 rounded-2xl bg-white/85 backdrop-blur-xl border border-purple-100/90 shadow-[0_8px_24px_-6px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_40px_-8px_rgba(106,56,194,0.20)] hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Card Glow */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-purple-100/40 blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md shadow-purple-900/15 group-hover:scale-110 transition-transform duration-300 mb-5`}
                  >
                    <Icon size={22} />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#6A38C2] transition-colors leading-snug">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-purple-50 flex items-center text-xs font-semibold text-[#6A38C2] group-hover:translate-x-1 transition-transform">
                  <span>Explore capability</span>
                  <ArrowRight size={13} className="ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FuturisticCareerShowcase;

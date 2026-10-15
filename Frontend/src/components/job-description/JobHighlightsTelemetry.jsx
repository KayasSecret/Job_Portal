import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  IndianRupee,
  Users,
  Layers,
} from "lucide-react";

/**
 * JobHighlightsTelemetry
 * 4 Light-themed futuristic HUD metric cards displaying openings, work arrangement,
 * compensation, and candidate applicant pool with HireNest's signature purple palette.
 */
const JobHighlightsTelemetry = ({ singleJob }) => {
  const cards = [
    {
      id: "openings",
      label: "Position Openings",
      sublabel: "Active Direct Roles",
      value: `${singleJob?.position || 1} Open Roles`,
      icon: Layers,
      color: "from-[#6A38C2] to-violet-500",
      iconBg: "bg-purple-50 text-[#6A38C2] border-purple-200/80",
      badge: "LIVE HIRING",
      badgeColor: "text-[#6A38C2] bg-purple-100/80 border-purple-200",
      accentGlow: "rgba(106, 56, 194, 0.12)",
    },
    {
      id: "engagement",
      label: "Work Arrangement",
      sublabel: "Engagement Model",
      value: singleJob?.jobType || "Full-Time",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
      badge: "PRIMARY",
      badgeColor: "text-blue-700 bg-blue-100/80 border-blue-200",
      accentGlow: "rgba(37, 99, 235, 0.12)",
    },
    {
      id: "compensation",
      label: "Annual Compensation",
      sublabel: "Fixed + Performance CTC",
      value: `₹ ${singleJob?.salary || 0} LPA`,
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
      badge: "VERIFIED CTC",
      badgeColor: "text-emerald-700 bg-emerald-100/80 border-emerald-200",
      accentGlow: "rgba(16, 185, 129, 0.12)",
    },
    {
      id: "applicants",
      label: "Candidate Pool",
      sublabel: "Submitted Applications",
      value: `${singleJob?.applications?.length || 0} Candidates`,
      icon: Users,
      color: "from-pink-500 to-rose-500",
      iconBg: "bg-pink-50 text-pink-600 border-pink-200/80",
      badge: "ACTIVE STAGE",
      badgeColor: "text-pink-700 bg-pink-100/80 border-pink-200",
      accentGlow: "rgba(236, 72, 153, 0.12)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
            whileHover={{ y: -5, scale: 1.015 }}
            className="group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white/95 hover:bg-white border border-purple-100/90 backdrop-blur-xl overflow-hidden shadow-[0_6px_24px_rgba(106,56,194,0.06)] transition-all duration-300 hover:border-purple-300 hover:shadow-[0_16px_36px_rgba(106,56,194,0.12)]"
          >
            {/* Ambient Corner Soft Glow on Hover */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: card.accentGlow }}
            />

            {/* Top Accent Gradient Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${card.color} opacity-80 group-hover:opacity-100 transition-opacity`}
            />

            {/* Header: Icon & Category Tag */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform duration-300 ${card.iconBg}`}
              >
                <Icon size={19} />
              </div>

              <span
                className={`text-[9.5px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>

            {/* Metric Value */}
            <div className="mt-2">
              <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                {card.label}
              </div>
              <div className="text-2xl sm:text-[26px] font-black tracking-tight text-gray-900 mt-1 group-hover:text-[#6A38C2] transition-colors">
                {card.value}
              </div>
              <div className="text-[11.5px] font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                <span>{card.sublabel}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default JobHighlightsTelemetry;

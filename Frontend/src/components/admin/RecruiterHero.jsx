import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Shared Recruiter Dashboard Hero Banner Component
 * Standardized across Companies, Jobs, and Applicants pages.
 * Compacted to exactly 60% of original height (40% reduction) with proportional layout.
 */
const RecruiterHero = ({
  badgeText = "Recruiter Command Center",
  badgeIcon: BadgeIcon = Sparkles,
  title,
  description,
  action,
  stats = [],
  gradient = "from-[#1E0E3E] via-[#2E1065] to-[#4C1D95]",
  shadow = "shadow-xl",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative rounded-2xl sm:rounded-3xl py-3.5 px-4 sm:py-4 sm:px-7 lg:px-8 mb-5 overflow-hidden bg-gradient-to-br ${gradient} text-white ${shadow}`}
    >
      {/* Ambient Lighting Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#8B5CF6]/25 blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#EC4899]/20 blur-3xl animate-pulse"
        style={{ animationDuration: "10s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
      />

      {/* Top Row: Heading, Badge, Description & Action */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5">
        <div className="max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10.5px] font-semibold text-purple-200 mb-1 shadow-2xs">
            {BadgeIcon && <BadgeIcon size={11} className="text-amber-300 shrink-0" />}
            <span className="truncate">{badgeText}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight truncate">
            {title}
          </h1>

          <p className="mt-0.5 text-[11.5px] sm:text-xs text-purple-100/80 leading-normal max-w-xl line-clamp-1 sm:line-clamp-none">
            {description}
          </p>
        </div>

        {/* Action Slot (Button or Dropdown) */}
        {action && (
          <div className="shrink-0 w-full sm:w-auto self-end sm:self-center">
            {action}
          </div>
        )}
      </div>

      {/* Stats Row separated by subtle divider */}
      {stats && stats.length > 0 && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label || idx}
                className="flex items-center gap-2 sm:gap-2.5 py-1.5 px-2.5 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-colors"
              >
                <div
                  className={`text-base sm:text-lg font-black leading-none shrink-0 ${
                    stat.valueColor || "text-white"
                  }`}
                >
                  {stat.value}
                </div>
                <div className="min-w-0 flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold text-purple-200/75 uppercase tracking-wider truncate">
                  {Icon && (
                    <Icon
                      size={11}
                      className={`shrink-0 ${stat.iconColor || "text-purple-300"}`}
                    />
                  )}
                  <span className="truncate">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RecruiterHero;

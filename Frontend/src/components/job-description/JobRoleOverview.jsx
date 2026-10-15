import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Zap,
  Send,
  UserCheck,
  Award,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

/**
 * JobRoleOverview
 * Light-themed main content panel featuring:
 * - Rich role specification & overview with high-contrast dark typography on clean white surface
 * - Key competencies & skills requirement pills in soft lavender tags
 * - Interactive 4-step recruitment journey roadmap
 */
const JobRoleOverview = ({ singleJob }) => {
  const [copied, setCopied] = useState(false);

  const requirements = singleJob?.requirements;
  // Normalize requirements from array or string
  const requirementsList = React.useMemo(() => {
    if (!requirements) return [];
    if (Array.isArray(requirements)) {
      return requirements.filter((r) => Boolean(r && r.trim()));
    }
    if (typeof requirements === "string") {
      return requirements
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [requirements]);

  const handleCopyDescription = () => {
    if (!singleJob?.description) return;
    navigator.clipboard.writeText(singleJob.description);
    setCopied(true);
    toast.success("Job description copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const recruitmentSteps = [
    {
      step: "01",
      title: "Direct Profile Submission",
      desc: "Apply with 1-click using your verified profile and validated PDF resume.",
      icon: Send,
      color: "from-purple-100 to-indigo-50",
      accent: "#6A38C2",
    },
    {
      step: "02",
      title: "Recruiter Qualification Review",
      desc: "Hiring managers evaluate qualifications, technical background, and experience.",
      icon: UserCheck,
      color: "from-cyan-100 to-blue-50",
      accent: "#0284C7",
    },
    {
      step: "03",
      title: "Technical Discussion & Deep Dive",
      desc: "Direct interview with the engineering team to review problem-solving and domain skills.",
      icon: Terminal,
      color: "from-pink-100 to-rose-50",
      accent: "#DB2777",
    },
    {
      step: "04",
      title: "Official Offer & Onboarding",
      desc: "Receive comprehensive CTC compensation package and seamless joining schedule.",
      icon: Award,
      color: "from-emerald-100 to-teal-50",
      accent: "#059669",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Main Role Overview & Specification Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-white/95 border border-purple-100/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(106,56,194,0.06)] overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-200/20 blur-3xl pointer-events-none"
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-purple-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-100 to-pink-50 border border-purple-200/80 flex items-center justify-center text-[#6A38C2] shadow-2xs">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Role Overview & Scope
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Comprehensive mandate and expectations for this opening
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyDescription}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-[#6A38C2] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Copy text"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-[#6A38C2]" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formatted Role Description */}
        <div className="prose max-w-none">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed sm:leading-loose whitespace-pre-line font-normal">
            {singleJob?.description ||
              "No detailed role description provided for this opening. Please contact the hiring recruiter for additional parameters."}
          </p>
        </div>

        {/* Key Competencies / Requirements Tags */}
        {requirementsList.length > 0 && (
          <div className="mt-8 pt-6 border-t border-purple-100">
            <div className="flex items-center gap-2 mb-3.5">
              <Zap size={16} className="text-[#6A38C2]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                Key Skills & Competencies Required
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {requirementsList.map((skill, i) => (
                <div
                  key={`${skill}-${i}`}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs sm:text-sm font-semibold text-gray-800 hover:border-[#6A38C2] hover:bg-purple-100/70 hover:text-[#6A38C2] transition-all shadow-2xs"
                >
                  <CheckCircle2 size={13} className="text-[#6A38C2] shrink-0" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 2. Interactive Recruitment Journey Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="relative rounded-3xl p-6 sm:p-8 bg-white/95 border border-purple-100/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(106,56,194,0.06)] overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-100 to-purple-100 border border-purple-200/80 flex items-center justify-center text-[#6A38C2]">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Recruitment Process & Roadmap
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Transparent 4-stage evaluation designed for speed and clarity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recruitmentSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative rounded-2xl p-4 sm:p-5 bg-purple-50/40 hover:bg-purple-50/90 border border-purple-100 hover:border-purple-200/90 transition-all duration-300 flex items-start gap-4 shadow-2xs"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${item.accent}12`, color: item.accent }}
                >
                  <Icon size={19} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#6A38C2]">
                      STAGE {item.step}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#6A38C2] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default JobRoleOverview;

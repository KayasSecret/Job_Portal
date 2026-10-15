import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  IndianRupee,
  Layers,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * JobSidebarTelemetry
 * Light-themed intelligence sidebar featuring:
 * 1. Verified Company Intelligence profile
 * 2. Structured Role Telemetry & metadata table
 * 3. Candidate Readiness verification checklist
 */
const JobSidebarTelemetry = ({ singleJob, user }) => {
  const company = singleJob?.company;
  const companyLogo = company?.logo;
  const companyName = company?.name || "Verified Enterprise";
  const experienceYears = singleJob?.experienceLevel ?? singleJob?.experience ?? 0;
  const postedDate = singleJob?.createdAt
    ? new Date(singleJob.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Posted";

  const hasResume = Boolean(
    user?.profile?.resume &&
    typeof user.profile.resume === "string" &&
    user.profile.resume.trim() !== ""
  );

  return (
    <div className="space-y-6">
      {/* 1. Verified Employer Profile Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl p-6 bg-white/95 border border-purple-100/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(106,56,194,0.06)] overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#6A38C2]" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-700">
              Employer Intelligence
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
            <ShieldCheck size={11} className="text-emerald-600" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Company Header */}
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200/80 p-2 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-contain filter drop-shadow-2xs"
              />
            ) : (
              <Building2 size={26} className="text-[#6A38C2]" />
            )}
            {/* Active pip */}
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-gray-900 tracking-tight truncate">
              {companyName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
              <MapPin size={12} className="text-[#6A38C2] shrink-0" />
              <span className="truncate">{singleJob?.location || company?.location || "India (Remote/Hybrid)"}</span>
            </div>
            {company?.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-[#6A38C2] hover:text-[#5B21B6] transition-colors"
              >
                <Globe size={11} />
                <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>

        {/* Company Description */}
        {company?.description && (
          <p className="mt-4 pt-3 border-t border-purple-100 text-xs text-gray-600 leading-relaxed line-clamp-3">
            {company.description}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Trust Rating</span>
          <span className="font-bold text-amber-600 flex items-center gap-1">
            <Sparkles size={11} /> 100% Direct Recruiter
          </span>
        </div>
      </motion.div>

      {/* 2. Structured Role Telemetry Breakdown */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="relative rounded-3xl p-6 bg-white/95 border border-purple-100/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(106,56,194,0.06)]"
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#6A38C2]" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-700">
              Role Parameters
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            ID: #{singleJob?._id?.slice(-6)?.toUpperCase() || "JOB-001"}
          </span>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-1 border-b border-purple-50">
            <span className="text-gray-600 flex items-center gap-2">
              <Briefcase size={13} className="text-[#6A38C2]" />
              Role Title
            </span>
            <span className="font-semibold text-gray-900 truncate max-w-[170px] text-right">
              {singleJob?.title}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-purple-50">
            <span className="text-gray-600 flex items-center gap-2">
              <MapPin size={13} className="text-[#6A38C2]" />
              Location
            </span>
            <span className="font-semibold text-gray-900">
              {singleJob?.location || "India"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-purple-50">
            <span className="text-gray-600 flex items-center gap-2">
              <Clock size={13} className="text-[#6A38C2]" />
              Experience Level
            </span>
            <span className="font-semibold text-gray-900">
              {experienceYears === 0 ? "Fresher / 0+ Yrs" : `${experienceYears}+ Years`}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-purple-50">
            <span className="text-gray-600 flex items-center gap-2">
              <IndianRupee size={13} className="text-emerald-600" />
              Target Salary
            </span>
            <span className="font-black text-emerald-600">
              ₹ {singleJob?.salary || 0} LPA
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-purple-50">
            <span className="text-gray-600 flex items-center gap-2">
              <Calendar size={13} className="text-[#6A38C2]" />
              Date Posted
            </span>
            <span className="font-semibold text-gray-900">
              {postedDate}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 flex items-center gap-2">
              <Sparkles size={13} className="text-amber-500" />
              Application Mode
            </span>
            <span className="font-bold text-[#6A38C2]">
              Direct 1-Click Profile
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. Candidate Readiness Checklist */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
        className="relative rounded-3xl p-6 bg-gradient-to-br from-purple-50/90 via-white to-pink-50/50 border border-purple-200/80 shadow-[0_10px_35px_rgba(106,56,194,0.06)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-[#6A38C2]" />
          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-gray-800">
            Candidate Application Readiness
          </h4>
        </div>

        <div className="space-y-2.5 text-xs text-gray-600">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Direct employer transmission without third-party delay</span>
          </div>

          <div className="flex items-start gap-2.5">
            {hasResume ? (
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <span>
              {hasResume ? (
                <span className="text-emerald-700 font-semibold">
                  Valid resume verified on file
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  Resume upload required to apply
                </span>
              )}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Average candidate review time: <strong>&lt; 24-48 hrs</strong></span>
          </div>
        </div>

        {!hasResume && (
          <Link
            to="/profile"
            className="mt-4 block w-full py-2.5 px-3 text-center rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
          >
            Update Profile & Resume →
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default JobSidebarTelemetry;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  FileText,
  Target,
  Layers,
  CheckSquare,
  RefreshCw,
  ArrowUp,
  Mail,
  Phone,
  Link2,
  Globe,
  MapPin,
  Lightbulb,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const getScoreTheme = (score) => {
  if (score >= 80) {
    return {
      stroke: "#10B981",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }
  if (score >= 55) {
    return {
      stroke: "#F59E0B",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }
  return {
    stroke: "#F43F5E",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  };
};

const ScoreRing = ({ score, label, subtitle, size = 136 }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const offset = circumference - (clamped / 100) * circumference;
  const theme = getScoreTheme(clamped);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-[104px] h-[104px] sm:w-[136px] sm:h-[136px]">
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">
            {clamped}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-1.5 sm:mt-2.5 leading-snug">
        {label}
      </p>
      {subtitle && (
        <Badge
          className={`mt-1 text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border ${theme.badge}`}
        >
          {subtitle}
        </Badge>
      )}
    </div>
  );
};

const ATSReportDashboard = ({ report, onScrollToForm, onResetAll }) => {
  const [activeKeywordTab, setActiveKeywordTab] = useState(
    report?.has_job_description ? "matched" : "detected"
  );
  const [expandedIssueIds, setExpandedIssueIds] = useState({});

  if (!report) return null;

  const toggleIssueExpand = (id) => {
    setExpandedIssueIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const {
    overall_score,
    score_label,
    score_summary,
    job_match_score,
    job_match_label,
    has_job_description,
    category_scores,
    contact_checks,
    detected_sections = [],
    missing_sections = [],
    keyword_analysis,
    issues = [],
    recommendations = [],
    checklist = [],
    resume_stats,
  } = report;

  const categoryList = category_scores
    ? [
        { key: "contact_info", ...category_scores.contact_info },
        { key: "section_completeness", ...category_scores.section_completeness },
        { key: "keyword_optimization", ...category_scores.keyword_optimization },
        { key: "experience_impact", ...category_scores.experience_impact },
        {
          key: "formatting_readability",
          ...category_scores.formatting_readability,
        },
        { key: "content_quality", ...category_scores.content_quality },
      ]
    : [];

  const contactItems = [
    { label: "Email Address", ok: contact_checks?.email, icon: Mail },
    { label: "Phone Number", ok: contact_checks?.phone, icon: Phone },
    { label: "LinkedIn URL", ok: contact_checks?.linkedin, icon: Link2 },
    {
      label: "GitHub / Portfolio",
      ok: contact_checks?.github_or_portfolio,
      icon: Globe,
    },
    { label: "Location", ok: contact_checks?.location, icon: MapPin },
  ];

  const matchedKw = keyword_analysis?.matched_keywords || [];
  const partialKw = keyword_analysis?.partial_keywords || [];
  const missingKw = keyword_analysis?.missing_keywords || [];
  const detectedSkills = keyword_analysis?.detected_resume_skills || [];

  const severityStyles = {
    critical: {
      badge: "bg-rose-100 text-rose-700 border-rose-200",
      border: "border-rose-200/90 bg-rose-50/40",
      icon: XCircle,
      iconColor: "text-rose-600",
      label: "Critical",
    },
    important: {
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      border: "border-amber-200/90 bg-amber-50/40",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      label: "Important",
    },
    optional: {
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      border: "border-blue-200/80 bg-blue-50/30",
      icon: Info,
      iconColor: "text-blue-600",
      label: "Optional",
    },
  };

  const priorityStyles = {
    high: "bg-purple-100 text-[#6A38C2] border-purple-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-4 sm:space-y-8"
    >
      {/* ================= 1. DUAL SCORE OVERVIEW CARD ================= */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-[0_14px_40px_-15px_rgba(106,56,194,0.14)] p-3.5 sm:p-8 space-y-3.5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-purple-50 pb-3 sm:pb-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6A38C2] uppercase tracking-wider">
              <Sparkles size={12} className="shrink-0" />
              <span>ATS Evaluation Report</span>
            </div>
            <h2 className="text-base sm:text-2xl font-black text-gray-900 mt-0.5 leading-snug">
              Resume Readiness & Keyword Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onScrollToForm}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl border-purple-200 text-[#6A38C2] hover:bg-purple-50 text-[11px] sm:text-xs font-bold cursor-pointer justify-center"
            >
              <ArrowUp size={13} className="mr-1 sm:mr-1.5 shrink-0" />
              <span>Edit Input / JD</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetAll}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] sm:text-xs font-bold cursor-pointer justify-center"
            >
              <RefreshCw size={13} className="mr-1 sm:mr-1.5 shrink-0" />
              <span>New Scan</span>
            </Button>
          </div>
        </div>

        {/* Score Gauges + Executive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-center">
          <div
            className={`lg:col-span-5 flex ${
              has_job_description && job_match_score !== null
                ? "flex-row justify-around"
                : "flex-col sm:flex-row justify-around"
            } items-center gap-3 sm:gap-6 p-3 sm:p-4 rounded-2xl bg-purple-50/40 border border-purple-100/80`}
          >
            <ScoreRing
              score={overall_score}
              label="ATS Readiness Score"
              subtitle={score_label}
            />

            {has_job_description && job_match_score !== null ? (
              <ScoreRing
                score={job_match_score}
                label="Job Match Score"
                subtitle={job_match_label}
              />
            ) : (
              <>
                {/* Mobile-only compact horizontal No-JD card */}
                <div className="sm:hidden w-full rounded-xl bg-white border border-dashed border-purple-200 p-2.5 flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6A38C2] flex items-center justify-center shrink-0">
                    <Target size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold text-gray-800 leading-tight">
                      No Job Description Added
                    </p>
                    <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
                      Add a target JD above to unlock your{" "}
                      <strong className="text-gray-700">Job Match Score</strong>.
                    </p>
                  </div>
                </div>

                {/* Desktop original vertical No-JD card (preserved) */}
                <div className="hidden sm:block max-w-[200px] rounded-2xl bg-white border border-dashed border-purple-200 p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6A38C2] mx-auto flex items-center justify-center">
                    <Target size={18} />
                  </div>
                  <p className="text-xs font-extrabold text-gray-800">
                    No Job Description Provided
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Paste a target job description above and re-run to unlock your{" "}
                    <strong className="text-gray-700">Job Match Score</strong>.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F8F6FF] to-white border border-purple-100 p-3 sm:p-5 space-y-1 sm:space-y-2">
              <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#6A38C2]">
                Executive Assessment
              </p>
              <p className="text-xs sm:text-sm text-gray-700 leading-snug sm:leading-relaxed font-medium">
                {score_summary}
              </p>
            </div>

            {/* Resume Telemetry Pills (Clean 2-Column Mobile Grid, 4-Column Desktop Grid) */}
            {resume_stats && (
              <div className="space-y-2 sm:space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  <div className="rounded-xl bg-gray-50 border border-gray-200/70 p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                      Document & Layer
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate mt-0.5">
                      {resume_stats.file_type} • {resume_stats.file_size_kb} KB
                    </p>
                    {resume_stats.document_classification && (
                      <p className="text-[10px] font-semibold text-[#6A38C2] truncate mt-0.5 capitalize">
                        {resume_stats.document_classification.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200/70 p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                      Word Count
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5">
                      {resume_stats.word_count} words
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 sm:hidden">
                      {resume_stats.page_or_section_count} page(s)
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200/70 p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                      Quantified Items
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5">
                      {resume_stats.quantified_bullet_count} detected{" "}
                      <span className="hidden sm:inline text-[11px] font-semibold text-gray-500">
                        ({resume_stats.bullet_count} bullets)
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 sm:hidden">
                      Across {resume_stats.bullet_count} bullets
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200/70 p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                      Action Verbs
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5">
                      {resume_stats.action_verb_count} detected
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 sm:hidden">
                      Active voice
                    </p>
                  </div>
                </div>

                {Array.isArray(resume_stats.extraction_warnings) &&
                  resume_stats.extraction_warnings.length > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 sm:p-3 space-y-1">
                      {resume_stats.extraction_warnings.map((warn, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-[11px] sm:text-xs text-amber-900 font-medium leading-snug sm:leading-relaxed"
                        >
                          <AlertTriangle
                            size={14}
                            className="text-amber-600 shrink-0 mt-0.5"
                          />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 2. 6-CATEGORY WEIGHTED SCORE BREAKDOWN ================= */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-xs p-3.5 sm:p-8 space-y-3 sm:space-y-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center shrink-0">
              <Layers size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">
                Category Score Breakdown
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                <span className="sm:hidden">100-point ATS readiness breakdown</span>
                <span className="hidden sm:inline">
                  Transparent 100-point rubric evaluating structure, content, and keywords
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          {categoryList.map((cat) => {
            const theme = getScoreTheme(cat.percentage);
            return (
              <div
                key={cat.key}
                className="rounded-xl sm:rounded-2xl border border-purple-100/80 bg-gray-50/40 p-3 sm:p-4 space-y-1.5 sm:space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 min-w-0 truncate">
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className="text-[11px] sm:text-xs font-extrabold text-gray-800">
                      {cat.score} / {cat.max_score} pts
                    </span>
                    <Badge
                      className={`text-[10px] font-bold px-2 py-0 rounded-full border ${theme.badge}`}
                    >
                      {cat.percentage}%
                    </Badge>
                  </div>
                </div>

                <div className="w-full h-1.5 sm:h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: theme.stroke,
                    }}
                  />
                </div>

                <p className="text-[11px] sm:text-xs text-gray-600 leading-snug sm:leading-relaxed">
                  {cat.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 3. CONTACT & SECTION STRUCTURE AUDIT ================= */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-xs p-3.5 sm:p-8 space-y-3.5 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center shrink-0">
            <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">
              Contact Channels & Section Detection
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              <span className="sm:hidden">Detected contact details and headings</span>
              <span className="hidden sm:inline">
                What an automated ATS parser extracts from your document headings
              </span>
            </p>
          </div>
        </div>

        {/* Contact Channels: 2-column grid on mobile (5th item spans cleanly), 5-column on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          {contactItems.map((item, idx) => {
            const Icon = item.icon;
            const isLastOdd = idx === contactItems.length - 1;
            return (
              <div
                key={item.label}
                className={`${
                  isLastOdd ? "col-span-2 sm:col-span-1" : ""
                } rounded-xl border p-2.5 sm:p-3 flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0 ${
                  item.ok
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50/40 border-rose-200 text-rose-700"
                }`}
              >
                <Icon
                  size={15}
                  className="shrink-0 mt-0.5 sm:mt-0"
                />
                <div className="min-w-0 flex-1 flex flex-col items-start">
                  <p className="text-[11px] font-bold leading-snug break-words w-full">
                    {item.label}
                  </p>
                  <span
                    className={`mt-1 sm:mt-0.5 inline-flex items-center text-[10px] font-bold sm:font-semibold px-1.5 py-0.5 sm:p-0 rounded-md sm:rounded-none sm:bg-transparent sm:opacity-80 ${
                      item.ok
                        ? "bg-emerald-100/85 text-emerald-800"
                        : "bg-rose-100/85 text-rose-700"
                    }`}
                  >
                    {item.ok ? "Detected" : "Missing"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detected vs Missing Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          <div className="rounded-xl sm:rounded-2xl bg-emerald-50/40 border border-emerald-200/80 p-3 sm:p-4 space-y-2 sm:space-y-2.5">
            <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Detected Standard Sections ({detected_sections.length})</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detected_sections.length > 0 ? (
                detected_sections.map((sec) => (
                  <Badge
                    key={sec}
                    className="bg-white text-emerald-800 border border-emerald-200 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg"
                  >
                    ✓ {sec}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-500">
                  No standard section headings detected.
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-amber-50/40 border border-amber-200/80 p-3 sm:p-4 space-y-2 sm:space-y-2.5">
            <p className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Missing Core Sections ({missing_sections.length})</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missing_sections.length > 0 ? (
                missing_sections.map((sec) => (
                  <Badge
                    key={sec}
                    className="bg-white text-amber-800 border border-amber-200 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg"
                  >
                    ! {sec}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-emerald-700 font-semibold">
                  All 5 core ATS sections are present!
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. KEYWORD & SKILL INTELLIGENCE ================= */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-xs p-3.5 sm:p-8 space-y-3 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center shrink-0">
              <Target size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">
                Keyword & Skill Analysis
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                {has_job_description ? (
                  <>
                    <span className="sm:hidden">
                      Target job keyword alignment & detected skills
                    </span>
                    <span className="hidden sm:inline">
                      Exact, partial/ecosystem, and missing keywords compared against your target Job Description
                    </span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">
                      Technical & domain skills extracted from your resume
                    </span>
                    <span className="hidden sm:inline">
                      Canonical technical and professional skills extracted from your resume via NLP
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Filter Tabs: 2x2 grid on mobile, inline flex wrap on desktop */}
          {has_job_description && (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 sm:gap-1.5 bg-purple-50/70 p-1 rounded-xl border border-purple-100">
              {[
                {
                  id: "matched",
                  label: `Matched (${matchedKw.length})`,
                },
                {
                  id: "partial",
                  label: `Partial (${partialKw.length})`,
                },
                {
                  id: "missing",
                  label: `Missing (${missingKw.length})`,
                },
                {
                  id: "detected",
                  label: `All Skills (${detectedSkills.length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveKeywordTab(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
                    activeKeywordTab === tab.id
                      ? "bg-[#6A38C2] text-white shadow-2xs"
                      : "text-gray-600 hover:text-[#6A38C2]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyword Chips Display */}
        <div className="rounded-xl sm:rounded-2xl bg-gray-50/70 border border-gray-200/70 p-3 sm:p-5">
          {has_job_description && activeKeywordTab === "matched" && (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-bold text-emerald-800">
                  Exact Keyword Matches Found
                </p>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold px-2 py-0 rounded-full">
                  {matchedKw.length} skills
                </Badge>
              </div>
              {matchedKw.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {matchedKw.map((kw) => (
                    <Badge
                      key={kw}
                      className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] sm:text-xs font-semibold sm:font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl max-w-full break-words"
                    >
                      ✓ {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No exact target keywords matched yet. Check the Missing tab to see which terms to add.
                </p>
              )}
            </div>
          )}

          {has_job_description && activeKeywordTab === "partial" && (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-bold text-amber-800">
                  Partial / Related Ecosystem Matches
                </p>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-2 py-0 rounded-full">
                  {partialKw.length} skills
                </Badge>
              </div>
              {partialKw.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {partialKw.map((kw) => (
                    <Badge
                      key={kw}
                      className="bg-amber-100 text-amber-800 border-amber-200 text-[11px] sm:text-xs font-semibold sm:font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl max-w-full break-words"
                    >
                      ≈ {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No partial or fuzzy keyword matches detected for this job description.
                </p>
              )}
            </div>
          )}

          {has_job_description && activeKeywordTab === "missing" && (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-bold text-rose-700">
                  Missing Job Description Keywords
                </p>
                <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold px-2 py-0 rounded-full">
                  {missingKw.length} skills
                </Badge>
              </div>
              {missingKw.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {missingKw.map((kw) => (
                    <Badge
                      key={kw}
                      className="bg-rose-100 text-rose-700 border-rose-200 text-[11px] sm:text-xs font-semibold sm:font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl max-w-full break-words"
                    >
                      + {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold">
                  Zero missing target keywords — your resume covers all detected skills in this job description!
                </p>
              )}
            </div>
          )}

          {(!has_job_description || activeKeywordTab === "detected") && (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-bold text-[#6A38C2]">
                  Canonical Skills Extracted from Your Resume
                </p>
                <Badge className="bg-purple-100 text-[#6A38C2] border-purple-200 text-[10px] font-bold px-2 py-0 rounded-full shrink-0">
                  {detectedSkills.length} skills
                </Badge>
              </div>
              {detectedSkills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {detectedSkills.map((kw) => (
                    <Badge
                      key={kw}
                      className="bg-white sm:bg-purple-100 text-[#6A38C2] border border-purple-200 text-[11px] sm:text-xs font-semibold sm:font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-2xs sm:shadow-none max-w-full break-words"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Very few standard technical skills were detected. Add a dedicated Technical Skills section listing your core languages, frameworks, and tools.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= 5. DETECTED ISSUES & ACTIONABLE RECOMMENDATIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Detected Issues */}
        <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-xs p-3.5 sm:p-7 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">
                Detected ATS Issues ({issues.length})
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                <span className="sm:hidden">Gaps found during resume inspection</span>
                <span className="hidden sm:inline">
                  Specific gaps found during parsing and structural inspection
                </span>
              </p>
            </div>
          </div>

          {issues.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {issues.map((issue) => {
                const style =
                  severityStyles[issue.severity] || severityStyles.optional;
                const Icon = style.icon;
                const isExpanded = Boolean(expandedIssueIds[issue.id]);
                const hasLongExplanation = (issue.explanation || "").length > 110;

                return (
                  <div
                    key={issue.id}
                    className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 space-y-1.5 sm:space-y-2 ${style.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <Icon
                          size={15}
                          className={`shrink-0 mt-0.5 ${style.iconColor}`}
                        />
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                          {issue.title}
                        </span>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}
                      >
                        {style.label}
                      </Badge>
                    </div>

                    <div className="text-[11px] sm:text-xs text-gray-600 leading-snug sm:leading-relaxed">
                      <p
                        className={
                          !isExpanded && hasLongExplanation
                            ? "line-clamp-2 sm:line-clamp-none"
                            : ""
                        }
                      >
                        {issue.explanation}
                      </p>
                      {hasLongExplanation && (
                        <button
                          type="button"
                          onClick={() => toggleIssueExpand(issue.id)}
                          className="sm:hidden mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-[#6A38C2] cursor-pointer"
                        >
                          <span>{isExpanded ? "Show less" : "Details"}</span>
                          {isExpanded ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs font-semibold text-gray-800 bg-white/85 rounded-lg sm:rounded-xl p-2 sm:p-2.5 border border-gray-200/60 leading-snug sm:leading-relaxed">
                      <span className="text-[#6A38C2] font-bold">Fix: </span>
                      {issue.suggestion}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-200 p-4 sm:p-5 text-center space-y-1">
              <CheckCircle2
                size={22}
                className="text-emerald-600 mx-auto"
              />
              <p className="text-xs sm:text-sm font-bold text-emerald-900">
                No Critical ATS Issues Detected
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-700">
                Your resume passed all core structural and contact parseability checks.
              </p>
            </div>
          )}
        </section>

        {/* Actionable Recommendations */}
        <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-xs p-3.5 sm:p-7 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Lightbulb size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">
                Actionable Recommendations ({recommendations.length})
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                <span className="sm:hidden">Prioritized fixes & rewrite templates</span>
                <span className="hidden sm:inline">
                  Prioritized improvements with concrete rewrite examples
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl sm:rounded-2xl border border-purple-100 bg-purple-50/25 p-3 sm:p-4 space-y-2 sm:space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                    {rec.title}
                  </span>
                  <Badge
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${
                      priorityStyles[rec.priority] || priorityStyles.medium
                    }`}
                  >
                    {rec.priority} priority
                  </Badge>
                </div>

                <p className="text-[11px] sm:text-xs text-gray-600 leading-snug sm:leading-relaxed">
                  {rec.action}
                </p>

                {rec.example && (
                  <div className="rounded-lg sm:rounded-xl bg-white border border-purple-100 p-2.5 sm:p-3 text-[11px] sm:text-xs text-gray-700 font-mono leading-snug sm:leading-relaxed whitespace-pre-wrap break-words overflow-x-hidden">
                    <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-[#6A38C2] mb-1">
                      Example Rewrite
                    </span>
                    {rec.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= 6. 7-POINT ATS READINESS CHECKLIST ================= */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-xs p-3.5 sm:p-8 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center shrink-0">
            <CheckSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">
              7-Point ATS Readiness Checklist
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              <span className="sm:hidden">Core automated screening checks</span>
              <span className="hidden sm:inline">
                Quick verification of fundamental automated screening criteria
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 ${
                item.passed
                  ? "bg-emerald-50/35 border-emerald-200/80"
                  : "bg-rose-50/35 border-rose-200/80"
              }`}
            >
              {item.passed ? (
                <CheckCircle2
                  size={16}
                  className="text-emerald-600 shrink-0 mt-0.5 sm:w-[17px] sm:h-[17px]"
                />
              ) : (
                <XCircle
                  size={16}
                  className="text-rose-500 shrink-0 mt-0.5 sm:w-[17px] sm:h-[17px]"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-gray-900 leading-snug">
                    {item.label}
                  </p>
                  <span
                    className={`sm:hidden text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      item.passed
                        ? "bg-emerald-100/80 text-emerald-800"
                        : "bg-rose-100/80 text-rose-700"
                    }`}
                  >
                    {item.passed ? "Pass" : "Needs Fix"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug sm:leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default ATSReportDashboard;

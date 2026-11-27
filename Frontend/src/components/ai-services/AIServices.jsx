import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Sparkles,
  FileText,
  FileCheck2,
  PenTool,
  MessageSquareCode,
  Compass,
  Target,
  ArrowRight,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Layers,
  Zap,
} from "lucide-react";

const AI_TOOLS = [
  {
    id: "ats-checker",
    title: "ATS Resume Score Checker",
    description:
      "Analyze your resume, identify missing job keywords, evaluate ATS compatibility, and receive personalized improvement suggestions.",
    icon: FileCheck2,
    status: "AVAILABLE",
    route: "/ai-services/ats-checker",
    ctaLabel: "Launch ATS Checker",
    highlights: [
      "Resume ATS Readiness (0–100)",
      "Target Job Keyword Match",
      "Actionable Section Fixes",
    ],
  },
  {
    id: "resume-builder",
    title: "AI Resume Builder",
    description:
      "Generate clean, ATS-friendly technical resumes with structured bullet points and role-aligned skill summaries.",
    icon: FileText,
    status: "COMING SOON",
    highlights: [
      "ATS-Safe Templates",
      "Impact Bullet Structuring",
      "One-Click PDF Export",
    ],
  },
  {
    id: "cover-letter",
    title: "AI Cover Letter Generator",
    description:
      "Draft tailored cover letters that connect your verified projects and experience directly to a company's job requisition.",
    icon: PenTool,
    status: "COMING SOON",
    highlights: [
      "Role-Specific Framing",
      "Company Tone Alignment",
      "Editable Drafts",
    ],
  },
  {
    id: "interview-prep",
    title: "AI Interview Preparation",
    description:
      "Practice role-specific technical and behavioral questions curated from your target job description and skill stack.",
    icon: MessageSquareCode,
    status: "COMING SOON",
    highlights: [
      "Technical Q&A Drills",
      "STAR Method Prompts",
      "Skill Gap Focus",
    ],
  },
  {
    id: "career-assistant",
    title: "AI Career Assistant",
    description:
      "Plan your next career milestone with personalized learning roadmaps, skill-gap analysis, and role transition guidance.",
    icon: Compass,
    status: "COMING SOON",
    highlights: [
      "Career Path Mapping",
      "Portfolio Recommendations",
      "Readiness Benchmarks",
    ],
  },
  {
    id: "job-match-analyzer",
    title: "Smart Job Match Analyzer",
    description:
      "Compare your candidate profile against live HireNest openings to prioritize applications where your skills align best.",
    icon: Target,
    status: "COMING SOON",
    highlights: [
      "Multi-Role Comparison",
      "Requirement Alignment",
      "Priority Application Insights",
    ],
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Upload your resume",
    description:
      "Select your current resume in PDF or DOCX format (up to 5 MB). Your document is validated and processed securely.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Add your target job description",
    description:
      "Optionally paste the job description you are targeting to unlock role-specific keyword, skill, and qualification matching.",
    icon: Layers,
  },
  {
    step: "03",
    title: "Receive your personalized ATS analysis",
    description:
      "Review your transparent ATS Readiness Score, Job Match Score, missing keywords, and section-by-section recommendations.",
    icon: CheckCircle2,
  },
];

const AIServices = () => {
  const navigate = useNavigate();

  const scrollToTools = () => {
    const el = document.getElementById("ai-tools-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-[#6A38C2] selection:text-white">
      <Navbar />

      <main className="flex-1 py-6 sm:py-10 lg:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-10 sm:space-y-14">
          {/* ================= A. HERO SECTION ================= */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-xl"
          >
            {/* Subtle Ambient Lighting */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#8B5CF6]/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#EC4899]/20 blur-3xl"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Headline, Copy & CTA */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-purple-200">
                  <Sparkles size={13} className="text-amber-300 shrink-0" />
                  <span>HireNest AI Career Suite • Job Seeker Edition</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight">
                  Your Career,{" "}
                  <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                    Powered by AI
                  </span>
                </h1>

                <p className="text-xs sm:text-base text-purple-100/85 max-w-xl leading-relaxed">
                  Smart AI tools to optimize your resume, improve your job applications, and move closer to your dream career.
                </p>

                <div className="pt-1 flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-3">
                  <Button
                    type="button"
                    onClick={scrollToTools}
                    className="h-11 px-6 rounded-xl bg-white hover:bg-purple-50 text-[#4C1D95] font-bold text-xs sm:text-sm shadow-lg shadow-purple-950/30 cursor-pointer justify-center"
                  >
                    <span>Explore AI Tools</span>
                    <ArrowRight size={15} className="ml-2 text-[#6A38C2]" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/ai-services/ats-checker")}
                    className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white border-white/20 font-semibold text-xs sm:text-sm cursor-pointer justify-center"
                  >
                    <FileCheck2 size={15} className="mr-2 text-emerald-300" />
                    <span>Launch ATS Checker</span>
                  </Button>
                </div>
              </div>

              {/* Right Column: Clean Abstract ATS Preview Artwork */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 shadow-inner space-y-3.5">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] flex items-center justify-center text-white shadow-sm shrink-0">
                        <FileCheck2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          ATS Resume Intelligence
                        </div>
                        <div className="text-[11px] text-purple-200/75 truncate">
                          Deterministic Readiness & Keyword Engine
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-[10px] font-bold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>

                  {/* Preview Metric Bars */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="text-[10.5px] font-semibold text-purple-200/80 uppercase tracking-wider">
                        ATS Readiness
                      </div>
                      <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                        0–100 Scale
                      </div>
                      <div className="text-[11px] text-purple-200/70 mt-0.5">
                        6 weighted categories
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="text-[10.5px] font-semibold text-purple-200/80 uppercase tracking-wider">
                        Job Alignment
                      </div>
                      <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">
                        Skill & Alias
                      </div>
                      <div className="text-[11px] text-purple-200/70 mt-0.5">
                        Exact + fuzzy match
                      </div>
                    </div>
                  </div>

                  {/* Sample Tag Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10.5px] font-semibold">
                      ✓ Section Structure
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-400/20 border border-purple-300/30 text-purple-100 text-[10.5px] font-semibold">
                      ✓ Missing Keywords
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10.5px] font-semibold">
                      ✓ Actionable Fixes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ================= B. AI TOOLS SECTION ================= */}
          <section id="ai-tools-grid" className="scroll-mt-24 space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-bold mb-2">
                  <Zap size={13} />
                  <span>Career Optimization Suite</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  AI Career Tools for Job Seekers
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                  Start with our live ATS Resume Score Checker today. Additional career intelligence modules are being rolled out in upcoming phases.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {AI_TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                const isAvailable = tool.status === "AVAILABLE";

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all ${
                      isAvailable
                        ? "bg-white border-2 border-[#6A38C2]/80 shadow-[0_14px_35px_-12px_rgba(106,56,194,0.18)] hover:shadow-[0_20px_45px_-12px_rgba(106,56,194,0.26)] hover:-translate-y-1"
                        : "bg-white/85 border border-purple-100/90 shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Card Top Row: Icon + Status Badge */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            isAvailable
                              ? "bg-gradient-to-br from-[#6A38C2] to-[#7C3AED] text-white shadow-md shadow-purple-600/25"
                              : "bg-purple-50 text-[#6A38C2]/70 border border-purple-100"
                          }`}
                        >
                          <Icon size={20} />
                        </div>

                        {isAvailable ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                            AVAILABLE
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-500 border-gray-200 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full"
                          >
                            <Lock size={10} className="mr-1 text-gray-400" />
                            COMING SOON
                          </Badge>
                        )}
                      </div>

                      {/* Tool Title & Description */}
                      <h3
                        className={`text-base sm:text-lg font-extrabold tracking-tight ${
                          isAvailable ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {tool.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Feature Highlights */}
                      <ul className="mt-4 pt-3.5 border-t border-purple-50 space-y-1.5">
                        {tool.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-xs text-gray-600 font-medium"
                          >
                            <CheckCircle2
                              size={13}
                              className={
                                isAvailable
                                  ? "text-[#6A38C2] shrink-0"
                                  : "text-gray-300 shrink-0"
                              }
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Footer CTA */}
                    <div className="mt-6 pt-4 border-t border-purple-50">
                      {isAvailable ? (
                        <Button
                          type="button"
                          onClick={() => navigate(tool.route)}
                          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 cursor-pointer justify-center"
                        >
                          <span>{tool.ctaLabel}</span>
                          <ArrowRight size={15} className="ml-2" />
                        </Button>
                      ) : (
                        <div
                          aria-disabled="true"
                          className="w-full h-11 rounded-xl bg-gray-100/80 border border-gray-200/80 text-gray-400 font-semibold text-xs flex items-center justify-center gap-1.5 select-none"
                        >
                          <Lock size={13} />
                          <span>Coming in Future Release</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ================= C. HOW IT WORKS SECTION ================= */}
          <section className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-[0_10px_30px_-10px_rgba(106,56,194,0.06)] p-5 sm:p-8 lg:p-10">
            <div className="max-w-2xl mb-6 sm:mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A38C2]">
                Simple 3-Step Workflow
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
                How the ATS Resume Score Checker Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Evaluate your resume in under a minute with clear, explainable feedback before you submit your job application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {HOW_IT_WORKS_STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="rounded-2xl bg-purple-50/40 border border-purple-100 p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-purple-200/80 text-[#6A38C2] flex items-center justify-center shadow-2xs">
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-mono font-black text-[#6A38C2] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                          STEP {item.step}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================= D. TRUST & PRIVACY SECTION ================= */}
          <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-50/90 via-white to-purple-50/60 border border-purple-200/80 p-5 sm:p-7">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-3.5 max-w-3xl">
                <div className="w-10 h-10 rounded-xl bg-[#6A38C2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Privacy-First Processing & Transparent Guidance</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Uploaded resumes are validated and processed securely in memory to generate your report. Your score is an estimated evaluation based on resume readability, structure, and your supplied job description. Different employers and ATS platforms use varied screening criteria, so this tool provides practical improvement guidance rather than a guarantee of interview selection.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => navigate("/ai-services/ats-checker")}
                className="w-full md:w-auto h-10 px-5 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white font-bold text-xs shrink-0 cursor-pointer justify-center"
              >
                <span>Check My Resume</span>
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIServices;

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import ATSReportDashboard from "./ATSReportDashboard";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ATS_API_ENDPOINT } from "../../utils/constant";
import {
  LogIn,
  Lock,
  ArrowLeft,
  FileCheck2,
  Upload,
  FileText,
  X,
  RefreshCw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_JD_LENGTH = 10000;

const ATSScoreChecker = () => {
  const fileInputRef = useRef(null);
  const formSectionRef = useRef(null);
  const reportSectionRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Single access gate for every resume-selection / upload / analyze action.
  // Backend (Express isAuthenticated + authorizeRole("student")) remains the final security boundary.
  const ensureStudentAccess = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return false;
    }
    if (user.role !== "student") {
      toast.error("The ATS Resume Checker is available to Job Seekers only.");
      return false;
    }
    return true;
  };

  const openFilePicker = () => {
    if (!ensureStudentAccess()) return;
    fileInputRef.current?.click();
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate("/login", { state: { from: "/ai-services/ats-checker" } });
  };

  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisReport, setAnalysisReport] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 639px)");
    const handleChange = (e) => setIsMobileViewport(e.matches);
    setIsMobileViewport(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileExtension = (filename = "") => {
    const idx = filename.lastIndexOf(".");
    return idx !== -1 ? filename.slice(idx).toLowerCase() : "";
  };

  const validateAndSelectFile = (file) => {
    if (!ensureStudentAccess()) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileError("");
    setAnalysisError("");

    if (!file) return;

    const ext = getFileExtension(file.name);
    const isExtValid = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeValid =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      (ext === ".docx" && !file.type) ||
      (ext === ".pdf" && file.type === "application/pdf");

    if (!isExtValid || !isMimeValid) {
      const msg =
        "Unsupported file format. Please upload a PDF (.pdf) or Word (.docx) resume.";
      setFileError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size === 0) {
      const msg =
        "The selected file is empty. Please choose a valid resume document.";
      setFileError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const msg = `File size (${formatFileSize(
        file.size
      )}) exceeds the ${MAX_FILE_SIZE_MB} MB limit. Please upload a smaller file.`;
      setFileError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setResumeFile(file);
    toast.success(`"${file.name}" attached and ready for ATS analysis.`);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      validateAndSelectFile(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setFileError("");
    setAnalysisError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetAll = () => {
    setResumeFile(null);
    setFileError("");
    setAnalysisError("");
    setJobDescription("");
    setAnalysisReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyzeSubmit = async (e) => {
    e.preventDefault();
    if (!ensureStudentAccess()) return;
    setFileError("");
    setAnalysisError("");

    if (!resumeFile) {
      setFileError("Please select a valid PDF or DOCX resume before analyzing.");
      return;
    }

    const trimmedJd = jobDescription.trim();
    if (trimmedJd.length > MAX_JD_LENGTH) {
      setAnalysisError(
        `Job description cannot exceed ${MAX_JD_LENGTH.toLocaleString()} characters.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", resumeFile);
    if (trimmedJd) {
      formData.append("jobDescription", trimmedJd);
    }

    try {
      setIsAnalyzing(true);
      const response = await axios.post(
        `${ATS_API_ENDPOINT}/analyze`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data?.success && response.data?.data) {
        setAnalysisReport(response.data.data);
        toast.success("ATS Resume Analysis complete!");
        setTimeout(() => {
          reportSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 120);
      } else {
        const fallbackMsg =
          response.data?.message || "Unable to complete resume analysis.";
        setAnalysisError(fallbackMsg);
        toast.error(fallbackMsg);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      const serverMsg =
        error.response?.data?.message ||
        "Unable to analyze your resume right now. Please verify the file is a readable text-based PDF or DOCX and try again.";
      setAnalysisError(serverMsg);
      toast.error(serverMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileExtensionBadge = resumeFile
    ? getFileExtension(resumeFile.name).replace(".", "").toUpperCase()
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-[#6A38C2] selection:text-white">
      <Navbar />

      <main className="flex-1 py-4 sm:py-10 overflow-x-hidden">
        <div className="container mx-auto max-w-5xl px-3.5 sm:px-6 space-y-4 sm:space-y-8">
          {/* Top Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              to="/ai-services"
              className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl bg-white/95 hover:bg-white border border-purple-200/90 text-xs font-semibold text-gray-700 hover:text-[#6A38C2] shadow-2xs transition-all"
            >
              <ArrowLeft size={14} className="text-[#6A38C2] shrink-0" />
              <span>Back to AI Services</span>
            </Link>

            <Badge className="bg-purple-100 text-[#6A38C2] border-purple-200 text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
              <Sparkles size={11} className="mr-1 text-amber-500 shrink-0" />
              ATS Intelligence v1.0
            </Badge>
          </div>

          {/* ================= A. ATS CHECKER INTRODUCTION ================= */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-xl relative overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#8B5CF6]/25 blur-3xl"
            />

            <div className="relative z-10 space-y-2.5 sm:space-y-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-200 shrink-0">
                  <FileCheck2 size={22} className="sm:hidden" />
                  <FileCheck2 size={24} className="hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-3xl font-black tracking-tight leading-snug">
                    ATS Resume Score Checker
                  </h1>
                  {/* Mobile-only concise subtitle */}
                  <p className="sm:hidden text-xs text-purple-100/90 mt-0.5 leading-relaxed">
                    Analyze your resume, check ATS readiness, and discover how well it matches your target job.
                  </p>
                  {/* Desktop full subtitle (preserved) */}
                  <p className="hidden sm:block text-sm text-purple-100/85 mt-1 max-w-2xl leading-relaxed">
                    Discover how well your resume aligns with automated screening systems and your target job description.
                  </p>
                </div>
              </div>

              {/* "What is an ATS?" Plain-Language Explanation */}
              <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2.5 sm:p-4 flex items-start gap-2.5 sm:gap-3">
                <HelpCircle
                  size={15}
                  className="text-amber-300 shrink-0 mt-0.5 sm:w-[17px] sm:h-[17px]"
                />
                <div className="text-[11px] sm:text-xs leading-relaxed text-purple-100/90">
                  <span className="font-bold text-white">What is an ATS? </span>
                  {/* Mobile-only concise explanation */}
                  <span className="sm:hidden">
                    ATS software scans resumes to identify relevant skills, experience, and keywords during recruitment.
                  </span>
                  {/* Desktop full explanation (preserved) */}
                  <span className="hidden sm:inline">
                    Applicant Tracking Systems (ATS) are software tools that help employers organize, search, and review job applications. They scan resumes for clear section headings, readable text, relevant skills, and role keywords so recruiters can quickly identify qualified candidates.
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ================= B & C. UPLOAD & JOB DESCRIPTION FORM ================= */}
          <form
            ref={formSectionRef}
            onSubmit={handleAnalyzeSubmit}
            className="rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-[0_12px_35px_-12px_rgba(106,56,194,0.1)] p-3.5 sm:p-8 space-y-5 sm:space-y-8"
          >
            {/* 1. Resume Upload Interface */}
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <Label className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  <Upload size={15} className="text-[#6A38C2] shrink-0" />
                  <span>1. Upload Your Resume</span>
                  <span className="text-rose-500">*</span>
                </Label>
                <span className="sm:hidden text-[11px] text-gray-500 font-medium">
                  PDF or DOCX · Maximum {MAX_FILE_SIZE_MB} MB
                </span>
                <span className="hidden sm:inline text-xs text-gray-400 font-medium">
                  Supported formats: PDF, DOCX • Max {MAX_FILE_SIZE_MB} MB
                </span>
              </div>

              <input
                ref={fileInputRef}
                id="ats-resume-upload"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {!resumeFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={openFilePicker}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openFilePicker();
                    }
                  }}
                  className={`rounded-2xl border-2 border-dashed p-4 sm:p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-[#6A38C2] bg-purple-100/50 scale-[1.005]"
                      : fileError
                      ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
                      : "border-purple-200 bg-purple-50/30 hover:bg-purple-50/70 hover:border-[#6A38C2]"
                  }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 text-[#6A38C2] mx-auto flex items-center justify-center mb-2 sm:mb-3 shadow-2xs">
                    <Upload size={19} className="sm:hidden" />
                    <Upload size={22} className="hidden sm:block" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    <span className="sm:hidden">Choose your resume</span>
                    <span className="hidden sm:inline">
                      Drag & drop your resume here, or click to browse
                    </span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    <span className="sm:hidden">
                      PDF or DOCX · Up to {MAX_FILE_SIZE_MB} MB
                    </span>
                    <span className="hidden sm:inline">
                      Text-based PDF (.pdf) or Microsoft Word (.docx) up to{" "}
                      {MAX_FILE_SIZE_MB} MB
                    </span>
                  </p>
                  <div className="mt-3 sm:mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                      className="h-9 px-4 rounded-xl border-purple-200 bg-white text-[#6A38C2] hover:bg-purple-50 text-xs font-bold cursor-pointer"
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-purple-50/60 border border-purple-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3.5">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-purple-200 text-[#6A38C2] flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[165px] xs:max-w-[215px] sm:max-w-md">
                          {resumeFile.name}
                        </p>
                        <Badge className="bg-purple-100 text-[#6A38C2] border-purple-200 text-[10px] font-bold px-2 py-0 shrink-0">
                          {fileExtensionBadge}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-gray-500 mt-0.5 flex-wrap">
                        <span>{formatFileSize(resumeFile.size)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 size={12} className="shrink-0" />
                          Ready to analyze
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isAnalyzing}
                      onClick={openFilePicker}
                      className="flex-1 sm:flex-initial h-9 px-3 rounded-xl border-purple-200 bg-white text-[#6A38C2] hover:bg-purple-50 text-xs font-semibold cursor-pointer justify-center"
                    >
                      <RefreshCw size={13} className="mr-1.5 shrink-0" />
                      <span>Replace</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isAnalyzing}
                      onClick={handleRemoveFile}
                      className="flex-1 sm:flex-initial h-9 px-3 rounded-xl border border-rose-100 sm:border-0 bg-rose-50/50 sm:bg-transparent text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer justify-center"
                    >
                      <X size={14} className="mr-1 shrink-0" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 sm:px-3.5 py-2.5 flex items-start gap-2 text-xs font-semibold text-rose-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span className="break-words">{fileError}</span>
                </div>
              )}
            </div>

            {/* 2. Optional Job Description Input */}
            <div className="space-y-2 sm:space-y-2.5 pt-2 border-t border-purple-50">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <Label
                  htmlFor="ats-job-description"
                  className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1.5"
                >
                  <FileText size={15} className="text-[#6A38C2] shrink-0" />
                  <span className="sm:hidden">2. Job Description</span>
                  <span className="hidden sm:inline">2. Paste Job Description</span>
                  <Badge className="sm:hidden bg-purple-50 text-[#6A38C2] border-purple-200 text-[10px] font-bold px-2 py-0 rounded-md">
                    Optional
                  </Badge>
                  <span className="hidden sm:inline text-xs font-semibold text-gray-400">
                    (Optional)
                  </span>
                </Label>

                <div className="flex items-center justify-end gap-2.5 sm:gap-3">
                  <span className="text-[11px] font-semibold text-gray-400">
                    {jobDescription.length.toLocaleString()} /{" "}
                    {MAX_JD_LENGTH.toLocaleString()}
                    <span className="hidden sm:inline"> characters</span>
                  </span>
                  {jobDescription.length > 0 && (
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => setJobDescription("")}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile-only concise supporting text */}
              <p className="sm:hidden text-[11px] text-gray-500 leading-relaxed">
                Add the target job description to get a personalized job match report.
              </p>

              {/* Desktop full supporting text (preserved) */}
              <p className="hidden sm:block text-xs text-gray-500 leading-relaxed">
                Leave blank to generate a standalone{" "}
                <strong className="text-gray-700">
                  Resume ATS Readiness Report
                </strong>
                , or paste a target job description to unlock both{" "}
                <strong className="text-gray-700">ATS Readiness</strong> and{" "}
                <strong className="text-gray-700">Job Match & Keyword</strong>{" "}
                analysis.
              </p>

              <textarea
                id="ats-job-description"
                rows={isMobileViewport ? 4 : 6}
                maxLength={MAX_JD_LENGTH}
                disabled={isAnalyzing}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={
                  isMobileViewport
                    ? "Paste the job description here..."
                    : "Paste the complete job description here, including responsibilities, required skills, qualifications, and experience..."
                }
                className="w-full rounded-xl sm:rounded-2xl border border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 p-3 sm:p-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 leading-relaxed outline-none transition-all resize-y disabled:opacity-60"
              />
            </div>

            {/* API / Analysis Error Banner */}
            {analysisError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2.5 text-xs font-semibold text-rose-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="leading-relaxed">{analysisError}</div>
              </div>
            )}

            {/* 3. Primary Analyze CTA & Disclaimer */}
            <div className="pt-2 border-t border-purple-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-start gap-2 text-[11px] text-gray-500 max-w-lg leading-relaxed">
                <ShieldCheck
                  size={15}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <span>
                  Your resume is processed in memory and evaluated deterministically. Scores are estimated guidance and do not guarantee interview selection.
                </span>
              </div>

              <Button
                type="submit"
                disabled={!resumeFile || isAnalyzing}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 disabled:opacity-50 cursor-pointer justify-center shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="mr-2 text-amber-300" />
                    <span>
                      {analysisReport ? "Re-Analyze My Resume" : "Analyze My Resume"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* ================= D. RESULTS DASHBOARD ================= */}
          <div ref={reportSectionRef}>
            {analysisReport && (
              <ATSReportDashboard
                report={analysisReport}
                onScrollToForm={handleScrollToForm}
                onResetAll={handleResetAll}
              />
            )}
          </div>
        </div>
      </main>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md rounded-2xl p-5">
          <DialogHeader className="items-center text-center sm:items-start sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#6A38C2] flex items-center justify-center mb-1">
              <Lock size={20} />
            </div>
            <DialogTitle className="text-base sm:text-lg font-extrabold text-gray-900">
              Login required
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Please log in to upload your resume and use the ATS Resume Checker.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLoginPrompt(false)}
              className="h-10 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLoginRedirect}
              className="h-10 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              <LogIn size={15} className="mr-1.5" />
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ATSScoreChecker;

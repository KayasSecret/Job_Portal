import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import ResumeRequiredModal from "./shared/ResumeRequiredModal";
import CareerHologramCore from "./job-description/CareerHologramCore";
import JobHighlightsTelemetry from "./job-description/JobHighlightsTelemetry";
import JobRoleOverview from "./job-description/JobRoleOverview";
import JobSidebarTelemetry from "./job-description/JobSidebarTelemetry";
import JobAtmosphericBackground from "./job-description/JobAtmosphericBackground";

import {
  Building2,
  Clock,
  IndianRupee,
  MapPin,
  Sparkles,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronLeft,
  Layers,
} from "lucide-react";

import { JOB_API_ENDPOINT, APPLICANT_API_ENDPOINT, USER_API_ENDPOINT } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";

/**
 * JobDescription Page
 * Ultra-premium, light-themed Career Command Center matching HireNest's signature
 * white and lavender visual identity, with 3D CGI visuals and smooth animations.
 */
const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [loading, setLoading] = useState(!singleJob || singleJob._id !== jobId);

  // Check initial saved status from user profile
  useEffect(() => {
    if (!user || !jobId) return;
    const isJobSaved =
      user?.savedJobs?.some((item) =>
        typeof item === "string" ? item === jobId : item?._id === jobId || item?.job === jobId
      ) ||
      user?.profile?.savedJobs?.includes(jobId) ||
      false;
    setSaved(Boolean(isJobSaved));
  }, [user, jobId]);

  // Execute the actual application request
  const executeApply = async () => {
    try {
      setApplying(true);
      const res = await axios.get(
        `${APPLICANT_API_ENDPOINT}/apply/${jobId}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setIsApplied(true);

        const updatedJob = {
          ...singleJob,
          applications: [
            ...(singleJob?.applications || []),
            {
              applicant: user?._id,
            },
          ],
        };

        dispatch(setSingleJob(updatedJob));
        toast.success(res.data.message || "Application successfully transmitted to hiring team!");
      }
    } catch (error) {
      console.error("Apply error:", error);
      if (error?.response?.data?.requireResume) {
        setResumeModalOpen(true);
      }
      toast.error(error?.response?.data?.message || "Failed to apply for job.");
    } finally {
      setApplying(false);
    }
  };

  const applyJobHandler = () => {
    // 1. Must be authenticated
    if (!user) {
      toast.error("Please log in to apply for this job.");
      navigate("/login");
      return;
    }

    // 2. Prevent recruiters from applying
    if (user.role === "recruiter") {
      toast.error("Recruiter accounts cannot apply for jobs.");
      return;
    }

    // 3. STRICT RESUME CHECK: Block immediately if no resume is present
    const hasResume = Boolean(
      user?.profile?.resume &&
      typeof user.profile.resume === "string" &&
      user.profile.resume.trim() !== ""
    );

    if (!hasResume) {
      setResumeModalOpen(true);
      return;
    }

    // 4. Resume present -> Proceed to apply
    executeApply();
  };

  // Toggle Save Job
  const saveJobHandler = async () => {
    if (!user) {
      toast.error("Please log in to save this job.");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        `${USER_API_ENDPOINT}/savejob/${jobId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setSaved(true);
        toast.success(res.data.message || "Job bookmarked in your saved roles!");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Job already saved.";
      if (msg.toLowerCase().includes("already saved")) {
        setSaved(true);
      }
      toast.info(msg);
    } finally {
      setSaving(false);
    }
  };

  // Share Role Link
  const shareRoleHandler = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    } else {
      toast.info(window.location.href);
    }
  };

  // Fetch single job by ID
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${JOB_API_ENDPOINT}/get/${jobId}`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));

          setIsApplied(
            res.data.job.applications?.some(
              (application) =>
                application.applicant === user?._id ||
                application === user?._id ||
                application?._id === user?._id
            )
          );
        }
      } catch (error) {
        console.error("Fetch job error:", error);
        toast.error("Unable to load role parameters.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  const company = singleJob?.company;
  const companyLogo = company?.logo;
  const companyName = company?.name || "Verified Enterprise";
  const experienceYears = singleJob?.experienceLevel ?? singleJob?.experience ?? 0;

  return (
    <>
      <Navbar />

      <div className="relative min-h-screen text-gray-900 pb-20 selection:bg-purple-500 selection:text-white">
        {/* Light-themed Ambient Atmosphere Layer */}
        <JobAtmosphericBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {/* Top Breadcrumb Navigation & Quick Action Controls */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-purple-200/90 text-xs font-semibold text-gray-700 hover:text-[#6A38C2] shadow-2xs transition-all hover:scale-105 active:scale-95 group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-[#6A38C2]" />
              <span>Back to Job Catalog</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shareRoleHandler}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white border border-purple-200/90 text-xs font-semibold text-gray-700 hover:text-[#6A38C2] shadow-2xs transition-all cursor-pointer"
                title="Share this role"
              >
                <Share2 size={13} className="text-[#6A38C2]" />
                <span className="hidden sm:inline">Share Role</span>
              </button>

              <button
                type="button"
                onClick={saveJobHandler}
                disabled={saving || saved}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  saved
                    ? "bg-purple-50 border-purple-300 text-[#6A38C2] cursor-default shadow-2xs"
                    : "bg-white/90 hover:bg-white border-purple-200/90 text-gray-700 hover:text-[#6A38C2] shadow-2xs"
                }`}
                title={saved ? "Role Bookmarked" : "Save this role"}
              >
                {saved ? (
                  <>
                    <BookmarkCheck size={13} className="text-[#6A38C2]" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={13} className="text-[#6A38C2]" />
                    <span className="hidden sm:inline">Save Job</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Skeleton State */}
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-80 rounded-3xl bg-white border border-purple-100 shadow-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-32 rounded-2xl bg-white border border-purple-100 shadow-sm" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ==============================================================
                  1. HERO SECTION: COMPACT PURPLE GRADIENT CAREER COMMAND CENTER
                  ============================================================== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl px-5 py-3.5 sm:px-7 sm:py-4 md:px-8 md:py-4.5 mb-6 sm:mb-8 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-2xl"
              >
                {/* Ambient Soft Glow Orbs */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -left-16 w-60 h-60 rounded-full bg-[#8B5CF6]/30 blur-3xl animate-pulse"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-[#EC4899]/25 blur-3xl"
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
                  {/* Left Column: Job Details & Primary Action */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    {/* Top Verified Opportunity Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10.5px] font-semibold text-purple-200 mb-1.5 self-start shadow-xs">
                      <Sparkles size={11} className="text-amber-300 animate-spin" style={{ animationDuration: "10s" }} />
                      <span className="tracking-wide">Direct Recruiter Verified Opening</span>
                      <ShieldCheck size={12} className="text-emerald-400" />
                    </div>

                    {/* Job Title with Gradient Accent */}
                    <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black tracking-tight text-white leading-tight">
                      <span className="bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
                        {singleJob?.title || "Technology Specialist"}
                      </span>
                    </h1>

                    {/* Company Identity & Location */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-purple-100/90 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 p-1 flex items-center justify-center shrink-0 backdrop-blur-md shadow-xs">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={companyName}
                              className="w-full h-full object-contain filter drop-shadow-xs"
                            />
                          ) : (
                            <Building2 size={14} className="text-purple-200" />
                          )}
                        </div>
                        <span className="font-bold text-white text-sm sm:text-base">
                          {companyName}
                        </span>
                      </div>

                      {singleJob?.location && (
                        <>
                          <span className="text-white/30">•</span>
                          <div className="flex items-center gap-1 text-[11.5px] sm:text-xs text-purple-200 font-medium">
                            <MapPin size={13} className="text-pink-400 shrink-0" />
                            <span>{singleJob.location}</span>
                          </div>
                        </>
                      )}

                      <span className="text-white/30">•</span>
                      <div className="flex items-center gap-1 text-[11.5px] sm:text-xs text-purple-200 font-medium">
                        <Clock size={13} className="text-cyan-400 shrink-0" />
                        <span>{experienceYears === 0 ? "Fresher Friendly" : `${experienceYears}+ Yrs Exp`}</span>
                      </div>
                    </div>

                    {/* Parameter Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-purple-200 text-[11px] font-bold shadow-xs flex items-center gap-1.5">
                        <Layers size={12} className="text-purple-300" />
                        <span>{singleJob?.position} Openings</span>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-blue-500/15 backdrop-blur-md border border-blue-400/25 text-blue-200 text-[11px] font-bold shadow-xs flex items-center gap-1.5">
                        <Clock size={12} className="text-blue-300" />
                        <span>{singleJob?.jobType || "Full-Time"}</span>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 backdrop-blur-md border border-emerald-400/25 text-emerald-200 text-[11px] font-bold shadow-xs flex items-center gap-1.5">
                        <IndianRupee size={12} className="text-emerald-300" />
                        <span>₹ {singleJob?.salary} LPA</span>
                      </div>
                    </div>

                    {/* Primary Apply Action Group */}
                    <div className="mt-3 pt-2.5 sm:pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <motion.div
                        whileHover={{ scale: isApplied ? 1 : 1.03 }}
                        whileTap={{ scale: isApplied ? 1 : 0.97 }}
                        className="w-full sm:w-auto"
                      >
                        <button
                          type="button"
                          onClick={!isApplied && !applying ? applyJobHandler : null}
                          disabled={isApplied || applying}
                          className={`w-full sm:w-auto px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isApplied
                              ? "bg-emerald-600 text-white shadow-emerald-500/20 cursor-default"
                              : "bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-600/30"
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 size={16} className="text-white" />
                              <span>Applied Successfully ✓</span>
                            </>
                          ) : applying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Submitting Application...</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Now</span>
                              <ArrowRight size={15} className="text-purple-200" />
                            </>
                          )}
                        </button>
                      </motion.div>

                      {/* Security & Resume Policy Indicator */}
                      <div className="flex items-center gap-1.5 text-[11px] text-purple-200/80">
                        <FileText size={13} className="text-purple-300 shrink-0" />
                        <span>
                          {isApplied ? (
                            <span className="text-emerald-300 font-semibold">Application active in candidate pipeline</span>
                          ) : (
                            <span>Verified PDF resume required to submit</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 3D Holographic Career Command Core */}
                  <div className="lg:col-span-5 flex items-center justify-center">
                    <CareerHologramCore
                      title={singleJob?.title}
                      company={companyName}
                      compact={true}
                    />
                  </div>
                </div>
              </motion.div>

              {/* ==============================================================
                  2. JOB HIGHLIGHTS TELEMETRY HUD METRICS (4 CARDS)
                  ============================================================== */}
              <JobHighlightsTelemetry singleJob={singleJob} />

              {/* ==============================================================
                  3. MASTER TWO-COLUMN ARCHITECTURE
                  Left: Role Overview, Key Skills & Recruitment Journey
                  Right: Company Intelligence, Metadata Table & Candidate Readiness
                  ============================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content Column (65% width) */}
                <div className="lg:col-span-8">
                  <JobRoleOverview singleJob={singleJob} />
                </div>

                {/* Sidebar Telemetry Column (35% width) */}
                <div className="lg:col-span-4">
                  <JobSidebarTelemetry singleJob={singleJob} user={user} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Strict Resume Required Verification Modal */}
        <ResumeRequiredModal
          open={resumeModalOpen}
          setOpen={setResumeModalOpen}
          jobTitle={singleJob?.title}
          companyName={companyName}
          onUploadAndApply={executeApply}
        />
      </div>
    </>
  );
};

export default JobDescription;
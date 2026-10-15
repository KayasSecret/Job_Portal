import React, { useState, useEffect } from "react";
import axios from "axios";
import { USER_API_ENDPOINT, APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  BookmarkCheck,
  BookmarkX,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Building2,
  Layers,
  IndianRupee,
  Sparkles,
  ShieldCheck,
  Trash2,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import ResumeRequiredModal from "../shared/ResumeRequiredModal";

/**
 * SavedJobCard
 * Ultra-premium glassmorphic saved job card with 3D hover elevation,
 * rich color-coded telemetry badges, remove micro-interaction,
 * and strict resume verification application flow.
 */
const SavedJobCard = ({
  job,
  onRemoveSuccess,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [removing, setRemoving] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Check if current user already applied to this job
  useEffect(() => {
    if (job?.applications && user?._id) {
      const alreadyApplied = job.applications.some(
        (app) => app?.applicant === user._id || app === user._id
      );
      setIsApplied(alreadyApplied);
    }
  }, [job?.applications, user?._id]);

  const daysAgoFunction = (mongodbTime) => {
    if (!mongodbTime) return "Recently";
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const diffDays = Math.floor(
      (currentTime - createdAt) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Posted Today";
    if (diffDays === 1) return "1 Day Ago";
    return `${diffDays} Days Ago`;
  };

  // Remove from saved jobs handler
  const removeSavedHandler = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to manage saved jobs.");
      navigate("/login");
      return;
    }

    try {
      setRemoving(true);

      // Attempt POST /unsavejob/:id with fallback to DELETE /savejob/:id
      let success = false;
      let message = "Job removed from saved collection.";

      try {
        const res = await axios.post(
          `${USER_API_ENDPOINT}/unsavejob/${job?._id}`,
          {},
          { withCredentials: true }
        );
        if (res.data.success) {
          success = true;
          message = res.data.message || message;
        }
      } catch {
        // Fallback to DELETE /savejob/:id
        const delRes = await axios.delete(
          `${USER_API_ENDPOINT}/savejob/${job?._id}`,
          { withCredentials: true }
        );
        if (delRes.data.success) {
          success = true;
          message = delRes.data.message || message;
        }
      }

      if (success) {
        toast.success(message);

        // Update Redux user savedJobs store so other pages stay synced
        if (user?.savedJobs) {
          const updatedSaved = user.savedJobs.filter(
            (item) => (typeof item === "string" ? item : item?._id) !== job?._id
          );
          dispatch(setUser({ ...user, savedJobs: updatedSaved }));
        }

        // Notify parent list to remove card with smooth animation
        if (onRemoveSuccess) {
          onRemoveSuccess(job?._id);
        }
      }
    } catch (error) {
      console.error("Remove saved job error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove job from saved list."
      );
    } finally {
      setRemoving(false);
    }
  };

  const executeApply = async () => {
    try {
      setApplying(true);
      const res = await axios.get(
        `${APPLICANT_API_ENDPOINT}/apply/${job?._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsApplied(true);
        toast.success(res.data.message || "Job applied successfully!");
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

  const applyJobHandler = (e) => {
    e.stopPropagation();

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

    // 3. STRICT RESUME CHECK: Block immediately if no resume is uploaded
    const hasResume = Boolean(
      user?.profile?.resume &&
      typeof user.profile.resume === "string" &&
      user.profile.resume.trim() !== ""
    );

    if (!hasResume) {
      setResumeModalOpen(true);
      return;
    }

    // 4. Resume verified -> proceed to apply
    executeApply();
  };

  const companyInitial = job?.company?.name?.charAt(0)?.toUpperCase() || "H";
  const experienceYears = job?.experienceLevel ?? job?.experience ?? 0;

  return (
    <>
      <motion.div
        layout
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={() => navigate(`/description/${job?._id}`)}
        className="group relative rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-[0_10px_30px_-8px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(106,56,194,0.22)] hover:border-purple-300 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer overflow-hidden"
      >
        {/* Dynamic Holographic Light Sweep Sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

        {/* Ambient Top Glow on Hover */}
        <div className="pointer-events-none absolute -top-14 -right-14 w-36 h-36 rounded-full bg-purple-200/50 blur-2xl group-hover:scale-150 transition-transform duration-500" />

        <div>
          {/* Top Header: Company Info + Timestamp + Remove Control */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              {job?.company?.logo ? (
                <Avatar className="h-12 w-12 rounded-2xl border border-purple-100 shadow-2xs shrink-0 bg-white">
                  <AvatarImage
                    src={job?.company?.logo}
                    alt={job?.company?.name}
                    className="object-contain p-1"
                  />
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-200 border border-purple-200/80 flex items-center justify-center font-black text-purple-700 text-base shadow-2xs shrink-0">
                  {companyInitial}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight truncate group-hover:text-[#6A38C2] transition-colors">
                    {job?.company?.name || "Verified Partner"}
                  </h4>
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1 font-medium truncate">
                    <MapPin size={12} className="text-[#6A38C2] shrink-0" />
                    {job?.location || "India"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium shrink-0">
                    <Clock size={11} className="text-pink-500 shrink-0" />
                    {daysAgoFunction(job?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Remove from Saved Button with Micro-Interaction */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={removeSavedHandler}
              disabled={removing}
              title="Remove from Saved Jobs"
              className="relative p-2 rounded-xl bg-purple-50 hover:bg-rose-50 text-[#6A38C2] hover:text-rose-600 border border-purple-100 hover:border-rose-200 shadow-2xs transition-all duration-200 cursor-pointer shrink-0"
            >
              {removing ? (
                <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </motion.button>
          </div>

          {/* Job Title & Verified Badge */}
          <div className="mt-4 relative z-10">
            <h3 className="font-black text-lg sm:text-xl text-gray-900 leading-snug group-hover:text-[#6A38C2] transition-colors">
              {job?.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
              {job?.description || "High-impact opportunity connecting talented professionals with top engineering teams."}
            </p>
          </div>

          {/* Rich Color-Coded Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 relative z-10">
            {/* Openings */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/80 text-[#6A38C2] text-xs font-bold shadow-2xs">
              <Layers size={11} className="text-[#6A38C2]" />
              <span>{job?.position || 1} Openings</span>
            </div>

            {/* Job Type */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
              <Briefcase size={11} className="text-blue-600" />
              <span>{job?.jobType || "Full-Time"}</span>
            </div>

            {/* Salary */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-2xs">
              <IndianRupee size={11} className="text-emerald-600" />
              <span>₹ {job?.salary} LPA</span>
            </div>

            {/* Experience */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold shadow-2xs">
              <span>{experienceYears === 0 ? "Fresher Friendly" : `${experienceYears}+ Yrs Exp`}</span>
            </div>
          </div>
        </div>

        {/* Card Footer Actions: Details & Apply */}
        <div className="mt-6 pt-4 border-t border-purple-100/80 flex items-center justify-between gap-3 relative z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/description/${job?._id}`);
            }}
            className="h-9 px-3 rounded-xl text-xs font-bold text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50/80 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>View Details</span>
            <ArrowUpRight size={14} className="text-[#6A38C2]" />
          </Button>

          <Button
            type="button"
            onClick={!isApplied && !applying ? applyJobHandler : (e) => e.stopPropagation()}
            disabled={isApplied || applying}
            className={`h-9 px-5 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
              isApplied
                ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-500/20 cursor-default"
                : "bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white shadow-purple-600/25 hover:shadow-purple-600/35"
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 size={14} className="text-white" />
                <span>Applied ✓</span>
              </>
            ) : applying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Apply Now</span>
                <ArrowRight size={13} className="text-purple-200" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Strict Resume Required Modal */}
      <ResumeRequiredModal
        open={resumeModalOpen}
        setOpen={setResumeModalOpen}
        jobTitle={job?.title}
        companyName={job?.company?.name}
        onUploadAndApply={executeApply}
      />
    </>
  );
};

export default SavedJobCard;

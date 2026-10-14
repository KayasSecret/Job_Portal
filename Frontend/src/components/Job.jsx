import React, { useState } from "react";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Bookmark,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  ArrowUpRight,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const Job = ({ job, isSaved = false, onSaveSuccess }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

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

  const saveJobHandler = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to save this job.");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        `${USER_API_ENDPOINT}/savejob/${job?._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setSaved(true);
        toast.success(res.data.message || "Job saved successfully!");
        if (onSaveSuccess) onSaveSuccess(job._id);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Job already saved.";
      if (msg.toLowerCase().includes("already saved")) {
        setSaved(true);
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const companyInitial = job?.company?.name?.charAt(0)?.toUpperCase() || "H";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => navigate(`/description/${job?._id}`)}
      className="group relative rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-[0_10px_30px_-8px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(106,56,194,0.22)] hover:border-purple-300 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top Ambient Glow on Card Hover */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full bg-purple-100/60 blur-2xl group-hover:scale-150 transition-transform duration-500" />

      <div>
        {/* Top Header: Company Avatar + Timing + Bookmark */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {job?.company?.logo ? (
              <Avatar className="h-13 w-13 rounded-2xl border-2 border-purple-100 shadow-xs shrink-0 bg-white">
                <AvatarImage src={job?.company?.logo} alt={job?.company?.name} className="object-cover" />
              </Avatar>
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-purple-900/15 shrink-0 group-hover:scale-105 transition-transform">
                {companyInitial}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                {job?.company?.name || "Verified Employer"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <MapPin size={13} className="text-purple-500 shrink-0" />
                <span className="truncate">{job?.location || "India"}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={saveJobHandler}
            disabled={saving}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              saved
                ? "bg-purple-100 text-[#6A38C2] shadow-xs"
                : "bg-gray-50 text-gray-400 hover:text-[#6A38C2] hover:bg-purple-50"
            }`}
            title={saved ? "Saved" : "Save this job"}
            aria-label="Save Job"
          >
            <Bookmark size={16} className={saved ? "fill-[#6A38C2]" : ""} />
          </motion.button>
        </div>

        {/* Job Title & Snippet */}
        <div className="mt-4 relative z-10">
          <h2 className="text-lg font-extrabold text-gray-900 group-hover:text-[#6A38C2] transition-colors line-clamp-1">
            {job?.title}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>

        {/* Feature Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 relative z-10">
          <Badge className="bg-purple-50 text-[#6A38C2] hover:bg-purple-100 border border-purple-200/80 font-semibold text-xs px-2.5 py-1 rounded-xl">
            {job?.position ? `${job.position} Openings` : "Actively Hiring"}
          </Badge>

          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 font-semibold text-xs px-2.5 py-1 rounded-xl">
            {job?.jobType || "Full-time"}
          </Badge>

          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 font-semibold text-xs px-2.5 py-1 rounded-xl">
            ₹ {job?.salary} LPA
          </Badge>
        </div>
      </div>

      {/* Card Footer: Metadata + Actions */}
      <div className="mt-6 pt-4 border-t border-purple-50/80 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Clock size={13} />
          <span>{daysAgoFunction(job?.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-3 text-xs font-semibold text-purple-700 hover:text-[#5B21B6] hover:bg-purple-50 rounded-xl"
          >
            <span>Details</span>
            <ArrowUpRight size={14} className="ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Job;
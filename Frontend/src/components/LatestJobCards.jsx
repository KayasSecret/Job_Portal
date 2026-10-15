import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
  Bookmark,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Clock,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  const isInitiallySaved = user?.profile?.savedJobs?.includes(job?._id) || false;
  const [saved, setSaved] = useState(isInitiallySaved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.profile?.savedJobs) {
      setSaved(user.profile.savedJobs.includes(job?._id));
    }
  }, [user, job?._id]);

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/description/${job?._id}`)}
      className="group relative rounded-2xl bg-white/85 backdrop-blur-xl border border-purple-100/90 shadow-[0_8px_24px_-6px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_40px_-8px_rgba(106,56,194,0.20)] hover:border-purple-300 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top Ambient Hover Glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full bg-purple-200/40 blur-2xl group-hover:scale-150 transition-transform duration-500" />

      <div>
        {/* Top Header: Company Avatar + Timing + Bookmark */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {job?.company?.logo ? (
              <Avatar className="h-12 w-12 rounded-xl border border-purple-100 shadow-xs shrink-0 bg-white">
                <AvatarImage
                  src={job.company.logo}
                  alt={job?.company?.name}
                  className="object-cover"
                />
              </Avatar>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-purple-900/15 shrink-0 group-hover:scale-105 transition-transform">
                {companyInitial}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                {job?.company?.name || "Verified Employer"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <MapPin size={12} className="text-purple-500 shrink-0" />
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
                : "bg-gray-50/80 text-gray-400 hover:text-[#6A38C2] hover:bg-purple-50 border border-gray-100"
            }`}
            title={saved ? "Saved" : "Save this job"}
            aria-label="Save Job"
          >
            <Bookmark size={16} className={saved ? "fill-[#6A38C2]" : ""} />
          </motion.button>
        </div>

        {/* Job Title & Snippet */}
        <div className="mt-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-[11px] font-semibold text-[#6A38C2] mb-2">
            <Sparkles size={11} className="text-amber-500" />
            <span>Featured Role</span>
          </div>

          <h2 className="text-lg font-extrabold text-gray-900 group-hover:text-[#6A38C2] transition-colors line-clamp-1">
            {job?.title}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>

        {/* Feature Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 relative z-10">
          <Badge className="bg-purple-50 text-[#6A38C2] hover:bg-purple-100 border border-purple-200/80 font-semibold text-xs px-2.5 py-1 rounded-xl shadow-none">
            {job?.position ? `${job.position} Openings` : "Actively Hiring"}
          </Badge>

          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 font-semibold text-xs px-2.5 py-1 rounded-xl shadow-none">
            {job?.jobType || "Full-time"}
          </Badge>

          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 font-semibold text-xs px-2.5 py-1 rounded-xl shadow-none">
            ₹ {job?.salary} LPA
          </Badge>
        </div>
      </div>

      {/* Card Footer: Metadata + CTA */}
      <div className="mt-5 pt-4 border-t border-purple-50 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Clock size={13} />
          <span>{daysAgoFunction(job?.createdAt)}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A38C2] group-hover:text-[#5B21B6] transition-colors">
          <span>View Job</span>
          <ArrowUpRight
            size={14}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LatestJobCards;
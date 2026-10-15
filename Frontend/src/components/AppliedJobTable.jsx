import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Search,
  Filter,
  IndianRupee,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage } from "./ui/avatar";

const AppliedJobTable = () => {
  const navigate = useNavigate();
  const { allAppliedJobs = [] } = useSelector((store) => store.job) || {};

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate real counts for each status
  const counts = useMemo(() => {
    return {
      all: allAppliedJobs.length,
      pending: allAppliedJobs.filter((item) => item.status === "pending").length,
      accepted: allAppliedJobs.filter((item) => item.status === "accepted").length,
      rejected: allAppliedJobs.filter((item) => item.status === "rejected").length,
    };
  }, [allAppliedJobs]);

  // Filtered jobs by active tab and search query
  const filteredJobs = useMemo(() => {
    return allAppliedJobs.filter((item) => {
      // Tab filter
      if (activeTab !== "all" && item.status !== activeTab) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item?.job?.title?.toLowerCase().includes(query);
        const compMatch = item?.job?.company?.name?.toLowerCase().includes(query);
        const locMatch = item?.job?.location?.toLowerCase().includes(query);
        return titleMatch || compMatch || locMatch;
      }

      return true;
    });
  }, [allAppliedJobs, activeTab, searchQuery]);

  const formatDate = (isoString) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString.split("T")[0];
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Shortlisted / Accepted</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
            <XCircle size={13} className="text-rose-600" />
            <span>Not Selected</span>
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <Clock size={13} className="text-amber-600" />
            <span>Under Review</span>
          </span>
        );
    }
  };

  if (allAppliedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4 rounded-3xl bg-purple-50/40 border border-dashed border-purple-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6A38C2] to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/15 mb-4">
          <BriefcaseBusiness size={28} />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
          No Job Applications Yet
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-md leading-relaxed">
          You haven't submitted applications yet. Explore verified company openings and apply with your profile to track your candidate status here.
        </p>
        <button
          type="button"
          onClick={() => navigate("/jobs")}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>Explore Job Openings</span>
          <ArrowUpRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search & Status Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-purple-50/80 border border-purple-100 overflow-x-auto">
          {[
            { id: "all", label: "All Applications", count: counts.all },
            { id: "pending", label: "In Review", count: counts.pending },
            { id: "accepted", label: "Accepted", count: counts.accepted },
            { id: "rejected", label: "Not Selected", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white text-[#6A38C2] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-purple-100 text-[#6A38C2]"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by role or company..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-purple-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-purple-50/20 border border-dashed border-purple-100">
          <p className="text-xs sm:text-sm text-gray-500">
            No applications match your selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((appliedJob, index) => {
            const companyName = appliedJob?.job?.company?.name || "Verified Employer";
            const companyLogo = appliedJob?.job?.company?.logo;
            const companyInitial = companyName.charAt(0).toUpperCase();

            return (
              <motion.div
                key={appliedJob._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group relative p-4 sm:p-5 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-300 shadow-2xs hover:shadow-[0_12px_28px_-8px_rgba(106,56,194,0.12)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Company Logo + Title + Metadata */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {companyLogo ? (
                    <Avatar className="h-12 w-12 rounded-xl border border-purple-100 shadow-xs shrink-0 bg-white">
                      <AvatarImage
                        src={companyLogo}
                        alt={companyName}
                        className="object-contain p-1"
                      />
                    </Avatar>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6A38C2] to-violet-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                      {companyInitial}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                        {appliedJob?.job?.title || "Software Engineering Role"}
                      </h4>
                      {appliedJob?.job?.jobType && (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {appliedJob?.job?.jobType}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">
                        {companyName}
                      </span>
                      {appliedJob?.job?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={11} className="text-purple-500" />
                          <span>{appliedJob?.job?.location}</span>
                        </div>
                      )}
                      {appliedJob?.job?.salary && (
                        <span className="font-medium text-emerald-600">
                          ₹ {appliedJob?.job?.salary} LPA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Date + Status Badge + Action */}
                <div className="flex items-center justify-between md:justify-end gap-3.5 pt-3 md:pt-0 border-t md:border-t-0 border-purple-50 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>{formatDate(appliedJob?.createdAt)}</span>
                  </div>

                  <div>{renderStatusBadge(appliedJob?.status)}</div>

                  {appliedJob?.job?._id && (
                    <Link to={`/description/${appliedJob.job._id}`}>
                      <button
                        type="button"
                        className="p-2 rounded-xl text-[#6A38C2] hover:bg-purple-50 hover:text-[#5B21B6] transition-all cursor-pointer"
                        title="View Job Details"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppliedJobTable;
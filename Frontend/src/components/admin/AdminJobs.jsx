import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import AdminJobsTable from "./AdminJobsTable";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import { setSearchJobByText, setAllAdminJobs } from "@/redux/jobSlice";
import {
  Search,
  Briefcase,
  Plus,
  Sparkles,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  X,
  ExternalLink,
  MoreVertical,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const AdminJobs = () => {
  useGetAllAdminJobs();
  useGetAllCompanies();

  const [searchInput, setSearchInput] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allAdminJobs = [] } = useSelector((store) => store.job);
  const { companies = [] } = useSelector((store) => store.company);

  // Sync search input to Redux store
  useEffect(() => {
    dispatch(setSearchJobByText(searchInput));
  }, [searchInput, dispatch]);

  // Aggregate dashboard metrics
  const totalJobsCount = allAdminJobs?.length || 0;
  const totalApplicantsCount = useMemo(() => {
    return (
      allAdminJobs?.reduce(
        (acc, job) => acc + (job?.applications?.length || 0),
        0
      ) || 0
    );
  }, [allAdminJobs]);

  const fullTimeCount = useMemo(() => {
    return (
      allAdminJobs?.filter((job) => job?.jobType === "Full-Time")?.length || 0
    );
  }, [allAdminJobs]);

  const uniqueCompaniesLinked = useMemo(() => {
    const companyIds = allAdminJobs
      .map((job) => job?.company?._id || job?.company)
      .filter(Boolean);
    return new Set(companyIds).size;
  }, [allAdminJobs]);

  // Filter jobs based on search text and job type filter
  const filteredJobs = useMemo(() => {
    return (allAdminJobs || []).filter((job) => {
      const query = searchInput.toLowerCase().trim();
      const matchesSearch =
        !query ||
        job?.title?.toLowerCase().includes(query) ||
        job?.company?.name?.toLowerCase().includes(query) ||
        job?.location?.toLowerCase().includes(query) ||
        (Array.isArray(job?.requirements) &&
          job.requirements.some((r) => r.toLowerCase().includes(query)));

      const matchesType =
        selectedJobType === "All" || job?.jobType === selectedJobType;

      return matchesSearch && matchesType;
    });
  }, [allAdminJobs, searchInput, selectedJobType]);

  const confirmDelete = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      setDeleting(true);
      const res = await axios.delete(
        `${JOB_API_ENDPOINT}/delete/${jobToDelete._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Job deleted successfully.");
        const updated = allAdminJobs.filter((j) => j._id !== jobToDelete._id);
        dispatch(setAllAdminJobs(updated));
      }
    } catch (error) {
      console.error("Delete job error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete job.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const jobTypeFilterOptions = ["All", "Full-Time", "Part-Time", "Internship", "Contract"];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 py-8 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ================= HERO DASHBOARD BANNER ================= */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#7C3AED] p-8 sm:p-12 text-white shadow-[0_25px_60px_-15px_rgba(106,56,194,0.4)] overflow-hidden mb-10"
          >
            {/* Ambient Lighting Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#A855F7]/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EC4899]/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#06B6D4]/15 blur-3xl"
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-purple-200 tracking-wide uppercase">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Recruiter Command Center &bull; Talent Requisitions</span>
                </div>

                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Manage Tech Requisitions
                </h1>
                <p className="mt-3 text-sm sm:text-base text-purple-100/80 leading-relaxed max-w-xl">
                  Publish high-impact roles, track incoming talent pipelines in real time, and scale your engineering teams.
                </p>
              </div>

              {/* Action Button: Post New Job */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0"
              >
                <Button
                  onClick={() => navigate("/admin/jobs/create")}
                  className="h-12 px-6 rounded-2xl bg-white hover:bg-purple-50 text-[#4C1D95] font-bold text-sm shadow-xl shadow-purple-950/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={18} className="text-[#6A38C2]" />
                  <span>Post New Requisition</span>
                </Button>
              </motion.div>
            </div>

            {/* Quick Live Stats Row inside Hero */}
            <div className="relative z-10 mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {totalJobsCount}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-purple-300" />
                  <span>Total Requisitions</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {totalApplicantsCount}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Users size={13} className="text-pink-300" />
                  <span>Total Applicants</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {fullTimeCount}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-300" />
                  <span>Full-Time Roles</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {companies?.length || uniqueCompaniesLinked}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Building2 size={13} className="text-cyan-300" />
                  <span>Managed Entities</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= CONTROLS: SEARCH, FILTERS & VIEW MODE ================= */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <Input
                type="text"
                placeholder="Search by role, company, location, or skills..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-9 h-12 rounded-2xl border-purple-100 bg-white shadow-xs focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-xs sm:text-sm font-medium transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filters & View Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Job Type Pills */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-purple-100 shadow-xs">
                {jobTypeFilterOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedJobType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedJobType === type
                        ? "bg-[#6A38C2] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900 hover:bg-purple-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-purple-100 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-purple-100 text-[#6A38C2] shadow-xs"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-purple-100 text-[#6A38C2] shadow-xs"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Table View"
                >
                  <TableIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ================= CONTENT: CARDS OR TABLE VIEW ================= */}
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-purple-100 shadow-[0_20px_50px_-15px_rgba(106,56,194,0.1)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6A38C2] flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Briefcase size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No Job Requisitions Found
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                {searchInput || selectedJobType !== "All"
                  ? "No positions match your current search filters. Try adjusting keywords or selecting another job type."
                  : "You haven't posted any job openings yet. Create a requisition to start receiving candidate applications."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {searchInput || selectedJobType !== "All" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchInput("");
                      setSelectedJobType("All");
                    }}
                    className="h-10 px-4 rounded-xl border-purple-200 text-xs font-semibold"
                  >
                    Reset Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/admin/jobs/create")}
                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-md"
                  >
                    <Plus size={15} className="mr-1.5" />
                    <span>Create First Job</span>
                  </Button>
                )}
              </div>
            </motion.div>
          ) : viewMode === "cards" ? (
            /* ================= 3D INTERACTIVE CARDS GRID ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => {
                const applicantCount = job?.applications?.length || 0;
                const companyName = job?.company?.name || "Independent Enterprise";
                const companyLogo = job?.company?.logo;
                const companyId = job?.company?._id || job?.company;

                return (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group relative rounded-3xl bg-white border border-purple-100 p-6 shadow-[0_15px_35px_-15px_rgba(106,56,194,0.12)] hover:shadow-[0_20px_45px_-10px_rgba(106,56,194,0.22)] hover:border-purple-200 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Ambient Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Card Header: Company Logo & Action Popover */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-purple-50/80 border border-purple-100 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
                            {companyLogo ? (
                              <img
                                src={companyLogo}
                                alt={companyName}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 size={22} className="text-[#6A38C2]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-[#6A38C2] uppercase tracking-wider block truncate">
                              {companyName}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                              <MapPin size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate">{job?.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Popover */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-[#6A38C2] cursor-pointer shrink-0"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-44 p-1.5 rounded-2xl border border-purple-100 shadow-xl bg-white"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/jobs/${job._id}/applicants`)
                              }
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] rounded-xl transition-all cursor-pointer"
                            >
                              <Eye size={14} className="text-[#6A38C2]" />
                              <span>View Applicants</span>
                            </button>

                            {companyId && (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/admin/companies/${companyId}`)
                                }
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] rounded-xl transition-all cursor-pointer"
                              >
                                <Building2 size={14} className="text-purple-600" />
                                <span>Company Profile</span>
                              </button>
                            )}

                            <div className="h-px bg-purple-50 my-1" />

                            <button
                              type="button"
                              onClick={() => confirmDelete(job)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 size={14} className="text-rose-500" />
                              <span>Delete Job</span>
                            </button>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#6A38C2] transition-colors leading-snug line-clamp-2">
                        {job?.title}
                      </h3>

                      {/* Description Excerpt */}
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {job?.description}
                      </p>

                      {/* Badges: Job Type, Experience, Salary */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Badge className="bg-purple-50 text-[#6A38C2] hover:bg-purple-100 border-purple-200 text-[10px] font-bold px-2.5 py-0.5">
                          {job?.jobType}
                        </Badge>

                        <Badge
                          variant="outline"
                          className="border-purple-200 text-gray-600 text-[10px] font-semibold px-2 py-0.5"
                        >
                          {job?.experienceLevel !== undefined
                            ? `${job.experienceLevel}+ Yrs Exp`
                            : "Any Exp"}
                        </Badge>

                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full ml-auto">
                          ₹{job?.salary} LPA
                        </span>
                      </div>

                      {/* Skill Tags */}
                      {Array.isArray(job?.requirements) &&
                        job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-purple-50">
                            {job.requirements.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 truncate max-w-[100px]"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.requirements.length > 3 && (
                              <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                                +{job.requirements.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Card Footer: Applicants & View CTA */}
                    <div className="mt-5 pt-4 border-t border-purple-50 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/jobs/${job._id}/applicants`)
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          applicantCount > 0
                            ? "bg-purple-100/80 text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <Users size={13} />
                        <span>
                          {applicantCount} Applicant{applicantCount === 1 ? "" : "s"}
                        </span>
                      </button>

                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/jobs/${job._id}/applicants`)
                        }
                        className="h-8 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6A38C2] text-xs font-semibold cursor-pointer border border-purple-200"
                      >
                        <span>Manage</span>
                        <ExternalLink size={12} className="ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* ================= ENHANCED TABLE VIEW ================= */
            <AdminJobsTable jobs={filteredJobs} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-purple-100 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Delete Job Requisition?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800 font-mono">
                "{jobToDelete?.title}"
              </span>
              ? This action is permanent and removes all candidate applications attached to this requisition.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-10 rounded-xl border-purple-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={deleting}
              onClick={handleDelete}
              className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-md"
            >
              {deleting ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Delete</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminJobs;
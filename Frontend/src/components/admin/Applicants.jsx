import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import RecruiterHero from "./RecruiterHero";
import axios from "axios";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplication } from "@/redux/applicationSlice";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import {
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  X,
  Filter,
  ArrowLeft,
  ChevronDown,
  Building2,
  Loader2,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public";

const Applicants = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedJobFilter, setSelectedJobFilter] = useState(params.id || "all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Helper: Only authenticated recruiter owning this requisition can delete candidate records
  const canDeleteApplicant = (app) => {
    if (!user || user.role !== "recruiter") return false;
    const jobOwnerId =
      app?.job?.created_by?._id?.toString() ||
      app?.job?.created_by?.toString() ||
      jobDetails?.created_by?._id?.toString() ||
      jobDetails?.created_by?.toString();
    const currentUserId = user?._id?.toString();
    if (jobOwnerId && currentUserId) {
      return jobOwnerId === currentUserId;
    }
    return true;
  };

  const confirmDeleteApplicant = (app) => {
    setApplicationToDelete(app);
    setDeleteDialogOpen(true);
  };

  const handleDeleteApplicant = async () => {
    if (!applicationToDelete) return;
    try {
      setDeleting(true);
      const res = await axios.delete(
        `${APPLICANT_API_ENDPOINT}/delete/${applicationToDelete._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Candidate record removed successfully.");

        // Optimistically update local application state
        const updatedApps = applications.filter(
          (a) => a._id !== applicationToDelete._id
        );
        setApplications(updatedApps);

        // Update Redux state if applicable
        if (jobDetails) {
          dispatch(
            setAllApplication({
              ...jobDetails,
              applications: updatedApps,
            })
          );
        } else {
          dispatch(setAllApplication(updatedApps));
        }
      }
    } catch (error) {
      console.error("Delete applicant error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove candidate record."
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  // Fetch applicant data
  useEffect(() => {
    let isMounted = true;

    const fetchApplicantData = async () => {
      try {
        setLoading(true);

        if (params.id) {
          // Specific job applicants endpoint
          const res = await axios.get(
            `${APPLICANT_API_ENDPOINT}/${params.id}/applicants`,
            { withCredentials: true }
          );

          if (isMounted && res.data.success) {
            const job = res.data.job;
            setJobDetails(job);
            const jobApps = job?.applications || [];
            setApplications(jobApps);
            dispatch(setAllApplication(job));
            setSelectedJobFilter(params.id);
          }
        } else {
          // Centralized recruiter applicants endpoint
          const res = await axios.get(
            `${APPLICANT_API_ENDPOINT}/recruiter/all`,
            { withCredentials: true }
          );

          if (isMounted && res.data.success) {
            setApplications(res.data.applications || []);
            setRecruiterJobs(res.data.jobs || []);
            setJobDetails(null);
            dispatch(setAllApplication(res.data.applications || []));
            setSelectedJobFilter("all");
          }
        }
      } catch (error) {
        console.error("Fetch applicants error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load candidate applications."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchApplicantData();

    return () => {
      isMounted = false;
    };
  }, [params.id, dispatch]);

  // Handle status update (Accept / Reject)
  const handleStatusChange = async (status, applicationId) => {
    try {
      setStatusUpdatingId(applicationId);

      const res = await axios.post(
        `${APPLICANT_API_ENDPOINT}/status/${applicationId}/update`,
        { status },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || `Application marked as ${status}.`);

        // Optimistically update local application state
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: status.toLowerCase() } : app
          )
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update application status."
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Job selection switcher
  const handleJobSelectionChange = (value) => {
    if (value === "all") {
      navigate("/admin/applicants");
    } else {
      navigate(`/admin/jobs/${value}/applicants`);
    }
  };

  // Compute live statistics
  const totalCount = applications?.length || 0;
  const acceptedCount = useMemo(() => {
    return (
      applications?.filter((a) => a?.status?.toLowerCase() === "accepted")?.length || 0
    );
  }, [applications]);

  const pendingCount = useMemo(() => {
    return (
      applications?.filter((a) => a?.status?.toLowerCase() === "pending")?.length || 0
    );
  }, [applications]);

  const rejectedCount = useMemo(() => {
    return (
      applications?.filter((a) => a?.status?.toLowerCase() === "rejected")?.length || 0
    );
  }, [applications]);

  // Filter applications by search and status
  const filteredApplications = useMemo(() => {
    return (applications || []).filter((app) => {
      const candidate = app?.applicant;
      const query = searchInput.toLowerCase().trim();

      const matchesSearch =
        !query ||
        candidate?.fullName?.toLowerCase().includes(query) ||
        candidate?.email?.toLowerCase().includes(query) ||
        candidate?.phoneNumber?.toLowerCase().includes(query) ||
        app?.job?.title?.toLowerCase().includes(query) ||
        (Array.isArray(candidate?.profile?.skills) &&
          candidate.profile.skills.some((s) => s.toLowerCase().includes(query)));

      const currentStatus = app?.status?.toLowerCase() || "pending";
      const matchesStatus =
        selectedStatus === "All" || currentStatus === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchInput, selectedStatus]);

  const statusOptions = ["All", "Pending", "Accepted", "Rejected"];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-8 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Top Breadcrumb when on specific job */}
          {params.id && (
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/applicants")}
                className="h-9 px-3 rounded-xl border-purple-200 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] cursor-pointer"
              >
                <ArrowLeft size={14} className="mr-1.5" />
                <span>All Requisitions</span>
              </Button>
              <span className="text-xs text-purple-400 font-semibold">&bull;</span>
              <span className="text-xs font-bold text-gray-600 truncate max-w-xs">
                {jobDetails?.title || "Requisition"}
              </span>
            </div>
          )}

          {/* ================= HERO DASHBOARD BANNER ================= */}
          <RecruiterHero
            gradient="from-[#2E1065] via-[#4C1D95] to-[#7C3AED]"
            shadow="shadow-[0_20px_50px_-15px_rgba(106,56,194,0.35)]"
            badgeText={
              params.id ? "Targeted Requisition Pipeline" : "Centralized Talent Pipeline"
            }
            title={
              jobDetails?.title ? (
                <span className="truncate block max-w-2xl">
                  {jobDetails.title} Candidates
                </span>
              ) : (
                "Talent & Applicant Review"
              )
            }
            description={
              jobDetails?.company?.name ? (
                <span>
                  Review and manage active candidates for{" "}
                  <span className="text-white font-semibold">
                    {jobDetails.company.name}
                  </span>
                  .
                </span>
              ) : (
                "Evaluate candidate resumes, verify engineering credentials, and fast-track top tech talent into hiring pipelines."
              )
            }
            action={
              recruiterJobs && recruiterJobs.length > 0 ? (
                <div className="w-full sm:w-auto">
                  <div className="text-[9.5px] font-bold text-purple-200 uppercase tracking-wider mb-0.5">
                    Filter by Requisition
                  </div>
                  <Select
                    value={selectedJobFilter}
                    onValueChange={handleJobSelectionChange}
                  >
                    <SelectTrigger className="h-8 px-2.5 rounded-lg bg-white/15 border-white/20 text-white font-semibold text-[11px] backdrop-blur-md w-full sm:w-[220px] shadow-xs">
                      <SelectValue placeholder="All Active Requisitions" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-purple-100 bg-white shadow-2xl">
                      <SelectGroup>
                        <SelectItem
                          value="all"
                          className="cursor-pointer text-xs font-semibold py-1.5"
                        >
                          All Requisitions ({recruiterJobs.length})
                        </SelectItem>
                        {recruiterJobs.map((job) => (
                          <SelectItem
                            key={job._id}
                            value={job._id}
                            className="cursor-pointer text-xs font-semibold py-1.5"
                          >
                            <span className="truncate max-w-[200px] block">
                              {job.title} ({job?.company?.name || "Company"})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ) : null
            }
            stats={[
              {
                value: totalCount,
                label: "Total Candidates",
                icon: Users,
                iconColor: "text-purple-300",
              },
              {
                value: acceptedCount,
                label: "Shortlisted",
                icon: CheckCircle2,
                iconColor: "text-emerald-400",
                valueColor: "text-emerald-400",
              },
              {
                value: pendingCount,
                label: "Under Review",
                icon: Clock,
                iconColor: "text-amber-300",
                valueColor: "text-amber-300",
              },
              {
                value: rejectedCount,
                label: "Archived",
                icon: XCircle,
                iconColor: "text-rose-400",
                valueColor: "text-rose-300",
              },
            ]}
          />

          {/* ================= CONTROLS: SEARCH, FILTERS & VIEW MODE ================= */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <Input
                type="text"
                placeholder="Search candidates by name, email, role, or skills..."
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

            {/* Filter Pills & View Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Pills */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-purple-100 shadow-xs">
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedStatus === st
                        ? "bg-[#6A38C2] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900 hover:bg-purple-50"
                    }`}
                  >
                    {st}
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
                  title="Candidate Cards View"
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
          {loading ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-purple-100">
              <Loader2 size={36} className="mx-auto text-[#6A38C2] animate-spin mb-3" />
              <p className="text-sm font-semibold text-gray-700">Loading candidate applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-purple-100 shadow-[0_20px_50px_-15px_rgba(106,56,194,0.1)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6A38C2] flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No Applications Found
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                {searchInput || selectedStatus !== "All"
                  ? "No candidates match the specified search query or status filter. Try clearing filters to view all applicants."
                  : "No candidates have applied to your active job requisitions yet. Candidate submissions will appear here in real time."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {searchInput || selectedStatus !== "All" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchInput("");
                      setSelectedStatus("All");
                    }}
                    className="h-10 px-4 rounded-xl border-purple-200 text-xs font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/admin/jobs")}
                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-md cursor-pointer"
                  >
                    <span>View Jobs Dashboard</span>
                  </Button>
                )}
              </div>
            </motion.div>
          ) : viewMode === "cards" ? (
            /* ================= 3D CANDIDATE CARDS GRID ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((app, index) => {
                const candidate = app?.applicant;
                const status = app?.status?.toLowerCase() || "pending";
                const resumeUrl = candidate?.profile?.resume;
                const resumeName =
                  candidate?.profile?.resumeOriginalName || "Resume.pdf";
                const isUpdating = statusUpdatingId === app._id;

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group relative rounded-3xl bg-white border border-purple-100 p-6 shadow-[0_15px_35px_-15px_rgba(106,56,194,0.12)] hover:shadow-[0_20px_45px_-10px_rgba(106,56,194,0.22)] hover:border-purple-200 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Accent Strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
                        status === "accepted"
                          ? "bg-emerald-500"
                          : status === "rejected"
                          ? "bg-rose-500"
                          : "bg-gradient-to-r from-[#6A38C2] via-violet-500 to-amber-500"
                      }`}
                    />

                    <div>
                      {/* Top Row: Avatar & Status Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-12 w-12 border-2 border-purple-100 shrink-0 shadow-xs group-hover:border-[#6A38C2] transition-colors">
                            <AvatarImage
                              src={candidate?.profile?.profilePhoto || DEFAULT_AVATAR}
                              alt={candidate?.fullName}
                              className="object-cover"
                            />
                          </Avatar>

                          <div className="min-w-0">
                            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                              {candidate?.fullName || "Candidate"}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Applied{" "}
                              {app?.createdAt
                                ? new Date(app.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recently"}
                            </p>
                          </div>
                        </div>

                        {/* Status Pill & Delete Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {status === "accepted" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Accepted</span>
                            </Badge>
                          ) : status === "rejected" ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                              <XCircle size={12} />
                              <span>Rejected</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-bold px-2.5 py-0.5 shrink-0 flex items-center gap-1">
                              <Clock size={12} />
                              <span>Pending</span>
                            </Badge>
                          )}

                          {canDeleteApplicant(app) && (
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              type="button"
                              onClick={() => confirmDeleteApplicant(app)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove Candidate Application"
                              aria-label="Remove Candidate Application"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Requisition Pill */}
                      <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 mb-4 flex items-center gap-2">
                        <Briefcase size={14} className="text-[#6A38C2] shrink-0" />
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {app?.job?.title || "Engineering Role"}
                        </span>
                        {app?.job?.company?.name && (
                          <span className="text-[10px] text-purple-600 font-semibold truncate ml-auto">
                            {app.job.company.name}
                          </span>
                        )}
                      </div>

                      {/* Contact Channels */}
                      <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                        <a
                          href={`mailto:${candidate?.email}`}
                          className="flex items-center gap-2 hover:text-[#6A38C2] transition-colors truncate"
                          title={candidate?.email}
                        >
                          <Mail size={13} className="text-[#6A38C2] shrink-0" />
                          <span className="truncate">{candidate?.email}</span>
                        </a>

                        {candidate?.phoneNumber && (
                          <a
                            href={`tel:${candidate.phoneNumber}`}
                            className="flex items-center gap-2 hover:text-[#6A38C2] transition-colors"
                          >
                            <Phone size={13} className="text-[#6A38C2] shrink-0" />
                            <span>{candidate.phoneNumber}</span>
                          </a>
                        )}
                      </div>

                      {/* Skills Tags */}
                      {Array.isArray(candidate?.profile?.skills) &&
                        candidate.profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {candidate.profile.skills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md truncate max-w-[110px]"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.profile.skills.length > 4 && (
                              <span className="text-[10px] font-semibold text-[#6A38C2] bg-purple-50 px-1.5 py-0.5 rounded-md">
                                +{candidate.profile.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Card Footer: Resume & Decision Buttons */}
                    <div className="pt-4 border-t border-purple-50 space-y-3">
                      {/* Resume Link */}
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100 text-[#6A38C2] text-xs font-semibold border border-purple-200 transition-all cursor-pointer group/resume"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="shrink-0" />
                            <span className="truncate">{resumeName}</span>
                          </div>
                          <ExternalLink size={13} className="shrink-0 opacity-70 group-hover/resume:opacity-100" />
                        </a>
                      ) : (
                        <div className="p-2 rounded-xl bg-gray-50 text-gray-400 text-xs text-center border border-gray-100">
                          No Resume Attached
                        </div>
                      )}

                      {/* Action Decision Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          disabled={isUpdating || status === "accepted"}
                          onClick={() => handleStatusChange("accepted", app._id)}
                          className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-40"
                        >
                          <CheckCircle2 size={13} className="mr-1.5" />
                          <span>Accept</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating || status === "rejected"}
                          onClick={() => handleStatusChange("rejected", app._id)}
                          className="h-9 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs transition-all cursor-pointer disabled:opacity-40"
                        >
                          <XCircle size={13} className="mr-1.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* ================= ENHANCED TABLE VIEW ================= */
            <ApplicantsTable
              applications={filteredApplications}
              onStatusChange={handleStatusChange}
              statusUpdatingId={statusUpdatingId}
              onDelete={confirmDeleteApplicant}
              canDelete={canDeleteApplicant}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Candidate Application"
        itemName={applicationToDelete?.applicant?.fullName}
        itemType="applicant"
        deleting={deleting}
        onConfirm={handleDeleteApplicant}
      />
    </>
  );
};

export default Applicants;
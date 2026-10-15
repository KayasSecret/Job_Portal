import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Building2,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  MoreVertical,
  ExternalLink,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setAllAdminJobs } from "@/redux/jobSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const AdminJobsTable = ({ jobs = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allAdminJobs = [] } = useSelector((store) => store.job);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
        // Instantly update Redux state
        const updatedJobs = allAdminJobs.filter((j) => j._id !== jobToDelete._id);
        dispatch(setAllAdminJobs(updatedJobs));
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

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(106,56,194,0.12)] border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 border-b border-purple-100">
              <TableRow>
                <TableHead className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                  Opportunity / Role
                </TableHead>
                <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                  Company Entity
                </TableHead>
                <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                  Compensation & Exp
                </TableHead>
                <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                  Applicants
                </TableHead>
                <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                  Posted Date
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {jobs.map((job, index) => {
                const applicantCount = job?.applications?.length || 0;
                const companyName = job?.company?.name || "Independent";
                const companyLogo = job?.company?.logo;
                const companyId = job?.company?._id || job?.company;

                return (
                  <motion.tr
                    key={job._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="hover:bg-purple-50/50 transition-colors border-b border-purple-50/70 group"
                  >
                    {/* Role Title & Location */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-[#6A38C2] flex items-center justify-center shrink-0 border border-purple-200/50 group-hover:scale-105 transition-transform">
                          <Briefcase size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                            {job?.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="truncate max-w-[130px]">{job?.location}</span>
                            </span>
                            <span className="text-purple-300">&bull;</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold px-2 py-0 h-5 border-purple-200 bg-purple-50/50 text-[#6A38C2]"
                            >
                              {job?.jobType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company Entity */}
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-purple-100 p-0.5 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={companyName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 size={16} className="text-[#6A38C2]" />
                          )}
                        </div>
                        <span className="font-semibold text-xs text-gray-800 truncate max-w-[140px]">
                          {companyName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Compensation & Experience */}
                    <TableCell className="py-4 px-4">
                      <div className="text-xs">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          ₹{job?.salary} LPA
                        </span>
                        <div className="text-[11px] text-gray-500 mt-1 font-medium">
                          {job?.experienceLevel !== undefined
                            ? `${job.experienceLevel}+ Yrs Exp`
                            : "Any Experience"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Applicants Pill Button */}
                    <TableCell className="py-4 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                        className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          applicantCount > 0
                            ? "bg-purple-100/70 border-purple-200 text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white"
                            : "border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <Users size={13} />
                        <span>{applicantCount} Candidate{applicantCount === 1 ? "" : "s"}</span>
                      </Button>
                    </TableCell>

                    {/* Posted Date */}
                    <TableCell className="py-4 px-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>
                          {job?.createdAt
                            ? new Date(job.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recently"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-4 px-6 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-xl hover:bg-purple-100 text-gray-600 hover:text-[#6A38C2] cursor-pointer"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          align="end"
                          className="w-48 p-1.5 rounded-2xl border border-purple-100 shadow-xl bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] rounded-xl transition-all cursor-pointer"
                          >
                            <Eye size={14} className="text-[#6A38C2]" />
                            <span>View Applicants</span>
                          </button>

                          {companyId && (
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/companies/${companyId}`)}
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
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
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
              Are you sure you want to delete <span className="font-semibold text-gray-800 font-mono">"{jobToDelete?.title}"</span>? This will permanently remove the requisition and its associated candidate applications.
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

export default AdminJobsTable;
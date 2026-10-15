import React from "react";
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
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  MoreVertical,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Clock,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public";

const ApplicantsTable = ({
  applications = [],
  onStatusChange,
  statusUpdatingId,
  onDelete,
  canDelete,
}) => {
  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(106,56,194,0.12)] border border-purple-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 border-b border-purple-100">
            <TableRow>
              <TableHead className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Candidate Profile
              </TableHead>
              <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Applied Requisition
              </TableHead>
              <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Contact Info
              </TableHead>
              <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Resume
              </TableHead>
              <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Applied On
              </TableHead>
              <TableHead className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Decision
              </TableHead>
              <TableHead className="py-4 px-6 text-right font-bold text-xs uppercase tracking-wider text-[#6A38C2]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {applications.map((app, index) => {
              const candidate = app?.applicant;
              const jobTitle = app?.job?.title || "Requisition Opportunity";
              const resumeUrl = candidate?.profile?.resume;
              const resumeName =
                candidate?.profile?.resumeOriginalName || "Candidate_Resume.pdf";
              const status = app?.status?.toLowerCase() || "pending";
              const isUpdating = statusUpdatingId === app?._id;

              return (
                <motion.tr
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025, duration: 0.3 }}
                  className="hover:bg-purple-50/50 transition-colors border-b border-purple-50/70 group"
                >
                  {/* Candidate Identity */}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-purple-200 shrink-0">
                        <AvatarImage
                          src={candidate?.profile?.profilePhoto || DEFAULT_AVATAR}
                          alt={candidate?.fullName}
                          className="object-cover"
                        />
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                          {candidate?.fullName || "Candidate"}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {candidate?.profile?.skills &&
                          candidate.profile.skills.length > 0 ? (
                            <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                              {candidate.profile.skills.slice(0, 2).join(", ")}
                              {candidate.profile.skills.length > 2 && "..."}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">
                              Verified Applicant
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Applied Requisition */}
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#6A38C2] flex items-center justify-center shrink-0">
                        <Briefcase size={14} />
                      </div>
                      <span className="font-semibold text-xs text-gray-800 truncate max-w-[150px]">
                        {jobTitle}
                      </span>
                    </div>
                  </TableCell>

                  {/* Contact Info */}
                  <TableCell className="py-4 px-4">
                    <div className="text-xs space-y-1">
                      <a
                        href={`mailto:${candidate?.email}`}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-[#6A38C2] truncate max-w-[160px]"
                        title={candidate?.email}
                      >
                        <Mail size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{candidate?.email}</span>
                      </a>
                      {candidate?.phoneNumber && (
                        <a
                          href={`tel:${candidate.phoneNumber}`}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-[#6A38C2]"
                        >
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{candidate.phoneNumber}</span>
                        </a>
                      )}
                    </div>
                  </TableCell>

                    {/* Resume Viewer */}
                    <TableCell className="py-4 px-4">
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6A38C2] hover:bg-purple-100 hover:text-[#5B21B6] border border-purple-200 text-xs font-semibold transition-all cursor-pointer group/link"
                          title={resumeName}
                        >
                        <FileText size={13} className="shrink-0" />
                        <span className="truncate max-w-[100px]">View Resume</span>
                        <ExternalLink
                          size={11}
                          className="opacity-70 group-hover/link:opacity-100 shrink-0"
                        />
                      </a>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium text-gray-400 border-gray-200"
                      >
                        No Resume
                      </Badge>
                    )}
                  </TableCell>

                  {/* Applied Date */}
                  <TableCell className="py-4 px-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400 shrink-0" />
                      <span>
                        {app?.createdAt
                          ? new Date(app.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-4 px-4">
                    {status === "accepted" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} />
                        <span>Accepted</span>
                      </Badge>
                    ) : status === "rejected" ? (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1 w-fit">
                        <XCircle size={12} />
                        <span>Rejected</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        <span>Pending</span>
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions Menu */}
                  <TableCell className="py-4 px-6 text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isUpdating}
                          className="h-8 w-8 p-0 rounded-xl hover:bg-purple-100 text-gray-600 hover:text-[#6A38C2] cursor-pointer"
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
                          onClick={() => onStatusChange?.("accepted", app._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>Accept Candidate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onStatusChange?.("rejected", app._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer mt-1"
                        >
                          <XCircle size={14} className="text-rose-600" />
                          <span>Reject Candidate</span>
                        </button>

                        {resumeUrl && (
                          <>
                            <div className="h-px bg-purple-50 my-1" />
                            <a
                              href={resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] rounded-xl transition-all"
                            >
                              <FileText size={14} className="text-[#6A38C2]" />
                              <span>Open Resume</span>
                            </a>
                          </>
                        )}

                        {canDelete?.(app) && (
                          <>
                            <div className="h-px bg-purple-50 my-1" />
                            <button
                              type="button"
                              onClick={() => onDelete?.(app)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 size={14} className="text-rose-500" />
                              <span>Remove Candidate</span>
                            </button>
                          </>
                        )}
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
  );
};

export default ApplicantsTable;
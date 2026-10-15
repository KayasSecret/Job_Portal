import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Pen,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Users2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import UpdateRecruiterProfileDialog from "./UpdateRecruiterProfileDialog";
import UpdateProfilePhotoDialog from "../UpdateProfilePhotoDialog";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public";

const RecruiterProfile = () => {
  // Load fresh profile, companies, and jobs from backend
  useGetUserProfile();
  useGetAllCompanies();
  useGetAllAdminJobs();

  const [open, setOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { companies = [] } = useSelector((store) => store.company);
  const { allAdminJobs = [] } = useSelector((store) => store.job);
  const navigate = useNavigate();

  const totalCompanies = companies?.length || 0;
  const totalJobs = allAdminJobs?.length || 0;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* ================= PROFILE HEADER CARD ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-3xl border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.15)] overflow-hidden"
          >
            {/* Top Accent Gradient Banner */}
            <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500" />

            <div className="p-6 sm:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Left: Avatar & Identity Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Clickable Profile Picture */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => setPhotoDialogOpen(true)}
                    title="Click to update profile photo"
                  >
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-purple-100 shadow-lg transition-all group-hover:border-[#6A38C2]">
                      <AvatarImage
                        src={user?.profile?.profilePhoto || DEFAULT_AVATAR}
                        alt={user?.fullName || "Recruiter Profile"}
                        className="object-cover"
                      />
                    </Avatar>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Camera size={22} />
                      <span className="text-[10px] font-semibold mt-0.5">Edit Photo</span>
                    </div>

                    {/* Camera Badge */}
                    <button
                      type="button"
                      aria-label="Update profile picture"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6A38C2] hover:bg-[#5B21B6] text-white border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer"
                    >
                      <Camera size={14} />
                    </button>
                  </motion.div>

                  {/* Name, Role & Bio */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {user?.fullName || "Recruiter"}
                      </h1>
                      <Badge className="bg-purple-100 text-[#6A38C2] hover:bg-purple-200 border-purple-200 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                        Recruiter Account
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed mt-1">
                      {user?.profile?.bio ||
                        "Lead Talent Acquisition Specialist hiring high-impact engineering and product teams on HireNest."}
                    </p>

                    {/* Contact Badges Row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail size={15} className="text-[#6A38C2]" />
                        <span>{user?.email || "No email available"}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone size={15} className="text-[#6A38C2]" />
                        <span>{user?.phoneNumber || "Phone not provided"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle2 size={15} />
                        <span>Verified Hiring Entity</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Edit Profile Trigger */}
                <Button
                  onClick={() => setOpen(true)}
                  className="h-11 px-5 rounded-2xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white font-semibold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer shrink-0"
                >
                  <Pen size={14} className="mr-2" />
                  <span>Edit Profile</span>
                </Button>
              </div>

              {/* ================= STATS ROW ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 pt-8 border-t border-purple-50">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="text-[#6A38C2]" size={24} />
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-100 px-2 py-0.5 rounded-full">
                      Entities
                    </span>
                  </div>
                  <h2 className="font-extrabold text-2xl text-gray-900 mt-2">
                    {totalCompanies}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Registered Companies
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Briefcase className="text-[#7C3AED]" size={24} />
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-violet-100 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <h2 className="font-extrabold text-2xl text-gray-900 mt-2">
                    {totalJobs}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Active Job Postings
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="text-emerald-600" size={24} />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                      Status
                    </span>
                  </div>
                  <h2 className="font-extrabold text-2xl text-gray-900 mt-2">
                    Verified
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Enterprise Privileges
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ================= RECRUITER ENTITIES & MANAGEMENT CARD ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="bg-white rounded-3xl border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.12)] mt-8 p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-50">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold mb-1">
                  <Sparkles size={13} />
                  <span>Talent Command Center</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Managed Companies & Pipelines
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Overview of corporate entities linked to your recruiter account.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/admin/companies/create")}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Plus size={14} className="mr-1.5" />
                  <span>Register Company</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/companies")}
                  className="h-10 px-4 rounded-xl border-purple-200 text-gray-700 hover:bg-purple-50 text-xs font-semibold cursor-pointer"
                >
                  <span>All Companies</span>
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Companies Grid / Preview */}
            {companies && companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.slice(0, 4).map((company) => (
                  <div
                    key={company._id}
                    className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 hover:border-purple-200 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-purple-100 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 size={20} className="text-[#6A38C2]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 truncate">
                          {company.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {company.location || "Location not specified"}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/companies/${company._id}`)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-[#6A38C2] hover:bg-purple-100/70"
                    >
                      <span>Manage</span>
                      <ExternalLink size={12} className="ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-purple-50/30 border border-dashed border-purple-200">
                <Building2 size={32} className="mx-auto text-purple-400 mb-2" />
                <h3 className="text-sm font-bold text-gray-800">
                  No Companies Registered Yet
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Register your company profile to attach verified corporate entities to job postings.
                </p>
                <Button
                  onClick={() => navigate("/admin/companies/create")}
                  className="mt-4 h-9 px-4 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-semibold"
                >
                  <Plus size={14} className="mr-1.5" />
                  <span>Register First Company</span>
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Modals */}
        <UpdateRecruiterProfileDialog open={open} setOpen={setOpen} />
        <UpdateProfilePhotoDialog
          open={photoDialogOpen}
          setOpen={setPhotoDialogOpen}
        />
      </div>
    </>
  );
};

export default RecruiterProfile;

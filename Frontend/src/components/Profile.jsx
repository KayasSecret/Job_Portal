import React, { useState, useMemo } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Pen,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Camera,
  CheckCircle2,
  Sparkles,
  Bookmark,
  ExternalLink,
  Code2,
  Target,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import UpdateProfilePhotoDialog from "./UpdateProfilePhotoDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import RecruiterProfile from "./admin/RecruiterProfile";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public";

// Domain analysis mapping based on real candidate skills
const DOMAIN_KEYWORDS = [
  { domain: "Frontend Engineering", keywords: ["react", "vue", "angular", "html", "css", "javascript", "typescript", "tailwind", "next.js", "frontend"], color: "from-blue-500 to-cyan-500" },
  { domain: "Backend Systems & APIs", keywords: ["node", "express", "django", "python", "java", "spring", "golang", "c++", "sql", "mongodb", "backend", "postgres"], color: "from-purple-500 to-indigo-600" },
  { domain: "Full Stack Development", keywords: ["fullstack", "mern", "mean", "web", "full-stack"], color: "from-pink-500 to-rose-600" },
  { domain: "Cloud & DevOps", keywords: ["aws", "azure", "docker", "kubernetes", "gcp", "devops", "ci/cd", "linux"], color: "from-cyan-500 to-blue-600" },
  { domain: "AI & Data Science", keywords: ["ai", "machine learning", "ml", "data science", "pytorch", "pandas", "deep learning", "nlp"], color: "from-amber-500 to-orange-600" },
  { domain: "Mobile Applications", keywords: ["flutter", "react native", "android", "ios", "swift", "kotlin"], color: "from-emerald-500 to-teal-600" },
];

const Profile = () => {
  // Sync fresh profile & applied applications from backend
  useGetUserProfile();
  useGetAppliedJobs();

  const [open, setOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs = [] } = useSelector((store) => store.job);

  const isResume = Boolean(user?.profile?.resume);
  const skillsList = useMemo(() => user?.profile?.skills || [], [user?.profile?.skills]);
  const savedJobsCount = user?.savedJobs?.length || 0;

  // Calculate real profile completion score & checklist
  const { completionScore, checklist } = useMemo(() => {
    const items = [
      {
        id: "details",
        label: "Basic Personal Info",
        done: Boolean(user?.fullName && user?.email),
        weight: 20,
        tip: "Provide full name and active contact email",
      },
      {
        id: "phone",
        label: "Contact Phone Number",
        done: Boolean(user?.phoneNumber),
        weight: 15,
        tip: "Add phone number for recruiter outreach",
      },
      {
        id: "bio",
        label: "Career Headline & Bio",
        done: Boolean(user?.profile?.bio && user.profile.bio.length >= 10),
        weight: 15,
        tip: "Write a bio statement detailing your career focus",
      },
      {
        id: "photo",
        label: "Profile Headshot",
        done: Boolean(user?.profile?.profilePhoto),
        weight: 15,
        tip: "Upload a clean photo to personalize your profile",
      },
      {
        id: "skills",
        label: "Technical Skills (3+ Added)",
        done: Boolean(skillsList.length >= 3),
        weight: 20,
        tip: "Add at least 3 skills to enable AI job matching",
      },
      {
        id: "resume",
        label: "Verified Resume Document",
        done: isResume,
        weight: 15,
        tip: "Upload your latest PDF resume for recruiters",
      },
    ];

    const score = items.reduce((acc, curr) => (curr.done ? acc + curr.weight : acc), 0);
    return { completionScore: score, checklist: items };
  }, [user, skillsList, isResume]);

  // Derive candidate focus domains from actual added skills
  const matchedDomains = useMemo(() => {
    if (!skillsList || skillsList.length === 0) return [];

    const lowerSkills = skillsList.map((s) => s.toLowerCase());
    return DOMAIN_KEYWORDS.filter((domainItem) =>
      domainItem.keywords.some((kw) =>
        lowerSkills.some((skill) => skill.includes(kw) || kw.includes(skill))
      )
    ).slice(0, 3);
  }, [skillsList]);

  // Circumference for circular progress ring (radius = 16)
  const strokeDashoffset = 100 - completionScore;

  // If recruiter, render recruiter profile (placed after all hooks)
  if (user?.role === "recruiter") {
    return <RecruiterProfile />;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-8 sm:py-12 relative overflow-hidden">
        {/* Subtle Ambient Background Lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-10 left-10 w-96 h-96 bg-purple-300/15 blur-[120px] rounded-full -z-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-10 right-10 w-96 h-96 bg-pink-300/10 blur-[140px] rounded-full -z-0"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
          {/* ================= 1. HERO PROFILE HEADER CARD ================= */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-3xl border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.15)] overflow-hidden"
          >
            {/* Top Accent Gradient Banner */}
            <div className="h-2.5 bg-gradient-to-r from-[#6A38C2] via-fuchsia-500 to-cyan-500" />

            <div className="p-6 sm:p-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Left: Avatar & Identity Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Clickable Profile Picture with Gradient Border */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => setPhotoDialogOpen(true)}
                    title="Click to update profile photo"
                  >
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-purple-100 shadow-lg transition-all group-hover:border-[#6A38C2]">
                      <AvatarImage
                        src={user?.profile?.profilePhoto || DEFAULT_AVATAR}
                        alt={user?.fullName || "Candidate"}
                        className="object-cover"
                      />
                    </Avatar>

                    {/* Active Candidate Status Pulse Indicator */}
                    <span
                      title="Active Candidate"
                      className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"
                    >
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Camera size={22} />
                      <span className="text-[10px] font-semibold mt-0.5">Edit Photo</span>
                    </div>

                    {/* Camera Badge Button */}
                    <button
                      type="button"
                      aria-label="Update profile picture"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6A38C2] hover:bg-[#5B21B6] text-white border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer"
                    >
                      <Camera size={14} />
                    </button>
                  </motion.div>

                  {/* Name, Headline, and Badges */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {user?.fullName || "Candidate"}
                      </h1>
                      <Badge className="bg-purple-100 text-[#6A38C2] hover:bg-purple-200 border-purple-200 text-xs font-bold px-3 py-1">
                        Student Candidate
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
                        Open to Roles
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed mt-1">
                      {user?.profile?.bio ||
                        "Passionate software engineering and technology professional exploring high-impact career opportunities on HireNest."}
                    </p>

                    {/* Contact Pills Row */}
                    <div className="flex flex-wrap items-center gap-3.5 mt-3 text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-[#6A38C2]" />
                        <span>{user?.email || "No email available"}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-[#6A38C2]" />
                        <span>{user?.phoneNumber || "Phone not provided"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <ShieldCheck size={14} />
                        <span>Verified Profile</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Circular Progress Meter + Edit Profile CTA */}
                <div className="flex sm:flex-row lg:flex-col items-center sm:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-purple-50">
                  {/* Circular Completion Meter */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 36 36">
                        <path
                          className="text-purple-100"
                          strokeWidth="3.2"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#6A38C2] transition-all duration-1000 ease-out"
                          strokeDasharray="100, 100"
                          strokeDashoffset={strokeDashoffset}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-black text-[#6A38C2]">
                          {completionScore}%
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Profile Strength
                      </span>
                      <span className="text-xs font-bold text-[#6A38C2]">
                        {completionScore >= 90
                          ? "All-Star Ready 🌟"
                          : completionScore >= 60
                          ? "Strong Progress 🚀"
                          : "Needs Setup ⚡"}
                      </span>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <Button
                    onClick={() => setOpen(true)}
                    className="h-10 px-5 rounded-2xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Pen size={13} className="mr-2" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              </div>

              {/* ================= 2. KEY STATS CARDS ================= */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-purple-50">
                {/* 1. Skills */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-purple-50/70 border border-purple-100/90 rounded-2xl p-4 sm:p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Code2 className="text-[#6A38C2]" size={22} />
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Skills
                    </span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 mt-2">
                    {skillsList.length}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Verified Competencies
                  </p>
                </motion.div>

                {/* 2. Applications */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-violet-50/70 border border-violet-100/90 rounded-2xl p-4 sm:p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Briefcase className="text-violet-600" size={22} />
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Applied
                    </span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 mt-2">
                    {allAppliedJobs.length}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Submissions Tracked
                  </p>
                </motion.div>

                {/* 3. Bookmarks */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-amber-50/70 border border-amber-100/90 rounded-2xl p-4 sm:p-5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Bookmark className="text-amber-600" size={22} />
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Saved
                    </span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 mt-2">
                    {savedJobsCount}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Saved Opportunities
                  </p>
                </motion.div>

                {/* 4. Resume */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                    isResume
                      ? "bg-emerald-50/70 border-emerald-100/90"
                      : "bg-rose-50/70 border-rose-100/90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FileText
                      className={isResume ? "text-emerald-600" : "text-rose-500"}
                      size={22}
                    />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isResume
                          ? "text-emerald-700 bg-emerald-100"
                          : "text-rose-700 bg-rose-100"
                      }`}
                    >
                      Resume
                    </span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 mt-2">
                    {isResume ? "Ready" : "Missing"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {isResume ? "Candidate CV Attached" : "Upload Required"}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ================= 3. TWO-COLUMN MIDDLE SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT COLUMN: Skills & Domain Interests (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-8">
              {/* Technical Skills Card */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="bg-white rounded-3xl border border-purple-100 shadow-[0_15px_40px_-15px_rgba(106,56,194,0.1)] p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-purple-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center">
                      <Code2 size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Technical Skills
                      </h2>
                      <p className="text-xs text-gray-500">
                        Keywords indexed by recruiters for role matching
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-xs font-semibold text-[#6A38C2] hover:text-[#5B21B6] transition-colors cursor-pointer"
                  >
                    + Manage Skills
                  </button>
                </div>

                {/* Skills Pills */}
                {skillsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {skillsList.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 text-[#6A38C2] text-xs font-semibold hover:border-purple-300 transition-all shadow-2xs"
                      >
                        <Sparkles size={11} className="text-amber-500" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-2xl bg-purple-50/40 border border-dashed border-purple-200">
                    <Code2 size={28} className="mx-auto text-purple-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      No skills added yet
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Add languages, frameworks, or tools to attract recruiter search queries.
                    </p>
                    <Button
                      onClick={() => setOpen(true)}
                      className="mt-3.5 h-8 px-4 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-medium"
                    >
                      Add Technical Skills
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Matched Career Focus Domains */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="bg-white rounded-3xl border border-purple-100 shadow-[0_15px_40px_-15px_rgba(106,56,194,0.1)] p-6 sm:p-8"
              >
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-purple-50">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center">
                    <Target size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Career Focus & Preferences
                    </h2>
                    <p className="text-xs text-gray-500">
                      Target specializations mapped from your verified skills
                    </p>
                  </div>
                </div>

                {matchedDomains.length > 0 ? (
                  <div className="space-y-3">
                    {matchedDomains.map((item) => (
                      <div
                        key={item.domain}
                        className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-3 h-3 rounded-full bg-gradient-to-tr ${item.color} shadow-xs`}
                          />
                          <span className="text-xs sm:text-sm font-bold text-gray-800">
                            {item.domain}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#6A38C2] bg-white px-2.5 py-0.5 rounded-md border border-purple-100 shadow-2xs">
                          High Match
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Add tech skills like React, Node, Python, or AWS in your profile to automatically unlock targeted specializations and recruiter recommendations.
                  </p>
                )}

                {/* Job Types Chips */}
                <div className="mt-5 pt-4 border-t border-purple-50 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">
                    Open To:
                  </span>
                  {["Full-Time", "Remote", "Internship", "Hybrid"].map((type) => (
                    <span
                      key={type}
                      className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-md border border-gray-100"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Resume & Career Readiness (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Resume Document Card */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="bg-white rounded-3xl border border-purple-100 shadow-[0_15px_40px_-15px_rgba(106,56,194,0.1)] p-6 sm:p-7"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-50">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#6A38C2]" />
                    <h2 className="text-base font-bold text-gray-900">
                      Resume Attachment
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isResume
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isResume ? "Attached" : "Missing"}
                  </span>
                </div>

                {isResume ? (
                  <div className="space-y-3.5">
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/90 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                            {user?.profile?.resumeOriginalName || "Candidate_Resume.pdf"}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            PDF Document • Ready for Review
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={user?.profile?.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-9 rounded-xl border-purple-200 text-[#6A38C2] hover:bg-purple-50 text-xs font-semibold"
                        >
                          <ExternalLink size={13} className="mr-1.5" />
                          <span>View PDF</span>
                        </Button>
                      </a>

                      <Button
                        onClick={() => setOpen(true)}
                        variant="ghost"
                        className="h-9 px-3 rounded-xl text-gray-600 hover:text-[#6A38C2] hover:bg-purple-50 text-xs font-semibold"
                      >
                        <span>Replace</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-center rounded-2xl bg-purple-50/30 border border-dashed border-purple-200">
                    <AlertCircle size={26} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-xs font-bold text-gray-800">
                      No Resume Uploaded
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Upload your PDF resume to unlock instant 1-click job applications.
                    </p>
                    <Button
                      onClick={() => setOpen(true)}
                      className="mt-3.5 h-8 px-4 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-medium"
                    >
                      Upload Resume
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Career Readiness Checklist Card */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="bg-white rounded-3xl border border-purple-100 shadow-[0_15px_40px_-15px_rgba(106,56,194,0.1)] p-6 sm:p-7"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <h2 className="text-base font-bold text-gray-900">
                      Profile Readiness
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-[#6A38C2]">
                    {completionScore}%
                  </span>
                </div>

                <div className="space-y-2.5">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <span
                          className={
                            item.done
                              ? "text-gray-700 font-medium"
                              : "text-gray-400"
                          }
                        >
                          {item.label}
                        </span>
                      </div>

                      {!item.done && (
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          className="text-[10px] font-bold text-[#6A38C2] hover:underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================= 4. APPLIED JOBS PIPELINE TRACKING ================= */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="bg-white rounded-3xl border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.12)] p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-50">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold mb-1">
                  <Sparkles size={13} />
                  <span>Candidate Career Pipeline</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Applied Job Applications
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Monitor company evaluations, review stages, and interview statuses live.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/jobs")}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Briefcase size={14} className="mr-1.5" />
                  <span>Explore More Roles</span>
                </Button>
              </div>
            </div>

            <AppliedJobTable />
          </motion.div>
        </div>

        {/* Profile Dialogs */}
        <UpdateProfileDialog open={open} setOpen={setOpen} />
        <UpdateProfilePhotoDialog
          open={photoDialogOpen}
          setOpen={setPhotoDialogOpen}
        />
      </div>
    </>
  );
};

export default Profile;

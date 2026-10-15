import React, { useState, useEffect } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import { setAllAdminJobs } from "@/redux/jobSlice";
import {
  Loader2,
  Briefcase,
  Sparkles,
  MapPin,
  TrendingUp,
  Users,
  IndianRupee,
  Building2,
  ArrowLeft,
  CheckCircle2,
  X,
  Plus,
  Eye,
  Zap,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/badge";

const PostJob = () => {
  useGetAllCompanies();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { companies = [] } = useSelector((store) => store.company);
  const { allAdminJobs = [] } = useSelector((store) => store.job);

  const [input, setInput] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
    jobType: "Full-Time",
    experience: "",
    position: 1,
    companyId: "",
  });

  // Interactive skills array
  const [skills, setSkills] = useState(["React", "Node.js", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Set default company if only one company exists
  useEffect(() => {
    if (companies.length === 1 && !input.companyId) {
      setInput((prev) => ({
        ...prev,
        companyId: companies[0]._id,
      }));
    }
  }, [companies, input.companyId]);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanySelect = (companyId) => {
    setInput((prev) => ({
      ...prev,
      companyId,
    }));
  };

  const handleJobTypeSelect = (jobType) => {
    setInput((prev) => ({
      ...prev,
      jobType,
    }));
  };

  // Skill chip handlers
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    // Handle comma-separated input
    const parts = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !skills.includes(s));

    if (parts.length > 0) {
      setSkills((prev) => [...prev, ...parts]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Selected company object for preview
  const selectedCompany = companies.find((c) => c._id === input.companyId);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.title.trim()) {
      toast.error("Job title is required.");
      return;
    }

    if (!input.companyId) {
      toast.error("Please select a registered company.");
      return;
    }

    if (!input.location.trim()) {
      toast.error("Location / Work mode is required.");
      return;
    }

    if (!input.salary) {
      toast.error("Annual salary (LPA) is required.");
      return;
    }

    if (skills.length === 0) {
      toast.error("Please add at least one required skill.");
      return;
    }

    if (!input.description.trim()) {
      toast.error("Job description is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: input.title.trim(),
        description: input.description.trim(),
        requirements: skills.join(", "),
        salary: Number(input.salary),
        location: input.location.trim(),
        jobType: input.jobType,
        experience: input.experience || 0,
        position: Number(input.position) || 1,
        companyId: input.companyId,
      };

      const res = await axios.post(`${JOB_API_ENDPOINT}/post`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Job posted successfully!");

        // Update Redux state with newly created job
        if (res.data.job) {
          const newJobWithCompany = {
            ...res.data.job,
            company: selectedCompany || res.data.job.company,
          };
          dispatch(setAllAdminJobs([newJobWithCompany, ...allAdminJobs]));
        }

        navigate("/admin/jobs");
      }
    } catch (error) {
      console.error("Post job error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to publish job requisition."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/jobs")}
              className="h-10 px-4 rounded-xl border-purple-200 text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft size={15} className="mr-2" />
              <span>Back to Jobs</span>
            </Button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-bold border border-purple-200">
              <Sparkles size={13} className="text-amber-500" />
              <span>Live Requisition Publisher</span>
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: 3D Holographic Candidate Live Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6"
            >
              {/* Holographic Candidate Preview Container */}
              <div className="relative rounded-3xl bg-gradient-to-b from-[#180A33] via-[#1F0E42] to-[#0E061D] border border-purple-500/30 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(106,56,194,0.35)] overflow-hidden text-white">
                {/* Ambient Blur Orbs */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#8B5CF6]/30 blur-[80px]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#EC4899]/25 blur-[80px]"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                      <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">
                        Live Candidate Card Preview
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                      HireNest Discover
                    </span>
                  </div>

                  {/* Interactive Mock Card */}
                  <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl">
                    {/* Company Branding */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                          {selectedCompany?.logo ? (
                            <img
                              src={selectedCompany.logo}
                              alt={selectedCompany.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 size={24} className="text-[#6A38C2]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {selectedCompany?.name || "Select Your Company"}
                          </h4>
                          <p className="text-xs text-purple-200/80 truncate flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-purple-300 shrink-0" />
                            <span>{input.location || "Location not set"}</span>
                          </p>
                        </div>
                      </div>

                      <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 text-[10px] font-bold">
                        ₹{input.salary ? `${input.salary} LPA` : "₹-- LPA"}
                      </Badge>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-black text-white tracking-tight leading-snug line-clamp-2">
                      {input.title || "Senior Software Engineer"}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-purple-100/70 mt-2 line-clamp-3 leading-relaxed">
                      {input.description ||
                        "Join our world-class engineering team to design, build, and deploy high-performance applications with cutting-edge tech..."}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-semibold border border-white/10">
                        {input.jobType}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-purple-200 text-[11px] font-semibold border border-white/10">
                        {input.experience ? `${input.experience}+ Yrs Exp` : "Fresher / Any Exp"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-amber-300 text-[11px] font-semibold border border-white/10">
                        {input.position || 1} Openings
                      </span>
                    </div>

                    {/* Skill Tags */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10">
                        {skills.slice(0, 5).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                        {skills.length > 5 && (
                          <span className="text-[10px] font-semibold text-purple-300 bg-white/10 px-1.5 py-0.5 rounded-md">
                            +{skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Highlights Footer */}
                  <div className="mt-6 flex items-center justify-between text-xs text-purple-200/70 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-400" />
                      <span>Instant Candidate Discovery</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Verified Recruiter</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips & Assistance Card */}
              <div className="rounded-3xl bg-white border border-purple-100 p-6 shadow-sm">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[#6A38C2]" />
                  <span>Job Posting Best Practices</span>
                </h4>
                <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
                  <li>&bull; <span className="font-semibold text-gray-800">Clear Title:</span> Use standardized titles like "Backend Engineer" for higher search ranking.</li>
                  <li>&bull; <span className="font-semibold text-gray-800">Competitive Compensation:</span> Roles displaying salary ranges receive up to 3x more qualified applicants.</li>
                  <li>&bull; <span className="font-semibold text-gray-800">Targeted Skills:</span> Adding 3-6 relevant skill chips ensures smart algorithmic matching.</li>
                </ul>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Consolidated Job Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7 order-1 lg:order-2"
            >
              <div className="rounded-3xl bg-white border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.15)] overflow-hidden">
                {/* Accent Gradient Banner */}
                <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-pink-500" />

                <div className="p-6 sm:p-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
                      <Briefcase size={28} />
                    </div>

                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Post New Requisition
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Publish your open tech roles to attract top-tier verified talent on HireNest.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={submitHandler} className="space-y-6">
                    {/* 1. Company Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <Building2 size={14} className="text-[#6A38C2]" />
                          <span>Hiring Company Entity</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <span className="text-[11px] text-gray-400">Required</span>
                      </div>

                      {companies.length > 0 ? (
                        <Select
                          value={input.companyId}
                          onValueChange={handleCompanySelect}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white text-sm font-medium transition-all">
                            <SelectValue placeholder="Choose a registered company..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-purple-100 shadow-xl bg-white">
                            <SelectGroup>
                              {companies.map((company) => (
                                <SelectItem
                                  key={company._id}
                                  value={company._id}
                                  className="cursor-pointer py-2.5 text-xs font-semibold"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 p-0.5 flex items-center justify-center shrink-0">
                                      {company.logo ? (
                                        <img
                                          src={company.logo}
                                          alt={company.name}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <Building2 size={12} className="text-[#6A38C2]" />
                                      )}
                                    </div>
                                    <span>{company.name}</span>
                                    {company.location && (
                                      <span className="text-[10px] text-gray-400">
                                        ({company.location})
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-800">
                          <div>
                            <span className="font-bold">No companies found.</span>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                              You must register at least one company before publishing job requisitions.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => navigate("/admin/companies/create")}
                            className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer"
                          >
                            Register Company
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 2. Grid: Job Title & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Job Title */}
                      <div>
                        <Label
                          htmlFor="job-title"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2"
                        >
                          <Briefcase size={14} className="text-[#6A38C2]" />
                          <span>Job Title</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <Input
                          id="job-title"
                          name="title"
                          type="text"
                          placeholder="e.g. Senior Full-Stack Engineer"
                          value={input.title}
                          onChange={changeEventHandler}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                          required
                        />
                      </div>

                      {/* Location / Work Mode */}
                      <div>
                        <Label
                          htmlFor="job-location"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2"
                        >
                          <MapPin size={14} className="text-[#6A38C2]" />
                          <span>Location & Work Mode</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <Input
                          id="job-location"
                          name="location"
                          type="text"
                          placeholder="e.g. Bangalore, India (Hybrid / Remote)"
                          value={input.location}
                          onChange={changeEventHandler}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* 3. Grid: Job Type & Salary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Job Type */}
                      <div>
                        <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                          <Sparkles size={14} className="text-[#6A38C2]" />
                          <span>Employment Type</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <Select
                          value={input.jobType}
                          onValueChange={handleJobTypeSelect}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white text-sm font-medium transition-all">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-purple-100 bg-white shadow-xl">
                            <SelectGroup>
                              <SelectItem value="Full-Time" className="cursor-pointer text-xs font-semibold">
                                Full-Time
                              </SelectItem>
                              <SelectItem value="Part-Time" className="cursor-pointer text-xs font-semibold">
                                Part-Time
                              </SelectItem>
                              <SelectItem value="Internship" className="cursor-pointer text-xs font-semibold">
                                Internship
                              </SelectItem>
                              <SelectItem value="Contract" className="cursor-pointer text-xs font-semibold">
                                Contract
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Annual Salary (LPA) */}
                      <div>
                        <Label
                          htmlFor="job-salary"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2"
                        >
                          <IndianRupee size={14} className="text-[#6A38C2]" />
                          <span>Annual Salary (in LPA)</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <Input
                          id="job-salary"
                          name="salary"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="e.g. 18 (for ₹18 LPA)"
                          value={input.salary}
                          onChange={changeEventHandler}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* 4. Grid: Experience Level & Positions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Experience Level */}
                      <div>
                        <Label
                          htmlFor="job-exp"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2"
                        >
                          <TrendingUp size={14} className="text-[#6A38C2]" />
                          <span>Experience Level (in Years)</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <Input
                          id="job-exp"
                          name="experience"
                          type="number"
                          min="0"
                          placeholder="e.g. 3 (0 for freshers)"
                          value={input.experience}
                          onChange={changeEventHandler}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                          required
                        />
                      </div>

                      {/* Number of Open Positions */}
                      <div>
                        <Label
                          htmlFor="job-positions"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2"
                        >
                          <Users size={14} className="text-[#6A38C2]" />
                          <span>Number of Openings</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <Input
                          id="job-positions"
                          name="position"
                          type="number"
                          min="1"
                          placeholder="e.g. 2"
                          value={input.position}
                          onChange={changeEventHandler}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* 5. Key Skills & Requirements (Interactive Chips) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label
                          htmlFor="job-skills-input"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5"
                        >
                          <Sparkles size={14} className="text-[#6A38C2]" />
                          <span>Key Required Skills</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <span className="text-[11px] text-gray-400">
                          Press Enter or comma to add tag
                        </span>
                      </div>

                      {/* Skill Chips Input Area */}
                      <div className="p-2.5 rounded-2xl border border-purple-100 bg-gray-50/50 focus-within:bg-white focus-within:border-[#6A38C2] focus-within:ring-2 focus-within:ring-[#6A38C2]/20 transition-all flex flex-wrap items-center gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-[#6A38C2] text-xs font-bold border border-purple-200"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}

                        <input
                          id="job-skills-input"
                          type="text"
                          placeholder={
                            skills.length === 0
                              ? "Type skill (e.g. React, Docker, Python) and press Enter..."
                              : "Add another skill..."
                          }
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                          className="flex-1 min-w-[160px] bg-transparent text-sm font-medium outline-none px-2 py-1"
                        />

                        {skillInput.trim() && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddSkill}
                            className="h-8 px-2.5 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-semibold cursor-pointer"
                          >
                            <Plus size={14} className="mr-1" />
                            <span>Add</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 6. Detailed Job Description */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label
                          htmlFor="job-desc"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5"
                        >
                          <FileText size={14} className="text-[#6A38C2]" />
                          <span>Detailed Role Description & Scope</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <span className="text-[11px] text-gray-400">Required</span>
                      </div>
                      <textarea
                        id="job-desc"
                        name="description"
                        rows={5}
                        placeholder="Detail the daily responsibilities, ideal candidate background, mission, perks, and expectations for this role..."
                        value={input.description}
                        onChange={changeEventHandler}
                        className="w-full rounded-2xl border border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium p-4 transition-all outline-none resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* 7. Footer Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-50">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/jobs")}
                        className="w-full sm:w-auto h-12 px-6 rounded-2xl border-purple-200 text-gray-600 hover:bg-purple-50 text-xs font-semibold cursor-pointer"
                      >
                        <ArrowLeft size={15} className="mr-2" />
                        <span>Cancel</span>
                      </Button>

                      <Button
                        type="submit"
                        disabled={loading || !input.title.trim() || !input.companyId}
                        className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-[#6A38C2] via-violet-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            <span>Publishing Requisition...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="mr-2 text-amber-300" />
                            <span>Publish Job Requisition</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostJob;
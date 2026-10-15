import React, { useState, useEffect, useRef } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setSingleCompany, setCompanies } from "@/redux/companySlice";
import Isometric3DCorporateScene from "./Isometric3DCorporateScene";
import {
  Building2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Globe,
  MapPin,
  Upload,
  Image as ImageIcon,
  X,
  ExternalLink,
  Briefcase,
  AlertCircle,
  FileText,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { companies = [] } = useSelector((store) => store.company);

  // Consolidated form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Clean up object URL preview on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview && !filePreview.startsWith("http")) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const processSelectedFile = (selectedFile) => {
    setFileError("");
    if (!selectedFile) return;

    // MIME type validation
    const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validMimes.includes(selectedFile.type)) {
      const errMsg = "Invalid format: Only JPEG, PNG, or WebP images are permitted.";
      setFileError(errMsg);
      toast.error(errMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Size limit validation (5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      const errMsg = "File exceeds limit: Company logo must be smaller than 5 MB.";
      setFileError(errMsg);
      toast.error(errMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Clean up previous preview URL
    if (filePreview && !filePreview.startsWith("http")) {
      URL.revokeObjectURL(filePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setFilePreview(previewUrl);
    toast.success("Logo attached successfully!");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    processSelectedFile(selected);
  };

  const removeSelectedFile = () => {
    if (filePreview && !filePreview.startsWith("http")) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processSelectedFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Company name is required.");
      return;
    }

    try {
      setLoading(true);

      const submissionPayload = new FormData();
      submissionPayload.append("name", formData.name.trim());
      submissionPayload.append("description", formData.description.trim());
      submissionPayload.append("website", formData.website.trim());
      submissionPayload.append("location", formData.location.trim());

      if (file) {
        submissionPayload.append("file", file);
      }

      const res = await axios.post(
        `${COMPANY_API_ENDPOINT}/register`,
        submissionPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        const createdCompany = res.data.company;
        dispatch(setSingleCompany(createdCompany));

        // Immediately update Redux list of companies so recruiter sees it without re-fetching
        if (createdCompany) {
          const updatedCompaniesList = [
            createdCompany,
            ...companies.filter((c) => c._id !== createdCompany._id),
          ];
          dispatch(setCompanies(updatedCompaniesList));
        }

        toast.success(res.data.message || "Company registered successfully!");
        navigate("/admin/companies");
      }
    } catch (error) {
      console.error("Single-step registration error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to register company. Please verify the company name is unique."
      );
    } finally {
      setLoading(false);
    }
  };

  const formattedWebsiteLink = formData.website.trim()
    ? formData.website.startsWith("http://") || formData.website.startsWith("https://")
      ? formData.website.trim()
      : `https://${formData.website.trim()}`
    : null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Breadcrumb & Back Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/companies")}
              className="h-10 px-4 rounded-xl border-purple-200 text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft size={15} className="mr-2" />
              <span>Back to Companies</span>
            </Button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-bold border border-purple-200">
              <Sparkles size={13} className="text-amber-500" />
              <span>Unified Single-Step Registration</span>
            </div>
          </div>

          {/* Main 2-Column Responsive Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: 3D Holographic Scene & Live Entity Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6"
            >
              {/* 3D Scene Container */}
              <div className="relative rounded-3xl bg-gradient-to-b from-[#180A33] via-[#1F0E42] to-[#0E061D] border border-purple-500/30 shadow-[0_25px_60px_-15px_rgba(106,56,194,0.35)] overflow-hidden">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                  <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">
                    Interactive 3D Entity Hub
                  </span>
                </div>

                {/* Live Isometric 3D Corporate Scene */}
                <Isometric3DCorporateScene
                  companyName={formData.name}
                  location={formData.location}
                  website={formData.website}
                  logoPreview={filePreview}
                />
              </div>

              {/* Value Highlights Card */}
              <div className="rounded-3xl bg-white border border-purple-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#6A38C2]" />
                  <span>Enterprise Verification Features</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800">Atomic Registration:</span> Complete name, bio, location, website, and brand logo in one click without multi-step redirects.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800">Cloudinary CDN Delivery:</span> High-resolution branding served with global sub-second latency.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800">Instant Job Linking:</span> Connect active engineering requisitions immediately upon saving.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Consolidated Single-Step Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7 order-1 lg:order-2"
            >
              <div className="rounded-3xl bg-white border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.15)] overflow-hidden">
                {/* Top Accent Gradient Bar */}
                <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-pink-500" />

                <div className="p-6 sm:p-10">
                  {/* Form Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
                      <Building2 size={28} />
                    </div>

                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Register Your Company
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Configure all entity parameters in one step to begin publishing verified positions.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Company Name */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label
                          htmlFor="company-name"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5"
                        >
                          <Building2 size={14} className="text-[#6A38C2]" />
                          <span>Company Name</span>
                          <span className="text-[#6A38C2]">*</span>
                        </Label>
                        <span className="text-[11px] text-gray-400">Required</span>
                      </div>
                      <Input
                        id="company-name"
                        name="name"
                        type="text"
                        placeholder="e.g. Acme Cloud, Stripe, Vercel, DeepMind"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                        required
                      />
                    </div>

                    {/* 2. Company Description / Bio */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label
                          htmlFor="company-desc"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5"
                        >
                          <FileText size={14} className="text-[#6A38C2]" />
                          <span>Company Bio & Mission</span>
                        </Label>
                        <span className="text-[11px] text-gray-400">Optional</span>
                      </div>
                      <textarea
                        id="company-desc"
                        name="description"
                        rows={3}
                        placeholder="Briefly describe your company's mission, engineering culture, tech stack, and what makes working with you unique..."
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium p-3.5 transition-all outline-none resize-none"
                      />
                    </div>

                    {/* 3. Grid: Location & Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Location */}
                      <div>
                        <Label
                          htmlFor="company-location"
                          className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2"
                        >
                          <MapPin size={14} className="text-[#6A38C2]" />
                          <span>Headquarters / Location</span>
                        </Label>
                        <Input
                          id="company-location"
                          name="location"
                          type="text"
                          placeholder="e.g. San Francisco, CA or Remote"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label
                            htmlFor="company-website"
                            className="text-xs font-bold text-gray-700 flex items-center gap-1.5"
                          >
                            <Globe size={14} className="text-[#6A38C2]" />
                            <span>Official Website</span>
                          </Label>
                          {formattedWebsiteLink && (
                            <a
                              href={formattedWebsiteLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#6A38C2] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>Preview</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                        <Input
                          id="company-website"
                          name="website"
                          type="url"
                          placeholder="https://company.com"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="h-12 rounded-2xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    {/* 4. Company Brand Logo (File Upload with Drag-and-Drop) */}
                    <div>
                      <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                        <ImageIcon size={14} className="text-[#6A38C2]" />
                        <span>Company Brand Logo</span>
                        <span className="text-gray-400 font-normal">(JPEG, PNG, WebP up to 5MB)</span>
                      </Label>

                      {/* Hidden native input */}
                      <input
                        ref={fileInputRef}
                        id="company-logo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {/* Upload Area / Dropzone */}
                      {filePreview ? (
                        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-16 h-16 rounded-xl bg-white border border-purple-100 p-1.5 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={filePreview}
                                alt="Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {file?.name || "Uploaded Logo"}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Attached image"}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
                                <CheckCircle2 size={12} />
                                <span>Ready for Cloudinary upload</span>
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeSelectedFile}
                            className="h-9 px-3 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer text-xs font-semibold"
                          >
                            <X size={15} className="mr-1" />
                            <span>Remove</span>
                          </Button>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                            isDragging
                              ? "border-[#6A38C2] bg-purple-100/50 scale-[1.01]"
                              : "border-purple-200 bg-purple-50/30 hover:bg-purple-50/70 hover:border-purple-300"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6A38C2] mx-auto flex items-center justify-center mb-3 shadow-sm">
                            <Upload size={20} />
                          </div>
                          <p className="text-xs font-bold text-gray-800">
                            Click to upload or drag & drop logo
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            PNG, JPG, or WebP (max 5 MB)
                          </p>
                        </div>
                      )}

                      {fileError && (
                        <div className="mt-2 text-xs text-rose-500 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={13} />
                          <span>{fileError}</span>
                        </div>
                      )}
                    </div>

                    {/* 5. Footer Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-50">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/companies")}
                        className="w-full sm:w-auto h-12 px-6 rounded-2xl border-purple-200 text-gray-600 hover:bg-purple-50 text-xs font-semibold cursor-pointer"
                      >
                        <ArrowLeft size={15} className="mr-2" />
                        <span>Cancel</span>
                      </Button>

                      <Button
                        type="submit"
                        disabled={loading || !formData.name.trim()}
                        className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-[#6A38C2] via-violet-600 to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            <span>Saving & Registering...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="mr-2 text-amber-300" />
                            <span>Save & Register Company</span>
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

export default CompanyCreate;
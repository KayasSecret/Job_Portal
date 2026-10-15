import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Globe,
  MapPin,
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import axios from "axios";
import useGetCompanyById from "@/hooks/useGetCompanyById";
import { motion } from "framer-motion";

const CompanySetup = () => {
  const params = useParams();
  useGetCompanyById(params.id);

  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    file: null,
  });

  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const { singleCompany } = useSelector((store) => store.company);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  useEffect(() => {
    if (singleCompany) {
      setInput({
        name: singleCompany.name || "",
        description: singleCompany.description || "",
        website: singleCompany.website || "",
        location: singleCompany.location || "",
        file: null,
      });
      if (singleCompany.logo) {
        setFilePreview(singleCompany.logo);
      }
    }
  }, [singleCompany]);

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const changeFileHandler = (e) => {
    setFileError("");
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate MIME type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      const msg = "Only JPEG, PNG, and WebP images are allowed.";
      setFileError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const msg = "Logo file exceeds 5MB limit.";
      setFileError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (filePreview && !filePreview.startsWith("http")) {
      URL.revokeObjectURL(filePreview);
    }

    setFilePreview(URL.createObjectURL(file));
    setInput({
      ...input,
      file,
    });
  };

  const removeSelectedFile = () => {
    if (filePreview && !filePreview.startsWith("http")) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(singleCompany?.logo || null);
    setFileError("");
    setInput({ ...input, file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.name.trim()) {
      toast.error("Company name cannot be empty.");
      return;
    }

    const formData = new FormData();
    formData.append("name", input.name.trim());
    formData.append("description", input.description || "");
    formData.append("website", input.website || "");
    formData.append("location", input.location || "");

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${COMPANY_API_ENDPOINT}/update/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Company information updated!");
        navigate("/admin/companies");
      }
    } catch (error) {
      console.error("Update company error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update company information."
      );
    } finally {
      setLoading(false);
    }
  };

  const initial = (input.name || singleCompany?.name || "C")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl bg-white border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.18)] overflow-hidden"
          >
            {/* Top Gradient Banner */}
            <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500" />

            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-purple-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
                    <Building2 size={28} />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold mb-1">
                      <Sparkles size={13} />
                      <span>Brand Profile & Details</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      Company Setup
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Configure public logo, headquarters, bio, and official website.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/companies")}
                  className="self-start sm:self-auto h-10 px-4 rounded-xl border-purple-200 text-gray-600 hover:bg-purple-50 text-xs font-semibold"
                >
                  <ArrowLeft size={15} className="mr-1.5" />
                  <span>Back</span>
                </Button>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/40 border border-purple-100 mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {filePreview ? (
                    <div className="w-16 h-16 rounded-2xl p-1 bg-white border-2 border-purple-200 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={filePreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-purple-900/15 shrink-0">
                      {initial}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-extrabold text-lg text-gray-900 truncate">
                      {input.name || singleCompany?.name || "Company Name"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-purple-500" />
                        <span>{input.location || "Location not set"}</span>
                      </span>
                      {input.website && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Globe size={12} />
                          <span className="truncate max-w-[150px]">
                            {input.website.replace(/^https?:\/\//, "")}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-[11px] font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                  Live Preview
                </span>
              </div>

              {/* Form */}
              <form onSubmit={submitHandler} className="space-y-6">
                <div>
                  <Label htmlFor="setup-name" className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Company Name <span className="text-[#6A38C2]">*</span>
                  </Label>
                  <Input
                    id="setup-name"
                    type="text"
                    name="name"
                    value={input.name}
                    onChange={changeEventHandler}
                    placeholder="e.g. Acme Corp"
                    className="h-12 rounded-xl border-purple-100 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="setup-desc" className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Company Description / Bio
                  </Label>
                  <Input
                    id="setup-desc"
                    type="text"
                    name="description"
                    value={input.description}
                    onChange={changeEventHandler}
                    placeholder="Short description of your products, mission, and culture..."
                    className="h-12 rounded-xl border-purple-100 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="setup-web" className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Website URL
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2]">
                        <Globe size={17} />
                      </div>
                      <Input
                        id="setup-web"
                        type="text"
                        name="website"
                        value={input.website}
                        onChange={changeEventHandler}
                        placeholder="https://company.com"
                        className="pl-10 pr-4 h-12 rounded-xl border-purple-100 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="setup-loc" className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Headquarters / Office Location
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2]">
                        <MapPin size={17} />
                      </div>
                      <Input
                        id="setup-loc"
                        type="text"
                        name="location"
                        value={input.location}
                        onChange={changeEventHandler}
                        placeholder="e.g. Bangalore, India"
                        className="pl-10 pr-4 h-12 rounded-xl border-purple-100 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      Company Brand Logo
                    </Label>
                    <span className="text-[11px] text-gray-400">JPEG, PNG, WebP (Max 5MB)</span>
                  </div>

                  {input.file ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-200 bg-white shrink-0 p-1 flex items-center justify-center">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {input.file.name}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {(input.file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer"
                        title="Remove new logo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-purple-200 hover:border-[#6A38C2] bg-purple-50/20 hover:bg-purple-50/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                          <Upload size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">
                            Upload company logo
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Click to select an image from your computer
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#6A38C2] group-hover:underline">
                        Browse
                      </span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={changeFileHandler}
                    className="hidden"
                  />

                  {fileError && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{fileError}</p>
                  )}
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  {loading ? (
                    <Button
                      disabled
                      className="w-full h-12 rounded-2xl bg-[#6A38C2] text-white font-semibold text-sm shadow-md"
                    >
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving Company Changes...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      <span>Save Company Profile</span>
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CompanySetup;
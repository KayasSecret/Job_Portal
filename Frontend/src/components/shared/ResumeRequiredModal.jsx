import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
  Loader2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ResumeRequiredModal = ({
  open,
  setOpen,
  jobTitle = "",
  companyName = "",
  onUploadAndApply,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const validateAndStageFile = (selectedFile) => {
    setErrorMsg("");
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      const msg = "Invalid file type. Please select a PDF document (.pdf).";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const msg = "File size exceeds the 10 MB limit. Please select a smaller file.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndStageFile(selected);
    }
    e.target.value = "";
  };

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
    if (droppedFile) {
      validateAndStageFile(droppedFile);
    }
  };

  const handleUploadAndApply = async () => {
    if (!file) {
      setErrorMsg("Please select a PDF resume before proceeding.");
      toast.error("Please select a PDF resume.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    // Keep existing user fields
    if (user?.fullName) formData.append("fullName", user.fullName);
    if (user?.email) formData.append("email", user.email);
    if (user?.phoneNumber) formData.append("phoneNumber", String(user.phoneNumber));
    if (user?.profile?.bio) formData.append("bio", user.profile.bio);

    try {
      setUploading(true);
      setErrorMsg("");

      const res = await axios.post(
        `${USER_API_ENDPOINT}/profile/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // Update user in Redux immediately
        dispatch(setUser(res.data.user));
        toast.success("Resume uploaded and attached to your profile!");

        setOpen(false);
        setFile(null);

        // If an onUploadAndApply callback is provided, invoke it immediately
        if (onUploadAndApply) {
          onUploadAndApply();
        }
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to upload resume. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setOpen(false);
    setFile(null);
    setErrorMsg("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[480px] rounded-3xl border border-purple-100 shadow-[0_25px_70px_rgba(106,56,194,0.25)] p-0 overflow-hidden bg-white"
        onInteractOutside={() => !uploading && handleClose()}
      >
        {/* Top Gradient Banner Bar */}
        <div className="h-2.5 bg-gradient-to-r from-[#6A38C2] via-fuchsia-500 to-cyan-500" />

        <div className="p-6 sm:p-8">
          <DialogHeader className="text-center sm:text-center">
            {/* Animated Icon Box */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6A38C2] via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/25 mb-4">
              <FileText size={30} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold mx-auto mb-2">
              <Sparkles size={12} className="text-amber-500" />
              <span>Verified Application Gateway</span>
            </div>

            <DialogTitle className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Resume Required to Apply
            </DialogTitle>

            <DialogDescription className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              Upload your resume to showcase your skills and experience before applying
              {jobTitle ? (
                <>
                  {" "}
                  for <span className="font-semibold text-gray-800">{jobTitle}</span>
                  {companyName && <> at <span className="font-semibold text-[#6A38C2]">{companyName}</span></>}
                </>
              ) : (
                " for this position"
              )}.
            </DialogDescription>
          </DialogHeader>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Upload Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`mt-5 p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
              isDragging
                ? "border-[#6A38C2] bg-purple-50/80 scale-[1.01]"
                : file
                ? "border-emerald-300 bg-emerald-50/30"
                : "border-purple-200/90 bg-purple-50/30 hover:border-purple-300 hover:bg-purple-50/60"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-xs">
                  <FileCheck size={26} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 truncate max-w-[280px]">
                  {file.name}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                </p>
                <span className="mt-2 text-[11px] font-semibold text-[#6A38C2] hover:underline inline-block">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center mb-2 shadow-xs">
                  <Upload size={22} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-800">
                  Click to choose PDF or drag & drop here
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  PDF documents up to 10 MB accepted
                </p>
              </div>
            )}
          </div>

          {/* Security & Benefits Note */}
          <div className="mt-4 p-3 rounded-xl bg-purple-50/50 border border-purple-100/80 flex items-center gap-2.5 text-[11px] text-gray-600">
            <ShieldCheck size={16} className="text-[#6A38C2] shrink-0" />
            <span>
              Your resume is saved securely to your profile and shared directly with verified hiring recruiters.
            </span>
          </div>

          {/* Dialog Action Buttons */}
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={handleClose}
              className="w-full sm:w-1/2 h-11 rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Not Now
            </Button>

            <Button
              type="button"
              disabled={uploading || !file}
              onClick={handleUploadAndApply}
              className="w-full sm:w-1/2 h-11 rounded-2xl bg-gradient-to-r from-[#6A38C2] via-purple-600 to-indigo-600 hover:from-[#5B21B6] hover:to-[#4C1D95] text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Uploading & Applying...</span>
                </>
              ) : (
                <>
                  <span>Upload & Apply</span>
                  <ArrowRight size={14} className="ml-1.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeRequiredModal;

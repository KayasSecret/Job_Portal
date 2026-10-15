import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Loader2,
  User,
  Mail,
  Phone,
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    skills: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  // Sync inputs whenever the dialog opens or user state updates
  useEffect(() => {
    if (user && open) {
      setInput({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills ? user.profile.skills.join(", ") : "",
        file: null,
      });
    }
  }, [user, open]);

  const changeEventHandler = (e) => {
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF document for your resume.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size cannot exceed 10 MB.");
        return;
      }
      setInput((prev) => ({ ...prev, file }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    if (!input.email.trim()) {
      toast.error("Email address cannot be empty.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", input.fullName.trim());
    formData.append("email", input.email.trim());
    formData.append("phoneNumber", input.phoneNumber ? String(input.phoneNumber).trim() : "");
    formData.append("bio", input.bio.trim());
    formData.append("skills", input.skills.trim());

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_ENDPOINT}/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message || "Profile updated successfully!");
        setOpen(false);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[500px] rounded-3xl border border-purple-100 shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col"
        onInteractOutside={() => !loading && setOpen(false)}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-pink-500" />

        <div className="p-6 sm:p-7 overflow-y-auto">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold mb-2 self-start">
              <Sparkles size={13} />
              <span>Candidate Settings</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Candidate Profile
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Update your personal details, skills tags, and resume for recruiters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <User size={14} className="text-[#6A38C2]" />
                <span>Full Name</span>
              </Label>
              <Input
                name="fullName"
                type="text"
                value={input.fullName}
                onChange={changeEventHandler}
                placeholder="e.g. Alex Morgan"
                required
                className="h-10 rounded-xl bg-purple-50/40 border border-purple-100 focus:border-purple-300 text-xs sm:text-sm"
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Mail size={14} className="text-[#6A38C2]" />
                  <span>Email</span>
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={input.email}
                  onChange={changeEventHandler}
                  placeholder="alex@domain.com"
                  required
                  className="h-10 rounded-xl bg-purple-50/40 border border-purple-100 focus:border-purple-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Phone size={14} className="text-[#6A38C2]" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={input.phoneNumber}
                  onChange={changeEventHandler}
                  placeholder="+1 555 0192"
                  className="h-10 rounded-xl bg-purple-50/40 border border-purple-100 focus:border-purple-300 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Headline / Bio */}
            <div>
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <FileText size={14} className="text-[#6A38C2]" />
                <span>Bio / Professional Headline</span>
              </Label>
              <textarea
                name="bio"
                rows={3}
                value={input.bio}
                onChange={changeEventHandler}
                placeholder="Write a brief career summary or objective..."
                className="w-full p-3 rounded-xl bg-purple-50/40 border border-purple-100 focus:border-purple-300 outline-none text-xs sm:text-sm text-gray-800 resize-none transition-all"
              />
            </div>

            {/* Technical Skills */}
            <div>
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Sparkles size={14} className="text-[#6A38C2]" />
                <span>Technical Skills (Comma separated)</span>
              </Label>
              <Input
                name="skills"
                type="text"
                value={input.skills}
                onChange={changeEventHandler}
                placeholder="React, TypeScript, Node.js, Python, Tailwind"
                className="h-10 rounded-xl bg-purple-50/40 border border-purple-100 focus:border-purple-300 text-xs sm:text-sm"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Separate skills with commas (e.g. React, Node.js, AWS)
              </p>
            </div>

            {/* Resume Upload */}
            <div>
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Upload size={14} className="text-[#6A38C2]" />
                <span>Upload New Resume (PDF only, max 10 MB)</span>
              </Label>
              <div className="relative">
                <input
                  id="resume-file"
                  type="file"
                  accept="application/pdf"
                  onChange={fileChangeHandler}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-[#6A38C2] hover:file:bg-purple-200 cursor-pointer border border-purple-100 rounded-xl p-1 bg-purple-50/30"
                />
              </div>
              {input.file && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Selected: {input.file.name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-3 gap-2 flex flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white font-semibold text-xs shadow-md shadow-purple-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
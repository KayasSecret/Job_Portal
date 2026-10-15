import React, { useState, useEffect } from "react";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, User, Mail, Phone, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";

const UpdateRecruiterProfileDialog = ({ open, setOpen }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "",
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
      });
    }
  }, [user, open]);

  const changeEventHandler = (e) => {
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", input.fullName.trim());
      formData.append("email", input.email.trim());
      formData.append("phoneNumber", input.phoneNumber.trim());
      formData.append("bio", input.bio.trim());

      const res = await axios.post(
        `${USER_API_ENDPOINT}/profile/update`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message || "Recruiter profile updated successfully!");
        setOpen(false);
      }
    } catch (error) {
      console.error("Recruiter profile update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update recruiter profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[480px] p-0 rounded-3xl border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.25)] bg-white overflow-hidden"
        onInteractOutside={() => setOpen(false)}
      >
        {/* Accent Banner */}
        <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500" />

        <div className="p-6 sm:p-7">
          <DialogHeader className="mb-5 text-left">
            <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <User size={20} className="text-[#6A38C2]" />
              <span>Edit Recruiter Profile</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Update your corporate contact details, name, and recruiting bio visible to applicants.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label
                htmlFor="recruiter-name"
                className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5"
              >
                <User size={13} className="text-[#6A38C2]" />
                <span>Full Name</span>
                <span className="text-[#6A38C2]">*</span>
              </Label>
              <Input
                id="recruiter-name"
                name="fullName"
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={input.fullName}
                onChange={changeEventHandler}
                className="h-11 rounded-xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <Label
                htmlFor="recruiter-email"
                className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5"
              >
                <Mail size={13} className="text-[#6A38C2]" />
                <span>Email Address</span>
                <span className="text-[#6A38C2]">*</span>
              </Label>
              <Input
                id="recruiter-email"
                name="email"
                type="email"
                placeholder="e.g. sarah@enterprise.com"
                value={input.email}
                onChange={changeEventHandler}
                className="h-11 rounded-xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label
                htmlFor="recruiter-phone"
                className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5"
              >
                <Phone size={13} className="text-[#6A38C2]" />
                <span>Contact Phone</span>
              </Label>
              <Input
                id="recruiter-phone"
                name="phoneNumber"
                type="tel"
                placeholder="e.g. +1 (555) 234-5678"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="h-11 rounded-xl border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium transition-all"
              />
            </div>

            {/* Bio / Headline */}
            <div>
              <Label
                htmlFor="recruiter-bio"
                className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5"
              >
                <FileText size={13} className="text-[#6A38C2]" />
                <span>Recruiter Headline & Bio</span>
              </Label>
              <textarea
                id="recruiter-bio"
                name="bio"
                rows={3}
                placeholder="Lead Talent Acquisition Partner hiring elite software engineers..."
                value={input.bio}
                onChange={changeEventHandler}
                className="w-full rounded-xl border border-purple-100 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 text-sm font-medium p-3 transition-all outline-none resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-purple-50 flex flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 px-4 rounded-xl border-purple-200 text-gray-600 hover:bg-purple-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-xs shadow-md shadow-purple-600/25 cursor-pointer disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="mr-1.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRecruiterProfileDialog;

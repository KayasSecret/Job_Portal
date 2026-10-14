import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "../../utils/constant";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/authSlice";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import HireNestAuthBrandPanel from "./HireNestAuthBrandPanel";

const Signup = () => {
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "student",
    file: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const changeFileHandler = (e) => {
    setFileError("");
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate MIME type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Only JPEG, PNG, and WebP images are allowed.");
      toast.error("Invalid image format. Please select a JPEG, PNG, or WebP photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size exceeds 5MB limit.");
      toast.error("Image size must be 5MB or less.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    setFilePreview(URL.createObjectURL(file));
    setInput({
      ...input,
      file,
    });
  };

  const removeSelectedFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setFileError("");
    setInput({ ...input, file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!input.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!input.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!input.phoneNumber.toString().trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!input.password) {
      toast.error("Please enter a password.");
      return;
    }
    if (input.password.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", input.fullName.trim());
    formData.append("email", input.email.trim());
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Account created successfully! Please log in.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Password strength hint (purely decorative & lightweight)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(input.password);

  return (
    <>
      <Navbar />

      <div className="relative min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/40 overflow-hidden">
        {/* Subtle Ambient Background Gradients & Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 left-1/4 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-violet-200/30 blur-3xl"
        />

        {/* Main Split-Screen Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-5xl rounded-3xl bg-white border border-purple-100 shadow-[0_20px_60px_-15px_rgba(106,56,194,0.18)] overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Left Hero & Ambient Branding Panel */}
          <HireNestAuthBrandPanel mode="signup" />

          {/* Right Form Panel */}
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-12 xl:p-14 bg-white">
            {/* Mobile Header Accent */}
            <div className="lg:hidden mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold">
                <Sparkles size={13} />
                <span>HireNest Registration</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
                Join thousands of verified candidates and recruiters on HireNest.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submitHandler} noValidate>
              {/* Role Toggle Selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    I am joining as a
                  </Label>
                  <span className="text-[11px] font-medium text-purple-600">
                    {input.role === "student" ? "Job Seeker" : "Talent Recruiter"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-purple-50/80 border border-purple-100">
                  <button
                    type="button"
                    onClick={() => setInput({ ...input, role: "student" })}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      input.role === "student"
                        ? "bg-white text-[#6A38C2] shadow-sm shadow-purple-900/10 border border-purple-200/80"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <GraduationCap
                      size={16}
                      className={input.role === "student" ? "text-[#6A38C2]" : "text-gray-400"}
                    />
                    <span>Student / Seeker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInput({ ...input, role: "recruiter" })}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      input.role === "recruiter"
                        ? "bg-white text-[#6A38C2] shadow-sm shadow-purple-900/10 border border-purple-200/80"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Briefcase
                      size={16}
                      className={input.role === "recruiter" ? "text-[#6A38C2]" : "text-gray-400"}
                    />
                    <span>Recruiter</span>
                  </button>
                </div>
              </div>

              {/* Full Name & Phone Number (2-column on tablet+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="signup-name" className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Full Name <span className="text-purple-600">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2] transition-colors">
                      <User size={17} />
                    </div>
                    <Input
                      id="signup-name"
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      value={input.fullName}
                      onChange={changeEventHandler}
                      placeholder="e.g. Alex Johnson"
                      className="pl-10 pr-3 h-11 rounded-xl border-gray-200 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-phone" className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Phone Number <span className="text-purple-600">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2] transition-colors">
                      <Phone size={17} />
                    </div>
                    <Input
                      id="signup-phone"
                      type="tel"
                      name="phoneNumber"
                      autoComplete="tel"
                      value={input.phoneNumber}
                      onChange={changeEventHandler}
                      placeholder="e.g. 9876543210"
                      className="pl-10 pr-3 h-11 rounded-xl border-gray-200 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="mb-4">
                <Label htmlFor="signup-email" className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Email Address <span className="text-purple-600">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2] transition-colors">
                    <Mail size={17} />
                  </div>
                  <Input
                    id="signup-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    placeholder="you@example.com"
                    className="pl-10 pr-4 h-11 rounded-xl border-gray-200 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle & Strength Indicator */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-semibold text-gray-700">
                    Password <span className="text-purple-600">*</span>
                  </Label>
                  <span className="text-[11px] text-gray-400">Min. 6 characters</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2] transition-colors">
                    <Lock size={17} />
                  </div>
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    value={input.password}
                    onChange={changeEventHandler}
                    placeholder="Create a strong password"
                    className="pl-10 pr-11 h-11 rounded-xl border-gray-200 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Lightweight strength bar */}
                {input.password && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden flex gap-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength >= 1 ? (strength <= 2 ? "bg-amber-400 w-1/3" : strength === 3 ? "bg-blue-400 w-2/3" : "bg-emerald-500 w-full") : "w-0"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 capitalize">
                      {strength <= 1 ? "Weak" : strength <= 3 ? "Good" : "Strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Photo Upload Card */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Profile Photo <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <span className="text-[11px] text-gray-400">JPEG, PNG, WebP (Max 5MB)</span>
                </div>

                {filePreview ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-purple-200 bg-purple-50/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#6A38C2] shadow-sm shrink-0 bg-white">
                        <img
                          src={filePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">
                          {input.file?.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {(input.file?.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-dashed border-purple-200 hover:border-[#6A38C2] bg-purple-50/30 hover:bg-purple-50/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-800">
                          Upload profile avatar
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Click to browse image from device
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
                  id="signup-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={changeFileHandler}
                  className="hidden"
                />

                {fileError && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{fileError}</p>
                )}
              </div>

              {/* Submit Button */}
              {loading ? (
                <Button
                  disabled
                  className="w-full h-12 rounded-xl bg-[#6A38C2] text-white shadow-lg shadow-purple-600/25 font-semibold text-sm cursor-not-allowed opacity-90"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Your Account...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all duration-200 group cursor-pointer"
                >
                  <span>Complete Registration</span>
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              )}

              {/* Bottom Navigation */}
              <div className="mt-7 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <span>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#6A38C2] hover:text-[#5B21B6] hover:underline ml-1"
                  >
                    Sign in here
                  </Link>
                </span>

                <div className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <ShieldCheck size={14} />
                  <span>Secure Account Creation</span>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;
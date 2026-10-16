import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "../../utils/constant";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../../redux/authSlice";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import HireNestAuthBrandPanel from "./HireNestAuthBrandPanel";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { loading, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      navigate(user.role === "recruiter" ? "/admin/companies" : "/", { replace: true });
    }
  }, [user, navigate]);

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password) {
      toast.error("Please fill in both your email and password.");
      return;
    }

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_ENDPOINT}/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));

        if (res.data.user.role === "recruiter") {
          navigate("/admin/companies");
        } else {
          navigate("/");
        }

        toast.success(res.data.message || `Welcome back, ${res.data.user.fullName}!`);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

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
          <HireNestAuthBrandPanel mode="login" />

          {/* Right Form Panel */}
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-12 xl:p-14 bg-white">
            {/* Mobile Header Accent */}
            <div className="lg:hidden mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#6A38C2] text-xs font-semibold">
                <Sparkles size={13} />
                <span>HireNest Authentication</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
                Sign in to manage your applications, profile, or job postings.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submitHandler} noValidate>
              {/* Role Toggle Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Signing in as
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

              {/* Email Input */}
              <div className="mb-5">
                <Label htmlFor="login-email" className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2] transition-colors">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    placeholder="you@example.com"
                    className="pl-10 pr-4 h-12 rounded-xl border-gray-200 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <Label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  <span className="text-[11px] text-gray-400">Case-sensitive</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A38C2] transition-colors">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={input.password}
                    onChange={changeEventHandler}
                    placeholder="Enter your password"
                    className="pl-10 pr-11 h-12 rounded-xl border-gray-200 bg-gray-50/40 hover:bg-white focus:bg-white focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              {loading ? (
                <Button
                  disabled
                  className="w-full h-12 rounded-xl bg-[#6A38C2] text-white shadow-lg shadow-purple-600/25 font-semibold text-sm cursor-not-allowed opacity-90"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 transition-all duration-200 group cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              )}

              {/* Bottom Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <span>
                  Don't have an account yet?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-[#6A38C2] hover:text-[#5B21B6] hover:underline ml-1"
                  >
                    Create account
                  </Link>
                </span>

                <div className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <ShieldCheck size={14} />
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
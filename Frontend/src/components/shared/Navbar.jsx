import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User2,
  Menu,
  X,
  Briefcase,
  Building2,
  Bookmark,
  Calendar,
  Compass,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Users,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";
import Logo from "../../assets/Logo_Org.png";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public";

function Navbar() {
  const { user } = useSelector((store) => store.auth) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Track scroll position to adjust navbar backdrop glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_ENDPOINT}/logout`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message || "Logged out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const isRecruiter = user?.role === "recruiter";

  // Navigation Links Definition
  const studentNavLinks = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Jobs", path: "/jobs", icon: Briefcase },
    { name: "Browse", path: "/browse", icon: Compass },
    { name: "Saved Jobs", path: "/savedjobs", icon: Bookmark },
    { name: "Events", path: "/events", icon: Calendar },
  ];

  const recruiterNavLinks = [
    { name: "Companies", path: "/admin/companies", icon: Building2 },
    { name: "Jobs", path: "/admin/jobs", icon: Briefcase },
    { name: "Applicants", path: "/admin/applicants", icon: Users },
  ];

  const navLinks = isRecruiter ? recruiterNavLinks : studentNavLinks;

  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/admin/applicants" && location.pathname.includes("/applicants")) {
      return true;
    }
    if (path === "/admin/jobs" && location.pathname.includes("/applicants")) {
      return false;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-purple-100/80 shadow-[0_4px_24px_-4px_rgba(106,56,194,0.08)] py-2"
          : "bg-white/95 backdrop-blur-md border-b border-purple-50 py-3"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* BRAND LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none select-none"
            aria-label="HireNest Home"
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-100 via-white to-purple-50 p-1 border border-purple-200/70 shadow-sm flex items-center justify-center overflow-hidden"
            >
              <img
                src={Logo}
                alt="HireNest Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </motion.div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#C026D3] bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
                HIRE<span className="text-[#6A38C2] ml-0.5 font-extrabold">NEST</span>
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 -mt-1 hidden sm:block">
                Careers & Talent
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION PILL (Floating segmented indicator) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-purple-50/70 border border-purple-100/90 backdrop-blur-md shadow-inner shadow-purple-900/[0.02]"
          >
            {navLinks.map((link) => {
              const active = isActiveRoute(link.path);
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-1.5 text-xs lg:text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-1.5 ${
                    active ? "text-[#6A38C2]" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`transition-colors ${
                      active ? "text-[#6A38C2]" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{link.name}</span>

                  {/* Active Animated Floating Background Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(106,56,194,0.12)] border border-purple-200/60 -z-10"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE: AUTHENTICATION / USER PROFILE */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 text-xs font-semibold text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50 rounded-xl transition-all"
                  >
                    Login
                  </Button>
                </Link>

                <Link to="/signup">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button className="h-10 px-5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white shadow-md shadow-purple-600/25 hover:shadow-purple-600/35 transition-all">
                      <span>Get Started</span>
                      <ArrowRight size={13} className="ml-1.5" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="relative p-0.5 rounded-full border-2 border-purple-200/90 hover:border-[#6A38C2] focus:outline-none focus:ring-2 focus:ring-[#6A38C2]/30 transition-all cursor-pointer shadow-sm group"
                    aria-label="Open User Account Menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.profile?.profilePhoto || DEFAULT_AVATAR}
                        alt={user?.fullName || "User Profile"}
                        className="object-cover"
                      />
                    </Avatar>
                    {/* Active Status Dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </motion.button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className="w-80 p-0 rounded-3xl border border-purple-100 shadow-[0_20px_50px_-15px_rgba(106,56,194,0.2)] bg-white overflow-hidden"
                >
                  {/* Popover Gradient Top Banner */}
                  <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500" />

                  <div className="p-5">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-purple-50">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-purple-100 shadow-sm">
                          <AvatarImage
                            src={user?.profile?.profilePhoto || DEFAULT_AVATAR}
                            alt={user?.fullName || "User Profile"}
                            className="object-cover"
                          />
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-purple-100 text-[#6A38C2] text-[9px] font-bold border border-white uppercase">
                          {user?.role}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-sm text-gray-900 truncate">
                          {user?.fullName}
                        </h2>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Popover Actions */}
                    <div className="mt-3 space-y-1">
                      <Link
                        to={user?.role === "recruiter" ? "/admin/profile" : "/profile"}
                        className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50/80 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#6A38C2] flex items-center justify-center group-hover:scale-105 transition-transform">
                            <User2 size={14} />
                          </div>
                          <span>View Profile</span>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={logoutHandler}
                        className="flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/80 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <LogOut size={14} />
                          </div>
                          <span>Logout</span>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-red-300 group-hover:translate-x-0.5 transition-transform"
                        />
                      </button>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <ShieldCheck size={13} />
                        <span>Authenticated Session</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-semibold">HireNest</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* MOBILE MENU TOGGLE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50 border border-purple-100 transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE EXPANDABLE MENU (Animated Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-purple-100 bg-white/98 backdrop-blur-2xl shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 space-y-2">
              {/* Role Indicator Banner */}
              {user && (
                <div className="flex items-center justify-between p-3 mb-2 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 border border-purple-200">
                      <AvatarImage
                        src={user?.profile?.profilePhoto || DEFAULT_AVATAR}
                        alt={user?.fullName}
                        className="object-cover"
                      />
                    </Avatar>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{user?.fullName}</div>
                      <div className="text-[10px] text-purple-600 font-semibold uppercase">
                        {user?.role} Account
                      </div>
                    </div>
                  </div>
                  <Sparkles size={14} className="text-[#6A38C2]" />
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const active = isActiveRoute(link.path);
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-purple-100/70 text-[#6A38C2] border border-purple-200/80 shadow-xs"
                          : "text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={active ? "text-[#6A38C2]" : "text-gray-400"}
                        />
                        <span>{link.name}</span>
                      </div>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#6A38C2]" />}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Auth Actions */}
              {!user ? (
                <div className="pt-3 mt-2 border-t border-purple-50 grid grid-cols-2 gap-2">
                  <Link to="/login" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full h-10 rounded-xl border-purple-200 text-xs font-semibold hover:bg-purple-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button className="w-full h-10 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-purple-50 space-y-1">
                  <Link
                    to={user?.role === "recruiter" ? "/admin/profile" : "/profile"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] transition-colors"
                  >
                    <User2 size={16} className="text-[#6A38C2]" />
                    <span>View Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={logoutHandler}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
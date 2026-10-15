import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { BriefcaseBusiness } from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "Jobs", path: "/jobs" },
  { label: "Saved Jobs", path: "/savedjobs" },
  { label: "Tech Events", path: "/events" },
];

const CATEGORIES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Science",
  "UI / UX Design",
  "DevOps Engineer",
];

const RESOURCES = [
  "Resume Builder",
  "Interview Preparation",
  "Career Roadmap",
  "Salary Insights",
  "Help Center",
  "Privacy Policy",
];

const SOCIAL_LINKS = [
  {
    icon: FaLinkedinIn,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: FaGithub,
    href: "https://github.com",
    label: "GitHub",
  },
  {
    icon: FaTwitter,
    href: "https://twitter.com",
    label: "Twitter",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: FaFacebookF,
    href: "https://facebook.com",
    label: "Facebook",
  },
];

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCategorySearch = (cat) => {
    dispatch(setSearchedQuery(cat));
    navigate("/jobs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#090610] text-[#B8AEC9] border-t border-[#261545]/80 overflow-hidden z-10">
      {/* Top Hairline Glowing Gradient Accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent pointer-events-none"
      />

      {/* Subtle Ambient Violet & Purple Lighting Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-20 w-[460px] h-[460px] rounded-full bg-[#8B5CF6]/12 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 w-[440px] h-[380px] rounded-full bg-[#A855F7]/10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] rounded-full bg-[#160B26]/60 blur-[100px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-10">
        {/* Main Grid: Brand Column + Navigation + Categories + Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 pb-12 border-b border-[#261545]/70">
          {/* Brand Info Column */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              onClick={scrollToTop}
              className="inline-flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white shadow-lg shadow-purple-900/40 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(139,92,246,0.6)] transition-all duration-300">
                <BriefcaseBusiness size={22} className="text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-purple-200 group-hover:to-[#A855F7] transition-all">
                  Hire Nest
                </span>
                <p className="text-[11px] text-[#A855F7] font-semibold tracking-wider uppercase mt-0.5">
                  AI-Powered Recruitment Engine
                </p>
              </div>
            </Link>

            <p className="mt-4 text-xs sm:text-sm text-[#B8AEC9] leading-relaxed max-w-sm">
              Connecting verified candidates with industry-leading employers. Streamlined applications, transparent hiring stages, and intelligent skill matching.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((soc) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={soc.label}
                    className="w-10 h-10 rounded-xl bg-[#160B26] border border-[#261545] text-[#B8AEC9] hover:text-white hover:bg-[#8B5CF6] hover:border-[#8B5CF6] hover:shadow-[0_0_18px_rgba(139,92,246,0.55)] hover:-translate-y-1 flex items-center justify-center transition-all duration-300 shadow-sm text-sm cursor-pointer"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 1: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="relative py-0.5 text-xs sm:text-sm text-[#B8AEC9] hover:text-white transition-colors duration-200 group inline-block font-medium cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] group-hover:w-full transition-all duration-300 rounded-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => handleCategorySearch(cat)}
                    className="relative py-0.5 text-xs sm:text-sm text-[#B8AEC9] hover:text-white transition-colors duration-200 group inline-block font-medium text-left cursor-pointer"
                  >
                    <span>{cat}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] group-hover:w-full transition-all duration-300 rounded-full" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {RESOURCES.map((item) => (
                <li key={item}>
                  <Link
                    to="/jobs"
                    onClick={scrollToTop}
                    className="relative py-0.5 text-xs sm:text-sm text-[#B8AEC9] hover:text-white transition-colors duration-200 group inline-block font-medium cursor-pointer"
                  >
                    <span>{item}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] group-hover:w-full transition-all duration-300 rounded-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Verified Trust */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8AEC9]">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© {new Date().getFullYear()} HireNest Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="relative py-0.5 hover:text-white transition-colors cursor-pointer group">
              Privacy Policy
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#8B5CF6] group-hover:w-full transition-all duration-300 rounded-full" />
            </span>
            <span className="relative py-0.5 hover:text-white transition-colors cursor-pointer group">
              Terms of Service
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#8B5CF6] group-hover:w-full transition-all duration-300 rounded-full" />
            </span>
            <span className="relative py-0.5 hover:text-white transition-colors cursor-pointer group">
              Security
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#8B5CF6] group-hover:w-full transition-all duration-300 rounded-full" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
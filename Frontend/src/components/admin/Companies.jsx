import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import { useDispatch, useSelector } from "react-redux";
import { setSearchCompanyByText } from "@/redux/companySlice";
import {
  Search,
  Building2,
  Plus,
  Sparkles,
  Briefcase,
  LayoutGrid,
  Table as TableIcon,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const Companies = () => {
  // Fetch recruiter's registered companies and posted jobs
  useGetAllCompanies();
  useGetAllAdminJobs();

  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { companies = [] } = useSelector((store) => store.company);
  const { allAdminJobs = [] } = useSelector((store) => store.job);

  // Sync search input to Redux store
  useEffect(() => {
    dispatch(setSearchCompanyByText(searchInput));
  }, [searchInput, dispatch]);

  // Aggregate statistics for dashboard metrics
  const totalCompaniesCount = companies?.length || 0;
  const totalActiveJobsCount = allAdminJobs?.length || 0;
  const companiesWithLogos = useMemo(() => {
    return companies?.filter((c) => Boolean(c?.logo))?.length || 0;
  }, [companies]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 py-8 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ================= HERO DASHBOARD BANNER ================= */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative rounded-3xl p-6 sm:p-10 md:p-12 mb-10 overflow-hidden bg-gradient-to-br from-[#1E0E3E] via-[#2E1065] to-[#4C1D95] text-white shadow-2xl"
          >
            {/* Ambient Lighting Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#8B5CF6]/30 blur-3xl animate-pulse"
              style={{ animationDuration: "8s" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EC4899]/25 blur-3xl animate-pulse"
              style={{ animationDuration: "10s" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-4 shadow-sm">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>Recruiter Brand Command Center</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Company{" "}
                  <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                    Management
                  </span>
                </h1>

                <p className="mt-3 text-sm sm:text-base text-purple-100/80 leading-relaxed max-w-xl">
                  Register, brand, and organize your recruitment entities. Seamlessly attach verified companies to job postings and applicant pipelines.
                </p>
              </div>

              {/* Action Button: Create Company */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                <Button
                  onClick={() => navigate("/admin/companies/create")}
                  className="h-12 px-6 rounded-2xl bg-white hover:bg-purple-50 text-[#4C1D95] font-bold text-sm shadow-xl shadow-purple-950/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={18} className="text-[#6A38C2]" />
                  <span>Register New Company</span>
                </Button>
              </motion.div>
            </div>

            {/* Quick Live Stats Row inside Hero */}
            <div className="relative z-10 mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {totalCompaniesCount}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Building2 size={13} className="text-purple-300" />
                  <span>Total Entities</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {totalActiveJobsCount}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-pink-300" />
                  <span>Active Requisitions</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {companiesWithLogos}
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Branded Profiles</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  100%
                </div>
                <div className="text-[11px] font-semibold text-purple-200/70 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Recruiter Verified</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= CONTROLS: SEARCH & VIEW SWITCHER ================= */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search registered companies by name or location..."
                className="w-full h-12 pl-10 pr-9 rounded-2xl bg-white border border-purple-100/90 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6A38C2] focus:ring-2 focus:ring-[#6A38C2]/20 shadow-xs transition-all"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* View Switcher Toggle (Cards vs Table) */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="p-1 rounded-2xl bg-white border border-purple-100/90 shadow-xs flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-purple-100 text-[#6A38C2] shadow-2xs"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid size={15} />
                  <span className="hidden md:inline">Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-purple-100 text-[#6A38C2] shadow-2xs"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  title="High-Density Table View"
                >
                  <TableIcon size={15} />
                  <span className="hidden md:inline">Table</span>
                </button>
              </div>

              <Button
                onClick={() => navigate("/admin/companies/create")}
                className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-semibold text-xs shadow-md shadow-purple-600/25 sm:hidden"
              >
                <Plus size={16} className="mr-1" />
                <span>New</span>
              </Button>
            </div>
          </div>

          {/* ================= COMPANIES LIST / CARDS VIEW ================= */}
          <CompaniesTable viewMode={viewMode} />
        </div>
      </div>
    </>
  );
};

export default Companies;
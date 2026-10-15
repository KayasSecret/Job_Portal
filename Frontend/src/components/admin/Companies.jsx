import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import RecruiterHero from "./RecruiterHero";
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

      <div className="min-h-screen bg-transparent py-8 sm:py-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ================= HERO DASHBOARD BANNER ================= */}
          <RecruiterHero
            badgeText="Recruiter Brand Command Center"
            title={
              <>
                Company{" "}
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  Management
                </span>
              </>
            }
            description="Register, brand, and organize your recruitment entities. Seamlessly attach verified companies to job postings and applicant pipelines."
            action={
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate("/admin/companies/create")}
                  className="h-9 px-4 rounded-xl bg-white hover:bg-purple-50 text-[#4C1D95] font-bold text-xs shadow-md shadow-purple-950/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} className="text-[#6A38C2]" />
                  <span>Register New Company</span>
                </Button>
              </motion.div>
            }
            stats={[
              {
                value: totalCompaniesCount,
                label: "Total Entities",
                icon: Building2,
                iconColor: "text-purple-300",
              },
              {
                value: totalActiveJobsCount,
                label: "Active Requisitions",
                icon: Briefcase,
                iconColor: "text-pink-300",
              },
              {
                value: companiesWithLogos,
                label: "Branded Profiles",
                icon: Sparkles,
                iconColor: "text-amber-300",
              },
              {
                value: "100%",
                label: "Recruiter Verified",
                icon: ShieldCheck,
                iconColor: "text-emerald-400",
              },
            ]}
          />

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
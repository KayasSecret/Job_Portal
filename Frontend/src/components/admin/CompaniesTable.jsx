import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  Edit3,
  ExternalLink,
  Briefcase,
  Search,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const CompaniesTable = ({ viewMode = "cards" }) => {
  const { companies, searchCompanyByText } = useSelector(
    (store) => store.company
  );
  const { allAdminJobs = [] } = useSelector((store) => store.job);
  const navigate = useNavigate();

  // Compute job counts per company for rich recruiter insights
  const jobCountsByCompanyId = useMemo(() => {
    const map = {};
    if (Array.isArray(allAdminJobs)) {
      allAdminJobs.forEach((job) => {
        const cId =
          typeof job?.company === "object"
            ? job?.company?._id?.toString()
            : job?.company?.toString();
        if (cId) {
          map[cId] = (map[cId] || 0) + 1;
        }
      });
    }
    return map;
  }, [allAdminJobs]);

  const [filterCompany, setFilterCompany] = useState(companies || []);

  useEffect(() => {
    const filtered =
      companies?.filter((company) => {
        if (!searchCompanyByText) return true;
        const q = searchCompanyByText.toLowerCase();
        return (
          company?.name?.toLowerCase().includes(q) ||
          company?.location?.toLowerCase().includes(q) ||
          company?.website?.toLowerCase().includes(q)
        );
      }) || [];

    setFilterCompany(filtered);
  }, [companies, searchCompanyByText]);

  const formatDate = (isoString) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString.split("T")[0] || "Recently";
    }
  };

  // If no companies registered at all or matching query
  if (!companies || companies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl p-12 sm:p-16 text-center bg-white/90 backdrop-blur-xl border border-dashed border-purple-200 shadow-sm"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-100 to-pink-100 text-[#6A38C2] flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Building2 size={36} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          No Registered Companies Yet
        </h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          Add your enterprise or startup brand profile before posting open requisitions to candidates.
        </p>
        <Button
          onClick={() => navigate("/admin/companies/create")}
          className="mt-6 rounded-2xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white px-7 py-3 text-sm font-bold shadow-lg shadow-purple-600/25 cursor-pointer"
        >
          Register Your First Company
        </Button>
      </motion.div>
    );
  }

  if (filterCompany.length === 0) {
    return (
      <div className="rounded-3xl p-12 sm:p-16 text-center bg-white/90 backdrop-blur-xl border border-purple-100 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
          <Search size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">No Matching Companies</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          No company records matched "{searchCompanyByText}". Try searching with a different term.
        </p>
      </div>
    );
  }

  // ================= VIEW 1: PREMIUM FIGMA-STYLE CARDS GRID =================
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filterCompany.map((company, index) => {
            const initial = company?.name?.charAt(0)?.toUpperCase() || "C";
            const jobCount = jobCountsByCompanyId[company?._id?.toString()] || 0;

            return (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="group relative rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-[0_10px_30px_-8px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(106,56,194,0.22)] hover:border-purple-300 transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden cursor-default"
              >
                {/* Ambient Top Glow on Hover */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full bg-purple-100/60 blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div>
                  {/* Top Row: Logo + Active Tag + Edit Action */}
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {company.logo ? (
                        <div className="w-14 h-14 rounded-2xl p-1 bg-white border-2 border-purple-100 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-purple-900/15 shrink-0 group-hover:scale-105 transition-transform">
                          {initial}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base sm:text-lg text-gray-900 group-hover:text-[#6A38C2] transition-colors truncate">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin size={13} className="text-purple-500 shrink-0" />
                          <span className="truncate">
                            {company.location || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => navigate(`/admin/companies/${company._id}`)}
                      className="p-2.5 rounded-xl bg-purple-50 hover:bg-[#6A38C2] text-[#6A38C2] hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
                      title="Edit Company Details"
                      aria-label="Edit Company"
                    >
                      <Edit3 size={15} />
                    </motion.button>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs sm:text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {company.description ||
                      "No company description provided yet. Click edit to add your organizational story and branding."}
                  </p>

                  {/* Metadata Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-purple-50">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-[#6A38C2] text-xs font-semibold border border-purple-100">
                      <Briefcase size={12} />
                      <span>{jobCount} {jobCount === 1 ? "Job Active" : "Jobs Active"}</span>
                    </span>

                    {company.website && (
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-100 transition-colors"
                        title={company.website}
                      >
                        <Globe size={12} />
                        <span className="max-w-[120px] truncate">
                          {company.website.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Footer: Registration Date & Action Button */}
                <div className="mt-5 pt-4 border-t border-purple-50 flex items-center justify-between gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar size={13} />
                    <span>Registered {formatDate(company.createdAt)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/admin/companies/${company._id}`)}
                    className="flex items-center gap-1 font-bold text-[#6A38C2] hover:text-[#5B21B6] transition-colors cursor-pointer group/btn"
                  >
                    <span>Configure</span>
                    <ArrowUpRight
                      size={13}
                      className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                    />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // ================= VIEW 2: PREMIUM HIGH-DENSITY TABLE =================
  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-purple-100/90 shadow-[0_15px_35px_-5px_rgba(106,56,194,0.08)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-50/70 border-b border-purple-100/90 text-xs font-bold uppercase tracking-wider text-purple-900/80">
              <th className="py-4 px-6">Company Profile</th>
              <th className="py-4 px-6">Location</th>
              <th className="py-4 px-6">Active Jobs</th>
              <th className="py-4 px-6">Website</th>
              <th className="py-4 px-6">Created On</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 text-sm">
            {filterCompany.map((company, index) => {
              const initial = company?.name?.charAt(0)?.toUpperCase() || "C";
              const jobCount = jobCountsByCompanyId[company?._id?.toString()] || 0;

              return (
                <motion.tr
                  key={company._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-purple-50/40 transition-colors group"
                >
                  {/* Logo + Company Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      {company.logo ? (
                        <div className="w-11 h-11 rounded-2xl p-0.5 bg-white border border-purple-100 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6A38C2] to-[#9333EA] text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-[#6A38C2] transition-colors">
                          {company.name}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                          {company.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-purple-400" />
                      <span>{company.location || "—"}</span>
                    </div>
                  </td>

                  {/* Active Jobs Badge */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-[#6A38C2] text-xs font-bold border border-purple-100">
                      <Briefcase size={12} />
                      <span>{jobCount}</span>
                    </span>
                  </td>

                  {/* Website */}
                  <td className="py-4 px-6 text-xs">
                    {company.website ? (
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline max-w-[140px] truncate"
                      >
                        <Globe size={12} />
                        <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Created On */}
                  <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                    {formatDate(company.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <Button
                      onClick={() => navigate(`/admin/companies/${company._id}`)}
                      variant="ghost"
                      className="h-9 px-3 text-xs font-semibold text-[#6A38C2] hover:bg-purple-100/70 rounded-xl"
                    >
                      <Edit3 size={14} className="mr-1.5" />
                      <span>Edit</span>
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesTable;
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  IndianRupee,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Building,
  Check,
} from "lucide-react";
import { setSearchedQuery } from "@/redux/jobSlice";

const LOCATIONS = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Noida",
  "Remote",
];

const INDUSTRIES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Manager",
  "Data Scientist",
  "DevOps Engineer",
  "AI Engineer",
];

const SALARY_RANGES = [
  { label: "0 - 3 LPA", min: 0, max: 3 },
  { label: "3 - 6 LPA", min: 3, max: 6 },
  { label: "6 - 12 LPA", min: 6, max: 12 },
  { label: "12 - 20 LPA", min: 12, max: 20 },
  { label: "20+ LPA", min: 20, max: 100 },
];

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract"];

const FilterCard = ({
  selectedLocation,
  setSelectedLocation,
  selectedIndustry,
  setSelectedIndustry,
  selectedSalary,
  setSelectedSalary,
  selectedJobType,
  setSelectedJobType,
  onResetFilters,
  totalResultsCount = 0,
}) => {
  const dispatch = useDispatch();
  const { searchedQuery } = useSelector((store) => store.job);

  const hasActiveFilters =
    Boolean(selectedLocation) ||
    Boolean(selectedIndustry) ||
    Boolean(selectedSalary) ||
    Boolean(selectedJobType) ||
    Boolean(searchedQuery);

  const handleLocationClick = (loc) => {
    const nextVal = selectedLocation === loc ? "" : loc;
    setSelectedLocation(nextVal);
  };

  const handleIndustryClick = (ind) => {
    const nextVal = selectedIndustry === ind ? "" : ind;
    setSelectedIndustry(nextVal);
    // Also sync to global searchedQuery if clicked directly
    dispatch(setSearchedQuery(nextVal));
  };

  const handleSalaryClick = (salLabel) => {
    const nextVal = selectedSalary === salLabel ? "" : salLabel;
    setSelectedSalary(nextVal);
  };

  const handleJobTypeClick = (type) => {
    const nextVal = selectedJobType === type ? "" : type;
    setSelectedJobType(nextVal);
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-xl rounded-3xl border border-purple-100/90 shadow-[0_15px_35px_-5px_rgba(106,56,194,0.08)] p-5 sm:p-6 overflow-hidden">
      {/* Top Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6A38C2] flex items-center justify-center">
            <SlidersHorizontal size={15} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900">Filter Roles</h3>
            <p className="text-[11px] text-gray-400">
              {totalResultsCount} matching jobs
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-[#6A38C2] hover:text-[#5B21B6] px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </motion.button>
        )}
      </div>

      <div className="space-y-6 pt-5">
        {/* Filter 1: Industry / Specialization */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            <Briefcase size={14} className="text-[#6A38C2]" />
            <span>Role / Industry</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-200">
            {INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustry === ind;
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => handleIndustryClick(ind)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#6A38C2] text-white shadow-sm shadow-purple-900/20 font-semibold"
                      : "text-gray-600 hover:bg-purple-50/80 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">{ind}</span>
                  {isSelected && <Check size={13} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 2: Locations */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            <MapPin size={14} className="text-[#6A38C2]" />
            <span>Location</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocationClick(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-100 border-[#6A38C2] text-[#6A38C2] font-semibold shadow-xs"
                      : "bg-white border-purple-100/80 text-gray-600 hover:border-purple-200 hover:bg-purple-50/50"
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 3: Salary Ranges */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            <IndianRupee size={14} className="text-[#6A38C2]" />
            <span>Annual CTC (LPA)</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {SALARY_RANGES.map((sal) => {
              const isSelected = selectedSalary === sal.label;
              return (
                <button
                  key={sal.label}
                  type="button"
                  onClick={() => handleSalaryClick(sal.label)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] text-white border-transparent shadow-xs font-semibold"
                      : "bg-white border-purple-100/80 text-gray-600 hover:bg-purple-50/50"
                  }`}
                >
                  {sal.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 4: Employment Type */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            <Building size={14} className="text-[#6A38C2]" />
            <span>Job Type</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {JOB_TYPES.map((type) => {
              const isSelected = selectedJobType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleJobTypeClick(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-100 border-[#6A38C2] text-[#6A38C2] font-semibold"
                      : "bg-white border-purple-100/80 text-gray-600 hover:bg-purple-50/50"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterCard;

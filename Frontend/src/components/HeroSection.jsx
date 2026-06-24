import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <section className="bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 text-center">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-[#6A38C2] font-medium text-sm">
            🚀 #1 Career Platform For Freshers & Professionals
          </span>
        </motion.div>

        {/* Heading */}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mt-6 leading-tight text-gray-900"
        >
          Search, Apply & <br />
          Get Your{" "}
          <span className="text-[#6A38C2]">
            Dream Job
          </span>
        </motion.h1>

        {/* Description */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 mt-4 max-w-2xl mx-auto"
        >
          Explore thousands of job opportunities from top companies
          and find the perfect role matching your skills and experience.
        </motion.p>

        {/* Search Bar */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="w-full md:w-[65%] mx-auto relative">

            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="
        w-full
        h-16
        pl-7
        pr-20
        text-lg
        bg-white
        border
        border-gray-200
        rounded-full
        shadow-lg
        outline-none
        focus:ring-2
        focus:ring-[#6A38C2]/30
      "
            />

            <button
              onClick={searchJobHandler}
              className="
        absolute
        right-2
        top-2
        h-12
        w-12
        flex
        items-center
        justify-center
        rounded-full
        bg-[#6A38C2]
        hover:bg-[#5B21B6]
        transition-all
        duration-300
        shadow-md
      "
            >
              <Search className="h-5 w-5 text-white" />
            </button>

          </div>
        </motion.div>

        {/* Popular Companies */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          <span className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
            Google
          </span>

          <span className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
            Microsoft
          </span>

          <span className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
            Amazon
          </span>

          <span className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
            Netflix
          </span>

          <span className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
            Adobe
          </span>

          <span className="px-4 py-2 bg-white border rounded-full text-sm shadow-sm">
            GitHub
          </span>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
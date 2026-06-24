import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const Jobs = () => {
  const { allJobs, searchedQuery } = useSelector(
    (store) => store.job
  );

  const [filterJobs, setFilterJobs] = useState(allJobs);

  useEffect(() => {
    if (searchedQuery) {
      const filteredJobs = allJobs.filter((job) => {
        return (
          job.title
            .toLowerCase()
            .includes(searchedQuery.toLowerCase()) ||
          job.description
            .toLowerCase()
            .includes(searchedQuery.toLowerCase()) ||
          job.location
            .toLowerCase()
            .includes(searchedQuery.toLowerCase())
        );
      });

      setFilterJobs(filteredJobs);
    } else {
      setFilterJobs(allJobs);
    }
  }, [allJobs, searchedQuery]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Hero */}

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-8">

              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                🚀 Discover Opportunities
              </span>

              <h1 className="text-3xl font-bold mt-5">
                Find Your
                <span className="text-[#6D28D9]">
                  {" "}Dream Job
                </span>
              </h1>

              <p className="text-gray-500 mt-4 text-lg">
                Explore thousands of jobs from top companies.
              </p>

            </div>
          </motion.div>

          {/* Stats */}

          <div className="grid md:grid-cols-3 gap-5 mb-8">

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <h3 className="text-purple-700 font-semibold">
                Total Jobs
              </h3>

              <p className="text-3xl font-bold mt-2">
                {allJobs.length}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <h3 className="text-orange-600 font-semibold">
                Search Results
              </h3>

              <p className="text-3xl font-bold mt-2">
                {filterJobs.length}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h3 className="text-green-600 font-semibold">
                Active Hiring
              </h3>

              <p className="text-3xl font-bold mt-2">
                {filterJobs.length}
              </p>
            </div>

          </div>

          {/* Main Section */}

          <div className="flex gap-6">

            {/* Sidebar */}

            <div className="w-[280px] hidden lg:block">

              <div className="sticky top-24 bg-white rounded-3xl border border-purple-100 shadow-lg p-4">

                <h2 className="font-bold text-xl mb-4 text-[#6D28D9]">
                  Filters
                </h2>

                <FilterCard />

              </div>

            </div>

            {/* Jobs */}

            <div className="flex-1">

              {filterJobs.length <= 0 ? (

                <div className="bg-white rounded-3xl shadow-lg border p-16 text-center">

                  <h2 className="text-3xl font-bold text-gray-700">
                    😔 No Jobs Found
                  </h2>

                  <p className="text-gray-500 mt-3">
                    Try searching with another keyword.
                  </p>

                </div>

              ) : (

                <>
                  <h2 className="text-3xl font-bold mb-6">
                    Latest Jobs
                  </h2>

                  <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">

                    {filterJobs.map((job, index) => (
                      <motion.div
                        key={job?._id}
                        initial={{
                          opacity: 0,
                          y: 30,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                        }}
                        whileHover={{
                          y: -8,
                        }}
                      >
                        <Job job={job} />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Jobs;
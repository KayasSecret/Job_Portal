import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

import {
  Edit2,
  Eye,
  MoreHorizontal,
  BriefcaseBusiness,
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminJobsTable = () => {
  const { allAdminJobs = [], searchJobByText } =
    useSelector((store) => store.job);

  const [filterJobs, setFilterJobs] =
    useState(allAdminJobs);

  const navigate = useNavigate();

  useEffect(() => {
    const filteredJobs =
      allAdminJobs?.filter((job) => {
        if (!searchJobByText) return true;

        return (
          job?.title
            ?.toLowerCase()
            .includes(searchJobByText.toLowerCase()) ||
          job?.company?.name
            ?.toLowerCase()
            .includes(searchJobByText.toLowerCase())
        );
      }) || [];

    setFilterJobs(filteredJobs);
  }, [allAdminJobs, searchJobByText]);

  if (filterJobs.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-16 text-center">

        <BriefcaseBusiness
          size={55}
          className="mx-auto text-[#6A38C2]"
        />

        <h2 className="text-2xl font-bold mt-4">
          No Jobs Found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first job posting to start
          receiving applications.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">

      <Table>

        <TableCaption className="py-4">
          Recent Posted Jobs
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50">

            <TableHead className="font-semibold text-[#6A38C2]">
              Company
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Role
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Posted Date
            </TableHead>

            <TableHead className="text-right font-semibold text-[#6A38C2]">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {filterJobs.map((job, index) => (
            <motion.tr
              key={job._id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className="hover:bg-purple-50/60 transition-all duration-300"
            >

              <TableCell>
                <div className="font-semibold">
                  {job?.company?.name}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-green-500"></span>

                  <span className="font-medium">
                    {job?.title}
                  </span>

                </div>
              </TableCell>

              <TableCell>
                {job?.createdAt?.split("T")[0]}
              </TableCell>

              <TableCell className="text-right">

                <Popover>

                  <PopoverTrigger>
                    <MoreHorizontal className="cursor-pointer hover:text-[#6A38C2]" />
                  </PopoverTrigger>

                  <PopoverContent className="w-40">

                    <div
                      onClick={() =>
                        navigate(
                          `/admin/companies/${job._id}`
                        )
                      }
                      className="flex items-center gap-2 cursor-pointer hover:text-[#6A38C2] transition-all"
                    >
                      <Edit2 size={16} />
                      <span>Edit Job</span>
                    </div>

                    <div
                      onClick={() =>
                        navigate(
                          `/admin/jobs/${job._id}/applicants`
                        )
                      }
                      className="flex items-center gap-2 cursor-pointer hover:text-[#6A38C2] transition-all mt-3"
                    >
                      <Eye size={16} />
                      <span>Applicants</span>
                    </div>

                  </PopoverContent>

                </Popover>

              </TableCell>

            </motion.tr>
          ))}

        </TableBody>

      </Table>

    </div>
  );
};

export default AdminJobsTable;
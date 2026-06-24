import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";
import { BriefcaseBusiness } from "lucide-react";
import { motion } from "framer-motion";

const AppliedJobTable = () => {
  const jobState = useSelector((store) => store.job);
  const allAppliedJobs = jobState?.allAppliedJobs || [];

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border border-green-200";

      case "rejected":
        return "bg-red-100 text-red-700 border border-red-200";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
  };

  if (allAppliedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-purple-100 p-5 rounded-full mb-4">
          <BriefcaseBusiness
            className="text-[#6A38C2]"
            size={40}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          No Applications Yet
        </h2>

        <p className="text-gray-500 mt-2">
          Start applying for jobs and track your
          applications here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-100 overflow-hidden">

      <Table>

        <TableCaption className="py-4 text-gray-500">
          A list of your applied jobs
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50 hover:bg-purple-50">

            <TableHead className="font-semibold text-[#6A38C2]">
              Date
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Job Role
            </TableHead>

            <TableHead className="font-semibold text-[#6A38C2]">
              Company
            </TableHead>

            <TableHead className="text-right font-semibold text-[#6A38C2]">
              Status
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {allAppliedJobs.map((appliedJob, index) => (
            <motion.tr
              key={appliedJob._id}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="border-b hover:bg-purple-50/50 transition-all duration-300"
            >
              <TableCell className="font-medium">
                {appliedJob?.createdAt?.split("T")[0]}
              </TableCell>

              <TableCell className="font-semibold">
                {appliedJob?.job?.title}
              </TableCell>

              <TableCell>
                {appliedJob?.job?.company?.name}
              </TableCell>

              <TableCell className="text-right">

                <Badge
                  className={`${getStatusStyle(
                    appliedJob?.status
                  )} px-3 py-1 rounded-full font-semibold`}
                >
                  {appliedJob?.status?.toUpperCase()}
                </Badge>

              </TableCell>
            </motion.tr>
          ))}

        </TableBody>

      </Table>
    </div>
  );
};

export default AppliedJobTable;
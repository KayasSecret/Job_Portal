import React from "react";
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
  MoreHorizontal,
  FileText,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";

import { useSelector } from "react-redux";
import axios from "axios";
import { APPLICANT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

const shortListingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
  const { applicants } = useSelector(
    (store) => store.application
  );

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true;

      const res = await axios.post(
        `${APPLICANT_API_ENDPOINT}/status/${id}/update`,
        { status }
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  if (
    !applicants?.applications ||
    applicants.applications.length === 0
  ) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-16 text-center">

        <Users
          size={55}
          className="mx-auto text-[#6A38C2]"
        />

        <h2 className="text-2xl font-bold mt-4">
          No Applicants Yet
        </h2>

        <p className="text-gray-500 mt-2">
          Applications will appear here when
          candidates apply for this job.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">

      <Table>

        <TableCaption className="py-4">
          Recent Job Applications
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50">

            <TableHead className="text-[#6A38C2] font-semibold">
              Candidate
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Email
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Contact
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Resume
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Applied On
            </TableHead>

            <TableHead className="text-right text-[#6A38C2] font-semibold">
              Action
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {applicants?.applications?.map(
            (item, index) => (
              <motion.tr
                key={item._id}
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
                    {
                      item?.applicant
                        ?.fullName
                    }
                  </div>
                </TableCell>

                <TableCell>
                  {
                    item?.applicant
                      ?.email
                  }
                </TableCell>

                <TableCell>
                  {
                    item?.applicant
                      ?.phoneNumber
                  }
                </TableCell>

                <TableCell>
                  {item?.applicant?.profile
                    ?.resume ? (
                    <a
                      href={
                        item?.applicant
                          ?.profile
                          ?.resume
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#6A38C2] hover:underline font-medium"
                    >
                      <FileText size={16} />
                      {
                        item?.applicant
                          ?.profile
                          ?.resumeOriginalName
                      }
                    </a>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-500"
                    >
                      No Resume
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {item?.createdAt?.split(
                    "T"
                  )[0]}
                </TableCell>

                <TableCell className="text-right">

                  <Popover>

                    <PopoverTrigger>
                      <MoreHorizontal className="cursor-pointer hover:text-[#6A38C2]" />
                    </PopoverTrigger>

                    <PopoverContent className="w-40">

                      <div
                        onClick={() =>
                          statusHandler(
                            "Accepted",
                            item?._id
                          )
                        }
                        className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-all"
                      >
                        <CheckCircle2 size={16} />
                        <span>
                          Accept
                        </span>
                      </div>

                      <div
                        onClick={() =>
                          statusHandler(
                            "Rejected",
                            item?._id
                          )
                        }
                        className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-all mt-3"
                      >
                        <XCircle size={16} />
                        <span>
                          Reject
                        </span>
                      </div>

                    </PopoverContent>

                  </Popover>

                </TableCell>

              </motion.tr>
            )
          )}

        </TableBody>

      </Table>
    </div>
  );
};

export default ApplicantsTable;
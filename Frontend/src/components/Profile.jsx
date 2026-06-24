import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Pen,
  Mail,
  Contact,
  FileText,
  User,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";

const Profile = () => {
  useGetAppliedJobs();

  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const isResume = user?.profile?.resume;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Profile Header */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden"
          >

            {/* Top Banner */}

            <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500"></div>

            <div className="p-8">

              <div className="flex flex-col md:flex-row justify-between gap-8">

                {/* Left */}

                <div className="flex items-center gap-6">

                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      rotate: 3,
                    }}
                  >
                    <Avatar className="w-28 h-28 border-4 border-purple-100 shadow-lg">
                      <AvatarImage
                        src={
                          user?.profile?.profilePhoto ||
                          "https://avatar.iran.liara.run/public"
                        }
                        alt="profile"
                      />
                    </Avatar>
                  </motion.div>

                  <div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-[#6A38C2]" size={18} />

                      <h1 className="text-3xl font-bold">
                        {user?.fullName}
                      </h1>
                    </div>

                    <p className="text-gray-600 max-w-xl">
                      {user?.profile?.bio ||
                        "Passionate professional actively exploring career opportunities."}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-4">

                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        {user?.email}
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Contact size={16} />
                        {user?.phoneNumber}
                      </div>

                    </div>

                  </div>
                </div>

                {/* Edit Button */}

                <Button
                  onClick={() => setOpen(true)}
                  className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white h-fit"
                >
                  <Pen className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>

              </div>

              {/* Stats */}

              <div className="grid md:grid-cols-3 gap-5 mt-8">

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-purple-50 border border-purple-100 rounded-2xl p-5"
                >
                  <Briefcase className="text-[#6A38C2]" />
                  <h2 className="font-bold text-2xl mt-2">
                    {user?.profile?.skills?.length || 0}
                  </h2>
                  <p className="text-gray-500">
                    Skills Added
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-orange-50 border border-orange-100 rounded-2xl p-5"
                >
                  <FileText className="text-orange-500" />
                  <h2 className="font-bold text-2xl mt-2">
                    {isResume ? "Yes" : "No"}
                  </h2>
                  <p className="text-gray-500">
                    Resume Uploaded
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-green-50 border border-green-100 rounded-2xl p-5"
                >
                  <User className="text-green-500" />
                  <h2 className="font-bold text-2xl mt-2">
                    Active
                  </h2>
                  <p className="text-gray-500">
                    Profile Status
                  </p>
                </motion.div>

              </div>

              {/* Skills */}

              <div className="mt-8">

                <h2 className="font-bold text-xl mb-4">
                  Skills
                </h2>

                <div className="flex flex-wrap gap-3">

                  {user?.profile?.skills?.length > 0 ? (
                    user.profile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No skills added
                    </span>
                  )}

                </div>

              </div>

              {/* Resume */}

              <div className="mt-8">

                <Label className="font-bold text-xl mb-4 block">
                  Resume
                </Label>

                {isResume ? (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href={user?.profile?.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl p-4 hover:bg-purple-100 transition-all"
                  >
                    <div className="flex items-center gap-3">

                      <FileText className="text-[#6A38C2]" />

                      <div>
                        <p className="font-medium">
                          {user?.profile?.resumeOriginalName}
                        </p>

                        <p className="text-sm text-gray-500">
                          Click to view resume
                        </p>
                      </div>

                    </div>

                    <Button
                      variant="outline"
                      className="border-purple-200"
                    >
                      View
                    </Button>
                  </motion.a>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-5 text-gray-500">
                    No Resume Uploaded
                  </div>
                )}

              </div>

            </div>
          </motion.div>

          {/* Applied Jobs */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-purple-100 shadow-xl mt-8 p-6"
          >

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Applied Jobs
                </h2>

                <p className="text-gray-500">
                  Track all your job applications
                </p>
              </div>

              <Badge className="bg-purple-100 text-purple-700">
                My Applications
              </Badge>

            </div>

            <AppliedJobTable />

          </motion.div>

        </div>

        <UpdateProfileDialog
          open={open}
          setOpen={setOpen}
        />
      </div>
    </>
  );
};

export default Profile;

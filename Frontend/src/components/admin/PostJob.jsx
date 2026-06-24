import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
  Loader2,
  BriefcaseBusiness,
  FileText,
  MapPin,
  IndianRupee,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    companyId: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { companies } = useSelector(
    (store) => store.company
  );

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const selectChangeHandler = (value) => {
    const selectedCompany =
      companies.find(
        (company) =>
          company.name.toLowerCase() === value
      );

    setInput({
      ...input,
      companyId: selectedCompany._id,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${JOB_API_ENDPOINT}/post`,
        input,
        {
          headers: {
            "Content-Type":
              "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">

        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Header */}

          <motion.div
            initial={{
              opacity: 0,
              y: -25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

              <div>

                <span className="bg-purple-100 text-[#6A38C2] px-4 py-2 rounded-full text-sm font-medium">
                  Recruiter Dashboard
                </span>

                <h1 className="text-4xl font-bold mt-4">
                  Post New Job
                </h1>

                <p className="text-gray-500 mt-2">
                  Create attractive job
                  opportunities and hire top
                  talent faster.
                </p>

              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl px-8 py-5 text-center">

                <BriefcaseBusiness
                  size={30}
                  className="mx-auto text-[#6A38C2]"
                />

                <h2 className="text-3xl font-bold mt-2">
                  {companies?.length}
                </h2>

                <p className="text-gray-500 text-sm">
                  Registered Companies
                </p>

              </div>

            </div>
          </motion.div>

          {/* Form */}

          <motion.form
            onSubmit={submitHandler}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8"
          >

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <Label>Job Title</Label>
                <Input
                  name="title"
                  value={input.title}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="Frontend Developer"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  value={input.location}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="Bangalore"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  name="description"
                  value={input.description}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="Job Description"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Requirements</Label>
                <Input
                  name="requirements"
                  value={input.requirements}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="React, Node.js"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Salary (LPA)</Label>
                <Input
                  name="salary"
                  value={input.salary}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="12"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Job Type</Label>
                <Input
                  name="jobType"
                  value={input.jobType}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="Full-Time"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Experience</Label>
                <Input
                  name="experience"
                  value={input.experience}
                  onChange={
                    changeEventHandler
                  }
                  placeholder="2 Years"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>No. of Positions</Label>
                <Input
                  type="number"
                  name="position"
                  value={input.position}
                  onChange={
                    changeEventHandler
                  }
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

            </div>

            {/* Company Select */}

            <div className="mt-6">

              <Label className="mb-2 block">
                Select Company
              </Label>

              {companies.length > 0 ? (
                <Select
                  onValueChange={
                    selectChangeHandler
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose Company" />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectGroup>

                      {companies.map(
                        (company) => (
                          <SelectItem
                            key={
                              company._id
                            }
                            value={company.name.toLowerCase()}
                          >
                            {company.name}
                          </SelectItem>
                        )
                      )}

                    </SelectGroup>

                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 font-medium">
                  Please create a company
                  first before posting a
                  job.
                </div>
              )}

            </div>

            {/* Submit */}

            {loading ? (
              <Button
                disabled
                className="w-full mt-8 h-12 bg-[#6A38C2]"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting Job...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full mt-8 h-12 bg-[#6A38C2] hover:bg-[#5B21B6] rounded-xl text-white font-semibold"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            )}

          </motion.form>

        </div>
      </div>
    </>
  );
};

export default PostJob;
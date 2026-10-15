import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarausel from "./CategoryCarausel";
import LatestJobs from "./LatestJobs";
import FuturisticCareerShowcase from "./home/FuturisticCareerShowcase";
import Footer from "./shared/Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  useGetAllJobs();

  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (user?.role === "recruiter") {
      navigate("/admin/companies");
    }
  }, [user, navigate]);

  return (
    <div className="relative selection:bg-[#6A38C2] selection:text-white">
      {/* 1. Sticky Top Navigation Bar */}
      <Navbar />

      {/* 4. Unified Main Sections with Cohesive SaaS Hierarchy */}
      <main className="relative z-10 flex flex-col">
        <HeroSection />
        <CategoryCarausel />
        <LatestJobs />
        <FuturisticCareerShowcase />
      </main>

      {/* 5. Cohesive Footer Section with Integrated Atmosphere */}
      <Footer />
    </div>
  );
};

export default Home;

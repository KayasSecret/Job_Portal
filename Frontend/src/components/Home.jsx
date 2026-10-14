import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarausel from "./CategoryCarausel";
import LatestJobs from "./LatestJobs";
import FuturisticCareerShowcase from "./home/FuturisticCareerShowcase";
import CinematicBackgroundCanvas from "./home/CinematicBackgroundCanvas";
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
    <div className="relative min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-purple-50/40 overflow-x-hidden selection:bg-[#6A38C2] selection:text-white">
      {/* Interactive Cinematic Background Particle Constellation */}
      <CinematicBackgroundCanvas />

      {/* Top Navigation Bar (Preserved Completely) */}
      <Navbar />

      {/* Main Cinematic Content */}
      <main className="relative z-10">
        <HeroSection />
        <CategoryCarausel />
        <LatestJobs />
        <FuturisticCareerShowcase />
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Home;

import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CinematicBackgroundCanvas from "../home/CinematicBackgroundCanvas";

/**
 * AuthenticatedAppLayout
 * Global persistent layout wrapper for all authenticated HireNest pages (Student & Recruiter/Admin).
 *
 * Benefits:
 * - Mounts the continuous HTML5 constellation/particle wallpaper and ambient glows once.
 * - Stays active seamlessly across all client-side page transitions without restarting, remounting, or flickering.
 * - Strictly excluded from Login and Signup pages (which remain isolated outside this layout).
 * - Zero pointer-events interference ensures 100% clickability and responsiveness on all page content.
 */
const AuthenticatedAppLayout = () => {
  const location = useLocation();

  // Scroll to top cleanly on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-purple-50/60 via-white/85 to-purple-50/50 overflow-x-hidden selection:bg-[#6A38C2] selection:text-white">
      {/* 1. Global Continuous Live Constellation Particle Background Canvas */}
      <CinematicBackgroundCanvas />

      {/* 2. Global Ambient Atmosphere Radial Glows (Fixed Layer, Continuous) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-gradient-to-b from-purple-500/12 via-fuchsia-500/8 to-transparent blur-[140px] z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 -left-48 w-[600px] h-[600px] rounded-full bg-blue-500/8 blur-[150px] z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-10 -right-48 w-[600px] h-[600px] rounded-full bg-pink-500/8 blur-[150px] z-0"
      />

      {/* 3. Page Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticatedAppLayout;

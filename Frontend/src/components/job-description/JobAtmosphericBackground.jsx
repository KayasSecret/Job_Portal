import React from "react";

/**
 * JobAtmosphericBackground
 * Light-themed cinematic ambient lighting background matching HireNest's visual style.
 * Features soft lilac, cyan, and violet atmospheric blurs and subtle geometric accents.
 */
const JobAtmosphericBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-transparent"
    >
      {/* Top Left Soft Lilac Glow */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple-300/25 blur-[130px] animate-pulse"
        style={{ animationDuration: "10s" }}
      />

      {/* Top Right Subtle Cyan Flare */}
      <div
        className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-cyan-200/20 blur-[140px] animate-pulse"
        style={{ animationDuration: "12s" }}
      />

      {/* Center Delicate Fuchsia Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-pink-200/15 blur-[160px] pointer-events-none" />

      {/* Bottom Soft Violet Orb */}
      <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-300/20 blur-[150px]" />

      {/* Subtle Precision Dot Matrix Grid */}
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#6A38C2_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Hairline Glowing Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent" />
    </div>
  );
};

export default JobAtmosphericBackground;

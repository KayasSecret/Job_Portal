import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Globe2,
  Users2,
  Boxes,
  Zap,
} from "lucide-react";

/**
 * Isometric3DCorporateScene
 * High-end cinematic isometric 3D-inspired corporate campus illustration with glowing towers,
 * floating geometric holographic rings, ambient lighting, and particle auras.
 */
const Isometric3DCorporateScene = ({ companyName = "", location = "", website = "", logoPreview = null }) => {
  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center p-8 select-none overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#8B5CF6]/35 blur-[90px] animate-pulse"
        style={{ animationDuration: "7s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-[#EC4899]/30 blur-[90px] animate-pulse"
        style={{ animationDuration: "9s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#06B6D4]/20 blur-[80px]"
      />

      {/* Futuristic Isometric Campus Illustration (SVG + CSS 3D Depth) */}
      <div className="relative z-10 w-full max-w-[380px] aspect-square flex items-center justify-center">
        {/* Floating Rotating Holographic Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-dashed border-purple-400/25 pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute inset-10 rounded-full border border-purple-300/15 pointer-events-none"
        />

        {/* Central Isometric Cyber Tower Structure */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex flex-col items-center"
        >
          {/* Holographic Glowing Crown / Floating Diamond */}
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6A38C2] via-[#9333EA] to-[#EC4899] p-0.5 shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center mb-4 backdrop-blur-md overflow-hidden"
          >
            <div className="w-full h-full rounded-[14px] bg-[#1E0E3E]/90 flex items-center justify-center text-white overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company Logo Preview"
                  className="w-full h-full object-contain p-1.5 bg-white/95 rounded-[12px]"
                />
              ) : (
                <Building2 size={28} className="text-purple-300 drop-shadow" />
              )}
            </div>
          </motion.div>

          {/* Isometric Office Tower Block 1 (Top Level) */}
          <div className="relative w-52 h-22 bg-gradient-to-br from-purple-500/40 via-indigo-600/30 to-[#1E0E3E]/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399] animate-ping shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs font-black text-white tracking-wide truncate max-w-[120px]">
                  {companyName.trim() || "HireNest HQ"}
                </div>
                <div className="text-[10px] text-purple-200/70 truncate max-w-[110px]">
                  {location.trim() || "Global Enterprise"}
                </div>
                {website?.trim() && (
                  <div className="text-[9px] text-cyan-300 truncate max-w-[110px]">
                    {website.trim().replace(/^https?:\/\//i, "")}
                  </div>
                )}
              </div>
            </div>

            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <Zap size={14} />
            </div>
          </div>

          {/* Tower Connector Beam */}
          <div className="w-24 h-4 bg-gradient-to-b from-purple-400/40 to-transparent" />

          {/* Isometric Campus Base Floor (Bottom Level) */}
          <div className="relative w-64 h-24 bg-gradient-to-br from-[#2E1065]/90 to-[#14082B]/95 backdrop-blur-2xl rounded-3xl border border-purple-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs font-black text-purple-200">100%</div>
              <div className="text-[9px] uppercase tracking-wider text-purple-400 font-semibold">
                Verified
              </div>
            </div>
            <div className="h-8 w-px bg-purple-400/20" />
            <div className="text-center">
              <div className="text-xs font-black text-purple-200">Instant</div>
              <div className="text-[9px] uppercase tracking-wider text-purple-400 font-semibold">
                Requisitions
              </div>
            </div>
            <div className="h-8 w-px bg-purple-400/20" />
            <div className="text-center">
              <div className="text-xs font-black text-purple-200">Global</div>
              <div className="text-[9px] uppercase tracking-wider text-purple-400 font-semibold">
                Branding
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orbiting Floating 3D Micro-Badges */}
        <motion.div
          animate={{ y: [-5, 5, -5], x: [3, -3, 3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 left-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-900/30"
        >
          <Sparkles size={12} className="text-amber-300" />
          <span>Talent Pipeline</span>
        </motion.div>

        <motion.div
          animate={{ y: [6, -6, 6], x: [-3, 3, -3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-900/30"
        >
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Verified Recruiter</span>
        </motion.div>
      </div>

      {/* Bottom Subtitle / Tagline */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-purple-200/70 font-medium">
        HireNest 3D Entity Command Center &bull; Live Entity Preview
      </div>
    </div>
  );
};

export default Isometric3DCorporateScene;

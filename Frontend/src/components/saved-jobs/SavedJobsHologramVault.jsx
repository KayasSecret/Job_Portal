import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Shield, Bookmark, Activity } from "lucide-react";

/**
 * SavedJobsHologramVault
 * Ultra-premium, interactive 3D Holographic Career Vault powered by real mathematical
 * 3D perspective projection on a high-DPI HTML5 canvas.
 *
 * Features:
 * - 3D Nested Polyhedral Core with illuminated edges and vertices
 * - Dual counter-rotating 3D Gyroscopic Gimbal Rings with depth sorting
 * - 3D Orbiting holographic crystal bookmark nodes on elliptical paths
 * - Interactive mouse parallax with smooth spring damping
 * - Volumetric ambient glow and vertical scanning sweep
 * - Automatic pause via IntersectionObserver and visibilitychange
 * - Respects prefers-reduced-motion
 */
const SavedJobsHologramVault = ({ savedCount = 0 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 3D Polyhedron Vertex Definitions (Octahedral Bipyramid + Core)
    const baseVertices = [
      [0, 1.3, 0],   // Top apex
      [0, -1.3, 0],  // Bottom apex
      [1.1, 0, 0],   // Equator +X
      [-1.1, 0, 0],  // Equator -X
      [0, 0, 1.1],   // Equator +Z
      [0, 0, -1.1],  // Equator -Z
      // Secondary inner crystal vertices
      [0.65, 0.65, 0.65],
      [-0.65, 0.65, 0.65],
      [0.65, -0.65, 0.65],
      [-0.65, -0.65, 0.65],
      [0.65, 0.65, -0.65],
      [-0.65, 0.65, -0.65],
      [0.65, -0.65, -0.65],
      [-0.65, -0.65, -0.65],
    ];

    // Normalize and scale vertices
    const coreVertices = baseVertices.map(([x, y, z]) => {
      const len = Math.hypot(x, y, z) || 1;
      return [(x / len) * 1.15, (y / len) * 1.15, (z / len) * 1.15];
    });

    // Edges connecting vertices
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
      // Inner cube interconnects
      [6, 7], [7, 9], [9, 8], [8, 6],
      [10, 11], [11, 13], [13, 12], [12, 10],
      [6, 10], [7, 11], [8, 12], [9, 13],
    ];

    // 3D Orbiting Bookmark Nodes
    const orbitalNodesCount = 6;
    const orbitalNodes = [];
    for (let i = 0; i < orbitalNodesCount; i++) {
      const angle = (i / orbitalNodesCount) * Math.PI * 2;
      orbitalNodes.push({
        baseAngle: angle,
        orbitRadius: 1.65 + (i % 2) * 0.25,
        speed: (i % 2 === 0 ? 1 : -1) * 0.012,
        inclination: (i * 0.45) - 0.9,
        size: 3.5,
        color: i % 2 === 0 ? "#06B6D4" : "#EC4899",
      });
    }

    // 3D Gyroscopic Gimbal Rings (points on circles)
    const ringPointCount = 48;
    const ring1 = [];
    const ring2 = [];
    const ringRadius1 = 1.95;
    const ringRadius2 = 2.25;

    for (let i = 0; i < ringPointCount; i++) {
      const th = (i / ringPointCount) * Math.PI * 2;
      ring1.push({ x: Math.cos(th) * ringRadius1, y: 0, z: Math.sin(th) * ringRadius1 });
      ring2.push({ x: 0, y: Math.cos(th) * ringRadius2, z: Math.sin(th) * ringRadius2 });
    }

    // Rotation state
    let rotX = 0.35;
    let rotY = 0.45;
    let rotZ = 0.1;
    let targetRotX = 0.35;
    let targetRotY = 0.45;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current
        ? containerRef.current.getBoundingClientRect()
        : { width: 220, height: 220 };

      width = Math.max(rect.width, 170);
      height = Math.max(rect.height, 170);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = 0.45 + nx * 0.6;
      targetRotX = 0.35 - ny * 0.5;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.35;
      targetRotY = 0.45;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animId) {
        animId = requestAnimationFrame(render);
      }
    }, { threshold: 0.1 });

    if (container) observer.observe(container);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        animId = null;
      } else if (isVisible && !animId) {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener("resize", resize);
    resize();

    // 3D Projection Engine
    function project3D(x, y, z, fov = 3.8, scaleMultiplier = 58) {
      // Rotate around X
      let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
      let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

      // Rotate around Y
      let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

      // Rotate around Z
      let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
      let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

      // Perspective projection
      const cameraDist = 5.2;
      const depth = z2 + cameraDist;
      const f = depth > 0.1 ? (fov / depth) * scaleMultiplier : 1;

      return {
        x: width / 2 + x3 * f,
        y: height / 2 + y3 * f,
        z: z2,
        scale: f,
      };
    }

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animId = null;
        return;
      }

      time += prefersReducedMotion ? 0.004 : 0.016;

      // Smooth spring damping for rotations
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;
      rotZ = Math.sin(time * 0.5) * 0.12;

      // Auto rotation drift
      if (!prefersReducedMotion) {
        targetRotY += 0.005;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw central volumetric ambient glow
      const cx = width / 2;
      const cy = height / 2;
      const radialGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, width * 0.42);
      radialGlow.addColorStop(0, "rgba(168, 85, 247, 0.32)");
      radialGlow.addColorStop(0.4, "rgba(139, 92, 246, 0.16)");
      radialGlow.addColorStop(0.75, "rgba(6, 182, 212, 0.08)");
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Project Gyroscopic Rings
      const ringProjected1 = ring1.map((p) => {
        // Local ring rotation
        const t = time * 0.8;
        const rx = p.x * Math.cos(t) - p.z * Math.sin(t);
        const rz = p.x * Math.sin(t) + p.z * Math.cos(t);
        return project3D(rx, p.y, rz);
      });

      const ringProjected2 = ring2.map((p) => {
        const t = -time * 0.6;
        const ry = p.y * Math.cos(t) - p.z * Math.sin(t);
        const rz = p.y * Math.sin(t) + p.z * Math.cos(t);
        return project3D(p.x, ry, rz);
      });

      // Split rings into back (z < 0) and front (z >= 0) for true depth sorting
      const drawRing = (points, strokeStyle, alpha, isFront = false) => {
        for (let i = 0; i < points.length; i++) {
          const curr = points[i];
          const next = points[(i + 1) % points.length];
          const midZ = (curr.z + next.z) / 2;

          if (isFront ? midZ >= 0 : midZ < 0) {
            ctx.beginPath();
            ctx.moveTo(curr.x, curr.y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = strokeStyle;
            ctx.globalAlpha = Math.max(0.12, Math.min(0.85, alpha * (1 + midZ * 0.25)));
            ctx.lineWidth = isFront ? 1.4 : 0.85;
            ctx.stroke();
          }
        }
      };

      // Draw Back Rings
      drawRing(ringProjected1, "#C084FC", 0.35, false);
      drawRing(ringProjected2, "#38BDF8", 0.35, false);

      // 3. Project Core Polyhedron
      const projectedCore = coreVertices.map((v) => project3D(v[0], v[1], v[2]));

      // Sort and draw edges
      const depthSortedEdges = edges
        .map(([i1, i2]) => {
          const p1 = projectedCore[i1];
          const p2 = projectedCore[i2];
          return { p1, p2, avgZ: (p1.z + p2.z) / 2 };
        })
        .sort((a, b) => a.avgZ - b.avgZ);

      depthSortedEdges.forEach(({ p1, p2, avgZ }) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        const edgeAlpha = Math.max(0.2, Math.min(0.9, 0.5 + avgZ * 0.25));
        ctx.strokeStyle = avgZ > 0 ? "#E879F9" : "#818CF8";
        ctx.globalAlpha = edgeAlpha;
        ctx.lineWidth = avgZ > 0 ? 1.6 : 0.95;
        ctx.stroke();
      });

      // Draw Core Vertices
      projectedCore.forEach((p) => {
        const rad = Math.max(1.5, 2.8 + p.z * 0.8);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = p.z > 0 ? "#F472B6" : "#A78BFA";
        ctx.globalAlpha = Math.max(0.3, Math.min(0.95, 0.6 + p.z * 0.3));
        ctx.shadowColor = "#C084FC";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Front Rings
      drawRing(ringProjected1, "#C084FC", 0.75, true);
      drawRing(ringProjected2, "#38BDF8", 0.75, true);

      // 5. Draw 3D Orbiting Bookmark Nodes
      orbitalNodes.forEach((node, idx) => {
        const curAngle = node.baseAngle + time * (idx % 2 === 0 ? 1 : -1) * 0.8;
        const ox = Math.cos(curAngle) * node.orbitRadius;
        const oz = Math.sin(curAngle) * node.orbitRadius;
        const oy = Math.sin(curAngle * 2 + idx) * 0.45 + node.inclination * 0.5;

        const proj = project3D(ox, oy, oz);

        // Halo
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(3, node.size + proj.z * 1.2), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = Math.max(0.25, Math.min(0.95, 0.65 + proj.z * 0.3));
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner spark
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(1.2, 1.8 + proj.z * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 0.9;
        ctx.fill();
      });

      // 6. Laser Scanning Horizontal Sweep
      const sweepY = ((Math.sin(time * 1.5) + 1) / 2) * (height * 0.65) + height * 0.18;
      const sweepGradient = ctx.createLinearGradient(width * 0.15, sweepY, width * 0.85, sweepY);
      sweepGradient.addColorStop(0, "rgba(168, 85, 247, 0)");
      sweepGradient.addColorStop(0.5, "rgba(6, 182, 212, 0.45)");
      sweepGradient.addColorStop(1, "rgba(168, 85, 247, 0)");

      ctx.beginPath();
      ctx.moveTo(width * 0.15, sweepY);
      ctx.lineTo(width * 0.85, sweepY);
      ctx.strokeStyle = sweepGradient;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.7;
      ctx.stroke();

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        observer.unobserve(container);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-[190px] h-[190px] sm:w-[215px] sm:h-[215px] mx-auto flex items-center justify-center select-none group shrink-0"
      aria-label="3D Holographic Career Vault"
    >
      {/* Outer Volumetric Halo Backdrop */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 via-violet-400/15 to-cyan-400/20 blur-xl pointer-events-none -z-10 transition-opacity duration-500 ${
          isHovered ? "opacity-100 scale-105" : "opacity-75 animate-pulse"
        }`}
      />

      {/* Actual HTML5 High-DPI 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
      />

      {/* Floating Futuristic HUD Telemetry Corner Elements */}
      {/* Top Left: Status Pill */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs pointer-events-none px-2 py-0.5 max-w-[120px]">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
        </span>
        <span className="font-mono font-bold tracking-wider uppercase text-purple-200 text-[8.5px] truncate">
          VAULT // ACTIVE
        </span>
      </div>

      {/* Top Right: 3D Coordinate Badge */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs font-mono text-purple-200/80 pointer-events-none px-1.5 py-0.5 text-[7.5px]">
        <Activity size={8} className="text-cyan-400" />
        <span>GEO•v2</span>
      </div>

      {/* Bottom Left: Saved Bookmarks Counter Badge */}
      <div className="absolute bottom-2 left-1.5 flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs pointer-events-none px-2 py-0.5 max-w-[130px]">
        <Bookmark size={9} className="text-pink-300 shrink-0" />
        <span className="font-bold text-white tracking-wide text-[9px] truncate">
          {savedCount} {savedCount === 1 ? "Role" : "Roles"} Synced
        </span>
      </div>

      {/* Bottom Right: Security Shield */}
      <div className="absolute bottom-2 right-1.5 flex items-center gap-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 font-bold text-emerald-300 pointer-events-none px-1.5 py-0.5 text-[8px]">
        <Shield size={9} className="text-emerald-400" />
        <span className="font-mono">SECURE</span>
      </div>
    </div>
  );
};

export default SavedJobsHologramVault;

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Shield, Calendar, Activity } from "lucide-react";

/**
 * EventHologramSphere
 * Ultra-premium, interactive 3D Holographic Event Sphere powered by real mathematical
 * 3D perspective projection on a high-DPI HTML5 canvas.
 *
 * Features:
 * - 3D Geodesic Wireframe Sphere with rotating latitude and longitude rings
 * - Dual counter-rotating 3D Gyroscopic Gimbal Rings with depth sorting
 * - 3D Orbiting holographic event satellites on elliptical inclined orbits
 * - Interactive mouse parallax with smooth spring damping
 * - Volumetric central pulse glow and horizontal scanning laser sweep
 * - Automatic pause via IntersectionObserver and visibilitychange
 * - Respects prefers-reduced-motion
 */
const EventHologramSphere = ({ eventCount = 0 }) => {
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

    // Generate 3D Geodesic Sphere Vertices & Latitude/Longitude Rings
    const sphereRadius = 1.25;
    const latRings = 7;
    const pointsPerLat = 24;
    const sphereVertices = [];
    const sphereLines = [];

    // Latitude circles
    for (let i = 1; i < latRings; i++) {
      const phi = (i / latRings) * Math.PI - Math.PI / 2; // -PI/2 to PI/2
      const r = Math.cos(phi) * sphereRadius;
      const y = Math.sin(phi) * sphereRadius;
      const ring = [];

      for (let j = 0; j < pointsPerLat; j++) {
        const theta = (j / pointsPerLat) * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        ring.push({ x, y, z });
        sphereVertices.push({ x, y, z });
      }
      sphereLines.push(ring);
    }

    // Longitude circles (Meridians)
    const meridianCount = 6;
    for (let m = 0; m < meridianCount; m++) {
      const theta = (m / meridianCount) * Math.PI;
      const meridian = [];
      const steps = 32;
      for (let s = 0; s < steps; s++) {
        const phi = (s / steps) * Math.PI * 2;
        const x = Math.sin(phi) * Math.cos(theta) * sphereRadius;
        const y = Math.cos(phi) * sphereRadius;
        const z = Math.sin(phi) * Math.sin(theta) * sphereRadius;
        meridian.push({ x, y, z });
      }
      sphereLines.push(meridian);
    }

    // 3D Orbiting Event Satellites
    const satelliteCount = 8;
    const satellites = [];
    for (let i = 0; i < satelliteCount; i++) {
      const baseAngle = (i / satelliteCount) * Math.PI * 2;
      satellites.push({
        baseAngle,
        radius: 1.8 + (i % 3) * 0.25,
        speed: (i % 2 === 0 ? 1 : -1) * 0.012,
        inclination: (i * 0.5) - 1.0,
        color: i % 3 === 0 ? "#38BDF8" : i % 3 === 1 ? "#C084FC" : "#F472B6",
        size: 3.5,
      });
    }

    // Gyroscopic Outer Gimbal Rings
    const ringPointCount = 48;
    const ring1 = [];
    const ring2 = [];
    const ringRadius1 = 2.05;
    const ringRadius2 = 2.35;

    for (let i = 0; i < ringPointCount; i++) {
      const th = (i / ringPointCount) * Math.PI * 2;
      ring1.push({ x: Math.cos(th) * ringRadius1, y: 0, z: Math.sin(th) * ringRadius1 });
      ring2.push({ x: 0, y: Math.cos(th) * ringRadius2, z: Math.sin(th) * ringRadius2 });
    }

    // Rotation state
    let rotX = 0.3;
    let rotY = 0.5;
    let rotZ = 0.1;
    let targetRotX = 0.3;
    let targetRotY = 0.5;

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
      targetRotY = 0.5 + nx * 0.6;
      targetRotX = 0.3 - ny * 0.5;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.3;
      targetRotY = 0.5;
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
      rotZ = Math.sin(time * 0.4) * 0.08;

      // Auto rotation drift
      if (!prefersReducedMotion) {
        targetRotY += 0.005;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw central volumetric ambient glow
      const cx = width / 2;
      const cy = height / 2;
      const radialGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, width * 0.45);
      radialGlow.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      radialGlow.addColorStop(0.35, "rgba(168, 85, 247, 0.2)");
      radialGlow.addColorStop(0.7, "rgba(236, 72, 153, 0.08)");
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Project Gyroscopic Rings
      const ringProjected1 = ring1.map((p) => {
        const t = time * 0.7;
        const rx = p.x * Math.cos(t) - p.z * Math.sin(t);
        const rz = p.x * Math.sin(t) + p.z * Math.cos(t);
        return project3D(rx, p.y, rz);
      });

      const ringProjected2 = ring2.map((p) => {
        const t = -time * 0.55;
        const ry = p.y * Math.cos(t) - p.z * Math.sin(t);
        const rz = p.y * Math.sin(t) + p.z * Math.cos(t);
        return project3D(p.x, ry, rz);
      });

      // Ring rendering function with depth sorting
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
            ctx.globalAlpha = Math.max(0.1, Math.min(0.85, alpha * (1 + midZ * 0.25)));
            ctx.lineWidth = isFront ? 1.4 : 0.8;
            ctx.stroke();
          }
        }
      };

      // Draw Back Rings (Behind sphere)
      drawRing(ringProjected1, "#38BDF8", 0.35, false);
      drawRing(ringProjected2, "#C084FC", 0.35, false);

      // 3. Project and Render 3D Sphere Rings
      sphereLines.forEach((ring) => {
        const projected = ring.map((p) => project3D(p.x, p.y, p.z));

        for (let i = 0; i < projected.length; i++) {
          const curr = projected[i];
          const next = projected[(i + 1) % projected.length];
          const midZ = (curr.z + next.z) / 2;

          ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(next.x, next.y);

          // Closer lines are brighter electric blue/cyan; farther lines are muted indigo
          if (midZ > 0) {
            ctx.strokeStyle = "#38BDF8";
            ctx.globalAlpha = Math.max(0.25, Math.min(0.85, 0.45 + midZ * 0.35));
            ctx.lineWidth = 1.25;
          } else {
            ctx.strokeStyle = "#818CF8";
            ctx.globalAlpha = Math.max(0.08, Math.min(0.35, 0.2 + midZ * 0.15));
            ctx.lineWidth = 0.75;
          }
          ctx.stroke();
        }
      });

      // 4. Draw Front Rings
      drawRing(ringProjected1, "#38BDF8", 0.75, true);
      drawRing(ringProjected2, "#C084FC", 0.75, true);

      // 5. Draw 3D Orbiting Satellites
      satellites.forEach((sat, idx) => {
        const curAngle = sat.baseAngle + time * sat.speed * 40;
        const ox = Math.cos(curAngle) * sat.radius;
        const oz = Math.sin(curAngle) * sat.radius;
        const oy = Math.sin(curAngle * 2 + idx) * 0.5 + sat.inclination * 0.4;

        const proj = project3D(ox, oy, oz);

        // Halo
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(3, sat.size + proj.z * 1.2), 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.globalAlpha = Math.max(0.25, Math.min(0.95, 0.65 + proj.z * 0.3));
        ctx.shadowColor = sat.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Core spark
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(1.2, 1.8 + proj.z * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 0.95;
        ctx.fill();
      });

      // 6. Laser Scanning Horizontal Sweep
      const sweepY = ((Math.sin(time * 1.6) + 1) / 2) * (height * 0.65) + height * 0.18;
      const sweepGradient = ctx.createLinearGradient(width * 0.15, sweepY, width * 0.85, sweepY);
      sweepGradient.addColorStop(0, "rgba(56, 189, 248, 0)");
      sweepGradient.addColorStop(0.5, "rgba(56, 189, 248, 0.5)");
      sweepGradient.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.beginPath();
      ctx.moveTo(width * 0.15, sweepY);
      ctx.lineTo(width * 0.85, sweepY);
      ctx.strokeStyle = sweepGradient;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.75;
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
      aria-label="3D Holographic Event Sphere"
    >
      {/* Outer Volumetric Halo Backdrop */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/15 to-pink-500/20 blur-xl pointer-events-none -z-10 transition-opacity duration-500 ${
          isHovered ? "opacity-100 scale-105" : "opacity-75 animate-pulse"
        }`}
      />

      {/* Actual HTML5 High-DPI 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
      />

      {/* Floating Futuristic HUD Telemetry Corner Elements */}
      {/* Top Left: Live Status */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs pointer-events-none px-2 py-0.5 max-w-[130px]">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
        </span>
        <span className="font-mono font-bold tracking-wider uppercase text-cyan-200 text-[8.5px] truncate">
          EVENT MATRIX // LIVE
        </span>
      </div>

      {/* Top Right: Coordinate Badge */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs font-mono text-purple-200/80 pointer-events-none px-1.5 py-0.5 text-[7.5px]">
        <Activity size={8} className="text-cyan-400" />
        <span>3D•SPHERE</span>
      </div>

      {/* Bottom Left: Event Sessions Count */}
      <div className="absolute bottom-2 left-1.5 flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs pointer-events-none px-2 py-0.5 max-w-[135px]">
        <Calendar size={9} className="text-cyan-300 shrink-0" />
        <span className="font-bold text-white tracking-wide text-[9px] truncate">
          {eventCount} {eventCount === 1 ? "Session" : "Sessions"} Synced
        </span>
      </div>

      {/* Bottom Right: Verified Security Shield */}
      <div className="absolute bottom-2 right-1.5 flex items-center gap-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 font-bold text-emerald-300 pointer-events-none px-1.5 py-0.5 text-[8px]">
        <Shield size={9} className="text-emerald-400" />
        <span className="font-mono">VERIFIED</span>
      </div>
    </div>
  );
};

export default EventHologramSphere;

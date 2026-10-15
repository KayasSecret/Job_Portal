import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Shield, Cpu, Activity } from "lucide-react";

/**
 * CareerHologramCore
 * Ultra-premium, interactive 3D Holographic Career Core powered by real mathematical
 * 3D perspective projection on a high-DPI HTML5 canvas.
 *
 * Features:
 * - 3D Nested Polyhedral Core (truncated icosahedron vertices)
 * - Dual counter-rotating 3D Gyroscopic Gimbal Rings with depth sorting
 * - 3D orbiting energy spark particles with variable focal blur
 * - Interactive mouse parallax with smooth spring damping
 * - Volumetric holographic glow and vertical scanning sweep
 * - Automatic pause via IntersectionObserver when scrolled out of view
 * - Respects prefers-reduced-motion
 */
const CareerHologramCore = ({
  title = "Tech Role",
  company = "Verified Partner",
  compact = false,
}) => {
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

    // 3D Polyhedron Vertex Definitions (Normalized Golden-Ratio 3D Coordinates)
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ~1.618
    const baseVertices = [
      // Rectangles on coordinate planes
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    // Normalize vertices to unit sphere
    const coreVertices = baseVertices.map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return [x / len, y / len, z / len];
    });

    // Edges connecting vertices with distance threshold
    const edges = [];
    for (let i = 0; i < coreVertices.length; i++) {
      for (let j = i + 1; j < coreVertices.length; j++) {
        const dx = coreVertices[i][0] - coreVertices[j][0];
        const dy = coreVertices[i][1] - coreVertices[j][1];
        const dz = coreVertices[i][2] - coreVertices[j][2];
        const dist = Math.hypot(dx, dy, dz);
        if (dist > 0.9 && dist < 1.25) {
          edges.push([i, j]);
        }
      }
    }

    // Orbiting 3D Particle System
    const PARTICLE_COUNT = 32;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      radius: 1.35 + Math.random() * 0.45,
      speed: 0.008 + Math.random() * 0.012,
      tiltX: (Math.random() - 0.5) * 1.2,
      tiltY: (Math.random() - 0.5) * 1.2,
      size: 1.2 + Math.random() * 1.8,
      color: i % 3 === 0 ? "#06B6D4" : i % 2 === 0 ? "#A855F7" : "#EC4899",
      alpha: 0.3 + Math.random() * 0.6,
    }));

    // Mouse Tracking with Spring Damping
    const mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = Math.max(rect.width, 160);
      height = Math.max(rect.height, 160);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    // IntersectionObserver to pause loop when out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener("resize", resize);
    resize();

    // Rotation state
    let rotX = 0.3;
    let rotY = 0.5;
    let rotZ = 0.1;
    let scanLineY = 0;
    let time = 0;

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.32;
      const focalLength = 400;

      // Smooth mouse interpolation (spring feel)
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.08;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.08;

      if (!prefersReducedMotion) {
        rotX += 0.006 + mouse.currentY * 0.01;
        rotY += 0.009 + mouse.currentX * 0.015;
        rotZ += 0.004;
        time += 0.02;
        scanLineY = (Math.sin(time * 0.8) * 0.5 + 0.5) * height;
      }

      // 3D Rotation Matrix helper (Euler angles)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      const project3D = (x, y, z) => {
        // Rotate Y
        let x1 = x * cosY + z * sinY;
        let y1 = y;
        let z1 = -x * sinY + z * cosY;

        // Rotate X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        // Perspective Projection
        const distance = focalLength + z3;
        const scale = focalLength / Math.max(distance, 50);
        return {
          x: cx + x3 * scale,
          y: cy + y3 * scale,
          z: z3,
          scale: scale,
        };
      };

      // 1. Central Volumetric Core Glow
      // 1. Central Volumetric Core Glow (Light Theme)
      const corePulse = 1 + Math.sin(time * 1.5) * 0.08;
      const radialGlow = ctx.createRadialGradient(
        cx,
        cy,
        4,
        cx,
        cy,
        baseRadius * 1.35 * corePulse
      );
      radialGlow.addColorStop(0, "rgba(106, 56, 194, 0.14)");
      radialGlow.addColorStop(0.35, "rgba(168, 85, 247, 0.08)");
      radialGlow.addColorStop(0.65, "rgba(6, 182, 212, 0.04)");
      radialGlow.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dual 3D Orbiting Gimbal Rings (Vibrant on Light Surfaces)
      const draw3DRing = (ringRadius, tiltAngle, speedMult, colorHex, dashPattern) => {
        const segments = 48;
        const pts = [];
        const ringTime = time * speedMult;

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          // Elliptical ring rotated in space
          const rx = Math.cos(theta) * ringRadius;
          const ry = Math.sin(theta) * ringRadius * Math.cos(tiltAngle);
          const rz = Math.sin(theta) * ringRadius * Math.sin(tiltAngle);

          // Apply current global rotation
          const proj = project3D(rx, ry, rz);
          pts.push(proj);
        }

        // Draw segmented line with depth sorting
        for (let i = 0; i < segments; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const avgZ = (p1.z + p2.z) / 2;
          const depthAlpha = Math.max(0.25, Math.min(0.95, (avgZ + baseRadius) / (baseRadius * 2)));

          ctx.beginPath();
          ctx.setLineDash(dashPattern || []);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = colorHex.replace("ALPHA", (depthAlpha * 0.85).toFixed(2));
          ctx.lineWidth = avgZ > 0 ? 1.9 : 1.1;
          ctx.stroke();
        }

        // Add 2 glowing orbital nodes on the ring
        for (let k = 0; k < 2; k++) {
          const nodeAngle = ringTime + k * Math.PI;
          const nx = Math.cos(nodeAngle) * ringRadius;
          const ny = Math.sin(nodeAngle) * ringRadius * Math.cos(tiltAngle);
          const nz = Math.sin(nodeAngle) * ringRadius * Math.sin(tiltAngle);
          const np = project3D(nx, ny, nz);

          ctx.beginPath();
          ctx.setLineDash([]);
          ctx.arc(np.x, np.y, np.z > 0 ? 3.8 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = np.z > 0 ? "#0284C7" : "#7C3AED";
          ctx.shadowColor = "#7C3AED";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };

      // Outer & Inner Gimbal Rings
      ctx.setLineDash([]);
      draw3DRing(baseRadius * 1.32, 0.9, 0.7, "rgba(2, 132, 199, ALPHA)", [4, 4]);
      draw3DRing(baseRadius * 1.15, -0.65, -0.9, "rgba(124, 58, 237, ALPHA)", []);

      // 3. 3D Polyhedron Core Projection
      const projectedVertices = coreVertices.map(([vx, vy, vz]) => {
        return project3D(
          vx * baseRadius * 0.75,
          vy * baseRadius * 0.75,
          vz * baseRadius * 0.75
        );
      });

      // Draw Polyhedron Wireframe Edges (sorted by Z depth)
      const sortedEdges = edges.map(([i, j]) => ({
        i,
        j,
        p1: projectedVertices[i],
        p2: projectedVertices[j],
        avgZ: (projectedVertices[i].z + projectedVertices[j].z) / 2,
      })).sort((a, b) => a.avgZ - b.avgZ);

      sortedEdges.forEach(({ p1, p2, avgZ }) => {
        const depthRatio = (avgZ + baseRadius) / (baseRadius * 2);
        const alpha = Math.max(0.3, Math.min(0.95, depthRatio));

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        const edgeGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        edgeGrad.addColorStop(0, `rgba(106, 56, 194, ${alpha})`);
        edgeGrad.addColorStop(0.5, `rgba(2, 132, 199, ${alpha * 1.05})`);
        edgeGrad.addColorStop(1, `rgba(219, 39, 119, ${alpha})`);

        ctx.strokeStyle = edgeGrad;
        ctx.lineWidth = avgZ > 0 ? 1.8 : 1.0;
        ctx.stroke();
      });

      // Draw Polyhedron Nodes (Vertices)
      projectedVertices.forEach((p) => {
        if (p.z > -baseRadius * 0.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.z > 0 ? 3 : 1.8, 0, Math.PI * 2);
          ctx.fillStyle = p.z > 0 ? "#7C3AED" : "#0284C7";
          ctx.shadowColor = "#7C3AED";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 4. Orbiting 3D Quantum Particles
      particles.forEach((pt) => {
        if (!prefersReducedMotion) {
          pt.angle += pt.speed;
        }

        const px = Math.cos(pt.angle) * baseRadius * pt.radius;
        const py = Math.sin(pt.angle) * baseRadius * pt.radius * Math.cos(pt.tiltX);
        const pz = Math.sin(pt.angle) * baseRadius * pt.radius * Math.sin(pt.tiltY);

        const proj = project3D(px, py, pz);

        if (proj.z > -baseRadius * 0.8) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, pt.size * (proj.scale || 1), 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0.3, Math.min(0.95, pt.alpha * (proj.z > 0 ? 1 : 0.6)));
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      });

      // 5. Subtle Holographic Scanline Sweep
      if (!prefersReducedMotion) {
        ctx.beginPath();
        const scanGrad = ctx.createLinearGradient(0, scanLineY - 12, 0, scanLineY + 12);
        scanGrad.addColorStop(0, "rgba(106, 56, 194, 0)");
        scanGrad.addColorStop(0.5, "rgba(106, 56, 194, 0.16)");
        scanGrad.addColorStop(1, "rgba(106, 56, 194, 0)");

        ctx.fillStyle = scanGrad;
        ctx.fillRect(cx - baseRadius * 1.3, scanLineY - 10, baseRadius * 2.6, 20);
      }

      animId = requestAnimationFrame(render);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={
        compact
          ? "relative w-[185px] h-[185px] sm:w-[200px] sm:h-[200px] mx-auto flex items-center justify-center select-none group shrink-0"
          : "relative w-full max-w-[340px] h-[340px] sm:max-w-[380px] sm:h-[380px] mx-auto flex items-center justify-center select-none group"
      }
      aria-label="3D Holographic Career Command Core"
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
      {/* Top Left: Status Pill with Active Role */}
      <div
        className={`absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm pointer-events-none ${
          compact ? "px-2 py-0.5 max-w-[110px]" : "px-3 py-1 max-w-[180px]"
        }`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
        </span>
        <span
          className={`font-mono font-bold tracking-wider uppercase text-purple-200 truncate ${
            compact ? "text-[8.5px]" : "text-[10px]"
          }`}
        >
          {company}
        </span>
      </div>

      {/* Top Right: Hologram Coordinates */}
      <div
        className={`absolute top-1.5 right-1.5 flex items-center gap-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs font-mono text-purple-200/80 pointer-events-none ${
          compact ? "px-1.5 py-0.5 text-[7.5px]" : "px-2.5 py-0.5 text-[9px]"
        }`}
      >
        <Activity size={compact ? 8 : 10} className="text-cyan-400" />
        <span>3D•GEO</span>
      </div>

      {/* Bottom Left: Quantum Match Badge with Role Title */}
      <div
        className={`absolute bottom-2 left-1.5 flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 shadow-sm pointer-events-none ${
          compact ? "px-2 py-0.5 max-w-[125px]" : "px-3 py-1 max-w-[210px]"
        }`}
      >
        <Sparkles
          size={compact ? 10 : 12}
          className="text-amber-300 shrink-0 animate-spin"
          style={{ animationDuration: "12s" }}
        />
        <span
          className={`font-bold text-white tracking-wide truncate ${
            compact ? "text-[9px]" : "text-[11px]"
          }`}
        >
          {title}
        </span>
      </div>

      {/* Bottom Right: Security Verification Shield */}
      <div
        className={`absolute bottom-2 right-1.5 flex items-center gap-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 font-bold text-emerald-300 pointer-events-none ${
          compact ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-1 text-[10px]"
        }`}
      >
        <Shield size={compact ? 9 : 11} className="text-emerald-400" />
        <span className="font-mono">VERIFIED</span>
      </div>
    </div>
  );
};

export default CareerHologramCore;

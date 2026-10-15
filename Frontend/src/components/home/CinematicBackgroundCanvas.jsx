import React, { useEffect, useRef } from "react";

/**
 * CinematicBackgroundCanvas
 * High-performance HTML5 Canvas rendering a continuous, razor-sharp constellation
 * network and ambient glowing particles across the entire viewport.
 * Fixed in the background (z-0, pointer-events-none) so it flows seamlessly behind
 * all page sections from the hero down to the footer.
 */
const CinematicBackgroundCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Palette: HireNest purple identity with electric violet, magenta, and cyan accents
    const colors = [
      "#8B5CF6", // electric violet
      "#A855F7", // purple
      "#6366F1", // indigo
      "#C026D3", // fuchsia / magenta
      "#06B6D4", // subtle cyan
    ];

    let particles = [];
    const mouse = { x: -1000, y: -1000, active: false };

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Density calculation: balanced count for 60fps across mobile and desktop
      const targetCount = Math.min(
        Math.max(Math.floor(width / 24), 32),
        65
      );

      // Re-seed or adjust pool
      if (particles.length === 0) {
        for (let i = 0; i < targetCount; i++) {
          particles.push(createParticle(true));
        }
      } else if (particles.length < targetCount) {
        while (particles.length < targetCount) {
          particles.push(createParticle(false));
        }
      } else if (particles.length > targetCount) {
        particles.length = targetCount;
      }
    };

    function createParticle(randomPosition = true) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: randomPosition ? Math.random() * width : Math.random() * width,
        y: randomPosition ? Math.random() * height : height + 10,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.1 : 0.42),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.1 : 0.42),
        radius: Math.random() * 1.8 + 1.2,
        color,
        alpha: Math.random() * 0.45 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    }

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting constellation lines
      const maxDistance = 125;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistance * maxDistance) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxDistance) * 0.18;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor if near
        if (mouse.active) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdistSq = mdx * mdx + mdy * mdy;
          const mouseDist = 140;

          if (mdistSq < mouseDist * mouseDist) {
            const mdist = Math.sqrt(mdistSq);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "#C026D3";
            ctx.globalAlpha = (1 - mdist / mouseDist) * 0.28;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Subtle gentle repulsion
            const force = (1 - mdist / mouseDist) * 0.4;
            p1.x += (mdx / (mdist || 1)) * force;
            p1.y += (mdy / (mdist || 1)) * force;
          }
        }
      }

      // 2. Draw sharp, glowing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion update
        p.x += p.vx;
        p.y += p.vy;

        // Wrap-around screen bounds
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;

        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Subtle alpha breathing pulse
        const dynamicAlpha =
          p.alpha + Math.sin(time + p.pulseOffset) * 0.15;
        const clampedAlpha = Math.max(0.15, Math.min(0.85, dynamicAlpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = clampedAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset for lines
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 block w-full h-full select-none"
      aria-hidden="true"
    />
  );
};

export default CinematicBackgroundCanvas;

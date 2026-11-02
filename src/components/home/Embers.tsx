"use client";

import { useEffect, useRef } from "react";

/** Sparse rising embers on a canvas. Pauses off-screen and under reduced motion. */
export function Embers({ count = 38, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const spawn = (initial = false) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.45 + 0.15,
      vx: (Math.random() - 0.5) * 0.25,
      life: Math.random() * 0.6 + 0.4,
      phase: Math.random() * Math.PI * 2,
    });
    const ps = Array.from({ length: count }, () => spawn(true));

    let raf = 0;
    let visible = true;
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(t / 1400 + p.phase) * 0.15;
        if (p.y < -10) Object.assign(p, spawn());
        const fade = Math.min(1, p.y / h) * p.life;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, ${120 + Math.floor(p.r * 40)}, 50, ${fade})`;
        ctx.shadowColor = "rgba(255,110,30,0.9)";
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

"use client";
import { useEffect, useRef } from "react";

export function BotanicalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.globalAlpha = 0.13;
      const leafColor = "#ffffff";

      const drawLeaf = (x: number, y: number, size: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.38, size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size); ctx.lineTo(0, size);
        ctx.stroke();
        ctx.restore();
      };

      const drawStar = (x: number, y: number, r: number) => {
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const b = a + (2 * Math.PI) / 5;
          if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
          else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
          ctx.lineTo(x + r * 0.45 * Math.cos(b), y + r * 0.45 * Math.sin(b));
        }
        ctx.closePath(); ctx.fill();
      };

      const W = canvas.width;
      const H = canvas.height;
      const seeds = [
        [0.08, 0.12, 22, 0.5], [0.9, 0.08, 18, -0.4], [0.15, 0.85, 26, 0.8],
        [0.82, 0.8, 20, -0.6], [0.5, 0.05, 16, 0.2], [0.3, 0.5, 14, 1.1],
        [0.65, 0.35, 19, -0.3], [0.75, 0.65, 15, 0.9], [0.4, 0.92, 22, -0.7],
        [0.92, 0.45, 17, 0.4], [0.05, 0.55, 13, -0.5], [0.55, 0.18, 11, 1.0],
      ];
      seeds.forEach(([rx, ry, sz, ang]) => drawLeaf(rx * W, ry * H, sz, ang));
      [[0.2, 0.3, 8], [0.7, 0.15, 6], [0.85, 0.55, 7], [0.35, 0.75, 9], [0.6, 0.9, 5]].forEach(([rx, ry, r]) => drawStar(rx * W, ry * H, r));
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
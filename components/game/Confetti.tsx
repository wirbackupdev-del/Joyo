// components/game/Confetti.tsx
"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
}

const COLORS = [
  "#F5C518", "#FF7043", "#5C9BF5",
  "#A86FBE", "#4CAF50", "#ffffff", "#EF5350",
];

export function Confetti({ active }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    // Motion-sensitive users get no confetti (media query guard)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = containerRef.current;

    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 36; i++) {
      const el = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isCircle = Math.random() > 0.5;

      el.style.cssText = `
        position: absolute;
        width: 11px;
        height: 11px;
        background: ${color};
        border-radius: ${isCircle ? "50%" : "3px"};
        will-change: transform;
        left: ${20 + Math.random() * 60}%;
        top: 30%;
        --fy: ${-(Math.random() * 380 + 80)}px;
        --fx: ${(Math.random() - 0.5) * 320}px;
        --fr: ${Math.random() * 720 - 360}deg;
        --dur: ${(Math.random() * 1.2 + 0.9).toFixed(2)}s;
        --delay: ${(Math.random() * 0.4).toFixed(2)}s;
        animation: confetti-fall var(--dur) ease-out var(--delay) forwards;
        pointer-events: none;
      `;

      container.appendChild(el);
      pieces.push(el);
    }

    const cleanup = setTimeout(() => {
      pieces.forEach((el) => el.remove());
    }, 3000);

    return () => {
      clearTimeout(cleanup);
      pieces.forEach((el) => el.remove());
    };
  }, [active]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9000] overflow-hidden"
    />
  );
}

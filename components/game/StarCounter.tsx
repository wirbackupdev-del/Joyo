// components/game/StarCounter.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface StarCounterProps {
  count: number;
  /** Icon + number size in px */
  size?: number;
  className?: string;
}

/**
 * Live star tally with a spring "pop" every time the number changes —
 * children feel each point of progress the moment it lands.
 */
export function StarCounter({ count, size = 24, className = "" }: StarCounterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label={String(count)}>
      <Star
        className="text-[#F5C518] fill-[#F5C518] drop-shadow-sm shrink-0"
        size={size}
      />
      <span className="relative inline-flex items-center justify-center overflow-visible">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ scale: 1.7, y: -8, opacity: 0.6 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.55, duration: 0.45 }}
            className="font-fredoka leading-none inline-block"
            style={{ fontSize: size * 1.15 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

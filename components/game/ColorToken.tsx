// components/game/ColorToken.tsx
"use client";
import { motion } from "framer-motion";
import { playSound } from "@/lib/sounds";

interface Props {
  hex: string;
  /** Translated color name for assistive tech */
  label: string;
  onMatch: () => void;
  onWrong: () => void;
  isCorrect: boolean;
  disabled: boolean;
  isIdle: boolean;
}

export function ColorToken({ 
  hex, 
  label,
  onMatch, 
  onWrong, 
  isCorrect, 
  disabled,
  isIdle
}: Props) {
  
  const handleTap = () => {
    if (disabled) return;
    playSound("pop");
    if (isCorrect) onMatch();
    else onWrong();
  };

  return (
    <div className="relative aspect-square w-full">
      <motion.button
        onClick={handleTap}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.9, y: 4, boxShadow: "0 0px 0 rgba(0,0,0,0)" } : {}}
        animate={isIdle && isCorrect ? { scale: [1, 1.08, 1], rotate:[0, -3, 3, 0] } : {}}
        transition={isIdle && isCorrect ? { repeat: Infinity, duration: 1.5 } : { duration: 0.2 }}
        className={`w-full h-full rounded-full border-4 border-white flex items-center justify-center transition-all ${
          disabled ? "opacity-30 pointer-events-none" : "cursor-pointer"
        }`}
        style={{
          backgroundColor: hex,
          // Deep tactile shadow
          boxShadow: disabled ? "none" : `0 8px 0 rgba(0,0,0,0.15), 0 15px 20px rgba(0,0,0,0.1)`,
        }}
        aria-label={label}
      >
        {/* Subtle inner highlight to make it look like a shiny paint drop or jelly */}
        <div className="absolute top-[10%] left-[15%] w-[30%] h-[30%] bg-white/30 rounded-full blur-[2px]" />
      </motion.button>
    </div>
  );
}
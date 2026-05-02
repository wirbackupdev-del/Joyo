// components/game/LetterToken.tsx
"use client";
import { motion, PanInfo } from "framer-motion";
import { playSound } from "@/lib/sounds";
import React from "react";

interface Props {
  char: string;
  color: string;
  onMatch: () => void;
  onWrong: () => void;
  isCorrect: boolean;
  disabled: boolean;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
}

export function LetterToken({ 
  char, 
  color, 
  onMatch, 
  onWrong, 
  isCorrect, 
  disabled, 
  dropZoneRef 
}: Props) {
  
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const rect = dropZone.getBoundingClientRect();
    
    // Check if the token was dropped inside the drop zone boundaries
    const isOver = (
      info.point.x > rect.left &&
      info.point.x < rect.right &&
      info.point.y > rect.top &&
      info.point.y < rect.bottom
    );

    if (isOver) {
      if (isCorrect) onMatch();
      else onWrong();
    }
  };

  return (
    <div className="relative aspect-square w-full">
      <motion.div
        drag={!disabled}
        dragSnapToOrigin
        dragElastic={0.12}
        onDragStart={() => playSound("pop")}
        onDragEnd={handleDragEnd}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileDrag={{ scale: 1.15, zIndex: 100, rotate: [-2, 2, -2] }}
        className={`w-full h-full rounded-full bg-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] border-b-[6px] border-black/5 transition-opacity ${
          disabled ? "opacity-30 pointer-events-none" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <span 
          className="font-fredoka text-6xl drop-shadow-sm select-none" 
          style={{ color }}
        >
          {char}
        </span>
      </motion.div>
    </div>
  );
}
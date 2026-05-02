"use client";
import { motion, PanInfo } from "framer-motion";
import { playSound } from "@/lib/sounds";
import React from "react";

interface Props {
  svgPath: string;
  color: string;
  onMatch: () => void;
  onWrong: () => void;
  isCorrectShape: boolean;
  disabled: boolean;
  dropZoneRef: React.RefObject<HTMLDivElement | null>; // Allow null
}

export function AnswerToken({ 
  svgPath, 
  color, 
  onMatch, 
  onWrong, 
  isCorrectShape, 
  disabled, 
  dropZoneRef 
}: Props) {
  
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const rect = dropZone.getBoundingClientRect();
    
    // info.point provides absolute coordinates on the screen
    const isOver = (
      info.point.x > rect.left &&
      info.point.x < rect.right &&
      info.point.y > rect.top &&
      info.point.y < rect.bottom
    );

    if (isOver) {
      if (isCorrectShape) onMatch();
      else onWrong();
    }
  };

  return (
    <div className="relative aspect-square w-full">
      <motion.div
        drag={!disabled}
        dragSnapToOrigin
        dragElastic={0.1}
        onDragStart={() => playSound("pop")}
        onDragEnd={handleDragEnd}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileDrag={{ scale: 1.1, zIndex: 100 }}
        className={`w-full h-full rounded-full bg-white flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.13)] border-4 border-transparent transition-opacity ${
          disabled ? "opacity-30" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <svg viewBox="0 0 100 100" className="w-[52%] h-[52%]" style={{ color }}>
          <path d={svgPath} fill="currentColor" />
        </svg>
      </motion.div>
    </div>
  );
}
// components/game/DragToken.tsx
"use client";

import { motion, type PanInfo } from "framer-motion";
import { playSound } from "@/lib/sounds";

interface DragTokenProps {
  /** Token content (SVG or letter/number glyph). */
  children: React.ReactNode;
  /** "circle" → letters/shapes (classic round token). "squircle" → numbers (rounded-4xl). */
  shape: "circle" | "squircle";
  onMatch: () => void;
  onWrong: () => void;
  isCorrect: boolean;
  disabled: boolean;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * The single draggable answer token used across Shapes, Letters and Numbers.
 * Drop-zone hit detection runs on `info.point` (absolute page coordinates),
 * so it is unaffected by framer-motion's drag transforms.
 */
export function DragToken({
  children,
  shape,
  onMatch,
  onWrong,
  isCorrect,
  disabled,
  dropZoneRef,
}: DragTokenProps) {
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (disabled) return;
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const rect = dropZone.getBoundingClientRect();
    const isOver =
      info.point.x > rect.left &&
      info.point.x < rect.right &&
      info.point.y > rect.top &&
      info.point.y < rect.bottom;

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
        className={`w-full h-full bg-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.13)] border-b-[6px] border-black/5 transition-opacity ${
          shape === "squircle" ? "rounded-[32px]" : "rounded-full"
        } ${disabled ? "opacity-30 pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

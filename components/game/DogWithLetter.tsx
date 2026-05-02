// components/game/DogWithLetter.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  letter: string;
  color: string;
  className?: string;
}

/**
 * The Letters module mascot — the dog character holding a wooden sign
 * that displays the current letter. Replaces the generic AnimalCharacter
 * so the dog always appears here (per Brand DNA: dog = Letters module).
 */
export function DogWithLetter({ letter, color, className = "" }: Props) {
  return (
    <motion.svg
      viewBox="0 0 160 160"
      className={`drop-shadow-lg ${className}`}
      animate={{
        y:      [0, -7, 0],
        rotate: [-0.8, 1.2, -0.8],
      }}
      transition={{
        duration: 2.9,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      {/* ── SIGN / LETTER CARD (held out front, slightly below face) ── */}
      {/* Sign post */}
      <rect x="76" y="104" width="8" height="28" rx="3" fill="#8D6E63" />
      {/* Sign board */}
      <rect x="46" y="78" width="68" height="50" rx="10" fill="#FFF8E7" stroke="#8D6E63" strokeWidth="3.5" />
      {/* Sign board shadow */}
      <rect x="46" y="120" width="68" height="8" rx="4" fill="rgba(0,0,0,0.06)" />

      {/* Letter on sign — animates on change */}
      <AnimatePresence mode="wait">
        <motion.text
          key={letter}
          x="80"
          y="113"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Fredoka One', 'Fredoka', cursive"
          fontSize="34"
          fill={color}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={  { scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{ filter: `drop-shadow(0 2px 6px ${color}55)` }}
        >
          {letter}
        </motion.text>
      </AnimatePresence>

      {/* ── DOG HEAD ── */}
      {/* Floppy left ear */}
      <ellipse cx="36" cy="52" rx="16" ry="22"
        fill="#FFCC80" transform="rotate(-15 36 52)" />
      {/* Floppy right ear */}
      <ellipse cx="96" cy="52" rx="16" ry="22"
        fill="#FFCC80" transform="rotate(15 96 52)" />

      {/* Head */}
      <circle cx="66" cy="54" r="36" fill="#FFCC80" />
      {/* Muzzle */}
      <ellipse cx="66" cy="66" rx="18" ry="13" fill="#FFE0B2" />

      {/* Eyes */}
      <circle cx="54" cy="47" r="7"   fill="#212121" opacity="0.88" />
      <circle cx="78" cy="47" r="7"   fill="#212121" opacity="0.88" />
      <circle cx="56" cy="45" r="3"   fill="white" />
      <circle cx="80" cy="45" r="3"   fill="white" />

      {/* Nose */}
      <ellipse cx="66" cy="62" rx="6" ry="4.5" fill="#EF9A9A" />

      {/* Smile */}
      <path d="M57 70 Q66 78 75 70"
        stroke="#795548" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="46" cy="62" r="6" fill="#EF9A9A" opacity="0.45" />
      <circle cx="86" cy="62" r="6" fill="#EF9A9A" opacity="0.45" />

      {/* ── PAWS holding the sign ── */}
      {/* Left paw */}
      <ellipse cx="50" cy="96" rx="10" ry="8"
        fill="#FFCC80" stroke="#FFB74D" strokeWidth="1.5" />
      {/* Right paw */}
      <ellipse cx="110" cy="96" rx="10" ry="8"
        fill="#FFCC80" stroke="#FFB74D" strokeWidth="1.5" />
    </motion.svg>
  );
}

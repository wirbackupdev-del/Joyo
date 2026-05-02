// components/game/AnimalCharacter.tsx
"use client";

import { motion } from "framer-motion";

type Animal = "koala" | "fox" | "bear" | "dog" | "rabbit";

interface Props {
  animal: Animal;
  color: string;
  className?: string;
}

// Each animal is drawn in a 120×120 viewBox — pure SVG, zero assets required.
function getAnimalSVG(animal: Animal, color: string): React.ReactNode {
  switch (animal) {
    case "koala":
      return (
        <>
          {/* Ears */}
          <ellipse cx="38" cy="46" rx="16" ry="18" fill={color} />
          <ellipse cx="82" cy="46" rx="16" ry="18" fill={color} />
          <ellipse cx="38" cy="44" rx="10" ry="12" fill="#b0bec5" />
          <ellipse cx="82" cy="44" rx="10" ry="12" fill="#b0bec5" />
          {/* Head */}
          <circle cx="60" cy="68" r="34" fill={color} />
          <ellipse cx="60" cy="78" rx="22" ry="14" fill="#f5e6d3" />
          {/* Nose */}
          <ellipse cx="60" cy="64" r="8" fill="#37474f" opacity="0.9" />
          <circle cx="62" cy="62" r="3" fill="white" />
          {/* Eyes */}
          <circle cx="48" cy="60" r="6" fill="#212121" opacity="0.88" />
          <circle cx="72" cy="60" r="6" fill="#212121" opacity="0.88" />
          <circle cx="49.5" cy="58.5" r="2.5" fill="white" />
          <circle cx="73.5" cy="58.5" r="2.5" fill="white" />
          {/* Cheeks */}
          <circle cx="44" cy="72" r="5" fill="#ef9a9a" opacity="0.6" />
          <circle cx="76" cy="72" r="5" fill="#ef9a9a" opacity="0.6" />
          {/* Smile */}
          <path d="M52 80 Q60 87 68 80" stroke="#37474f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );

    case "fox":
      return (
        <>
          {/* Ears */}
          <polygon points="60,12 44,40 76,40" fill={color} />
          <polygon points="60,12 50,36 60,34" fill="white" />
          {/* Head */}
          <circle cx="60" cy="68" r="32" fill={color} />
          <ellipse cx="60" cy="78" rx="18" ry="14" fill="white" />
          {/* Eyes */}
          <circle cx="50" cy="60" r="6.5" fill="#212121" opacity="0.86" />
          <circle cx="70" cy="60" r="6.5" fill="#212121" opacity="0.86" />
          <circle cx="51.5" cy="58.5" r="2.5" fill="white" />
          <circle cx="71.5" cy="58.5" r="2.5" fill="white" />
          {/* Nose + mouth */}
          <ellipse cx="60" cy="72" r="5.5" fill="#ef9a9a" />
          <path d="M54 79 Q60 85 66 79" stroke="#37474f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="44" cy="70" r="5" fill="#FFCCBC" opacity="0.6" />
          <circle cx="76" cy="70" r="5" fill="#FFCCBC" opacity="0.6" />
        </>
      );

    case "bear":
      return (
        <>
          {/* Ears */}
          <circle cx="40" cy="44" r="15" fill={color} />
          <circle cx="80" cy="44" r="15" fill={color} />
          <circle cx="40" cy="44" r="8"  fill="#a1887f" />
          <circle cx="80" cy="44" r="8"  fill="#a1887f" />
          {/* Head */}
          <circle cx="60" cy="70" r="32" fill={color} />
          <ellipse cx="60" cy="80" rx="18" ry="13" fill="#bcaaa4" />
          {/* Eyes */}
          <circle cx="50" cy="62" r="6"   fill="#212121" opacity="0.86" />
          <circle cx="70" cy="62" r="6"   fill="#212121" opacity="0.86" />
          <circle cx="51.5" cy="60.5" r="2.5" fill="white" />
          <circle cx="71.5" cy="60.5" r="2.5" fill="white" />
          {/* Nose */}
          <circle cx="60" cy="76" r="5"   fill="#5d4037" />
          {/* Smile */}
          <path d="M53 83 Q60 89 67 83" stroke="#4e342e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="44" cy="73" r="5" fill="#ef9a9a" opacity="0.5" />
          <circle cx="76" cy="73" r="5" fill="#ef9a9a" opacity="0.5" />
        </>
      );

    case "dog":
      return (
        <>
          {/* Floppy ears */}
          <ellipse cx="40" cy="52" rx="14" ry="20" fill="#FFCC80" transform="rotate(-10 40 52)" />
          <ellipse cx="80" cy="52" rx="14" ry="20" fill="#FFCC80" transform="rotate(10 80 52)" />
          {/* Head */}
          <circle cx="60" cy="68" r="30" fill="#FFCC80" />
          <ellipse cx="60" cy="77" rx="15" ry="11" fill="#FFE0B2" />
          {/* Eyes */}
          <circle cx="51" cy="61" r="6"   fill="#212121" opacity="0.88" />
          <circle cx="69" cy="61" r="6"   fill="#212121" opacity="0.88" />
          <circle cx="52.5" cy="59.5" r="2.5" fill="white" />
          <circle cx="70.5" cy="59.5" r="2.5" fill="white" />
          {/* Nose */}
          <ellipse cx="60" cy="74" r="5" fill="#ef9a9a" />
          {/* Smile */}
          <path d="M53 81 Q60 88 67 81" stroke="#795548" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="44" cy="72" r="5" fill="#ef9a9a" opacity="0.5" />
          <circle cx="76" cy="72" r="5" fill="#ef9a9a" opacity="0.5" />
        </>
      );

    case "rabbit":
      return (
        <>
          {/* Long ears */}
          <ellipse cx="46" cy="32" rx="10" ry="26" fill="#fce4ec" transform="rotate(-10 46 32)" />
          <ellipse cx="74" cy="32" rx="10" ry="26" fill="#fce4ec" transform="rotate(10 74 32)" />
          <ellipse cx="46" cy="32" rx="6"  ry="20" fill="#F48FB1" transform="rotate(-10 46 32)" />
          <ellipse cx="74" cy="32" rx="6"  ry="20" fill="#F48FB1" transform="rotate(10 74 32)" />
          {/* Head */}
          <circle cx="60" cy="72" r="30" fill="#fce4ec" />
          <ellipse cx="60" cy="80" rx="14" ry="10" fill="#F8BBD0" />
          {/* Eyes */}
          <circle cx="51" cy="65" r="6"   fill="#ad1457" opacity="0.78" />
          <circle cx="69" cy="65" r="6"   fill="#ad1457" opacity="0.78" />
          <circle cx="52.5" cy="63.5" r="2.5" fill="white" />
          <circle cx="70.5" cy="63.5" r="2.5" fill="white" />
          {/* Nose */}
          <circle cx="60" cy="77" r="4.5" fill="#ef9a9a" />
          {/* Smile */}
          <path d="M54 83 Q60 89 66 83" stroke="#ad1457" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="44" cy="74" r="5" fill="#ef9a9a" opacity="0.5" />
          <circle cx="76" cy="74" r="5" fill="#ef9a9a" opacity="0.5" />
        </>
      );
  }
}

export function AnimalCharacter({ animal, color, className = "" }: Props) {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={`drop-shadow-lg ${className}`}
      animate={{
        y:      [0, -8, 0],
        rotate: [-1, 1.5, -1],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      {getAnimalSVG(animal, color)}
    </motion.svg>
  );
}

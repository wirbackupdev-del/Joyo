// app/[locale]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { useJoyoStore } from "@/store/useJoyoStore";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { playSound } from "@/lib/sounds";

export default function SplashPage() {
  const router = useRouter();
  const t = useTranslations("Splash");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Play the signature JOYO cheer shortly after mount
    const soundTimer = setTimeout(() => {
      playSound("cheer");
    }, 600);

    // 2. Animate the loading bar smoothly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Fills over ~2.5 seconds
      });
    }, 50);

    // 3. Routing Logic: Check for profile and redirect when loading completes
    const navTimer = setTimeout(() => {
      // Access store directly to guarantee we have the hydrated state
      const hasProfile = useJoyoStore.getState().childName.trim().length > 0;
      
      if (hasProfile) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    }, 3200);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(navTimer);
      clearInterval(interval);
    };
  }, [router]);

  // The JOYO Logo letters - Alternating Green and White (DNA requested Yellow/Green vibe)
  const letters =[
    { char: "J", color: "text-white" },
    { char: "O", color: "text-[#4CAF50]" },
    { char: "Y", color: "text-white" },
    { char: "O", color: "text-[#4CAF50]" },
  ];

  return (
    <div className="relative min-h-screen bg-[#F5C518] overflow-hidden flex flex-col items-center justify-center font-nunito touch-none select-none">
      {/* Soft background texture */}
      <BotanicalBackground />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6">
        
        {/* ── MASCOT REVEAL ──────────────────────────────── */}
        <motion.div
          initial={{ y: 150, scale: 0.5, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100,
            delay: 0.2,
          }}
          className="relative z-10 mb-2"
        >
          {/* Subtle glow behind the Koala */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/30 rounded-full blur-2xl pointer-events-none" />
          
          <AnimalCharacter 
            animal="koala" 
            color="#FFF8E7" // Using cream for the Koala base to contrast the yellow bg
            className="w-56 h-56 drop-shadow-[0_20px_30px_rgba(212,168,0,0.5)]" 
          />
        </motion.div>

        {/* ── LOGO ANIMATION ────────────────────────────── */}
        <div className="flex gap-1 mb-16 z-20" aria-label={t("ariaLabel")}>
          {letters.map((item, i) => (
            <motion.span
              key={i}
              initial={{ y: -50, opacity: 0, rotate: -15 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                bounce: 0.6,
                delay: 0.6 + i * 0.1,
              }}
              className={`font-fredoka text-[5.5rem] tracking-tight drop-shadow-[0_6px_0_rgba(212,168,0,1)] ${item.color}`}
            >
              {item.char}
            </motion.span>
          ))}
        </div>

        {/* ── LOADING BAR ───────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-16 w-full max-w-60 flex flex-col items-center gap-3"
        >
          <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden shadow-inner p-1">
            <motion.div
              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
          <span className="font-bold text-[#D4A800] text-sm tracking-widest uppercase">
            {t("loading")}
          </span>
        </motion.div>

      </main>
    </div>
  );
}
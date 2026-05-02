// app/[locale]/progress/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Lock, Play, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { Confetti } from "@/components/game/Confetti";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound } from "@/lib/sounds";

export default function ProgressPage() {
  const t = useTranslations("Progress");
  const tc = useTranslations("Common");
  const tm = useTranslations("Modules");
  const router = useRouter();

  // Zustand state
  const { stars, completedModules, avatar } = useJoyoStore();
  const[mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Framer Motion kinetic number counter
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    setMounted(true);

    // Play a delightful sound on load based on their star count
    if (stars > 0) {
      playSound("pop");
      const animation = animate(count, stars, {
        duration: 1.5,
        type: "spring",
        bounce: 0.25,
      });

      // If they have all 4 core modules done, trigger confetti
      if (completedModules.length >= 4) {
        setTimeout(() => setShowConfetti(true), 500);
        setTimeout(() => playSound("cheer"), 500);
      }

      return animation.stop;
    }
  }, [stars, count, completedModules]);

  const goBack = () => {
    playSound("pop");
    router.back();
  };

  const goPlay = () => {
    playSound("pop");
    router.push("/modules");
  };

  // Define the core modules to render the badge grid
  const BADGES =[
    { id: "shapes", label: tm("shapes"), color: "#4CAF50", shadow: "rgba(56,142,60,1)" },
    { id: "letters", label: tm("letters"), color: "#F5C518", shadow: "rgba(212,168,0,1)" },
    { id: "numbers", label: tm("numbers"), color: "#5C9BF5", shadow: "rgba(33,105,243,1)" },
    { id: "colors", label: tm("colors"), color: "#A86FBE", shadow: "rgba(123,31,162,1)" },
  ];

  // Prevent hydration errors
  if (!mounted) return <div className="min-h-screen bg-[#FFF8E7]" />;

  const isEmpty = stars === 0;

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />
      <Confetti active={showConfetti} />

      <main className="relative z-10 flex flex-col items-center min-h-screen w-full max-w-107.5 mx-auto px-6 pt-6 pb-10">
        
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="w-full flex items-center justify-between mb-6 z-20">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack} 
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
            aria-label={tc("back")}
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white px-6 py-3 rounded-full shadow-sm border-2 border-[#E8DCC8] flex items-center gap-2"
          >
            <Trophy className="text-[#FF7043]" size={20} strokeWidth={2.5} />
            <h1 className="font-fredoka text-xl text-[#FF7043] uppercase tracking-wide mt-1">
              {t("title")}
            </h1>
          </motion.div>
          
          <div className="w-14 h-14" /> {/* Spacer */}
        </header>

        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* ── EMPTY STATE ──────────────────────────────── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="flex-1 w-full flex flex-col items-center justify-center -mt-10"
            >
              <div className="relative mb-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/50 rounded-full blur-xl" />
                <AnimalCharacter animal={avatar} color="#F5C518" className="w-48 h-48 relative z-10" />
              </div>
              
              <h2 className="font-fredoka text-3xl text-[#FF7043] mb-3 text-center drop-shadow-sm">
                {t("emptyTitle")}
              </h2>
              <p className="text-[#7A6552] text-xl font-bold text-center max-w-280px mb-10 leading-relaxed">
                {t("emptyBody")}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={goPlay}
                className="w-full max-w-300px bg-[#4CAF50] rounded-32px p-6 flex items-center justify-center gap-3 shadow-[0_8px_0_rgba(56,142,60,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(56,142,60,1)] transition-all"
              >
                <Play className="text-white fill-white" size={32} />
                <span className="font-fredoka text-3xl text-white mt-1">
                  {t("startPlaying")}
                </span>
              </motion.button>
            </motion.div>

          ) : (
            /* ── CONTENT STATE ────────────────────────────── */
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 w-full flex flex-col items-center"
            >
              {/* STAR COUNTER HERO */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                className="relative w-full max-w-[320px] aspect-square flex flex-col items-center justify-center mb-8"
              >
                {/* Massive glowing background star */}
                <Star className="absolute inset-0 w-full h-full text-[#F5C518] fill-[#F5C518] opacity-20 blur-xl animate-pulse" />
                <Star className="absolute inset-0 w-full h-full text-[#F5C518] fill-[#F5C518] drop-shadow-[0_15px_30px_rgba(245,197,24,0.4)]" />
                
                <div className="relative z-10 flex flex-col items-center justify-center mt-4">
                  <motion.span className="font-fredoka text-[7rem] text-white drop-shadow-[0_4px_0_rgba(212,168,0,1)] leading-none">
                    {rounded}
                  </motion.span>
                  <span className="font-bold text-white/90 text-xl tracking-wider uppercase mt-2 drop-shadow-sm">
                    {t("totalStars")}
                  </span>
                </div>
              </motion.div>

              {/* BADGES GRID SECTION */}
              <div className="w-full bg-white rounded-[40px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border-4 border-white border-b-[#E8DCC8]">
                <h3 className="font-fredoka text-2xl text-[#3D2C1E] mb-6 text-center">
                  {t("badgesEarned")}
                </h3>

                <div className="grid grid-cols-2 gap-5 w-full">
                  {BADGES.map((badge, idx) => {
                    const isUnlocked = completedModules.includes(badge.id);

                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1, type: "spring", bounce: 0.4 }}
                        className={`relative aspect-square rounded-24px flex flex-col items-center justify-center gap-3 transition-all duration-500 ${
                          isUnlocked 
                            ? "bg-white" 
                            : "bg-[#F7F4EE] opacity-70 grayscale-[0.8]"
                        }`}
                        style={{
                          backgroundColor: isUnlocked ? badge.color : "#F7F4EE",
                          boxShadow: isUnlocked 
                            ? `0 6px 0 ${badge.shadow}, 0 10px 20px rgba(0,0,0,0.1)` 
                            : "inset 0 4px 10px rgba(0,0,0,0.05)",
                          border: isUnlocked ? "none" : "2px dashed #E8DCC8"
                        }}
                      >
                        {isUnlocked ? (
                          <>
                            <Trophy className="text-white drop-shadow-md w-10 h-10" />
                            <span className="font-fredoka text-white text-xl drop-shadow-sm">
                              {badge.label}
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock className="text-[#B8A898] w-10 h-10 mb-1" />
                            <span className="font-bold text-[#B8A898] text-sm tracking-wide">
                              {t("locked")}
                            </span>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
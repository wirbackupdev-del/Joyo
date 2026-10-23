// app/[locale]/progress/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Star, Lock, Play, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { BADGES } from "@/lib/lessons/badges";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { Confetti } from "@/components/game/Confetti";
import { SessionWatcher } from "@/components/game/SessionWatcher";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound, startMusic, stopMusic } from "@/lib/sounds";

export default function ProgressPage() {
  const t = useTranslations("Progress");
  const tc = useTranslations("Common");
  const tBadge = useTranslations("Badge");
  const router = useRouter();

  const hydrated = useHydrated();
  const { stars, avatar } = useJoyoStore();
  const earned = useJoyoStore((s) =>
    BADGES.filter((b) => b.check(s)).map((b) => b.id)
  );

  const [showConfetti, setShowConfetti] = useState(false);

  // Framer Motion kinetic number counter
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (stars > 0) {
      playSound("pop");
      const animation = animate(count, stars, {
        duration: 1.5,
        type: "spring" as const,
        bounce: 0.25,
      });

      // All 8 badges earned → celebrate!
      if (earned.length === BADGES.length) {
        const confettiTimer = setTimeout(() => setShowConfetti(true), 500);
        const cheerTimer = setTimeout(() => playSound("cheer"), 500);
        return () => {
          clearTimeout(confettiTimer);
          clearTimeout(cheerTimer);
          animation.stop();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    playSound("pop");
    router.back();
  };

  const goPlay = () => {
    playSound("pop");
    router.push("/modules");
  };

  // Avoid hydration mismatches: the store may be empty at SSR
  if (!hydrated) return <div className="min-h-screen bg-[#FFF8E7]" />;

  const isEmpty = stars === 0;

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] overflow-hidden flex flex-col touch-none select-none">
      <BotanicalBackground />
      <SessionWatcher />
      <Confetti active={showConfetti} />

      <main className="relative z-10 flex flex-col items-center min-h-screen w-full max-w-[430px] mx-auto px-6 pt-6 pb-10">
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="w-full flex items-center justify-between mb-6 z-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
            aria-label={tc("back")}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
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
              <p className="text-[#7A6552] text-xl font-bold text-center max-w-[280px] mb-10 leading-relaxed">
                {t("emptyBody")}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={goPlay}
                className="w-full max-w-[300px] bg-[#4CAF50] rounded-[32px] p-6 flex items-center justify-center gap-3 shadow-[0_8px_0_rgba(56,142,60,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(56,142,60,1)] transition-all"
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

              {/* BADGES GRID SECTION — the cabinet */}
              <div className="w-full bg-white rounded-[40px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border-4 border-white border-b-[#E8DCC8]">
                <h3 className="font-fredoka text-2xl text-[#3D2C1E] mb-2 text-center">
                  {t("badgesEarned")}
                </h3>
                <p className="text-[#B8A898] font-bold text-sm text-center mb-6">
                  {t("badgesCount", { earned: earned.length, total: BADGES.length })}
                </p>

                <div className="grid grid-cols-2 gap-5 w-full">
                  {BADGES.map((badge, idx) => {
                    const isUnlocked = earned.includes(badge.id);

                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.06, type: "spring", bounce: 0.4 }}
                        className={`relative aspect-square rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all duration-500 ${
                          isUnlocked ? "" : "grayscale"
                        }`}
                        style={{
                          backgroundColor: isUnlocked ? badge.color : "#F7F4EE",
                          boxShadow: isUnlocked
                            ? `0 6px 0 ${badge.shadow}, 0 10px 20px rgba(0,0,0,0.1)`
                            : "inset 0 4px 10px rgba(0,0,0,0.05)",
                          border: isUnlocked ? "none" : "2px dashed #E8DCC8",
                        }}
                        aria-label={tBadge(badge.nameKey as "firstStar")}
                      >
                        {isUnlocked ? (
                          <>
                            <Trophy className="text-white drop-shadow-md w-10 h-10" />
                            <span className="font-fredoka text-white text-lg drop-shadow-sm text-center px-2">
                              {(tBadge as (key: string) => string)(badge.nameKey)}
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

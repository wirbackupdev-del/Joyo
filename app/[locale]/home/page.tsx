// app/[locale]/home/page.tsx
"use client";

import { useEffect } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { Settings, Trophy, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { StarCounter } from "@/components/game/StarCounter";
import { SessionWatcher } from "@/components/game/SessionWatcher";
import { MODULE_META } from "@/lib/lessons/moduleMeta";
import { playSound, startMusic, stopMusic, say, unlockAudioEngine } from "@/lib/sounds";
import { vibrate } from "@/lib/haptics";

export default function HomePage() {
  const t = useTranslations("Home");
  const tc = useTranslations("Common");
  const tm = useTranslations("Modules");
  const reducedMotion = useReducedMotion();

  const router = useRouter();
  const hydrated = useHydrated();
  const { childName, avatar, stars, lastPlayed } = useJoyoStore();
  const mascotControls = useAnimation();

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  useEffect(() => {
    mascotControls.start({ scale: 1, rotate: 0 });
    const audioTimer = setTimeout(() => playSound("pop"), 500);
    return () => clearTimeout(audioTimer);
  }, [mascotControls]);

  // Speak the child's name in the greeting — pre-readers only *hear* it
  useEffect(() => {
    if (!hydrated || !childName?.trim()) return;
    const timer = setTimeout(() => say(t("greeting", { name: childName.trim() })), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const handleMascotTap = async () => {
    playSound("pop");
    vibrate("pop");

    await mascotControls.start({
      scaleY: [1, 0.8, 1.1, 1],
      scaleX: [1, 1.1, 0.9, 1],
      y: [0, 20, -30, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    });

    mascotControls.start({ scale: 1, rotate: 0 });
  };

  const navigateWithSound = (route: "/modules" | "/progress" | "/play/letters") => {
    playSound("pop");
    unlockAudioEngine();
    router.push(route);
  };

  const goParent = () => {
    playSound("pop");
    stopMusic(); // parent zone is quiet
    router.push("/parent");
  };

  // SAFETY FALLBACKS — the store may be empty if a user skipped onboarding
  const displayName = childName?.trim() ? childName : tc("superstar");
  const safeAvatar = avatar || "koala";

  const continueTarget = (() => {
    if (!hydrated || !lastPlayed) return null;
    const meta = MODULE_META[lastPlayed.moduleId as keyof typeof MODULE_META];
    const done = useJoyoStore.getState().completedModules.includes(lastPlayed.moduleId);
    if (done || !meta) return null;
    return {
      href: meta.href as "/play/letters",
      title: tm(meta.titleKey as "shapes"),
      level: lastPlayed.level + 1,
      color: meta.color,
    };
  })();

  if (!hydrated) return <div className="min-h-screen bg-[#FFF8E7]" />;

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] overflow-hidden flex flex-col touch-none select-none">
      <BotanicalBackground />
      <SessionWatcher />

      <main className="relative z-10 flex flex-col items-center h-full-screen w-full max-w-[430px] mx-auto px-6 py-6">
        {/* ── TOP NAVIGATION ──────────────────────────────── */}
        <header className="w-full flex items-center justify-between z-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={goParent}
            className="w-14 h-14 rounded-[20px] bg-white border-b-4 border-[#E8DCC8] flex items-center justify-center text-[#B8A898] active:border-b-0 active:translate-y-1 shadow-sm transition-all"
            aria-label={t("parentZone")}
          >
            <Settings size={28} strokeWidth={2.5} />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateWithSound("/progress")}
            className="h-14 px-5 rounded-[20px] bg-white border-b-4 border-[#E8DCC8] flex active:border-b-0 active:translate-y-1 shadow-sm transition-all"
            aria-label={t("starsCount")}
          >
            <StarCounter count={stars || 0} />
          </motion.button>
        </header>

        {/* ── WELCOME TEXT ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-center ${continueTarget ? "mt-6" : "mt-10"} mb-4`}
        >
          <h1 className="font-fredoka text-4xl text-[#3D2C1E] mb-2 drop-shadow-sm">
            {t("greeting", { name: displayName })} 👋
          </h1>
          <p className="text-[#7A6552] text-xl font-bold">{t("subtitle")}</p>
        </motion.div>

        {/* ── INTERACTIVE MASCOT ────────────────────────── */}
        <div className="relative flex-1 flex items-center justify-center w-full min-h-[300px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F5C518]/20 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={mascotControls}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 100,
              delay: 0.3,
              ...(reducedMotion ? { damping: 40, stiffness: 200 } : {}),
            }}
            className="relative cursor-pointer z-10"
            onClick={handleMascotTap}
            role="button"
            aria-label={t("tapMe")}
          >
            <AnimalCharacter
              animal={safeAvatar}
              color="#F5C518"
              className="w-64 h-64 drop-shadow-2xl"
            />

            <motion.div
              animate={reducedMotion ? {} : { y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 right-0 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-[#E8DCC8] pointer-events-none"
            >
              <span className="font-bold text-[#FF7043] text-sm whitespace-nowrap">
                {t("tapMe")}
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
            </motion.div>
          </motion.div>
        </div>

        {/* ── MAIN ACTIONS ──────────────────────────────── */}
        <div className="w-full flex flex-col gap-4 mt-auto mb-4">
          {/* Continue where the child left off */}
          {continueTarget && (
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15, delay: 0.35 }}
              onClick={() => navigateWithSound(continueTarget.href)}
              className="w-full bg-white rounded-[28px] p-4 flex items-center gap-4 border-4 border-[#F5C518]/60 border-b-8 active:border-b-4 active:translate-y-1 shadow-md transition-all text-start"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-fredoka text-white"
                style={{ backgroundColor: continueTarget.color }}
              >
                <ChevronRight size={28} strokeWidth={3.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-fredoka text-xl text-[#3D2C1E]">
                  {t("continueTitle")}
                </h3>
                <p className="text-[#7A6552] font-bold text-sm">
                  {continueTarget.title} • {t("continueLevel", { n: continueTarget.level })}
                </p>
              </div>
            </motion.button>
          )}

          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15, delay: 0.5 }}
            onClick={() => navigateWithSound("/modules")}
            className="group relative w-full bg-[#4CAF50] rounded-[32px] p-6 flex items-center justify-center gap-4 shadow-[0_10px_0_rgba(56,142,60,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(56,142,60,1)] transition-all"
          >
            <div className="absolute inset-0 bg-white/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 text-white fill-white shrink-0"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="font-fredoka text-4xl text-white tracking-wide mt-1">
              {tc("letsPlay")}
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15, delay: 0.6 }}
            onClick={() => navigateWithSound("/progress")}
            className="w-full bg-white rounded-[28px] p-5 flex items-center justify-center gap-3 border-b-[6px] border-[#E8DCC8] text-[#3D2C1E] active:border-b-0 active:translate-y-1.5 shadow-sm transition-all"
          >
            <Trophy className="text-[#FF7043]" size={28} strokeWidth={2.5} />
            <span className="font-bold text-xl mt-1">{t("trophyRoom")}</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
}

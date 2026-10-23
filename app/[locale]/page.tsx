// app/[locale]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import { useJoyoStore } from "@/store/useJoyoStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { playSound, startMusic, unlockAudioEngine } from "@/lib/sounds";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

export default function SplashPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Splash");
  const [progress, setProgress] = useState(0);
  const hydrated = useHydrated();
  // Language chips only show up before a profile exists (first visit)
  const hasProfile = useJoyoStore.getState().childName.trim().length > 0;

  // Child zone → start the ambient music if enabled (first gesture unlocks it)
  const navigate = useCallback(() => {
    unlockAudioEngine(); // this handler IS a user gesture — claim audio now
    startMusic();
    const hasProfile = useJoyoStore.getState().childName.trim().length > 0;
    router.replace(hasProfile ? "/home" : "/onboarding");
  }, [router]);

  useEffect(() => {
    // 1. Signature JOYO cheer shortly after mount (audio unlocks on first gesture)
    const soundTimer = setTimeout(() => playSound("cheer"), 600);

    // 2. Smooth loading bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Fills over ~2.5 seconds
      });
    }, 50);

    // 3. Routing logic: check profile and redirect when loading completes
    const navTimer = setTimeout(() => {
      navigate();
    }, 3200);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(navTimer);
      clearInterval(interval);
    };
  }, [navigate]);

  // The JOYO wordmark — alternating white/green with the brand drop shadow
  const letters = [
    { char: "J", color: "text-white" },
    { char: "O", color: "text-[#4CAF50]" },
    { char: "Y", color: "text-white" },
    { char: "O", color: "text-[#4CAF50]" },
  ];

  return (
    <div
      className="relative min-h-screen bg-[#F5C518] overflow-hidden flex flex-col items-center justify-center touch-none select-none"
      onClick={navigate}
      role="presentation"
    >
      {/* Soft background texture */}
      <BotanicalBackground />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6">
        {/* ── MASCOT REVEAL ──────────────────────────────── */}
        <motion.div
          initial={{ y: 150, scale: 0.5, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
          className="relative z-10 mb-2"
        >
          {/* Subtle glow behind the Koala */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/30 rounded-full blur-2xl pointer-events-none" />

          <AnimalCharacter
            animal="koala"
            color="#FFF8E7" // cream koala pops on the yellow bg
            className="w-56 h-56 drop-shadow-[0_20px_30px_rgba(212,168,0,0.5)]"
          />
        </motion.div>

        {/* ── WORDMARK — Baloo 2, bouncy per-letter spring ── */}
        <div className="flex gap-1 mb-16 z-20" aria-label={t("ariaLabel")}>
          {letters.map((item, i) => (
            <motion.span
              key={i}
              initial={{ y: -50, opacity: 0, rotate: -15 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.6 + i * 0.1 }}
              className={`font-joyo font-extrabold text-[5.5rem] leading-none tracking-tight drop-shadow-[0_6px_0_rgba(212,168,0,1)] ${item.color}`}
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

      {/* Tap anywhere to skip (impatient kids & parents) */}
      <span className="absolute bottom-4 inset-x-0 text-center text-[#D4A800]/70 text-xs font-bold uppercase tracking-wider z-20">
        {t("tapToContinue")}
      </span>

      {/* First-time language choice — written in each language, no flags */}
      {hydrated && !hasProfile && (
        <div
          className="absolute bottom-32 inset-x-0 z-30 flex justify-center gap-2 px-6"
          onClick={(e) => e.stopPropagation()}
        >
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang.code}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (lang.code !== locale) {
                  playSound("pop");
                  router.replace(pathname, { locale: lang.code });
                }
              }}
              aria-pressed={locale === lang.code}
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all border-2 ${
                locale === lang.code
                  ? "bg-white border-white text-[#D4A800]"
                  : "bg-white/40 border-white/60 text-[#7A6552]"
              }`}
            >
              {lang.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

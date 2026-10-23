// components/game/SessionWatcher.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Moon, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound, stopMusic, stopVoice } from "@/lib/sounds";
import { vibrate } from "@/lib/haptics";

/**
 * The gentle time-limit guardian. Mounted on every child-zone page; it
 * counts each second of play toward the parent-configured daily cap and,
 * once reached, lays a full-screen "Joyo is sleeping" scene over the app.
 * This is a real boundary — the only way past it is the parent zone.
 */
export function SessionWatcher() {
  const t = useTranslations("CalmDown");
  const router = useRouter();
  const avatar = useJoyoStore((s) => s.avatar);
  const sessionCapMinutes = useJoyoStore((s) => s.sessionCapMinutes);
  const sessionSecondsToday = useJoyoStore((s) => s.sessionSecondsToday);
  const tickSession = useJoyoStore((s) => s.tickSession);
  const reducedMotion = useReducedMotion();

  // Derived (never set in an effect): is the daily cap reached?
  const asleep =
    sessionCapMinutes > 0 && sessionSecondsToday >= sessionCapMinutes * 60;

  // Cap reached → tuck the app in (side effects only, once)
  useEffect(() => {
    if (!asleep) return;
    stopMusic();
    stopVoice();
    vibrate("celebrate");
  }, [asleep]);

  // The clock ticks once per second while the child keeps playing
  useEffect(() => {
    if (sessionCapMinutes <= 0) return;
    const interval = setInterval(() => tickSession(1), 1000);
    return () => clearInterval(interval);
  }, [sessionCapMinutes, tickSession]);

  const goSettings = () => {
    playSound("pop");
    router.push("/parent/settings");
  };

  return (
    <AnimatePresence>
      {asleep && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center overflow-hidden touch-none select-none bg-linear-to-b from-[#263B63] to-[#0E1B33] px-8 text-center"
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
        >
          {/* Twinkling stars */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[
              { top: "12%", left: "18%", delay: 0 },
              { top: "20%", left: "78%", delay: 0.6 },
              { top: "35%", left: "8%", delay: 1.2 },
              { top: "8%", left: "50%", delay: 1.8 },
              { top: "48%", left: "88%", delay: 0.9 },
            ].map((s, i) => (
              <motion.span
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{ top: s.top, left: s.left }}
                animate={reducedMotion ? {} : { opacity: [0.2, 1, 0.2], scale: [1, 1.4, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: s.delay }}
              />
            ))}
          </div>

          {/* Crescent moon */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mb-8"
          >
            <Moon className="text-[#FFF8E7] w-16 h-16 -rotate-12" size={56} />
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-[#263B63] translate-x-[-35%] translate-y-[-12%]" />
          </motion.div>

          {/* Sleeping friend */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, delay: 0.6 }}
            className="relative"
            aria-hidden="true"
          >
            <AnimalCharacter
              animal={avatar}
              color="#B0BEC5"
              className={`w-44 h-44 ${reducedMotion ? "" : "animate-[token-shake_4s_ease-in-out_infinite]"}`}
            />
            {/* ZZZ floater */}
            <motion.span
              className="absolute -top-2 right-0 font-fredoka text-3xl text-white/90"
              animate={reducedMotion ? { opacity: 0.9 } : { y: [-4, -22], opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity }}
              aria-hidden="true"
            >
              💤
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="font-fredoka text-3xl text-[#FFF8E7] mt-8 mb-3"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-white/70 font-bold text-lg leading-relaxed max-w-[300px] mb-10"
          >
            {t("body")}
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            onClick={goSettings}
            className="bg-white/15 text-white font-bold py-4 px-8 rounded-[24px] border-2 border-white/30 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <Lock size={20} strokeWidth={2.5} />
            {t("unlock")}
          </motion.button>

          {/* Home indicator safe area */}
          <div style={{ height: "env(safe-area-inset-bottom)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

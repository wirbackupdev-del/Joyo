// app/[locale]/play/colors/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { COLORS_DATA, type ColorLesson } from "@/lib/lessons/colors";
import { ColorToken } from "@/components/game/ColorToken";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { HintModal } from "@/components/modals/HintModal";
import { CelebrationModal } from "@/components/modals/CelebrationModal";
import { playSound } from "@/lib/sounds";
import { syncProgressToSupabase, markModuleComplete } from "@/lib/progress";

type HintKey = "hintRed" | "hintBlue" | "hintYellow" | "hintGreen" | "hintPurple";
type ColorKey = "red" | "blue" | "yellow" | "green" | "purple";

export default function ColorsPage() {
  const t = useTranslations("Colors");
  const tc = useTranslations("Common");

  const router = useRouter();
  const { addStar, stars, completeModule } = useJoyoStore();

  const [level, setLevel] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speech, setSpeech] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const generateOptions = useCallback((current: ColorLesson) => {
    const distractors = COLORS_DATA
      .filter((c) => c.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [...distractors, current].sort(() => Math.random() - 0.5);
  }, []);

  // ✅ Fix 1: Lazy initializer — no useEffect needed, avoids hydration mismatch
  const [options, setOptions] = useState<ColorLesson[]>(() =>
    generateOptions(COLORS_DATA[0])
  );

  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSpeech = useCallback((msg: string) => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    setSpeech(msg);
    setShowSpeech(true);
    speechTimeout.current = setTimeout(() => setShowSpeech(false), 3000);
  }, []);

  // ✅ Fix 2: startIdleTimer only touches a ref + schedules a timeout — no setState
  const startIdleTimer = useCallback(() => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setIsIdle(true), 5000);
  }, []);

  // resetIdleTimer still calls setIsIdle — but only used in event callbacks, not directly in effect body
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    startIdleTimer();
  }, [startIdleTimer]);

  // ✅ Effect now calls startIdleTimer (no setState) instead of resetIdleTimer
  useEffect(() => {
    if (options.length === 0) return;

    const translatedColorName = t(COLORS_DATA[level].nameKey as ColorKey);
    const timer = setTimeout(() => {
      triggerSpeech(t("instruction", { color: translatedColorName }));
    }, 600);

    startIdleTimer();

    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("mousemove", resetIdleTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [level, options.length, triggerSpeech, startIdleTimer, resetIdleTimer, t]);

  const handleMatch = async () => {
    if (isSuccess) return;
    setIsSuccess(true);
    setIsIdle(false);

    playSound("correct");

    addStar();
    triggerSpeech(tc("greatJob"));

    syncProgressToSupabase(stars + 1, "colors").catch(console.error);

    if (level === totalColors - 1) {
      markModuleComplete("colors").catch(console.error);
      completeModule("colors");
    }
  };

  const handleWrong = () => {
    playSound("wrong");
    triggerSpeech(tc("tryAgain"));
    setWrongShake(true);
    setTimeout(() => setWrongShake(false), 500);

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleNext = () => {
    setIsSuccess(false);
    if (level < totalColors - 1) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setOptions(generateOptions(COLORS_DATA[nextLevel]));
    } else {
      router.push("/home");
    }
  };

  const currentLesson = COLORS_DATA[level];
  const totalColors = COLORS_DATA.length;
  const progressPct = (level / totalColors) * 100;

  if (options.length === 0) {
    return <div className="min-h-screen bg-[#A86FBE]" />;
  }

  const splatPath =
    "M46.7,11.3c-6.8-6.8-19.1-3.6-25,1.2C16,17.2,12.3,24.1,10.6,32.4c-2,9.8,2,20.2,7.5,28.2 c4.7,6.8,11.2,13.8,19.3,16.5c10.7,3.6,22.8-1,31-8.5c7.9-7.3,13.2-17.7,14-28.5c0.8-11.4-4-23.3-13-30.4 C61.1,3.4,53.2,17.8,46.7,11.3z";

  return (
    <div className="relative min-h-screen bg-[#A86FBE] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />

      <div className="relative z-10 flex flex-col items-center h-screen w-full max-w-430px mx-auto px-6 pb-8">

        <header className="w-full flex items-center justify-between pt-6 pb-2">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>

          <div className="flex-1 mx-4 h-4 bg-white/30 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-[#F5C518] shadow-[0_0_12px_rgba(245,197,24,0.6)] relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>

          <button
            onClick={() => setShowHint(true)}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm"
          >
            <Lightbulb size={24} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex gap-2 mt-4 mb-2">
          {COLORS_DATA.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                i <= level ? "bg-white scale-125 shadow-md" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center w-full mt-2">
          <AnimatePresence>
            {showSpeech && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.8, x: "-50%" }}
                className="absolute top-0 left-1/2 -translate-y-full mb-2 bg-white px-6 py-3 rounded-2xl shadow-xl whitespace-nowrap font-black text-xl text-[#3D2C1E] z-20"
              >
                {speech}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-10px border-l-transparent border-r-10px border-r-transparent border-t-10px border-t-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 mt-4">
            <AnimalCharacter
              animal={currentLesson.animal}
              color={currentLesson.hex}
              className={`w-28 h-28 transition-transform duration-500 ${
                isSuccess ? "scale-110" : ""
              }`}
            />
          </div>

          <div className="relative w-48 h-48 mt-4">
            <motion.div
              animate={
                wrongShake
                  ? { x: [-10, 10, -10, 10, 0] }
                  : isSuccess
                  ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-center justify-center"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-xl transition-colors duration-500"
                fill={isSuccess ? currentLesson.hex : "rgba(255,255,255,0.4)"}
              >
                <path d={splatPath} />
              </svg>

              {!isSuccess && (
                <span className="absolute font-fredoka text-6xl text-white/70 drop-shadow-sm">
                  ?
                </span>
              )}
            </motion.div>
          </div>

          <div className="text-white font-bold text-xl mt-4 drop-shadow-md h-8 text-center px-4">
            {isSuccess
              ? tc("youDidIt")
              : t("instruction", { color: t(currentLesson.nameKey as ColorKey) })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-300px mb-8">
          {options.map((option, idx) => (
            <ColorToken
              key={`${level}-${option.id}-${idx}`}
              hex={option.hex}
              isCorrect={option.id === currentLesson.id}
              onMatch={handleMatch}
              onWrong={handleWrong}
              disabled={isSuccess}
              isIdle={isIdle}
            />
          ))}
        </div>
      </div>

      <CelebrationModal
        isOpen={isSuccess}
        onNext={handleNext}
        title="Super Duper!"
        subtitle={t("successBody", { color: t(currentLesson.nameKey as ColorKey) })}
        buttonText={level < totalColors - 1 ? t("nextColor") : tc("finish")}
      />

      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        title={t("hintTitle")}
        hintText={t(currentLesson.hintKey as HintKey)}
        animal={currentLesson.animal as "koala" | "fox" | "bear" | "dog" | "rabbit"}
        animalColor={currentLesson.hex}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%) skewX(-12deg); }
        }
      `}} />
    </div>
  );
}
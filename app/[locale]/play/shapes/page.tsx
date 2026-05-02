"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { SHAPES_DATA, type Shape } from "@/lib/lessons/shapes";
import { AnswerToken } from "@/components/game/AnswerToken";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { Confetti } from "@/components/game/Confetti";
import { HintModal } from "@/components/modals/HintModal";
import { CelebrationModal } from "@/components/modals/CelebrationModal";
import { playSound } from "@/lib/sounds";
import { syncProgressToSupabase, markModuleComplete } from "@/lib/progress";

type ShapeNameKey = "circle" | "square" | "triangle" | "star" | "heart";
type HintKey = "hintCircle" | "hintSquare" | "hintTriangle" | "hintStar" | "hintHeart";

export default function ShapesPage() {
  const t = useTranslations("Shapes");
  const tc = useTranslations("Common");

  const router = useRouter();
  const { addStar, stars, completeModule } = useJoyoStore();

  // ── GAME STATE ───────────────────────────────────
  const [level, setLevel] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [speech, setSpeech] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);

  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const generateOptions = useCallback((current: Shape) => {
    const distractors = SHAPES_DATA
      .filter((s) => s.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [...distractors, current].sort(() => Math.random() - 0.5);
  }, []);

  // ✅ Fix 1: Lazy initializer — no useEffect needed, avoids hydration mismatch
  const [options, setOptions] = useState<Shape[]>(() =>
    generateOptions(SHAPES_DATA[0])
  );

  const currentShape = SHAPES_DATA[level];
  const totalShapes = SHAPES_DATA.length;
  const progressPct = (level / totalShapes) * 100;

  const triggerSpeech = useCallback((msg: string) => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    setSpeech(msg);
    setShowSpeech(true);
    speechTimeout.current = setTimeout(() => setShowSpeech(false), 2800);
  }, []);

  // ✅ Fix 2: startIdleTimer only touches a ref + setTimeout — no setState in effect body
  const startIdleTimer = useCallback(() => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => {}, 5000); // extend if isIdle is needed for shapes
  }, []);

  useEffect(() => {
    if (options.length === 0) return;

    const timer = setTimeout(() => {
      triggerSpeech(t("instruction"));
    }, 500);

    startIdleTimer();

    return () => {
      clearTimeout(timer);
      if (speechTimeout.current) clearTimeout(speechTimeout.current);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [level, options.length, t, triggerSpeech, startIdleTimer]);

  const handleMatch = async () => {
    if (isSuccess) return;
    setIsSuccess(true);
    setShowConfetti(true);
    playSound("correct");

    addStar();
    triggerSpeech(tc("greatJob"));

    syncProgressToSupabase(stars + 1, "shapes").catch(console.error);

    if (level === totalShapes - 1) {
      markModuleComplete("shapes").catch(console.error);
      completeModule("shapes");
    }
  };

  const handleWrong = () => {
    playSound("wrong");
    triggerSpeech(tc("tryAgain"));
    setWrongShake(true);
    setTimeout(() => setWrongShake(false), 500);
  };

  const handleNext = () => {
    setIsSuccess(false);
    setShowConfetti(false);
    if (level < totalShapes - 1) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setOptions(generateOptions(SHAPES_DATA[nextLevel]));
    } else {
      router.push("/home");
    }
  };

  if (options.length === 0) {
    return <div className="min-h-screen bg-[#4CAF50]" />;
  }

  return (
    <div className="relative min-h-screen bg-[#4CAF50] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />
      <Confetti active={showConfetti} />

      <div className="relative z-10 flex flex-col items-center h-screen w-full max-w-107.5 mx-auto px-6 pb-8">

        <header className="w-full flex items-center justify-between pt-6 pb-2">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>

          <div className="flex-1 mx-4 h-3.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#F5C518] shadow-[0_0_12px_rgba(245,197,24,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            />
          </div>

          <button
            onClick={() => setShowHint(true)}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <Lightbulb size={24} strokeWidth={2.5} />
          </button>
        </header>

        <motion.h1
          key={currentShape.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-fredoka text-4xl text-white text-center mt-2 drop-shadow-md"
        >
          {t(currentShape.nameKey as ShapeNameKey)}
        </motion.h1>

        <div className="flex gap-2 mt-2 mb-4">
          {SHAPES_DATA.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                i <= level ? "bg-[#F5C518] scale-125 shadow-lg" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center w-full">
          <div className="relative w-56 h-56 mb-8" ref={dropZoneRef}>
            <motion.div
              animate={
                wrongShake
                  ? { x: [-10, 10, -10, 10, 0] }
                  : isSuccess
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              className={`w-full h-full rounded-[40px] flex items-center justify-center border-[3.5px] border-dashed transition-all duration-300 ${
                isSuccess
                  ? "bg-white/40 border-[#F5C518]"
                  : "bg-white/20 border-white/50"
              }`}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 drop-shadow-xl transition-colors duration-500"
                fill={isSuccess ? currentShape.color : "rgba(255,255,255,0.3)"}
              >
                <path d={currentShape.svgPath} />
              </svg>
            </motion.div>
            <div className="absolute -bottom-8 left-0 right-0 text-center text-white/80 font-bold text-sm tracking-wide">
              {isSuccess ? tc("youDidIt") : t("instruction")}
            </div>
          </div>

          <div className="relative mb-4">
            <AnimatePresence>
              {showSpeech && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, scale: 0.8, x: "-50%" }}
                  className="absolute bottom-full left-1/2 mb-4 bg-white px-5 py-2 rounded-2xl shadow-xl whitespace-nowrap font-black text-[#3D2C1E] z-20"
                >
                  {speech}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimalCharacter
              animal={currentShape.animal}
              color={currentShape.color}
              className="w-24 h-24"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-90 mb-4">
          {options.map((shape, idx) => (
            <AnswerToken
              key={`${level}-${shape.id}-${idx}`}
              svgPath={shape.svgPath}
              color={shape.color}
              isCorrectShape={shape.id === currentShape.id}
              onMatch={handleMatch}
              onWrong={handleWrong}
              disabled={isSuccess}
              dropZoneRef={dropZoneRef}
            />
          ))}
        </div>
      </div>

      {/* ✅ Replaced inline celebration modal with shared CelebrationModal component */}
      <CelebrationModal
        isOpen={isSuccess}
        onNext={handleNext}
        title={t("successTitle")}
        subtitle={tc("greatJob")}
        buttonText={level < totalShapes - 1 ? t("nextShape") : tc("finish")}
      />

      {/* ✅ Replaced inline hint modal with shared HintModal component */}
      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        title={t("hintTitle")}
        hintText={t(currentShape.hintKey as HintKey)}
        animal={currentShape.animal as "koala" | "fox" | "bear" | "dog" | "rabbit"}
        animalColor={currentShape.color}
      />
    </div>
  );
}
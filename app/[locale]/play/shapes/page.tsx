// app/[locale]/play/shapes/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { SHAPES_DATA, type Shape } from "@/lib/lessons/shapes";
import { useLessonGame } from "@/lib/hooks/useLessonGame";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { DragToken } from "@/components/game/DragToken";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { StarCounter } from "@/components/game/StarCounter";
import { SessionWatcher } from "@/components/game/SessionWatcher";
import { HintModal } from "@/components/modals/HintModal";
import { CelebrationModal } from "@/components/modals/CelebrationModal";
import { playSound, startMusic, stopMusic } from "@/lib/sounds";

export default function ShapesPage() {
  const t = useTranslations("Shapes");
  const tc = useTranslations("Common");

  const router = useRouter();
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const hydrated = useHydrated();

  const {
    level,
    current,
    options,
    isSuccess,
    showHint,
    openHint,
    closeHint,
    speech,
    showSpeech,
    triggerSpeech,
    sayInstruction,
    wrongShake,
    handleMatch,
    handleWrong,
    handleNext,
    progressPct,
    stars,
    moduleCompleted,
  } = useLessonGame<Shape>({
    lessons: SHAPES_DATA,
    moduleId: "shapes",
    getInstruction: (lesson) => t("instruction", { shape: t(lesson.nameKey as "circle") }),
    getSayText: (lesson) => t("instruction", { shape: t(lesson.nameKey as "circle") }),
  });

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  const onMatch = () => {
    if (!isSuccess) {
      triggerSpeech(tc("greatJob"));
      handleMatch();
    }
  };

  const onWrong = () => {
    handleWrong();
    triggerSpeech(tc("tryAgain"));
  };

  // Avoid hydration mismatches: persisted level/badge state only exists client-side
  if (!hydrated) return <div className="min-h-screen bg-[#4CAF50]" />;

  return (
    <div className="relative min-h-screen bg-[#4CAF50] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />
      <SessionWatcher />

      <div className="relative z-10 flex flex-col items-center h-full-screen w-full max-w-[430px] mx-auto px-6 pb-8">
        <header className="w-full flex items-center justify-between pt-6 pb-2">
          <button
            onClick={() => {
              playSound("pop");
              router.push("/modules");
            }}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label={tc("back")}
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>

          <div className="flex-1 mx-3 h-3.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#F5C518] shadow-[0_0_12px_rgba(245,197,24,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            />
          </div>

          <div className="mx-1 rounded-full bg-white/30 px-3 py-1.5">
            <StarCounter count={stars} size={18} />
          </div>

          <button
            onClick={openHint}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform ml-1"
            aria-label={t("hintTitle")}
          >
            <Lightbulb size={24} strokeWidth={2.5} />
          </button>
        </header>

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
                fill={isSuccess ? current.color : "rgba(255,255,255,0.3)"}
                aria-hidden="true"
              >
                <path d={current.svgPath} />
              </svg>
            </motion.div>
            {/* Instruction + replay button — hear it as often as needed */}
            <div className="absolute -bottom-8 left-0 right-0 text-center text-white/80 font-bold text-sm tracking-wide flex items-center justify-center gap-2">
              {!isSuccess && (
                <button
                  onClick={sayInstruction}
                  className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shrink-0"
                  aria-label={t("hearAgain")}
                >
                  <Volume2 size={16} strokeWidth={3} />
                </button>
              )}
              <span>
                {isSuccess ? tc("youDidIt") : t("instruction", { shape: t(current.nameKey as "circle") })}
              </span>
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
            <AnimalCharacter animal={current.animal} color={current.color} className="w-24 h-24" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-[360px] mb-4">
          {options.map((shape) => (
            <DragToken
              key={`${level}-${shape.id}`}
              shape="circle"
              isCorrect={shape.id === current.id}
              onMatch={onMatch}
              onWrong={onWrong}
              disabled={isSuccess}
              dropZoneRef={dropZoneRef}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-[52%] h-[52%]"
                style={{ color: shape.color }}
                aria-hidden="true"
              >
                <path d={shape.svgPath} fill="currentColor" />
              </svg>
            </DragToken>
          ))}
        </div>
      </div>

      {/* Shared celebration modal — brings its own confetti */}
      <CelebrationModal
        isOpen={isSuccess}
        onNext={handleNext}
        title={t("successTitle")}
        subtitle={t("successBody", { shape: t(current.nameKey as "circle") })}
        buttonText={level < SHAPES_DATA.length - 1 ? t("nextShape") : tc("finish")}
        diploma={moduleCompleted}
      />

      <HintModal
        isOpen={showHint}
        onClose={closeHint}
        title={t("hintTitle")}
        hintText={t(current.hintKey as "hintCircle")}
        animal={current.animal}
        animalColor={current.color}
      />
    </div>
  );
}

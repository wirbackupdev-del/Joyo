// app/[locale]/play/letters/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb, Volume2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { getLettersData, type LetterLesson } from "@/lib/lessons/letters";
import { useLessonGame } from "@/lib/hooks/useLessonGame";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { DragToken } from "@/components/game/DragToken";
import { DogWithLetter } from "@/components/game/DogWithLetter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { StarCounter } from "@/components/game/StarCounter";
import { SessionWatcher } from "@/components/game/SessionWatcher";
import { HintModal } from "@/components/modals/HintModal";
import { CelebrationModal } from "@/components/modals/CelebrationModal";
import { playSound, startMusic, stopMusic } from "@/lib/sounds";

export default function LettersPage() {
  const t = useTranslations("Letters");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const router = useRouter();
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const hydrated = useHydrated();

  // The curriculum follows the UI language: A–Z in English/French,
  // ا–ي in Arabic (the right letters for the child actually playing).
  const lessons = getLettersData(locale);

  const {
    level,
    current,
    options,
    isSuccess,
    isIdle,
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
  } = useLessonGame<LetterLesson>({
    lessons,
    moduleId: "letters",
    getInstruction: (lesson) => t("instruction", { letter: lesson.char }),
    getSayText: (lesson) => t("instruction", { letter: lesson.name }),
  });

  // Child zone → ambient music on, stopped again on unmount
  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  // Success wrapper — mascot speaks + module state advances atomically
  const onMatch = () => {
    if (!isSuccess) {
      triggerSpeech(tc("greatJob"));
      handleMatch();
    }
  };

  const total = lessons.length;

  // Avoid hydration mismatches: the persisted level/badge state only exists
  // on the client, so nothing store-derived renders before hydration.
  if (!hydrated) return <div className="min-h-screen bg-[#F5C518]" />;

  return (
    <div className="relative min-h-screen bg-[#F5C518] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />
      <SessionWatcher />

      <div className="relative z-10 flex flex-col items-center h-full-screen w-full max-w-[430px] mx-auto px-6 pb-8">
        {/* HEADER */}
        <header className="w-full flex items-center justify-between pt-6 pb-2">
          <button
            onClick={() => {
              playSound("pop");
              router.push("/modules");
            }}
            className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm"
            aria-label={tc("back")}
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>

          {/* PROGRESS BAR */}
          <div className="flex-1 mx-3 h-4 bg-white/30 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-[#4CAF50] shadow-[0_0_12px_rgba(76,175,80,0.6)] relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 animate-shimmer" />
            </motion.div>
          </div>

          <div className="mx-1 rounded-full bg-white/40 px-3 py-1.5">
            <StarCounter count={stars} size={18} />
          </div>

          <button
            onClick={openHint}
            className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm ml-1"
            aria-label={t("hintTitle")}
          >
            <Lightbulb size={24} strokeWidth={2.5} />
          </button>
        </header>

        {/* FOCAL AREA */}
        <div className="relative flex-1 flex flex-col items-center justify-center w-full">
          {/* SPEECH BUBBLE */}
          <AnimatePresence>
            {showSpeech && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.8, x: "-50%" }}
                className="absolute top-0 left-1/2 -translate-y-full mb-2 bg-white px-6 py-3 rounded-2xl shadow-xl whitespace-nowrap font-black text-xl text-[#3D2C1E] z-20"
              >
                {speech}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* MASCOT — the dog with a sign board holding the current letter */}
          <div className="relative z-10 mt-10">
            <DogWithLetter
              letter={current.char}
              color={current.color}
              className={`w-32 h-32 transition-transform duration-500 ${isSuccess ? "scale-110" : ""}`}
            />
          </div>

          {/* DROP ZONE */}
          <div className="relative w-44 h-44 mt-4" ref={dropZoneRef}>
            <motion.div
              animate={
                wrongShake
                  ? { x: [-10, 10, -10, 10, 0] }
                  : isSuccess
                  ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }
                  : isIdle
                  ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }
                  : {}
              }
              transition={
                isIdle && !isSuccess
                  ? { repeat: Infinity, duration: 1.5 }
                  : { duration: 0.4 }
              }
              className={`w-full h-full rounded-[40px] flex items-center justify-center border-4 border-dashed transition-all duration-300 z-0 ${
                isSuccess
                  ? "bg-white border-transparent shadow-[0_0_40px_rgba(255,255,255,0.6)]"
                  : "bg-white/20 border-white/60"
              }`}
            >
              <span
                className="font-fredoka text-8xl transition-colors duration-500"
                style={{ color: isSuccess ? current.color : "rgba(255,255,255,0.4)" }}
              >
                {current.char}
              </span>
            </motion.div>
          </div>

          {/* Instruction + replay button — hear it as often as needed */}
          <div className="flex items-center gap-2 text-white/90 font-bold text-lg mt-6 drop-shadow-sm h-10 text-center">
            {!isSuccess && (
              <button
                onClick={sayInstruction}
                className="w-10 h-10 shrink-0 rounded-full bg-white/40 flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform"
                aria-label={t("hearAgain")}
              >
                <Volume2 size={20} strokeWidth={3} />
              </button>
            )}
            <span>
              {isSuccess ? tc("youDidIt") : t("instruction", { letter: current.char })}
            </span>
          </div>
        </div>

        {/* DRAGGABLE OPTIONS GRID */}
        <div className="grid grid-cols-2 gap-5 w-full max-w-[320px] mb-6">
          {options.map((option) => (
            <DragToken
              key={`${level}-${option.id}`}
              shape="circle"
              isCorrect={option.id === current.id}
              onMatch={onMatch}
              onWrong={handleWrong}
              disabled={isSuccess}
              dropZoneRef={dropZoneRef}
            >
              <span
                className="font-fredoka text-6xl drop-shadow-sm select-none"
                style={{ color: option.color }}
              >
                {option.char}
              </span>
            </DragToken>
          ))}
        </div>
      </div>

      {/* REUSABLE MODALS */}
      <CelebrationModal
        isOpen={isSuccess}
        onNext={handleNext}
        title={tc("superDuper")}
        subtitle={t("successBody", { letter: current.char })}
        buttonText={level < total - 1 ? t("nextLetter") : tc("finish")}
        diploma={moduleCompleted}
      />

      <HintModal
        isOpen={showHint}
        onClose={closeHint}
        title={t("hintTitle")}
        hintText={t(current.hintKey as "hintA")}
        animal={current.animal}
        animalColor={current.color}
      />
    </div>
  );
}

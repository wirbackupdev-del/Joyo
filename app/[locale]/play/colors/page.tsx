// app/[locale]/play/colors/page.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { COLORS_DATA, type ColorLesson } from "@/lib/lessons/colors";
import { useLessonGame } from "@/lib/hooks/useLessonGame";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { ColorToken } from "@/components/game/ColorToken";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { StarCounter } from "@/components/game/StarCounter";
import { SessionWatcher } from "@/components/game/SessionWatcher";
import { HintModal } from "@/components/modals/HintModal";
import { CelebrationModal } from "@/components/modals/CelebrationModal";
import { playSound, startMusic, stopMusic } from "@/lib/sounds";

type ColorKey = "red" | "blue" | "yellow" | "green" | "purple";

const SPLAT_PATH =
  "M46.7,11.3c-6.8-6.8-19.1-3.6-25,1.2C16,17.2,12.3,24.1,10.6,32.4c-2,9.8,2,20.2,7.5,28.2 c4.7,6.8,11.2,13.8,19.3,16.5c10.7,3.6,22.8-1,31-8.5c7.9-7.3,13.2-17.7,14-28.5c0.8-11.4-4-23.3-13-30.4 C61.1,3.4,53.2,17.8,46.7,11.3z";

export default function ColorsPage() {
  const t = useTranslations("Colors");
  const tc = useTranslations("Common");

  const router = useRouter();
  const hydrated = useHydrated();

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
  } = useLessonGame<ColorLesson>({
    lessons: COLORS_DATA,
    moduleId: "colors",
    getInstruction: (lesson) =>
      t("instruction", { color: t(lesson.nameKey as ColorKey) }),
    getSayText: (lesson) =>
      t("instruction", { color: t(lesson.nameKey as ColorKey) }),
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
  if (!hydrated) return <div className="min-h-screen bg-[#A86FBE]" />;

  return (
    <div className="relative min-h-screen bg-[#A86FBE] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />
      <SessionWatcher />

      <div className="relative z-10 flex flex-col items-center h-full-screen w-full max-w-[430px] mx-auto px-6 pb-8">
        <header className="w-full flex items-center justify-between pt-6 pb-2">
          <button
            onClick={() => {
              playSound("pop");
              router.push("/modules");
            }}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm"
            aria-label={tc("back")}
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>

          <div className="flex-1 mx-3 h-4 bg-white/30 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-[#F5C518] shadow-[0_0_12px_rgba(245,197,24,0.6)] relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 animate-shimmer" />
            </motion.div>
          </div>

          <div className="mx-1 rounded-full bg-white/30 px-3 py-1.5">
            <StarCounter count={stars} size={18} />
          </div>

          <button
            onClick={openHint}
            className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm ml-1"
            aria-label={t("hintTitle")}
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 mt-4">
            <AnimalCharacter
              animal={current.animal}
              color={current.hex}
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
                fill={isSuccess ? current.hex : "rgba(255,255,255,0.4)"}
                aria-hidden="true"
              >
                <path d={SPLAT_PATH} />
              </svg>

              {!isSuccess && (
                <span className="absolute font-fredoka text-6xl text-white/70 drop-shadow-sm">
                  ?
                </span>
              )}
            </motion.div>
          </div>

          {/* Instruction + replay button — hear it as often as needed */}
          <div className="flex items-center gap-2 text-white font-bold text-xl mt-4 drop-shadow-md h-10 text-center px-4">
            {!isSuccess && (
              <button
                onClick={sayInstruction}
                className="w-10 h-10 shrink-0 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
                aria-label={t("hearAgain")}
              >
                <Volume2 size={20} strokeWidth={3} />
              </button>
            )}
            <span>
              {isSuccess
                ? tc("youDidIt")
                : t("instruction", { color: t(current.nameKey as ColorKey) })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-[300px] mb-8">
          {options.map((option) => (
            <ColorToken
              key={`${level}-${option.id}`}
              hex={option.hex}
              label={t("instructionOption", { color: t(option.nameKey as ColorKey) })}
              isCorrect={option.id === current.id}
              onMatch={onMatch}
              onWrong={onWrong}
              disabled={isSuccess}
              isIdle={isIdle}
            />
          ))}
        </div>
      </div>

      <CelebrationModal
        isOpen={isSuccess}
        onNext={handleNext}
        title={tc("superDuper")}
        subtitle={t("successBody", { color: t(current.nameKey as ColorKey) })}
        buttonText={level < COLORS_DATA.length - 1 ? t("nextColor") : tc("finish")}
        diploma={moduleCompleted}
      />

      <HintModal
        isOpen={showHint}
        onClose={closeHint}
        title={t("hintTitle")}
        hintText={t(current.hintKey as "hintRed")}
        animal={current.animal}
        animalColor={current.hex}
      />
    </div>
  );
}

// app/[locale]/onboarding/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore, type Avatar } from "@/store/useJoyoStore";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { Confetti } from "@/components/game/Confetti";
import { playSound, startMusic, stopMusic, unlockAudioEngine } from "@/lib/sounds";

const ANIMALS: { id: Avatar; color: string }[] = [
  { id: "koala", color: "#5C9BF5" },  // Blue
  { id: "fox", color: "#FF7043" },    // Orange
  { id: "bear", color: "#A86FBE" },   // Purple
  { id: "dog", color: "#F5C518" },    // Yellow
  { id: "rabbit", color: "#EF5350" }, // Red
];

// Variants for smooth slide transitions
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const tc = useTranslations("Common");
  const router = useRouter();
  const { setProfile } = useJoyoStore();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>("koala");

  const goNext = () => {
    playSound("pop");
    setDirection(1);
    if (step === 2) playSound("cheer"); // celebration on final slide
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    playSound("pop");
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const exitToHome = () => {
    playSound("pop");
    stopMusic();
    router.back();
  };

  const handleFinish = () => {
    playSound("pop");
    setProfile(name, selectedAvatar);
    // The finish tap IS a user gesture — this guarantees music actually starts
    unlockAudioEngine();
    startMusic();
    router.replace("/home");
  };

  const slideTransition = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] overflow-hidden flex flex-col touch-none select-none">
      <BotanicalBackground />
      <Confetti active={step === 3} />

      <main className="relative z-10 flex flex-col items-center h-full-screen w-full max-w-md mx-auto px-6 py-8">
        {/* ── BACK TO SPLASH (step 1 only) ─────────────── */}
        {step === 1 && (
          <header className="w-full flex z-20">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={exitToHome}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
              aria-label={tc("back")}
            >
              <ChevronLeft size={26} strokeWidth={3} />
            </motion.button>
          </header>
        )}

        {/* ── PROGRESS INDICATOR ──────────────────────── */}
        <div className="w-full flex justify-center gap-3 mb-8 z-20">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`h-3 rounded-full transition-all duration-500 ${
                i === step ? "w-10 bg-[#4CAF50] shadow-md" : "w-3 bg-[#E8DCC8]"
              }`}
            />
          ))}
        </div>

        {/* ── SLIDE CONTAINER ─────────────────────────── */}
        <div className="relative flex-1 w-full flex flex-col">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {/* ── SLIDE 1: NAME INPUT ─────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="absolute inset-0 flex flex-col items-center justify-center w-full"
              >
                <div className="bg-white p-8 rounded-[40px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] w-full text-center border-4 border-white border-b-[#E8DCC8]">
                  <h1 className="font-fredoka text-4xl text-[#FF7043] mb-2">{t("step1Title")}</h1>
                  <p className="text-[#7A6552] text-xl font-bold mb-8">{t("step1Subtitle")}</p>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && name.trim()) goNext();
                    }}
                    placeholder={t("namePlaceholder")}
                    className="w-full bg-[#FFF8E7] border-4 border-[#E8DCC8] rounded-[24px] px-6 py-5 font-bold text-2xl text-[#3D2C1E] text-center placeholder:text-[#B8A898] focus:outline-none focus:border-[#F5C518] focus:bg-white transition-all shadow-inner"
                    maxLength={12}
                    autoFocus
                  />
                </div>

                <motion.button
                  onClick={goNext}
                  disabled={name.trim().length === 0}
                  aria-label={tc("next")}
                  className={`mt-10 w-full rounded-[32px] p-6 flex items-center justify-center gap-3 transition-all ${
                    name.trim().length > 0
                      ? "bg-[#4CAF50] shadow-[0_8px_0_rgba(56,142,60,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(56,142,60,1)]"
                      : "bg-[#E8DCC8] shadow-[0_8px_0_rgba(200,190,170,1)] text-[#B8A898] pointer-events-none"
                  }`}
                >
                  <span className="font-fredoka text-3xl text-white">{tc("next")}</span>
                  <ChevronRight className="text-white" size={32} strokeWidth={4} />
                </motion.button>
              </motion.div>
            )}

            {/* ── SLIDE 2: AVATAR PICKER ──────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="absolute inset-0 flex flex-col items-center justify-center w-full"
              >
                <div className="w-full flex justify-start mb-2">
                  <motion.button
                    onClick={goBack}
                    whileTap={{ scale: 0.9 }}
                    aria-label={tc("back")}
                    className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] shadow-sm border-2 border-[#E8DCC8]"
                  >
                    <ChevronRight className="rotate-180 rtl:rotate-0" size={26} strokeWidth={3} />
                  </motion.button>
                </div>
                <h1 className="font-fredoka text-4xl text-[#F5C518] mb-2 drop-shadow-sm">{t("step2Title")}</h1>
                <p className="text-[#7A6552] text-xl font-bold mb-8">{t("step2Subtitle")}</p>

                {/* 4 friends in a row + the rabbit centered underneath — all 5 reachable */}
                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  {ANIMALS.filter((a) => a.id !== "rabbit").map((animal) => (
                    <motion.button
                      key={animal.id}
                      onClick={() => {
                        setSelectedAvatar(animal.id);
                        playSound("pop");
                      }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={animal.id}
                      aria-pressed={selectedAvatar === animal.id}
                      className={`relative aspect-square rounded-[32px] bg-white flex items-center justify-center transition-all duration-300 ${
                        selectedAvatar === animal.id
                          ? `border-4 shadow-[0_0_24px_rgba(0,0,0,0.15)] scale-105 z-10`
                          : "border-4 border-transparent shadow-sm scale-100 opacity-80"
                      }`}
                      style={selectedAvatar === animal.id ? { borderColor: animal.color } : {}}
                    >
                      <AnimalCharacter animal={animal.id} color={animal.color} className="w-24 h-24 drop-shadow-md" />
                      {selectedAvatar === animal.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-[#4CAF50] rounded-full border-2 border-white flex items-center justify-center shadow-md"
                        >
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}

                  {/* Rabbit centered on its own row */}
                  <motion.button
                    onClick={() => {
                      setSelectedAvatar("rabbit");
                      playSound("pop");
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="rabbit"
                    aria-pressed={selectedAvatar === "rabbit"}
                    className={`relative aspect-square rounded-[32px] bg-white flex items-center justify-center col-span-2 mx-auto w-1/2 transition-all duration-300 ${
                      selectedAvatar === "rabbit"
                        ? "border-4 border-[#EF5350] shadow-[0_0_24px_rgba(0,0,0,0.15)] scale-105 z-10"
                        : "border-4 border-transparent shadow-sm scale-100 opacity-80"
                    }`}
                  >
                    <AnimalCharacter animal="rabbit" color="#EF5350" className="w-24 h-24 drop-shadow-md" />
                    {selectedAvatar === "rabbit" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-[#4CAF50] rounded-full border-2 border-white flex items-center justify-center shadow-md"
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>

                <motion.button
                  onClick={goNext}
                  className="mt-auto mb-4 w-full bg-[#FF7043] rounded-[32px] p-6 flex items-center justify-center gap-3 shadow-[0_8px_0_rgba(230,81,0,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(230,81,0,1)] transition-all"
                >
                  <span className="font-fredoka text-3xl text-white">{tc("next")}</span>
                  <ChevronRight className="text-white" size={32} strokeWidth={4} />
                </motion.button>
              </motion.div>
            )}

            {/* ── SLIDE 3: CELEBRATION ────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="absolute inset-0 flex flex-col items-center justify-center w-full"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                  className="relative mb-8"
                >
                  {/* Glowing aura */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F5C518]/30 rounded-full blur-2xl pointer-events-none" />

                  <AnimalCharacter
                    animal={selectedAvatar}
                    color={ANIMALS.find((a) => a.id === selectedAvatar)?.color || "#F5C518"}
                    className="w-48 h-48 drop-shadow-2xl relative z-10"
                  />
                </motion.div>

                <h1 className="font-fredoka text-4xl text-[#4CAF50] mb-2 text-center drop-shadow-sm">
                  {t("step3Title", { name })}
                </h1>
                <p className="text-[#7A6552] text-xl font-bold mb-12">{t("step3Subtitle")}</p>

                <motion.button
                  onClick={handleFinish}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-[#F5C518] rounded-[32px] p-6 flex items-center justify-center gap-4 shadow-[0_8px_0_rgba(212,168,0,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(212,168,0,1)] transition-all"
                >
                  <Play className="text-white fill-white" size={32} />
                  <span className="font-fredoka text-3xl text-white tracking-wide">
                    {t("startAdventure")}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

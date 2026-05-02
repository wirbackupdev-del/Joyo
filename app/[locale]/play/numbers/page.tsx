// app/[locale]/play/numbers/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { NUMBERS_DATA, type NumberLesson } from "@/lib/lessons/numbers";
import { NumberToken } from "@/components/game/NumberToken";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { HintModal } from "@/components/modals/HintModal";
import { CelebrationModal } from "@/components/modals/CelebrationModal";
import { playSound } from "@/lib/sounds";
import { syncProgressToSupabase, markModuleComplete } from "@/lib/progress";

type HintKey = "hint1" | "hint2" | "hint3" | "hint4" | "hint5";

export default function NumbersPage() {
  const t = useTranslations("Numbers");
  const tc = useTranslations("Common");
  
  const router = useRouter();
  const { addStar, stars, completeModule } = useJoyoStore();

  const [level, setLevel] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const[speech, setSpeech] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const[wrongShake, setWrongShake] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  
  const generateOptions = useCallback((current: NumberLesson) => {
    const distractors = NUMBERS_DATA
      .filter((n) => n.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return [...distractors, current].sort(() => Math.random() - 0.5);
  },[]);

  // 1. Lazy initialization to prevent hydration mismatch & effect loops
  const [options, setOptions] = useState<NumberLesson[]>(() =>
    generateOptions(NUMBERS_DATA[0])
  );
  
  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const currentLesson = NUMBERS_DATA[level];
  const totalNumbers = NUMBERS_DATA.length;
  const progressPct = (level / totalNumbers) * 100;

  const triggerSpeech = useCallback((msg: string) => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    setSpeech(msg);
    setShowSpeech(true);
    speechTimeout.current = setTimeout(() => setShowSpeech(false), 3000);
  },[]);

  // 2. Safely track idle state without triggering re-renders
  const startIdleTimer = useCallback(() => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setIsIdle(true), 6000);
  },[]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    startIdleTimer();
  }, [startIdleTimer]);

  // 3. Initialization & event mounting effect
  useEffect(() => {
    if (options.length === 0) return;
    
    const timer = setTimeout(() => {
      triggerSpeech(t("instruction", { number: NUMBERS_DATA[level].char }));
    }, 600);

    startIdleTimer();

    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('mousemove', resetIdleTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  },[level, options.length, triggerSpeech, startIdleTimer, resetIdleTimer, t]);
  
  const handleMatch = async () => {
    if (isSuccess) return;
    setIsSuccess(true);
    setIsIdle(false);
    
    playSound("correct");
    
    addStar();
    triggerSpeech(tc("greatJob")); 

    syncProgressToSupabase(stars + 1, "numbers").catch(console.error);

    if (level === totalNumbers - 1) {
      markModuleComplete("numbers").catch(console.error);
      completeModule("numbers");
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

  // 4. Update level AND options simultaneously here to avoid multiple renders
  const handleNext = () => {
    setIsSuccess(false);
    if (level < totalNumbers - 1) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setOptions(generateOptions(NUMBERS_DATA[nextLevel]));
    } else {
      router.push("/home");
    }
  };

  if (options.length === 0) {
    return <div className="min-h-screen bg-[#5C9BF5]" />;
  }

  return (
    <div className="relative min-h-screen bg-[#5C9BF5] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />

      <div className="relative z-10 flex flex-col items-center h-screen w-full max-w-430px mx-auto px-6 pb-8">
        
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="w-full flex items-center justify-between pt-6 pb-2">
          <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm">
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
          
          <button onClick={() => setShowHint(true)} className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm">
            <Lightbulb size={24} strokeWidth={2.5} />
          </button>
        </header>

        {/* ── LEVEL INDICATORS ───────────────────────────── */}
        <div className="flex gap-2 mt-4 mb-2">
          {NUMBERS_DATA.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= level ? "bg-white scale-125 shadow-md" : "bg-white/30"}`} />
          ))}
        </div>

        {/* ── FOCAL AREA ─────────────────────────────────── */}
        <div className="relative flex-1 flex flex-col items-center justify-center w-full mt-4">
          
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

          <div className="relative z-10 mt-6">
             <AnimalCharacter 
               animal={currentLesson.animal} 
               color={currentLesson.color} 
               className={`w-32 h-32 transition-transform duration-500 ${isSuccess ? 'scale-110' : ''}`} 
             />
          </div>

          <div className="relative w-44 h-44 mt-4" ref={dropZoneRef}>
            <motion.div
              animate={
                wrongShake ? { x: [-10, 10, -10, 10, 0] } : 
                isSuccess ? { scale: [1, 1.15, 1], rotate:[0, 5, -5, 0] } : 
                isIdle ? { scale:[1, 1.05, 1], opacity: [1, 0.8, 1] } : {}
              }
              transition={isIdle && !isSuccess ? { repeat: Infinity, duration: 1.5 } : { duration: 0.4 }}
              className={`w-full h-full rounded-[40px] flex flex-col items-center justify-center border-4 border-dashed transition-all duration-300 z-0 ${
                isSuccess ? "bg-white border-transparent shadow-[0_0_40px_rgba(255,255,255,0.6)]" : "bg-white/20 border-white/60"
              }`}
            >
              <span 
                className={`font-fredoka text-8xl -mt-4 transition-colors duration-500 ${!isSuccess && 'text-white/40'}`}
                style={{ color: isSuccess ? currentLesson.color : undefined }}
              >
                {currentLesson.char}
              </span>
              
              {/* Counting Dots to reinforce numerical concept */}
              <div className="absolute bottom-6 flex gap-1.5 opacity-60">
                {[...Array(currentLesson.value)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${!isSuccess ? 'bg-white/50' : ''}`} 
                    style={{ backgroundColor: isSuccess ? currentLesson.color : undefined }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          
          <div className="text-white font-bold text-xl mt-6 drop-shadow-md h-8 text-center px-4">
            {isSuccess ? tc("youDidIt") : t("instruction", { number: currentLesson.char })}
          </div>
        </div>

        {/* ── DRAGGABLE OPTIONS GRID ─────────────────────── */}
        <div className="grid grid-cols-2 gap-5 w-full max-w-[320px] mb-6">
          {options.map((option, idx) => (
            <NumberToken
              key={`${level}-${option.id}-${idx}`}
              char={option.char}
              color={option.color}
              isCorrect={option.id === currentLesson.id}
              onMatch={handleMatch}
              onWrong={handleWrong}
              disabled={isSuccess}
              dropZoneRef={dropZoneRef}
            />
          ))}
        </div>
      </div>

      {/* ── REUSABLE MODALS ────────────────────────────── */}
      <CelebrationModal
        isOpen={isSuccess}
        onNext={handleNext}
        title="Super Duper!"
        subtitle={t("successBody", { number: currentLesson.char })}
        buttonText={level < totalNumbers - 1 ? t("nextNumber") : tc("finish")}
      />

      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        title={t("hintTitle")}
        hintText={t(currentLesson.hintKey as HintKey)}
        animal={currentLesson.animal as "koala" | "fox" | "bear" | "dog" | "rabbit"}
        animalColor={currentLesson.color}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%) skewX(-12deg); }
        }
      `}} />
    </div>
  );
}
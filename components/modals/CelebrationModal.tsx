// components/modals/CelebrationModal.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { useJoyoStore } from "@/store/useJoyoStore";
import { Confetti } from "@/components/game/Confetti";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound } from "@/lib/sounds";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

interface CelebrationModalProps {
  isOpen: boolean;
  onNext: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  /** Full-module graduation moment: special cap + celebratory styling */
  diploma?: boolean;
}

export function CelebrationModal({ 
  isOpen, 
  onNext,
  title,
  subtitle,
  buttonText,
  diploma = false,
}: CelebrationModalProps) {
  const t = useTranslations("Celebration");
  const tc = useTranslations("Common");
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
  
  const { avatar, childName } = useJoyoStore();

  useEffect(() => {
    if (isOpen) {
      // Trigger the triumphant cheer sound when the modal mounts
      playSound("cheer");
    }
  }, [isOpen]);

  const handleNext = () => {
    playSound("pop");
    onNext();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={trapRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden touch-none select-none px-6"
          role="dialog"
          aria-modal="true"
          aria-label={title || "celebration"}
        >
          
          {/* ── BACKDROP ───────────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#3D2C1E]/60 backdrop-blur-md"
          />

          {/* ── CONFETTI LAYER ─────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <Confetti active={isOpen} />
          </div>

          {/* ── MODAL CONTENT ──────────────────────────────────── */}
          <motion.div 
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className="relative w-full max-w-[400px] bg-white rounded-[48px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.3)] border-8 border-white flex flex-col items-center text-center z-20"
          >
            {/* Rotating Sunburst / Lightbeams Behind Avatar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none -z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-full h-full opacity-20"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0deg 15deg, #F5C518 15deg 30deg, transparent 30deg 45deg, #F5C518 45deg 60deg, transparent 60deg 75deg, #F5C518 75deg 90deg, transparent 90deg 105deg, #F5C518 105deg 120deg, transparent 120deg 135deg, #F5C518 135deg 150deg, transparent 150deg 165deg, #F5C518 165deg 180deg, transparent 180deg 195deg, #F5C518 195deg 210deg, transparent 210deg 225deg, #F5C518 225deg 240deg, transparent 240deg 255deg, #F5C518 255deg 270deg, transparent 270deg 285deg, #F5C518 285deg 300deg, transparent 300deg 315deg, #F5C518 315deg 330deg, transparent 330deg 345deg, #F5C518 345deg 360deg)",
                  borderRadius: "50%"
                }}
              />
            </div>

            {/* Glowing Avatar & Stars Cluster */}
            <div className="relative -mt-20 mb-6">
              <div className="absolute inset-0 bg-[#F5C518] blur-3xl opacity-30 rounded-full animate-pulse" />
              
              <div className="relative w-32 h-32 bg-[#FFF8E7] rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10">
                <AnimalCharacter animal={avatar} color="#F5C518" className="w-24 h-24 mt-4" />
                {/* Graduation cap for the module-completed "diploma" moment */}
                {diploma && (
                  <motion.div
                    initial={{ y: -30, rotate: -20, opacity: 0 }}
                    animate={{ y: 0, rotate: -8, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 64 40" className="w-14 h-10 drop-shadow-md">
                      <path d="M32 2 62 14 32 26 2 14Z" fill="#263238" />
                      <path d="M32 6 54 14 32 22 10 14Z" fill="#37474F" />
                      <rect x="26" y="22" width="12" height="10" rx="2" fill="#37474F" />
                      <circle cx="52" cy="18" r="3" fill="#F5C518" stroke="#D4A800" strokeWidth="1.5" />
                      <path d="M52 6v9" stroke="#F5C518" strokeWidth="1.5" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Child's own name on the diploma */}
              {diploma && childName && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="relative z-20 mt-2 font-fredoka text-lg text-[#3D2C1E] bg-white px-4 py-1.5 rounded-full border-2 border-[#F5C518] shadow-sm"
                >
                  {childName}
                </motion.span>
              )}

              {/* 3 Popping Stars */}
              <div className="absolute -top-4 -left-6 z-20">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: -15 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <Star className="text-[#F5C518] fill-[#F5C518] drop-shadow-md w-10 h-10" />
                </motion.div>
              </div>
              <div className="absolute -top-8 right-1/2 translate-x-1/2 z-20">
                <motion.div 
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1.2, rotate: 10 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                >
                  <Star className="text-[#FF7043] fill-[#FF7043] drop-shadow-md w-14 h-14" />
                </motion.div>
              </div>
              <div className="absolute -top-2 -right-6 z-20">
                <motion.div 
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: 1, rotate: 25 }}
                  transition={{ delay: 0.7, type: "spring", bounce: 0.6 }}
                >
                  <Star className="text-[#5C9BF5] fill-[#5C9BF5] drop-shadow-md w-10 h-10" />
                </motion.div>
              </div>
            </div>

            {/* Typography */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-fredoka text-4xl text-[#FF7043] mb-3 leading-tight drop-shadow-sm"
            >
              {title || (diploma ? t("diplomaTitle") : t("moduleComplete"))}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-[#7A6552] text-xl font-bold mb-8 leading-snug px-2"
            >
              {subtitle || t("youAreAStar")}
            </motion.p>

            {/* Action CTA */}
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="w-full bg-[#4CAF50] text-white font-fredoka text-2xl py-5 rounded-[32px] shadow-[0_8px_0_rgba(56,142,60,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(56,142,60,1)] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Shine effect on button */}
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-[-20deg] group-hover:animate-shine" />
              
              {buttonText ||
                (diploma
                  ? tc("finish")
                  : t("claimReward"))}
            </motion.button>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
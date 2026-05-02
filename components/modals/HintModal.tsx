// components/modals/HintModal.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound } from "@/lib/sounds";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  hintText: string;
  animal?: "koala" | "fox" | "bear" | "dog" | "rabbit";
  animalColor?: string;
}

export function HintModal({ 
  isOpen, 
  onClose, 
  title, 
  hintText,
  animal = "koala",
  animalColor = "#5C9BF5"
}: HintModalProps) {
  const tc = useTranslations("Common");

  useEffect(() => {
    if (isOpen) {
      playSound("pop");
    }
  }, [isOpen]);

  const handleClose = () => {
    playSound("pop");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-90 flex items-end justify-center overflow-hidden touch-none select-none">
          
          {/* ── BACKDROP ───────────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#3D2C1E]/40 backdrop-blur-[2px]"
          />

          {/* ── BOTTOM SHEET MODAL ───────────────────────────── */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-107.5 bg-white rounded-t-[40px] px-6 pt-10 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col items-center text-center z-20 border-t-4 border-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-5 right-5 w-10 h-10 bg-[#F7F4EE] rounded-full flex items-center justify-center text-[#B8A898] active:scale-90 transition-transform"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* Icon/Avatar Container breaking out of the top */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center">
               <div className="relative w-24 h-24 bg-[#FFF8E7] rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                <AnimalCharacter animal={animal} color={animalColor} className="w-16 h-16 mt-2" />
                
                {/* Little Lightbulb Badge */}
                <motion.div 
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 10 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                  className="absolute -top-1 -right-2 bg-[#F5C518] rounded-full p-2 border-2 border-white shadow-md"
                >
                  <Lightbulb size={16} className="text-white fill-white" />
                </motion.div>
              </div>
            </div>

            {/* Typography */}
            <h2 className="font-fredoka text-2xl text-[#3D2C1E] mt-4 mb-3">
              {title || "Need a hand?"}
            </h2>
            
            <p className="text-[#7A6552] text-lg font-bold mb-8 leading-relaxed max-w-280px">
              {hintText}
            </p>

            {/* Action CTA */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="w-full bg-[#4CAF50] text-white font-fredoka text-xl py-4 rounded-[28px] shadow-[0_6px_0_rgba(56,142,60,1)] active:translate-y-1 active:shadow-[0_0px_0_rgba(56,142,60,1)] transition-all flex items-center justify-center"
            >
              {tc("gotIt")}
            </motion.button>

            {/* Safe Area spacing for newer iPhones */}
            <div className="h-safe-bottom w-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
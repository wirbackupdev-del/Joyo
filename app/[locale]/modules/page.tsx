// app/[locale]/modules/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";
import { playSound } from "@/lib/sounds";

// Staggered animation container
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, bounce: 0.5, duration: 0.6 }
  },
};

export default function ModulesPage() {
  const t = useTranslations("Modules");
  const tc = useTranslations("Common");
  const router = useRouter();
  
  // Hydration safety for Zustand
  const { completedModules } = useJoyoStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  },[]);

  const navigateToGame = (route: string) => {
    playSound("pop");
    router.push(route);
  };

  const goBack = () => {
    playSound("pop");
    router.back();
  };

  // The Curriculum Data
  const MODULES =[
    {
      id: "shapes",
      title: t("shapes"),
      href: "/play/shapes",
      bgColor: "bg-[#4CAF50]",
      shadowColor: "rgba(56,142,60,1)",
      // Custom SVG composition for Shapes
      graphic: (
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute top-0 right-2 w-10 h-10 bg-white rounded-full opacity-90" />
          <div className="absolute bottom-1 left-1 w-12 h-12 bg-white rounded-lg opacity-90 rotate-12" />
          <svg viewBox="0 0 100 100" className="absolute top-2 left-2 w-10 h-10 text-white fill-current opacity-90 -rotate-12">
            <path d="M50,10 L90,88 L10,88 Z" />
          </svg>
        </div>
      ),
    },
    {
      id: "letters",
      title: t("letters"),
      href: "/play/letters",
      bgColor: "bg-[#F5C518]",
      shadowColor: "rgba(212,168,0,1)",
      graphic: (
        <span className="font-fredoka text-6xl text-white drop-shadow-md">
          Aa
        </span>
      ),
    },
    {
      id: "numbers",
      title: t("numbers"),
      href: "/play/numbers",
      bgColor: "bg-[#5C9BF5]",
      shadowColor: "rgba(33,105,243,1)",
      graphic: (
        <span className="font-fredoka text-6xl text-white drop-shadow-md tracking-tighter">
          123
        </span>
      ),
    },
    {
      id: "colors",
      title: t("colors"),
      href: "/play/colors",
      bgColor: "bg-[#A86FBE]",
      shadowColor: "rgba(123,31,162,1)",
      // Custom paint palette SVG for Colors
      graphic: (
        <svg viewBox="0 0 24 24" className="w-20 h-20 text-white fill-current drop-shadow-md">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-4 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      ),
    },
  ];

  if (!mounted) return <div className="min-h-screen bg-[#FFF8E7]" />;

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] overflow-hidden flex flex-col font-nunito touch-none select-none">
      <BotanicalBackground />

      <main className="relative z-10 flex flex-col items-center h-screen w-full max-w-107.5 mx-auto px-6 pt-6 pb-10">
        
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="w-full flex items-center justify-between mb-8 z-20">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack} 
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
            aria-label={tc("back", { namespace: "Common" })}
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white px-6 py-3 rounded-full shadow-sm border-2 border-[#E8DCC8]"
          >
            <h1 className="font-fredoka text-2xl text-[#FF7043] uppercase tracking-wide">
              {t("title")}
            </h1>
          </motion.div>
          
          {/* Spacer to perfectly center the title */}
          <div className="w-14 h-14" />
        </header>

        {/* ── MODULE GRID ─────────────────────────────────── */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-5 w-full mt-auto mb-auto"
        >
          {MODULES.map((module) => {
            const isCompleted = completedModules.includes(module.id);

            return (
              <motion.button
                key={module.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToGame(module.href)}
                className={`relative aspect-square w-full rounded-[36px] flex flex-col items-center justify-center gap-4 ${module.bgColor} transition-all`}
                style={{
                  boxShadow: `0 10px 0 ${module.shadowColor}, 0 15px 25px rgba(0,0,0,0.1)`,
                }}
                // Custom CSS variable for the active translation
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(8px) scale(0.95)";
                  e.currentTarget.style.boxShadow = `0 2px 0 ${module.shadowColor}, 0 5px 10px rgba(0,0,0,0.1)`;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `0 10px 0 ${module.shadowColor}, 0 15px 25px rgba(0,0,0,0.1)`;
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = "translateY(8px) scale(0.95)";
                  e.currentTarget.style.boxShadow = `0 2px 0 ${module.shadowColor}, 0 5px 10px rgba(0,0,0,0.1)`;
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `0 10px 0 ${module.shadowColor}, 0 15px 25px rgba(0,0,0,0.1)`;
                }}
              >
                {/* Internal soft highlight for glass/toy effect */}
                <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent rounded-[36px] pointer-events-none" />

                {/* The Module Icon */}
                <div className="relative z-10">
                  {module.graphic}
                </div>

                {/* Module Title */}
                <span className="font-fredoka text-2xl text-white tracking-wide relative z-10">
                  {module.title}
                </span>

                {/* Completion Star Badge */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 12 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                    className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#F5C518]"
                  >
                    <Star className="text-[#F5C518] fill-[#F5C518] w-6 h-6" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

      </main>
    </div>
  );
}
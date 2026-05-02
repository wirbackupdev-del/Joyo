// app/[locale]/parent/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowLeft, Settings, Star, CheckCircle2, Clock, Heart, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound } from "@/lib/sounds";

// ✅ Fix 1: Proper type for module keys instead of `as any`
type ModuleKey = "colors" | "shapes" | "numbers" | "animals";

export default function ParentDashboardPage() {
  const t = useTranslations("ParentDashboard");
  // const tc = useTranslations("Common");
  const tm = useTranslations("Modules");
  const router = useRouter();

  const { childName, avatar, stars, completedModules } = useJoyoStore();

  // Mocking "time today" for the MVP dashboard feel.
  // In a real app, you'd track session duration in the store.
  const mockTimeToday = stars > 0 ? stars * 2 + 4 : 0;

  // Deriving favorite module based on what's completed
  const favorite =
    completedModules.length > 0
      ? tm(completedModules[completedModules.length - 1] as ModuleKey)
      : t("noneYet");

  const goBack = () => {
    playSound("pop");
    router.push("/home");
  };

  const goSettings = () => {
    playSound("pop");
    router.push("/parent/settings");
  };

  // ✅ Fix 2: Remove useEffect + useState for mounted — use suppressHydrationWarning
  // or simply render directly. Since this page reads from a store (client-only),
  // wrapping the dynamic values with a client-safe pattern is enough.
  // If you still need a hydration guard, use `useSyncExternalStore` or move
  // the store reads into a child marked with `"use client"`.
  // For this MVP, we guard by checking if window is defined inline:
  const isMounted = typeof window !== "undefined";

  if (!isMounted) return <div className="min-h-screen bg-[#F7F4EE]" />;

  // ✅ Fix 3: Typed Variants with literal `type` values to satisfy Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, bounce: 0.4 },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#F7F4EE] overflow-y-auto font-nunito pb-12">

      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#FFF8E7] to-[#F7F4EE] pointer-events-none" />

      <main className="relative z-10 w-full max-w-107.5 mx-auto px-6 pt-6 flex flex-col">

        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-fredoka text-xl text-[#3D2C1E] tracking-wide"
          >
            {t("title")}
          </motion.h1>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goSettings}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#7A6552] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
            aria-label={t("settings")}
          >
            <Settings size={28} strokeWidth={2.5} />
          </motion.button>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {/* ── PROFILE HERO CARD ─────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white rounded-32px p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border-2 border-[#E8DCC8] flex items-center gap-5"
          >
            <div className="relative w-20 h-20 bg-[#FFF8E7] rounded-full shrink-0 border-4 border-[#FDE87A] flex items-center justify-center overflow-hidden shadow-inner">
              <AnimalCharacter animal={avatar} color="#F5C518" className="w-20 h-20 mt-4" />
            </div>
            <div>
              <h2 className="font-fredoka text-2xl text-[#3D2C1E] mb-1">
                {childName || "Your Child"}
              </h2>
              <p className="text-[#7A6552] font-bold text-sm leading-tight">
                {stars > 0
                  ? t("greeting", { name: childName || "Your child" })
                  : t("greetingEmpty")}
              </p>
            </div>
          </motion.div>

          {/* ── METRICS BENTO GRID ────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Stars Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[28px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8] flex flex-col relative overflow-hidden group cursor-default"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Star size={100} className="fill-[#F5C518] text-[#F5C518]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center mb-3">
                <Star size={20} className="fill-[#F5C518] text-[#F5C518]" />
              </div>
              <span className="font-fredoka text-4xl text-[#3D2C1E] mb-1">{stars}</span>
              <span className="font-bold text-[#B8A898] text-sm uppercase tracking-wide">
                {t("starsEarned")}
              </span>
            </motion.div>

            {/* Modules Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[28px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8] flex flex-col relative overflow-hidden group cursor-default"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <CheckCircle2 size={100} className="fill-[#4CAF50] text-[#4CAF50]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-3">
                <CheckCircle2 size={20} className="text-[#4CAF50]" strokeWidth={3} />
              </div>
              <span className="font-fredoka text-4xl text-[#3D2C1E] mb-1">
                {completedModules.length}
                <span className="text-xl text-[#B8A898]">/4</span>
              </span>
              <span className="font-bold text-[#B8A898] text-sm uppercase tracking-wide">
                {t("modulesDone")}
              </span>
            </motion.div>

            {/* Time Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[28px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8] flex flex-col relative overflow-hidden group cursor-default"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Clock size={100} className="fill-[#5C9BF5] text-[#5C9BF5]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center mb-3">
                <Clock size={20} className="text-[#5C9BF5]" strokeWidth={3} />
              </div>
              <span className="font-fredoka text-2xl text-[#3D2C1E] mb-1 mt-2">
                {t("timeValue", { mins: mockTimeToday })}
              </span>
              <span className="font-bold text-[#B8A898] text-sm uppercase tracking-wide">
                {t("timeToday")}
              </span>
            </motion.div>

            {/* Favorite Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[28px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8] flex flex-col relative overflow-hidden group cursor-default"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Heart size={100} className="fill-[#A86FBE] text-[#A86FBE]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F3E5F5] flex items-center justify-center mb-3">
                <Heart size={20} className="text-[#A86FBE] fill-[#A86FBE]" strokeWidth={2} />
              </div>
              <span className="font-fredoka text-2xl text-[#3D2C1E] mb-1 mt-2 truncate">
                {favorite}
              </span>
              <span className="font-bold text-[#B8A898] text-sm uppercase tracking-wide">
                {t("favoriteModule")}
              </span>
            </motion.div>

          </div>

          {/* ── DETAILED PROGRESS ROW (CTA) ───────────────── */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/progress")}
            className="w-full bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-2 border-[#E8DCC8] flex items-center justify-between mt-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF8E7] flex items-center justify-center">
                <Star size={24} className="text-[#FF7043]" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h3 className="font-fredoka text-lg text-[#3D2C1E]">
                  Detailed Progress
                </h3>
                <p className="text-sm font-bold text-[#7A6552]">
                  View full trophy room
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F7F4EE] flex items-center justify-center text-[#B8A898]">
              <ChevronRight size={24} strokeWidth={3} />
            </div>
          </motion.button>

        </motion.div>
      </main>
    </div>
  );
}
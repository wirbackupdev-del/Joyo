// app/[locale]/parent/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Settings, Star, CheckCircle2, Activity, Heart, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";

import { useJoyoStore } from "@/store/useJoyoStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { MODULE_META } from "@/lib/lessons/moduleMeta";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { stopMusic } from "@/lib/sounds";

export default function ParentDashboardPage() {
  const t = useTranslations("ParentDashboard");
  const tm = useTranslations("Modules");
  const router = useRouter();

  const hydrated = useHydrated();
  const { childName, avatar, stars, completedModules, starLog, sessionsPlayed, moduleStars } =
    useJoyoStore();

  // Parent zone → no ambient music
  useEffect(() => stopMusic(), []);

  // Last 7 days of star activity for the mini chart
  const last7 = (() => {
    const out: { key: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      out.push({
        key,
        label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        count: starLog[key] ?? 0,
      });
    }
    return out;
  })();
  const weeklyMax = Math.max(1, ...last7.map((d) => d.count));
  const weekTotal = last7.reduce((sum, d) => sum + d.count, 0);

  // Newest completed module = child's current favorite
  const favorite =
    completedModules.length > 0
      ? tm(completedModules[completedModules.length - 1] as "shapes")
      : t("noneYet");

  const goBack = () => router.push("/home");
  const goSettings = () => router.push("/parent/settings");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } },
  };

  if (!hydrated) return <div className="min-h-screen bg-[#F7F4EE]" />;

  return (
    <div className="relative min-h-screen bg-[#F7F4EE] overflow-y-auto pb-12">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#FFF8E7] to-[#F7F4EE] pointer-events-none" />

      <main className="relative z-10 w-full max-w-[430px] mx-auto px-6 pt-6 flex flex-col">
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
            aria-label={t("back")}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
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
            className="w-full bg-white rounded-[32px] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border-2 border-[#E8DCC8] flex items-center gap-5"
          >
            <div className="relative w-20 h-20 bg-[#FFF8E7] rounded-full shrink-0 border-4 border-[#FDE87A] flex items-center justify-center overflow-hidden shadow-inner">
              <AnimalCharacter animal={avatar} color="#F5C518" className="w-20 h-20 mt-4" />
            </div>
            <div>
              <h2 className="font-fredoka text-2xl text-[#3D2C1E] mb-1">
                {childName || t("defaultChild")}
              </h2>
              <p className="text-[#7A6552] font-bold text-sm leading-tight">
                {stars > 0
                  ? t("greeting", { name: childName || t("defaultChild") })
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

            {/* Sessions Card (real counter, not an estimate) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[28px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8] flex flex-col relative overflow-hidden group cursor-default"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Activity size={100} className="fill-[#5C9BF5] text-[#5C9BF5]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center mb-3">
                <Activity size={20} className="text-[#5C9BF5]" strokeWidth={3} />
              </div>
              <span className="font-fredoka text-4xl text-[#3D2C1E] mb-1">
                {sessionsPlayed}
              </span>
              <span className="font-bold text-[#B8A898] text-sm uppercase tracking-wide">
                {t("sessions")}
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

          {/* ── WEEKLY ACTIVITY ──────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white rounded-[32px] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border-2 border-[#E8DCC8]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-fredoka text-lg text-[#3D2C1E]">
                {t("weekTitle")}
              </h3>
              <span className="font-bold text-[#7A6552] text-sm">
                {t("weekStars", { n: weekTotal })}
              </span>
            </div>
            <div
              className="flex items-end justify-between gap-2 h-28"
              role="img"
              aria-label={t("weekTitle")}
            >
              {last7.map((day) => (
                <div key={day.key} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 4 }}
                    animate={{ height: `${Math.max(6, (day.count / weeklyMax) * 100)}%` }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    className={`w-full rounded-t-lg min-h-[6px] ${
                      day.count > 0 ? "bg-[#F5C518]" : "bg-[#F0EAE0]"
                    }`}
                  />
                  <span className="text-[#B8A898] font-bold text-xs uppercase">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── MODULE BREAKDOWN + NEXT STEP ─────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white rounded-[32px] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border-2 border-[#E8DCC8]"
          >
            <h3 className="font-fredoka text-lg text-[#3D2C1E] mb-4">
              {t("moduleBreakdown")}
            </h3>
            <div className="flex flex-col gap-3">
              {(Object.keys(MODULE_META) as Array<keyof typeof MODULE_META>).map(
                (moduleId) => {
                  const meta = MODULE_META[moduleId];
                  const done = moduleStars[moduleId] ?? 0;
                  const pct = Math.min(100, Math.round((done / meta.total) * 100));
                  return (
                    <div key={moduleId} className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden="true"
                      />
                      <span className="font-bold text-[#3D2C1E] text-sm w-20 shrink-0">
                        {tm(meta.titleKey as "shapes")}
                      </span>
                      <div className="flex-1 h-2.5 bg-[#F7F4EE] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                      </div>
                      <span className="font-bold text-[#B8A898] text-xs w-14 text-end shrink-0">
                        {done}/{meta.total}
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            {/* Actionable insight for tonight */}
            <p className="text-[#7A6552] font-bold text-sm mt-5 leading-relaxed bg-[#FFF8E7] border-2 border-[#FDE87A] rounded-2xl p-3">
              💡{" "}
              {t("insight", {
                module: completedModules.includes("letters")
                  ? tm("shapes")
                  : tm("letters"),
              })}
            </p>
          </motion.div>

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
              <div className="text-start">
                <h3 className="font-fredoka text-lg text-[#3D2C1E]">
                  {t("detailedCta")}
                </h3>
                <p className="text-sm font-bold text-[#7A6552]">
                  {t("detailedCtaSub")}
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

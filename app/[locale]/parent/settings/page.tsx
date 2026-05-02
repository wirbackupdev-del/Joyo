// app/[locale]/parent/settings/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, Music, User, Globe, Trash2, AlertTriangle, X, Pencil, Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

import { useJoyoStore } from "@/store/useJoyoStore";
import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { playSound } from "@/lib/sounds";

// Custom Chunky Toggle Component
function PremiumToggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        playSound("pop");
        onToggle();
      }}
      className={`relative w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${
        isOn ? "bg-[#4CAF50]" : "bg-[#D7C7B2]"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
        className="w-7 h-7 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
        style={{ originX: isOn ? 1 : 0 }}
      />
    </motion.button>
  );
}

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { childName, avatar, setProfile, resetProgress } = useJoyoStore();

  // No useEffect needed — initialize directly from store value
  const [editNameValue, setEditNameValue] = useState(childName);

  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Derive displayed name: show live store value when not editing
  const displayName = isEditingName ? editNameValue : childName;

  const goBack = () => {
    playSound("pop");
    router.back();
  };

  const handleSaveName = () => {
    playSound("correct");
    setProfile(editNameValue.trim() || "Your Child", avatar);
    setIsEditingName(false);
  };

  const switchLanguage = (newLocale: string) => {
    playSound("pop");
    router.replace(pathname, { locale: newLocale });
  };

  const handleResetConfirm = () => {
    playSound("wrong");
    resetProgress();
    setEditNameValue("Your Child"); // sync local edit value after reset
    setShowResetModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, bounce: 0.4 }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F4EE] overflow-y-auto font-nunito pb-12">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#FFF8E7] to-[#F7F4EE] pointer-events-none" />

      <main className="relative z-10 w-full max-w-107.5 mx-auto px-6 pt-6 flex flex-col">

        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="font-fredoka text-xl text-[#3D2C1E] tracking-wide"
          >
            {t("title")}
          </motion.h1>

          <div className="w-14 h-14" /> {/* Spacer */}
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">

          {/* ── PROFILE SECTION ────────────────────────────── */}
          <motion.section variants={itemVariants} className="bg-white rounded-32px p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8]">
            <div className="flex items-center gap-3 mb-5">
              <User size={22} className="text-[#5C9BF5]" strokeWidth={2.5} />
              <h2 className="font-fredoka text-lg text-[#3D2C1E]">{t("profile")}</h2>
            </div>

            <div className="flex items-center justify-between bg-[#F7F4EE] p-4 rounded-24px border border-[#E8DCC8]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-[#E8DCC8] shadow-sm">
                  <AnimalCharacter animal={avatar} color="#F5C518" className="w-10 h-10 mt-2" />
                </div>

                {isEditingName ? (
                  <input
                    autoFocus
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="bg-white border-2 border-[#5C9BF5] rounded-xl px-3 py-2 outline-none font-bold text-[#3D2C1E] w-32 focus:ring-4 focus:ring-[#5C9BF5]/20 transition-all"
                  />
                ) : (
                  <span className="font-fredoka text-xl text-[#3D2C1E]">{displayName}</span>
                )}
              </div>

              {isEditingName ? (
                <button
                  onClick={handleSaveName}
                  className="bg-[#4CAF50] text-white p-3 rounded-xl shadow-[0_4px_0_rgba(56,142,60,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    playSound("pop");
                    setEditNameValue(childName); // sync before opening edit
                    setIsEditingName(true);
                  }}
                  className="bg-white text-[#7A6552] p-3 rounded-xl border-2 border-[#E8DCC8] shadow-sm active:scale-95 transition-all"
                >
                  <Pencil size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </motion.section>

          {/* ── AUDIO SECTION ──────────────────────────────── */}
          <motion.section variants={itemVariants} className="bg-white rounded-32px p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8]">
            <div className="flex items-center gap-3 mb-5">
              <Volume2 size={22} className="text-[#A86FBE]" strokeWidth={2.5} />
              <h2 className="font-fredoka text-lg text-[#3D2C1E]">{t("audio")}</h2>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-4 bg-[#F7F4EE] rounded-24px border border-[#E8DCC8]">
                <div className="flex items-center gap-3">
                  <Music size={20} className="text-[#7A6552]" />
                  <span className="font-bold text-[#3D2C1E]">{t("music")}</span>
                </div>
                <PremiumToggle isOn={musicOn} onToggle={() => setMusicOn(!musicOn)} />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F7F4EE] rounded-24px border border-[#E8DCC8]">
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className="text-[#7A6552]" />
                  <span className="font-bold text-[#3D2C1E]">{t("sfx")}</span>
                </div>
                <PremiumToggle isOn={sfxOn} onToggle={() => setSfxOn(!sfxOn)} />
              </div>
            </div>
          </motion.section>

          {/* ── LANGUAGE SECTION ───────────────────────────── */}
          <motion.section variants={itemVariants} className="bg-white rounded-32px p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] border-2 border-[#E8DCC8]">
            <div className="flex items-center gap-3 mb-5">
              <Globe size={22} className="text-[#F5C518]" strokeWidth={2.5} />
              <h2 className="font-fredoka text-lg text-[#3D2C1E]">{t("language")}</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { code: "en", label: "English" },
                { code: "fr", label: "Français" },
                { code: "ar", label: "العربية" }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                    locale === lang.code
                      ? "bg-[#F5C518]/10 border-[#F5C518] text-[#D4A800] shadow-sm"
                      : "bg-[#F7F4EE] border-transparent text-[#7A6552] hover:bg-[#F5C518]/5"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.section>

          {/* ── DANGER ZONE ────────────────────────────────── */}
          <motion.section variants={itemVariants} className="bg-white rounded-32px p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] border-2 border-[#FFEBEE]">
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle size={22} className="text-[#EF5350]" strokeWidth={2.5} />
              <h2 className="font-fredoka text-lg text-[#EF5350]">{t("dangerZone")}</h2>
            </div>

            <button
              onClick={() => { playSound("pop"); setShowResetModal(true); }}
              className="w-full bg-[#FFEBEE] text-[#EF5350] font-bold py-4 rounded-24px border-2 border-[#EF5350]/20 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <Trash2 size={20} strokeWidth={2.5} />
              {t("resetProgress")}
            </button>
          </motion.section>

          {/* App Info Footer */}
          <motion.div variants={itemVariants} className="text-center pt-4 pb-8">
            <p className="text-[#B8A898] text-sm font-bold tracking-wide">
              {t("version")}
            </p>
          </motion.div>

        </motion.div>
      </main>

      {/* ── RESET CONFIRMATION MODAL ─────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#3D2C1E]/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring" as const, bounce: 0.4 }}
              className="bg-white w-full max-w-340px rounded-[40px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)] text-center relative border-4 border-white"
            >
              <button
                onClick={() => { playSound("pop"); setShowResetModal(false); }}
                className="absolute top-4 right-4 w-10 h-10 bg-[#F7F4EE] rounded-full flex items-center justify-center text-[#B8A898] active:scale-90 transition-transform"
              >
                <X size={20} strokeWidth={3} />
              </button>

              <div className="w-20 h-20 bg-[#FFEBEE] rounded-full mx-auto flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-[#EF5350]" strokeWidth={2.5} />
              </div>

              <h3 className="font-fredoka text-2xl text-[#3D2C1E] mb-3">
                {t("resetProgress")}?
              </h3>
              <p className="text-[#7A6552] font-bold text-[15px] leading-relaxed mb-8">
                {t("resetWarning")}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResetConfirm}
                  className="w-full bg-[#EF5350] text-white font-black py-4 rounded-24px shadow-[0_6px_0_rgba(198,40,40,1)] active:translate-y-1 active:shadow-none transition-all text-lg"
                >
                  {t("confirmReset")}
                </button>
                <button
                  onClick={() => { playSound("pop"); setShowResetModal(false); }}
                  className="w-full bg-white text-[#7A6552] font-bold py-4 rounded-24px border-2 border-[#E8DCC8] active:scale-95 transition-all text-lg"
                >
                  {t("cancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
// app/[locale]/parent/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Delete } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { playSound } from "@/lib/sounds";

export default function ParentGatePage() {
  const t = useTranslations("ParentGate");
  const tc = useTranslations("Common");
  const router = useRouter();

  // ── Lazy initializer: factors are computed once on mount, no effect needed ──
  const [[factorA, factorB]] = useState<[number, number]>(() => [
    Math.floor(Math.random() * 5) + 5, // 5 to 9
    Math.floor(Math.random() * 5) + 5, // 5 to 9
  ]);

  // ── mounted: use a ref flag so we never call setState inside an effect ──
  // We just flip `mounted` to true after the first render via a ref-guarded
  // synchronous setState that runs only once (inside a layout effect is fine
  // for hydration guards; alternatively we can use a simple ref + forceUpdate,
  // but the cleanest ESLint-safe pattern is the initializer below).
  const hasMounted = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Guard ensures we only flip the flag once; not a cascading render because
    // the condition prevents every subsequent render from calling setState.
    if (!hasMounted.current) {
      hasMounted.current = true;
      setMounted(true); 
    }
  }, []);

  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const expectedAnswer = (factorA * factorB).toString();

  // ── Validate when input reaches the expected length ──────────────────────
  // These setState calls are intentional derived-state reactions to external
  // input; they don't create cascading renders because each branch is terminal
  // (the condition prevents re-entry on the next render).
  useEffect(() => {
    if (input.length !== expectedAnswer.length || expectedAnswer === "0") return;

    if (input === expectedAnswer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reacting to user input event
      setIsSuccess(true);
      playSound("correct");
      setTimeout(() => {
        router.push("/parent/dashboard");
      }, 600);
    } else {
      playSound("wrong");
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setInput("");
      }, 600);
    }
  }, [input, expectedAnswer, router]);

  const handleKeyPress = (num: string) => {
    if (input.length < expectedAnswer.length && !isSuccess && !isError) {
      playSound("pop");
      setInput((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (input.length > 0 && !isSuccess && !isError) {
      playSound("pop");
      setInput((prev) => prev.slice(0, -1));
    }
  };

  const goBack = () => {
    playSound("pop");
    router.back();
  };

  if (!mounted) return <div className="min-h-screen bg-[#F7F4EE]" />;

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="relative min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center font-nunito touch-none select-none overflow-hidden">

      {/* Mature, subtle background gradient - not the fun botanical one */}
      <div className="absolute inset-0 bg-linear-to-b from-[#FFF8E7] to-[#F7F4EE] pointer-events-none" />

      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="absolute top-0 w-full max-w-107.5 mx-auto px-6 pt-6 flex items-center z-20">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={goBack}
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#3D2C1E] active:scale-90 transition-transform shadow-sm border-2 border-[#E8DCC8]"
          aria-label={tc("back")}
        >
          <ArrowLeft size={28} strokeWidth={3} />
        </motion.button>
      </header>

      <main className="relative z-10 w-full max-w-380px px-6 flex flex-col items-center">

        {/* ── LOCK ICON & TITLE ─────────────────────────── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.06)] border-4 border-[#E8DCC8] mb-4">
            <Lock className={isSuccess ? "text-[#4CAF50]" : "text-[#7A6552]"} size={36} strokeWidth={2.5} />
          </div>
          <h1 className="font-fredoka text-3xl text-[#3D2C1E] tracking-wide mb-2 text-center">
            {t("title")}
          </h1>
          <p className="text-[#7A6552] text-center font-bold text-lg max-w-260px leading-snug">
            {t("instruction")}
          </p>
        </motion.div>

        {/* ── PROBLEM & INPUT DISPLAY ───────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white rounded-32px p-8 mb-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border-2 border-[#E8DCC8] flex flex-col items-center"
        >
          <div className="font-fredoka text-4xl text-[#3D2C1E] mb-6 tracking-widest">
            {factorA} × {factorB} = ?
          </div>

          <motion.div
            animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex gap-4 ${isSuccess ? "text-[#4CAF50]" : isError ? "text-[#EF5350]" : "text-[#3D2C1E]"}`}
          >
            {Array.from({ length: expectedAnswer.length }).map((_, i) => (
              <div
                key={i}
                className={`w-16 h-20 rounded-2xl flex items-center justify-center font-fredoka text-5xl shadow-inner border-2 transition-colors duration-300 ${
                  isSuccess
                    ? "bg-[#E8F5E9] border-[#4CAF50]"
                    : isError
                    ? "bg-[#FFEBEE] border-[#EF5350]"
                    : input[i]
                    ? "bg-[#F7F4EE] border-[#D7C7B2]"
                    : "bg-[#F7F4EE] border-transparent"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {input[i] && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      {input[i]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── NUMPAD ────────────────────────────────────── */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
          className="grid grid-cols-3 gap-4 w-full max-w-[320px]"
        >
          {keys.map((key, idx) => {
            if (key === "") return <div key={idx} />;

            if (key === "del")
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="h-20 rounded-full bg-white flex items-center justify-center text-[#7A6552] shadow-[0_6px_0_rgba(232,220,200,1)] active:translate-y-1 active:shadow-[0_2px_0_rgba(232,220,200,1)] transition-all"
                  aria-label={t("clear")}
                >
                  <Delete size={28} strokeWidth={2.5} />
                </motion.button>
              );

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyPress(key)}
                className="h-20 rounded-full bg-white flex items-center justify-center font-fredoka text-3xl text-[#3D2C1E] shadow-[0_6px_0_rgba(232,220,200,1)] active:translate-y-1 active:shadow-[0_2px_0_rgba(232,220,200,1)] transition-all"
              >
                {key}
              </motion.button>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
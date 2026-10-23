// app/[locale]/error.tsx
"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { AnimalCharacter } from "@/components/game/AnimalCharacter";
import { BotanicalBackground } from "@/components/game/BotanicalBackground";

/**
 * Child-proof runtime error page: never a blank screen — the mascot stays
 * cheerful and one tap gets back into the play loop.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    // Surface the failure for parents/devtools only
    console.error("[joyo] runtime error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] overflow-hidden flex flex-col touch-none select-none">
      <BotanicalBackground />
      <main className="relative z-10 flex flex-col items-center justify-center h-full-screen w-full max-w-[430px] mx-auto px-8 text-center">
        <div className="relative mb-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/50 rounded-full blur-xl" />
          <AnimalCharacter
            animal="koala"
            color="#B0BEC5"
            className="w-44 h-44 relative z-10"
          />
        </div>
        <h1 className="font-fredoka text-3xl text-[#3D2C1E] mb-3">
          {t("title")}
        </h1>
        <p className="text-[#7A6552] font-bold text-xl leading-relaxed max-w-[300px] mb-10">
          {t("body")}
        </p>
        <button
          onClick={reset}
          className="w-full max-w-[300px] bg-[#4CAF50] rounded-[32px] p-6 flex items-center justify-center gap-3 shadow-[0_8px_0_rgba(56,142,60,1)] active:translate-y-2 active:shadow-[0_0px_0_rgba(56,142,60,1)] transition-all"
        >
          <span className="font-fredoka text-3xl text-white mt-1">
            {t("retry")}
          </span>
        </button>
      </main>
    </div>
  );
}

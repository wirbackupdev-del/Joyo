// lib/hooks/useLessonGame.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import { useJoyoStore } from "@/store/useJoyoStore";
import { playSound, say, type SayLocale } from "@/lib/sounds";
import { vibrate } from "@/lib/haptics";
import { syncProgressToSupabase, markModuleComplete } from "@/lib/progress";
import { newlyEarnedBadges, type BadgeCheckState } from "@/lib/lessons/badges";

export interface LessonBase {
  id: string;
  hintKey: string;
  animal: "koala" | "fox" | "bear" | "dog" | "rabbit";
}

export interface UseLessonGameOptions<T extends LessonBase> {
  /** Ordered lesson list (final level = module complete). */
  lessons: T[];
  /** Module id for Supabase/local completion, e.g. "letters". */
  moduleId: string;
  /** Build the instruction line shown in the speech bubble. */
  getInstruction: (lesson: T) => string;
  /** Build the line spoken aloud to the child (pre-readers can't read). */
  getSayText: (lesson: T) => string;
}

export interface UseLessonGameResult<T extends LessonBase> {
  level: number;
  current: T;
  options: T[];
  isSuccess: boolean;
  isIdle: boolean;
  showHint: boolean;
  openHint: () => void;
  closeHint: () => void;
  speech: string;
  showSpeech: boolean;
  triggerSpeech: (msg: string) => void;
  /** Speak the current instruction again (replay button). */
  sayInstruction: () => void;
  wrongShake: boolean;
  handleMatch: () => void;
  handleWrong: () => void;
  handleNext: () => void;
  /** Base percentage for the level progress bar (before answering). */
  progressPct: number;
  stars: number;
  /** True exactly when the final lesson was matched (diploma moment). */
  moduleCompleted: boolean;
}

const shuffle = <T,>(arr: T[]): T[] =>
  arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ v }) => v);

/**
 * The single lesson-game state machine shared by every "play" module:
 * level progression, option shuffling, mascot speech, idle-nudge timers,
 * wrong-shake feedback, star awarding, badges, adaptive difficulty and
 * (non-blocking) Supabase sync. Keeping it in one place means one tested
 * loop instead of four drifting copies.
 *
 * Adaptive rules (session-scoped, gentle by design):
 *   - A struggle current level → next level gets fewer options.
 *   - First-try streaks → richer sets, and a rare double bonus skip
 *     forward (never skipping the module's final level).
 *   - Two misses in a level → the hint opens by itself.
 */
export function useLessonGame<T extends LessonBase>({
  lessons,
  moduleId,
  getInstruction,
  getSayText,
}: UseLessonGameOptions<T>): UseLessonGameResult<T> {
  const router = useRouter();
  const locale = useLocale() as SayLocale;
  const tBadge = useTranslations("Badge");
  const { addStar, stars, completeModule } = useJoyoStore();

  // Resume exactly where this module was left off (fresh profile → level 0)
  const [level, setLevel] = useState<number>(() => {
    const s = useJoyoStore.getState();
    const lp = s.lastPlayed;
    if (
      lp &&
      lp.moduleId === moduleId &&
      lp.level > 0 &&
      lp.level < lessons.length &&
      !s.completedModules.includes(moduleId)
    ) {
      return lp.level;
    }
    return 0;
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speech, setSpeech] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  // Adaptive-difficulty session state
  const failuresRef = useRef(0); // misses within the current level
  const [streak, setStreak] = useState(0); // consecutive first-try wins
  const skipNextRef = useRef(false);
  const sessionCountedRef = useRef(false);

  const distractors = useCallback(
    (streakNow: number, failedNow: boolean): number => {
      if (failedNow) return 2;
      if (streakNow >= 8) return 5;
      if (streakNow >= 4) return 4;
      return 3;
    },
    []
  );

  const generateOptions = useCallback(
    (current: T, count: number): T[] => {
      const pool = lessons.filter((l) => l.id !== current.id);
      return shuffle(pool).slice(0, count).concat([current]);
    },
    [lessons]
  );

  // Lazy initializer — avoids hydration mismatch and effect-driven setState
  const [options, setOptions] = useState<T[]>(() => generateOptions(lessons[level], 3));

  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = lessons[level] ?? lessons[0];
  const total = lessons.length;

  const currentRef = useRef(current);
  const sayTextRef = useRef(getSayText);

  // Keep the refs in sync *after* render (never during)
  useEffect(() => {
    currentRef.current = current;
    sayTextRef.current = getSayText;
  }, [current, getSayText]);

  const triggerSpeech = useCallback((msg: string) => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    setSpeech(msg);
    setShowSpeech(true);
    speechTimeout.current = setTimeout(() => setShowSpeech(false), 3000);
  }, []);

  const repeatInstruction = useCallback(() => {
    say(sayTextRef.current(currentRef.current), locale);
  }, [locale]);

  const startIdleTimer = useCallback(() => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => {
      setIsIdle(true);
      // The mascot gently repeats itself when nothing happens for 6s
      say(sayTextRef.current(currentRef.current), locale);
    }, 6000);
  }, [locale]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    startIdleTimer();
  }, [startIdleTimer]);

  // Instruction speech (bubble + voice) + idle tracking per level
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerSpeech(getInstruction(lessons[level]));
      say(sayTextRef.current(lessons[level]), locale);
    }, 600);

    // Remember progress for the "Continue" tile
    useJoyoStore.getState().setLastPlayed({ moduleId, level });
    // Count this session in the dashboard stats on first play
    if (!sessionCountedRef.current) {
      sessionCountedRef.current = true;
      useJoyoStore.getState().addSessionPlayed();
    }

    startIdleTimer();
    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("mousemove", resetIdleTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
    // recalc when level changes; getInstruction intentionally excluded (pure fn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, triggerSpeech, startIdleTimer, resetIdleTimer]);

  const handleMatch = useCallback(() => {
    if (isSuccess) return;
    setIsSuccess(true);
    setIsIdle(false);
    playSound("correct");
    vibrate("correct");

    const wonFirstTry = failuresRef.current === 0;
    const newStreak = wonFirstTry ? streak + 1 : 0;
    setStreak(newStreak);
    // Rare bonus for hot streaks: jump one extra step next (never past 2nd-to-last)
    skipNextRef.current = newStreak >= 8 && level + 1 < total - 1;

    // Award the star first, then sync the authoritative total
    addStar(moduleId);
    const state = useJoyoStore.getState();
    syncProgressToSupabase(state.stars, moduleId).catch(() => {});

    // Check achievements with the freshly-updated counters
    const check: BadgeCheckState = {
      stars: state.stars,
      completedModules: state.completedModules,
      moduleStars: state.moduleStars,
      badges: state.badges,
      sessionsPlayed: state.sessionsPlayed,
      starLog: state.starLog,
    };
    const fresh = newlyEarnedBadges(check);
    fresh.forEach((id) => {
      state.awardBadge(id);
      playSound("cheer");
      triggerSpeech(
        (tBadge as (key: string) => string)(id)
      );
    });

    if (level === total - 1) {
      markModuleComplete(moduleId).catch(() => {});
      completeModule(moduleId);
      setModuleCompleted(true);
    }
  }, [isSuccess, addStar, streak, level, total, moduleId, completeModule, tBadge, triggerSpeech]);

  const handleWrong = useCallback(() => {
    playSound("wrong");
    vibrate("wrong");
    setWrongShake(true);
    failuresRef.current += 1;
    // Scaffolded help: the hint opens itself after two misses
    if (failuresRef.current >= 2) setShowHint(true);

    if (wrongTimeout.current) clearTimeout(wrongTimeout.current);
    wrongTimeout.current = setTimeout(() => setWrongShake(false), 500);
  }, []);

  const handleNext = useCallback(() => {
    setIsSuccess(false);
    setModuleCompleted(false);
    setShowHint(false);
    failuresRef.current = 0;
    const next = skipNextRef.current ? level + 2 : level + 1;
    skipNextRef.current = false;
    if (next < total) {
      setLevel(next);
      setOptions(generateOptions(lessons[next], distractors(streak, false)));
    } else {
      router.push("/modules");
    }
  }, [level, total, lessons, generateOptions, distractors, streak, router]);

  const progressPct = (level / total) * 100;

  return {
    level,
    current,
    options,
    isSuccess,
    isIdle,
    showHint,
    openHint: () => setShowHint(true),
    closeHint: () => setShowHint(false),
    speech,
    showSpeech,
    triggerSpeech,
    sayInstruction: repeatInstruction,
    wrongShake,
    handleMatch,
    handleWrong,
    handleNext,
    progressPct: Math.round(progressPct),
    stars,
    moduleCompleted,
  };
}

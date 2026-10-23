// lib/haptics.ts
"use client";

import { useJoyoStore } from "@/store/useJoyoStore";

/**
 * Semantically-named vibration patterns — the pulse *feels* the outcome,
 * which helps pre-verbal toddlers distinguish success from failure.
 */
export type HapticName =
  | "pop"         // menu taps
  | "correct"     // right answer — short confirmation
  | "wrong"       // wrong answer — one longer, unmistakable pulse
  | "celebrate";  // level/module cleared — little burst

const HAPTIC_PATTERNS: Record<HapticName, number | number[]> = {
  pop: 20,
  correct: 30,
  wrong: 70,
  celebrate: [30, 60, 30],
};

/** Fire a named vibration pattern, respecting the user's haptics setting. */
export function vibrate(pattern: HapticName | number | number[] = "pop"): void {
  if (typeof window === "undefined") return;
  if (!useJoyoStore.getState().hapticsEnabled) return;
  const resolved: number | number[] =
    typeof pattern === "string" ? HAPTIC_PATTERNS[pattern] : pattern;
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(resolved);
  }
}

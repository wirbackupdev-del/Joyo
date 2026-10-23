// lib/lessons/letters.ts

import type { Avatar } from "@/store/useJoyoStore";

export interface LetterLesson {
  id: string;
  /** The character shown on screen */
  char: string;
  /** Spoken name of the letter (narration) */
  name: string;
  /** i18n key for the hint: e.g. "hintA" */
  hintKey: string;
  /** Token fill color */
  color: string;
  /** Animal character tied to this letter */
  animal: Avatar;
}

const PALETTE = [
  "#EF5350", // red
  "#5C9BF5", // blue
  "#F5C518", // yellow
  "#FF7043", // orange
  "#4CAF50", // green
  "#A86FBE", // purple
];

const ANIMALS: Avatar[] = ["koala", "fox", "bear", "dog", "rabbit"];

// Full Latin alphabet — hints live in i18n files as hintA → hintZ.
export const LETTERS_DATA: LetterLesson[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
  ""
).map((char, i) => ({
  id: `letter-${char.toLowerCase()}`,
  char,
  name: char,
  hintKey: `hint${char}`,
  color: PALETTE[i % PALETTE.length],
  animal: ANIMALS[i % ANIMALS.length],
}));

/**
 * Arabic curriculum: the Letters module teaches ا → ي in Arabic mode —
 * teaching Latin letters inside an Arabic interface would be nonsense
 * for a pre-reader. Spoken names use the traditional letter names
 * (أَلِف، بَا، تا…) with full vowelization so TTS is clear.
 */
export const ARABIC_LETTERS: LetterLesson[] = [
  ["ا", "أَلِف"],
  ["ب", "بَا"],
  ["ت", "تَا"],
  ["ث", "ثَا"],
  ["ج", "جِيم"],
  ["ح", "حَا"],
  ["خ", "خَا"],
  ["د", "دَال"],
  ["ذ", "ذَال"],
  ["ر", "رَا"],
  ["ز", "زَاي"],
  ["س", "سِين"],
  ["ش", "شِين"],
  ["ص", "صَاد"],
  ["ض", "ضَاد"],
  ["ط", "طَا"],
  ["ظ", "ظَا"],
  ["ع", "عَين"],
  ["غ", "غَين"],
  ["ف", "فَا"],
  ["ق", "قَاف"],
  ["ك", "كَاف"],
  ["ل", "لَام"],
  ["م", "مِيم"],
  ["ن", "نُون"],
  ["ه", "هَا"],
  ["و", "وَاو"],
  ["ي", "يَا"],
].map(([char, name], i) => ({
  id: `ar-letter-${i + 1}`,
  char,
  name,
  hintKey: `arHint${i + 1}`,
  color: PALETTE[i % PALETTE.length],
  animal: ANIMALS[i % ANIMALS.length],
}));

/** The correct curriculum for the active language. */
export function getLettersData(locale: string): LetterLesson[] {
  return locale === "ar" ? ARABIC_LETTERS : LETTERS_DATA;
}

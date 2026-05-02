// lib/lessons/letters.ts

export interface LetterLesson {
  id: string;
  char: string;
  /** i18n key for the hint: e.g. "hintA" */
  hintKey: string;
  /** Token fill color */
  color: string;
  /** Animal character tied to this letter */
  animal: "koala" | "fox" | "bear" | "dog" | "rabbit";
}

export const LETTERS_DATA: LetterLesson[] =[
  {
    id: "letter-a",
    char: "A",
    hintKey: "hintA",
    color: "#EF5350", // Red (Apple)
    animal: "koala",
  },
  {
    id: "letter-b",
    char: "B",
    hintKey: "hintB",
    color: "#5C9BF5", // Blue (Ball)
    animal: "bear",
  },
  {
    id: "letter-c",
    char: "C",
    hintKey: "hintC",
    color: "#F5C518", // Yellow (Cat)
    animal: "fox",
  },
  {
    id: "letter-d",
    char: "D",
    hintKey: "hintD",
    color: "#FF7043", // Orange (Dog)
    animal: "dog",
  },
  {
    id: "letter-e",
    char: "E",
    hintKey: "hintE",
    color: "#4CAF50", // Green (Egg)
    animal: "rabbit",
  },
];
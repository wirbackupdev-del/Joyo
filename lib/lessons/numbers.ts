// lib/lessons/numbers.ts

export interface NumberLesson {
  id: string;
  char: string;
  value: number;
  /** i18n key for the hint: e.g. "hint1" */
  hintKey: string;
  /** Token fill color */
  color: string;
  /** Animal character tied to this number */
  animal: "koala" | "fox" | "bear" | "dog" | "rabbit";
}

export const NUMBERS_DATA: NumberLesson[] =[
  {
    id: "num-1",
    char: "1",
    value: 1,
    hintKey: "hint1",
    color: "#5C9BF5", // Blue
    animal: "koala",
  },
  {
    id: "num-2",
    char: "2",
    value: 2,
    hintKey: "hint2",
    color: "#FF7043", // Orange
    animal: "fox",
  },
  {
    id: "num-3",
    char: "3",
    value: 3,
    hintKey: "hint3",
    color: "#4CAF50", // Green
    animal: "bear", // Using bear for 3
  },
  {
    id: "num-4",
    char: "4",
    value: 4,
    hintKey: "hint4",
    color: "#A86FBE", // Purple
    animal: "dog",
  },
  {
    id: "num-5",
    char: "5",
    value: 5,
    hintKey: "hint5",
    color: "#EF5350", // Red
    animal: "rabbit",
  },
];
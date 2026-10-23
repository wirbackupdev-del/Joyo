// lib/lessons/colors.ts

import type { Avatar } from "@/store/useJoyoStore";

export interface ColorLesson {
  id: string;
  /** i18n key for the color name: e.g. "red" */
  nameKey: string;
  /** i18n key for the hint: e.g. "hintRed" */
  hintKey: string;
  /** The hex code of the color */
  hex: string;
  /** Animal character tied to this color lesson */
  animal: Avatar;
}

export const COLORS_DATA: ColorLesson[] = [
  {
    id: "color-red",
    nameKey: "red",
    hintKey: "hintRed",
    hex: "#EF5350",
    animal: "fox",
  },
  {
    id: "color-blue",
    nameKey: "blue",
    hintKey: "hintBlue",
    hex: "#5C9BF5",
    animal: "koala",
  },
  {
    id: "color-yellow",
    nameKey: "yellow",
    hintKey: "hintYellow",
    hex: "#F5C518",
    animal: "dog",
  },
  {
    id: "color-green",
    nameKey: "green",
    hintKey: "hintGreen",
    hex: "#4CAF50",
    animal: "rabbit",
  },
  {
    id: "color-purple",
    nameKey: "purple",
    hintKey: "hintPurple",
    hex: "#A86FBE",
    animal: "bear",
  },
];

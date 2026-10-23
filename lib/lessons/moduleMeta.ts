// lib/lessons/moduleMeta.ts
// One source of truth for the four modules' wrapping metadata: routing,
// display color and lesson-count — used by the Continue tile, dashboard
// and progress screens.

export type ModuleId = "shapes" | "letters" | "numbers" | "colors";

export const MODULE_META: Record<ModuleId, {
  href: string;
  titleKey: string;
  color: string;
  shadow: string;
  /** Lesson count for the Latin track (Arabic has 28 letters). */
  total: number;
}> = {
  shapes: {
    href: "/play/shapes",
    titleKey: "shapes",
    color: "#4CAF50",
    shadow: "rgba(56,142,60,1)",
    total: 5,
  },
  letters: {
    href: "/play/letters",
    titleKey: "letters",
    color: "#F5C518",
    shadow: "rgba(212,168,0,1)",
    total: 26,
  },
  numbers: {
    href: "/play/numbers",
    titleKey: "numbers",
    color: "#5C9BF5",
    shadow: "rgba(33,105,243,1)",
    total: 5,
  },
  colors: {
    href: "/play/colors",
    titleKey: "colors",
    color: "#A86FBE",
    shadow: "rgba(123,31,162,1)",
    total: 5,
  },
};

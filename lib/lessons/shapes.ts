// lib/lessons/shapes.ts

import type { Avatar } from "@/store/useJoyoStore";

export interface Shape {
  id: string;
  /** i18n key inside Shapes namespace: e.g. "circle" → t("circle") */
  nameKey: string;
  /** i18n key for the hint: e.g. "hintCircle" */
  hintKey: string;
  /** Full SVG path data — renders in a 100×100 viewBox */
  svgPath: string;
  /** Token fill color */
  color: string;
  /** Animal character tied to this shape */
  animal: Avatar;
}

export const SHAPES_DATA: Shape[] = [
  {
    id: "circle",
    nameKey: "circle",
    hintKey: "hintCircle",
    svgPath: "M50,50 m-38,0 a38,38 0 1,0 76,0 a38,38 0 1,0 -76,0",
    color: "#5C9BF5",
    animal: "koala",
  },
  {
    id: "triangle",
    nameKey: "triangle",
    hintKey: "hintTriangle",
    svgPath: "M50,10 L90,88 L10,88 Z",
    color: "#FF7043",
    animal: "fox",
  },
  {
    id: "square",
    nameKey: "square",
    hintKey: "hintSquare",
    svgPath: "M14,14 H86 V86 H14 Z",
    color: "#A86FBE",
    animal: "bear",
  },
  {
    id: "star",
    nameKey: "star",
    hintKey: "hintStar",
    svgPath:
      "M50,6 L61,35 L92,35 L68,54 L77,85 L50,67 L23,85 L32,54 L8,35 L39,35 Z",
    color: "#F5C518",
    animal: "dog",
  },
  {
    id: "heart",
    nameKey: "heart",
    hintKey: "hintHeart",
    svgPath:
      "M50,80 C50,80 12,55 12,32 C12,18 22,10 35,14 C42,17 50,26 50,26 C50,26 58,17 65,14 C78,10 88,18 88,32 C88,55 50,80 50,80Z",
    color: "#EF5350",
    animal: "rabbit",
  },
];

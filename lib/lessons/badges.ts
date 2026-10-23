// lib/lessons/badges.ts

export interface BadgeDef {
  id: string;
  /** i18n key in Badge namespace */
  nameKey: string;
  color: string;
  shadow: string;
  /** How the unlocked state is decided */
  check: (s: BadgeCheckState) => boolean;
}

export interface BadgeCheckState {
  stars: number;
  completedModules: string[];
  moduleStars: Record<string, number>;
  badges: string[];
  sessionsPlayed: number;
  /** Stars earned per day (YYYY-MM-DD → count) */
  starLog: Record<string, number>;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-star",
    nameKey: "firstStar",
    color: "#FF7043",
    shadow: "rgba(216,67,21,1)",
    check: (s) => s.stars >= 1,
  },
  {
    id: "letters",
    nameKey: "letters",
    color: "#F5C518",
    shadow: "rgba(212,168,0,1)",
    check: (s) => s.completedModules.includes("letters"),
  },
  {
    id: "shapes",
    nameKey: "shapes",
    color: "#4CAF50",
    shadow: "rgba(56,142,60,1)",
    check: (s) => s.completedModules.includes("shapes"),
  },
  {
    id: "numbers",
    nameKey: "numbers",
    color: "#5C9BF5",
    shadow: "rgba(33,105,243,1)",
    check: (s) => s.completedModules.includes("numbers"),
  },
  {
    id: "colors",
    nameKey: "colors",
    color: "#A86FBE",
    shadow: "rgba(123,31,162,1)",
    check: (s) => s.completedModules.includes("colors"),
  },
  {
    id: "stars-25",
    nameKey: "stars25",
    color: "#EF5350",
    shadow: "rgba(198,40,40,1)",
    check: (s) => s.stars >= 25,
  },
  {
    id: "stars-100",
    nameKey: "stars100",
    color: "#5C9BF5",
    shadow: "rgba(21,101,192,1)",
    check: (s) => s.stars >= 100,
  },
  {
    id: "three-days",
    nameKey: "threeDays",
    color: "#00897B",
    shadow: "rgba(0,105,92,1)",
    check: (s) => Object.values(s.starLog).filter((n) => n > 0).length >= 3,
  },
];

/** Evaluates every badge and returns the ids the profile has earned. */
export function earnedBadgeIds(s: BadgeCheckState): string[] {
  return BADGES.filter((b) => b.check(s)).map((b) => b.id);
}

/**
 * Award any badge whose condition just became true; returns the ids that
 * were newly awarded (empty on no-op).
 */
export function newlyEarnedBadges(
  state: BadgeCheckState
): string[] {
  const earned = earnedBadgeIds(state);
  return earned.filter((id) => !state.badges.includes(id));
}

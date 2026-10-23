// store/useJoyoStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Avatar = "koala" | "fox" | "bear" | "dog" | "rabbit";

export interface JoyoSettings {
  /** Sound effects (correct/wrong/pop/cheer) */
  sfxEnabled: boolean;
  /** Ambient background music loop */
  musicEnabled: boolean;
  /** Master volume for all audio, 0..1 */
  masterVolume: number;
  /** Narration volume (spoken instructions), 0..1 */
  voiceVolume: number;
  /** Vibration on game feedback & mascot taps */
  hapticsEnabled: boolean;
  /** Daily play cap in minutes (0 = unlimited) — triggers the calm-down screen */
  sessionCapMinutes: number;
}

export interface LastPlayed {
  moduleId: string;
  /** Zero-based level index the child can resume from */
  level: number;
}

interface JoyoState extends JoyoSettings {
  // Child profile
  childName: string;
  avatar: Avatar;

  // Progress
  stars: number;
  completedModules: string[];
  /** Stars collected per module — powers the dashboard breakdown */
  moduleStars: Record<string, number>;
  /** Achievement badges earned (ids from lib/lessons/badges.ts) */
  badges: string[];
  /** Stars earned per day (YYYY-MM-DD → count), last ~30 days kept */
  starLog: Record<string, number>;
  /** Total completed game sessions (opened + played at least one level) */
  sessionsPlayed: number;
  /** Where the child left off — powers the "Continue" tile */
  lastPlayed: LastPlayed | null;

  // Daily session tracking (calm-down screen)
  sessionSecondsToday: number;
  sessionDay: string;

  // Actions
  setProfile: (name: string, avatar: Avatar) => void;
  /** Award a star for a module (updates global + per-module + daily log). */
  addStar: (moduleId?: string) => void;
  completeModule: (moduleId: string) => void;
  awardBadge: (badgeId: string) => void;
  setLastPlayed: (entry: LastPlayed) => void;
  addSessionPlayed: () => void;
  /** Advance the daily play-clock by one second (day-rollover safe). */
  tickSession: (seconds: number) => void;
  resetProgress: () => void;
  /** Delete every trace of the child from this device (COPPA). */
  deleteAllData: () => void;
  updateSettings: (settings: Partial<JoyoSettings>) => void;
}

export const DEFAULT_SETTINGS: JoyoSettings = {
  sfxEnabled: true,
  musicEnabled: true,
  masterVolume: 0.7,
  voiceVolume: 0.9,
  hapticsEnabled: true,
  sessionCapMinutes: 20,
};

/** Today's date key, e.g. "2026-10-23" (local time). */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// Keep the starLog bounded — old days are dropped on write
function trimLog(log: Record<string, number>): Record<string, number> {
  const keys = Object.keys(log).sort();
  if (keys.length <= 30) return log;
  return Object.fromEntries(keys.slice(-30).map((k) => [k, log[k]]));
}

const cleanState = {
  childName: "",
  avatar: "koala" as Avatar,
  stars: 0,
  completedModules: [] as string[],
  moduleStars: {} as Record<string, number>,
  badges: [] as string[],
  starLog: {} as Record<string, number>,
  sessionsPlayed: 0,
  lastPlayed: null as LastPlayed | null,
  sessionSecondsToday: 0,
  sessionDay: "",
};

/** Wipes progress/profile but preserves the parent's settings. */
function keepSettings(state: JoyoState): Partial<JoyoSettings> {
  return {
    sfxEnabled: state.sfxEnabled,
    musicEnabled: state.musicEnabled,
    masterVolume: state.masterVolume,
    voiceVolume: state.voiceVolume,
    hapticsEnabled: state.hapticsEnabled,
    sessionCapMinutes: state.sessionCapMinutes,
  };
}

export const useJoyoStore = create<JoyoState>()(
  persist(
    (set) => ({
      ...cleanState,
      ...DEFAULT_SETTINGS,

      setProfile: (name, avatar) =>
        set({ childName: name.trim(), avatar }),

      addStar: (moduleId) =>
        set((state) => {
          const key = todayKey();
          const log = trimLog({
            ...state.starLog,
            [key]: (state.starLog[key] ?? 0) + 1,
          });
          return {
            stars: state.stars + 1,
            starLog: log,
            moduleStars: moduleId
              ? {
                  ...state.moduleStars,
                  [moduleId]: (state.moduleStars[moduleId] ?? 0) + 1,
                }
              : state.moduleStars,
          };
        }),

      completeModule: (moduleId) =>
        set((state) => ({
          completedModules: state.completedModules.includes(moduleId)
            ? state.completedModules
            : [...state.completedModules, moduleId],
        })),

      awardBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId],
        })),

      setLastPlayed: (entry) => set({ lastPlayed: entry }),

      addSessionPlayed: () =>
        set((state) => ({ sessionsPlayed: state.sessionsPlayed + 1 })),

      tickSession: (seconds) =>
        set((state) => {
          const key = todayKey();
          if (state.sessionDay !== key) {
            return { sessionDay: key, sessionSecondsToday: seconds };
          }
          return {
            sessionDay: key,
            sessionSecondsToday: state.sessionSecondsToday + seconds,
          };
        }),

      resetProgress: () =>
        set((state) => ({
          ...cleanState,
          ...keepSettings(state),
        })),

      deleteAllData: () =>
        set((state) => ({
          ...cleanState,
          ...keepSettings(state),
        })),

      updateSettings: (settings) => set(settings),
    }),
    {
      name: "joyo-storage",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      // Don't persist the session clock — it is app-lifetime state
      partialize: (state) => {
        const rest = { ...state, sessionSecondsToday: 0, sessionDay: "" };
        // The clock values still travel but always reset to zero on load
        return rest as JoyoState;
      },
      // Migrate older profiles (< v3) to the current defaults
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted as Partial<JoyoState> | undefined) ?? {};
        if (version < 3) {
          return {
            ...cleanState,
            ...DEFAULT_SETTINGS,
            ...(state.childName !== undefined ? { childName: state.childName } : {}),
            ...(state.avatar ? { avatar: state.avatar } : {}),
            stars: state.stars ?? 0,
            completedModules: state.completedModules ?? [],
          };
        }
        return state;
      },
    }
  )
);

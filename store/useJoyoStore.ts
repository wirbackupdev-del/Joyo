// store/useJoyoStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface JoyoState {
  // Child profile
  childName: string;
  avatar: "koala" | "fox" | "bear" | "dog" | "rabbit";

  // Progress
  stars: number;
  completedModules: string[];

  // Actions
  setProfile: (name: string, avatar: JoyoState["avatar"]) => void;
  addStar: () => void;
  completeModule: (moduleId: string) => void;
  resetProgress: () => void;
}

export const useJoyoStore = create<JoyoState>()(
  persist(
    (set) => ({
      childName: "",
      avatar: "koala",
      stars: 0,
      completedModules: [],

      setProfile: (name, avatar) => set({ childName: name, avatar }),

      addStar: () => set((state) => ({ stars: state.stars + 1 })),

      completeModule: (moduleId) =>
        set((state) => ({
          completedModules: state.completedModules.includes(moduleId)
            ? state.completedModules
            : [...state.completedModules, moduleId],
        })),

      resetProgress: () => set({ stars: 0, completedModules: [] }),
    }),
    {
      name: "joyo-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

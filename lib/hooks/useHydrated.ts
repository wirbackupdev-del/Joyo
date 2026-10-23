// lib/hooks/useHydrated.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the component has mounted on the client.
 * Zustand's persisted store is rehydrated asynchronously — reading it during
 * SSR (or the very first client render) produces hydration mismatches.
 * Render a neutral loading tile until this flips.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot mount flag
    setHydrated(true);
  }, []);
  return hydrated;
}

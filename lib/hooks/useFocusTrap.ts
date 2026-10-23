// lib/hooks/useFocusTrap.ts
"use client";

import { useEffect, useRef } from "react";

/**
 * Traps Tab focus inside a dialog while it is open (accessibility for
 * keyboard/AT users) and restores focus to the trigger on close.
 * Attach the returned ref to the dialog's outermost container.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusables = (): HTMLElement[] =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((n) => !n.hasAttribute("disabled"));

    // Move focus into the dialog (async so the AnimatePresence mount settles)
    const focusTimer = window.setTimeout(() => {
      const first = getFocusables()[0];
      (first ?? el).focus();
    }, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = getFocusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    el.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      el.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [active]);

  return ref;
}

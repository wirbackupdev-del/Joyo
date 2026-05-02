// i18n/routing.ts
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr", "ar"] as const,
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];

// Typed navigation helpers — use these instead of next/navigation throughout the app
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

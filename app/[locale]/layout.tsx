// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Nunito, Fredoka, Baloo_2, Cairo } from "next/font/google";
import { routing, Locale } from "@/i18n/routing";
import "../globals.css";

// ── FONTS ────────────────────────────────────────────
// Nunito   → body text (rounded, friendly, highly readable for kids)
// Fredoka  → UI headings & game visuals (chunky, playful)
// Baloo 2  → the "Joyo" wordmark only (bouncy, brand DNA)
// Cairo    → Arabic typography (body + headings when dir = rtl)
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-joyo",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

// ── VIEWPORT (Fixes the Warnings) ─────────────────────
// Next.js 15/16 requires this separate export for theme and scaling
export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: "#4CAF50",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // Add interactiveWidget if needed (prevents keyboard from squishing UI)
    interactiveWidget: "resizes-visual",
  };
}

// ── METADATA ─────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    applicationName: "Joyo",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Joyo",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Joyo",
      type: "website",
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ── LAYOUT ───────────────────────────────────────────
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${nunito.variable} ${fredoka.variable} ${baloo.variable} ${cairo.variable}`}
      // Important for PWA: stop pull-to-refresh and elastic bounce on mobile
      style={{ overscrollBehavior: 'none' }}
    >
      <body className="min-h-screen overflow-x-hidden bg-brand-cream antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
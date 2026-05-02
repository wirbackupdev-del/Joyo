// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next"; // Added Viewport type
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Nunito, Fredoka } from "next/font/google";
import { routing, Locale } from "@/i18n/routing";
import "../globals.css";

// ── FONTS ────────────────────────────────────────────
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
    manifest: "/manifest.json",
    // ✅ themeColor and viewport removed from here
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Joyo",
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
      className={`${nunito.variable} ${fredoka.variable}`}
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
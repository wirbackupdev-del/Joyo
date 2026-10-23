# Joyo 🌿 — Learning feels like play

A playful, installable PWA for children ages 2–6. Letters, shapes, numbers and
colors come alive through adorable animal friends — with a full parent zone
(math-gated), achievement badges, spoken instructions, a daily play-time
limit, and complete **English / Français / العربية** support including RTL.

Built with **Next.js (App Router) · React 19 · Tailwind CSS v4 · next-intl ·
Zustand · Framer Motion · Howler · Supabase**.

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

| Command           | What it does                                               |
| ----------------- | ---------------------------------------------------------- |
| `pnpm dev`        | Dev server (PWA disabled in development)                   |
| `pnpm build`      | Production build                                           |
| `pnpm lint`       | ESLint                                                     |
| `pnpm typecheck`  | `tsc --noEmit`                                             |
| `pnpm gen:sounds` | Regenerate `public/sounds/*.wav` (4 SFX + 3 music loops)   |
| `pnpm gen:icons`  | Regenerate `public/icons/*.png` PWA icons (pure Node)      |

## Project Structure

```
app/[locale]/          # en | fr | ar — routed by next-intl middleware (proxy.ts)
  page.tsx             # Splash (wordmark reveal, first-run language chips)
  onboarding/          # Name + avatar + celebration slides (back navigation)
  home/                # Child hub (named greeting, Continue tile, mascot)
  modules/             # Game picker grid
  play/{letters,shapes,numbers,colors}   # The 4 lesson games
  progress/            # Trophy room (8-badge cabinet, locked/earned states)
  parent/              # Math-gate (session memory) → dashboard → settings
  error.tsx            # Child-proof runtime error page (mascot + retry)
components/
  game/                # AnimalCharacter, DragToken, ColorToken, DogWithLetter,
                       # Confetti (motion-safe), StarCounter, SessionWatcher
  modals/              # CelebrationModal (diploma variant), HintModal — both
                       # with role=dialog, Escape handling and focus traps
lib/
  lessons/             # Curriculum data: Latin A–Z + Arabic ا–ي tracks per
                       # locale, shapes/numbers/colors, badge catalog, module meta
  hooks/               # useLessonGame (adaptive game loop), useHydrated, useFocusTrap
  sounds.ts            # Layered engine: Howler .wav → Web Audio synth fallback,
                       # rotating music loops, voice narration (speech synthesis),
                       # gesture unlock; settings-aware
  haptics.ts           # Semantic vibration patterns (pop/correct/wrong/celebrate)
  progress.ts          # Non-blocking Supabase sync (COPPA-safe: parent-auth only)
store/useJoyoStore.ts  # Persisted store v3: profile, stars, per-module stars,
                       # starLog (dashboard charts), badges, lastPlayed, settings
messages/{en,fr,ar}.json
supabase/              # SQL migration (profiles + RLS) & config
scripts/               # Asset generators (sounds zero-dep, icons pure-node PNG)
```

## Game Design Highlights

- **Everything is spoken.** Every instruction is narrated in the UI language
  (ar-SA / fr-FR / en-US voices), with a replay button in every game —
  pre-readers never need to read.
- **Adaptive difficulty.** Repeated misses shrink the answer set and open the
  hint automatically; hot streaks grow it and can jump a level ahead.
- **Right letters for the right child.** The Letters module teaches ا→ي in
  Arabic mode instead of A→Z.
- **Gentle time limits.** Parents set a daily cap; when reached, the app
  shows a sleeping-scene calm-down screen. Only the parent zone opens it.
- **Resumable.** The home Continue tile drops the child exactly where they
  left off.
- **Badges.** 8 achevements (first star, module masters, star milestones,
  3-day streak) with locked/earned cabinet in the trophy room.
- **Module graduation.** Finishing a module (all A–Z included) triggers a
  diploma celebration with the child's name and graduation cap.

## Audio

The engine plays real `.wav` assets from `public/sounds/` and falls back to
synthesized Web Audio tones if a file is missing — gameplay is never silent.
Audio is unlocked on the first user gesture (explicitly on Play/finish taps),
and everything respects the settings chosen in the parent zone:

- Background music — **three rotating lullaby loops** cross-fade every ~90 s
- Sound effects
- Master volume and a separate **narration volume** for spoken instructions
- Semantic vibration patterns

Replace the generated assets with professionally produced audio for release;
the engine stays the same.

## Internationalization

- Routing/middleware: `proxy.ts` + `i18n/routing.ts` (`en` default)
- First-run language chips on the splash; switcher in parent settings
- All user-facing strings live in `messages/{en,fr,ar}.json`
- Arabic renders RTL (`dir="rtl"` on `<html>`) with the **Cairo** font
- Latin UI uses **Nunito** (body) + **Fredoka** (headings) + **Baloo 2** (wordmark)

## Privacy

COPPA-aligned: no child accounts, no child-facing analytics. Progress lives
on device; a parent can review everything stored, and delete it permanently,
from **Settings → Data & Privacy**. If a parent signs in, progress syncs to
their own Supabase row with row-level security.

## Deploy

Vercel-ready (`next.config.ts` wires next-intl + next-pwa). iOS install steps
are documented inside parent settings; Android browsers get the native install
prompt.

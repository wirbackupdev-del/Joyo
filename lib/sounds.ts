// lib/sounds.ts
"use client";

/**
 * Joyo Sound Engine
 * ─────────────────
 * Strategy:
 *   1. Try to load real .mp3 files from /sounds/ via Howler.
 *   2. If Howler isn't available (SSR) or file 404s, fall back to
 *      synthesized Web Audio API tones — so the game always has audio
 *      even without the actual sound files in place.
 *
 * Sound file checklist (place in /public/sounds/):
 *   correct.mp3  — cheerful ascending chime
 *   wrong.mp3    — gentle low tone (not scary)
 *   pop.mp3      — satisfying soft pop
 *   cheer.mp3    — short confetti fanfare
 */

// ── WEB AUDIO FALLBACK ───────────────────────────────
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    return _audioCtx;
  } catch {
    return null;
  }
}

function synthTone(
  freqs: number[],
  gapMs = 110,
  vol = 0.18,
  type: OscillatorType = "sine"
) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  freqs.forEach((freq, i) => {
    try {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * (gapMs / 1000);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch {/* ignore */}
  });
}

// Synth presets matching the HTML prototype's exact feel
const SYNTH_PRESETS: Record<string, () => void> = {
  correct: () => synthTone([523, 659, 784], 110, 0.18),
  wrong:   () => synthTone([330, 294], 180, 0.14),
  pop:     () => synthTone([600, 750], 60, 0.12, "triangle"),
  cheer:   () => synthTone([523, 659, 784, 1047], 90, 0.18),
};

// ── HOWLER LAYER ─────────────────────────────────────
type SoundName = "correct" | "wrong" | "pop" | "cheer";

let howlerReady = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const howlMap: Record<string, any> = {};

async function initHowler(): Promise<void> {
  if (howlerReady || typeof window === "undefined") return;
  try {
    const { Howl } = await import("howler");
    const SOUND_NAMES: SoundName[] = ["correct", "wrong", "pop", "cheer"];
    SOUND_NAMES.forEach((name) => {
      howlMap[name] = new Howl({
        src: [`/sounds/${name}.mp3`],
        volume: name === "cheer" ? 0.7 : name === "correct" ? 0.6 : 0.5,
        preload: true,
        onloaderror: () => {
          // File missing → will fall back to synth
          howlMap[name] = null;
        },
      });
    });
    howlerReady = true;
  } catch {
    // Howler import failed → synth only
  }
}

// Kick off Howler init on first user gesture
if (typeof window !== "undefined") {
  const init = () => {
    initHowler();
    window.removeEventListener("touchstart", init);
    window.removeEventListener("mousedown", init);
  };
  window.addEventListener("touchstart", init, { once: true });
  window.addEventListener("mousedown",  init, { once: true });
}

// ── PUBLIC API ───────────────────────────────────────
export function playSound(name: SoundName): void {
  // Try Howler first
  if (howlerReady && howlMap[name]) {
    try {
      howlMap[name].play();
      return;
    } catch {/* fall through */}
  }
  // Fallback: synth
  SYNTH_PRESETS[name]?.();
}

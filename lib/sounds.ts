// lib/sounds.ts
"use client";

/**
 * Joyo Sound Engine
 * ─────────────────
 * Layered strategy for resilient audio:
 *   1. Load the real .wav files from /public/sounds/ via Howler
 *      (lazy — after the first user gesture, per browser autoplay policies).
 *   2. If Howler or a file is unavailable, fall back to synthesized
 *      Web Audio tones so gameplay is never silent.
 *   3. Spoken instructions use the browser's speech synthesis
 *      (a separate "voice" channel with its own volume).
 *
 * Music rotates through several generated lullaby loops so a single
 * track never wears on parents' ears during longer sessions.
 *
 * Everything respects the persisted settings in useJoyoStore:
 *   sfxEnabled, musicEnabled, masterVolume, voiceVolume.
 */

import type { Howl } from "howler";
import { useJoyoStore } from "@/store/useJoyoStore";

// ── SETTINGS HELPERS ─────────────────────────────────
const settings = () => useJoyoStore.getState();
const masterVol = () => Math.min(1, Math.max(0, settings().masterVolume));
const voiceVol = () => masterVol() * Math.min(1, Math.max(0, settings().voiceVolume));
const MUSIC_BASE = 0.28;

// ── WEB AUDIO FALLBACK ───────────────────────────────
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
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
      const osc = ctx.createOscillator();
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
    } catch {
      /* ignore */
    }
  });
}

// Synth presets — mirror the feel of the .wav files
const SYNTH_PRESETS: Record<SfxName, () => void> = {
  correct: () => synthTone([523, 659, 784], 110, 0.18),
  wrong: () => synthTone([330, 294], 180, 0.14),
  pop: () => synthTone([600, 750], 60, 0.12, "triangle"),
  cheer: () => synthTone([523, 659, 784, 1047], 90, 0.18),
};

// ── HOWLER LAYER ─────────────────────────────────────
export type SfxName = "correct" | "wrong" | "pop" | "cheer";

type HowlVolume = { base: number };

const howlMap: Partial<Record<SfxName, Howl & HowlVolume>> = {};
let sfxReady = false;

const SFX_VOLUMES: Record<SfxName, number> = {
  cheer: 0.7,
  correct: 0.6,
  wrong: 0.5,
  pop: 0.5,
};

const SFX_FILES: SfxName[] = ["correct", "wrong", "pop", "cheer"];

async function initSfx(): Promise<void> {
  if (sfxReady || typeof window === "undefined") return;
  sfxReady = true; // regardless of success — don't retry forever
  try {
    const { Howl: HowlCtor } = await import("howler");
    SFX_FILES.forEach((name) => {
      try {
        howlMap[name] = Object.assign(
          new HowlCtor({
            src: [`/sounds/${name}.wav`],
            volume: SFX_VOLUMES[name],
            preload: true,
            onloaderror: () => delete howlMap[name],
          }),
          { base: SFX_VOLUMES[name] }
        );
      } catch {
        /* leave absent — synth fallback covers it */
      }
    });
  } catch {
    /* Howler unavailable — synth only */
  }
}

// ── MUSIC LAYER (rotating lullaby tracks) ────────────
const MUSIC_TRACKS = ["/sounds/music.wav", "/sounds/music2.wav", "/sounds/music3.wav"];
const MUSIC_ROTATE_MS = 90_000; // ~90s per loop before cross-fading
const MUSIC_FADE_MS = 1200;

const musicHowls: ((Howl & HowlVolume) | "unavailable")[] = [];
let musicIndex = 0;
let musicWanted = false; // did a child-zone page ask for music?
let musicUnlocked = false; // have we had a user gesture yet?
let rotateTimer: ReturnType<typeof setInterval> | null = null;

async function ensureMusicTrack(index: number): Promise<Howl & HowlVolume | null> {
  if (typeof window === "undefined") return null;
  if (musicHowls[index] === "unavailable") return null;
  if (musicHowls[index]) return musicHowls[index] as Howl & HowlVolume;
  try {
    const { Howl: HowlCtor } = await import("howler");
    const howl = Object.assign(
      new HowlCtor({
        src: [MUSIC_TRACKS[index]],
        loop: true,
        volume: 0,
        html5: true, // stream the larger wav instead of buffering it fully
        onloaderror: () => {
          musicHowls[index] = "unavailable"; // no asset — try the next track
        },
      }),
      { base: MUSIC_BASE }
    );
    musicHowls[index] = howl;
    return howl;
  } catch {
    musicHowls[index] = "unavailable";
    return null;
  }
}

function currentMusicVolume(): number {
  return Math.min(1, Math.max(0, MUSIC_BASE * masterVol()));
}

/** Cross-fade whatever is playing into the next available track. */
function rotateMusic(): void {
  const playing = musicHowls[musicIndex];
  if (!playing || playing === "unavailable" || !playing.playing()) return;
  void (async () => {
    const from = playing as Howl & HowlVolume;
    // Find the next track that actually loads
    for (let step = 1; step <= MUSIC_TRACKS.length; step++) {
      const nextIdx = (musicIndex + step) % MUSIC_TRACKS.length;
      const to = await ensureMusicTrack(nextIdx);
      if (!to) continue;
      from.fade(currentMusicVolume(), 0, MUSIC_FADE_MS);
      window.setTimeout(() => from.stop(), MUSIC_FADE_MS + 50);
      window.setTimeout(() => {
        musicIndex = nextIdx;
        to.volume(0);
        if (musicWanted && settings().musicEnabled) {
          to.play();
          to.fade(0, currentMusicVolume(), MUSIC_FADE_MS);
        }
      }, MUSIC_FADE_MS + 80);
      return;
    }
  })();
}

function startRotateTimer(): void {
  if (rotateTimer) return;
  rotateTimer = setInterval(() => {
    if (musicWanted && settings().musicEnabled) rotateMusic();
  }, MUSIC_ROTATE_MS);
}

function stopRotateTimer(): void {
  if (rotateTimer) {
    clearInterval(rotateTimer);
    rotateTimer = null;
  }
}

/** Start the ambient loop (child zones call this on mount). */
export function startMusic(): void {
  musicWanted = true;
  if (!settings().musicEnabled) return;
  if (!musicUnlocked) return; // auto-starts on the first gesture
  void (async () => {
    let target = await ensureMusicTrack(musicIndex);
    if (!target) {
      for (let step = 1; step <= MUSIC_TRACKS.length; step++) {
        const idx = (musicIndex + step) % MUSIC_TRACKS.length;
        const alt = await ensureMusicTrack(idx);
        if (alt) {
          musicIndex = idx;
          target = alt;
          break;
        }
      }
    }
    if (target && !target.playing()) {
      target.volume(currentMusicVolume());
      target.play();
      startRotateTimer();
    }
  })();
}

/** Stop the ambient loop (parent zones call this on mount). */
export function stopMusic(): void {
  musicWanted = false;
  stopRotateTimer();
  const current = musicHowls[musicIndex];
  if (current && current !== "unavailable" && current.playing()) current.stop();
}

/** Re-apply volume + on/off immediately after a settings change. */
export function syncAudioSettings(): void {
  const s = settings();
  const vol = masterVol();
  Object.values(howlMap).forEach((h) => {
    if (h && "base" in h) h.volume(h.base * vol);
  });
  musicHowls.forEach((m) => {
    if (m && m !== "unavailable") m.volume(m.base * vol);
  });
  if (!s.musicEnabled || s.masterVolume <= 0) {
    stopMusic();
  } else if (musicWanted && musicUnlocked) {
    if (!musicHowls[musicIndex] || musicHowls[musicIndex] === "unavailable") {
      startMusic();
    } else {
      const current = musicHowls[musicIndex] as Howl & HowlVolume;
      current.volume(currentMusicVolume());
      if (!current.playing()) current.play();
      startRotateTimer();
    }
  }
}

// ── PUBLIC SFX API ───────────────────────────────────
export function playSound(name: SfxName): void {
  if (!settings().sfxEnabled) return;
  const vol = masterVol();
  if (vol <= 0) return;

  const howl = howlMap[name];
  if (howl) {
    try {
      howl.volume(howl.base * vol);
      howl.play();
      return;
    } catch {
      /* fall through to synth */
    }
  }
  SYNTH_PRESETS[name]?.();
}

// ── VOICE CHANNEL (narration via speech synthesis) ────
export type SayLocale = "en" | "fr" | "ar";

interface VoiceQueueItem {
  text: string;
  locale: SayLocale;
}

let voiceQueue: VoiceQueueItem[] = [];
let voiceBusy = false;

function speakNext(): void {
  if (voiceBusy) return;
  const item = voiceQueue.shift();
  if (!item) return;

  const vol = voiceVol();
  if (vol <= 0 || typeof speechSynthesis === "undefined") {
    voiceBusy = false;
    speakNext();
    return;
  }

  const utter = new SpeechSynthesisUtterance(item.text);
  utter.lang = item.locale === "ar" ? "ar-SA" : item.locale === "fr" ? "fr-FR" : "en-US";
  utter.rate = 0.95; // calm, child-friendly pace
  utter.pitch = 1.15;
  utter.volume = Math.min(1, vol);
  voiceBusy = true;
  utter.onend = () => {
    voiceBusy = false;
    if (voiceQueue.length > 0) speakNext();
  };
  utter.onerror = () => {
    voiceBusy = false;
    if (voiceQueue.length > 0) speakNext();
  };
  speechSynthesis.speak(utter);
}

/**
 * Speak a line of narration (pre-readers can't read instructions).
 * Cancels anything queued and speaks immediately.
 */
export function say(text: string, locale: SayLocale = "en"): void {
  if (voiceVol() <= 0 || typeof window === "undefined") return;
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  voiceQueue = [{ text, locale }];
  voiceBusy = false;
  speakNext();
}

/** Chain lines: efficiency — each line plays when the previous one ends. */
export function saySequence(lines: VoiceQueueItem[]): void {
  if (voiceVol() <= 0 || typeof window === "undefined") return;
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  voiceQueue = [...lines];
  voiceBusy = false;
  speakNext();
}

/** Silence the narrator (used when leaving child zones). */
export function stopVoice(): void {
  voiceQueue = [];
  voiceBusy = false;
  if (typeof window !== "undefined" && typeof speechSynthesis !== "undefined") {
    speechSynthesis.cancel();
  }
}

// ── FIRST-GESTURE UNLOCK ─────────────────────────────
// Browsers require a user gesture before audio; the very first tap
// initiates Howler and (if enabled + wanted) starts the music loop.
let unlockDone = false;

/** Explicit unlock — call inside user-gesture handlers (CTA taps). */
export function unlockAudioEngine(): void {
  if (unlockDone) return;
  unlockDone = true;
  musicUnlocked = true;
  void initSfx();
  if (musicWanted && settings().musicEnabled) void startMusic();
}

if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAudioEngine();
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("mousedown", unlock);
  };
  window.addEventListener("touchstart", unlock, { once: true });
  window.addEventListener("mousedown", unlock, { once: true });
}

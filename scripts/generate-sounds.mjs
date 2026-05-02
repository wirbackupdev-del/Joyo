#!/usr/bin/env node
// scripts/generate-sounds.mjs
//
// Generates synthesized .wav audio files for Joyo.
// Run: npm run gen:sounds
//
// Output: public/sounds/{correct,wrong,pop,cheer}.wav
//
// These are simple PCM .wav files — no dependencies required.
// Replace with proper .mp3 files from a sound designer for production.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, "../public/sounds");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── WAV BUILDER ────────────────────────────────────────
const SAMPLE_RATE = 44100;

function buildWav(samples) {
  const numSamples = samples.length;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes

  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF",  0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE",  8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16,           16); // chunk size
  buf.writeUInt16LE(1,            20); // PCM
  buf.writeUInt16LE(numChannels,  22);
  buf.writeUInt32LE(SAMPLE_RATE,  24);
  buf.writeUInt32LE(byteRate,     28);
  buf.writeUInt16LE(blockAlign,   32);
  buf.writeUInt16LE(bitsPerSample,34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize,     40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const val     = clamped < 0
      ? Math.round(clamped * 32768)
      : Math.round(clamped * 32767);
    buf.writeInt16LE(val, 44 + i * 2);
  }

  return buf;
}

// ── TONE GENERATORS ────────────────────────────────────

/** Sine wave tone with fade-in / fade-out */
function sine(freq, durationMs, vol = 0.5, fadeMs = 20) {
  const n = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const fade = Math.floor(SAMPLE_RATE * fadeMs / 1000);
  return Array.from({ length: n }, (_, i) => {
    let env = 1;
    if (i < fade) env = i / fade;
    else if (i > n - fade) env = (n - i) / fade;
    return vol * env * Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE);
  });
}

/** Stack multiple samples with an offset (in samples) */
function mix(...tracks) {
  const len = Math.max(...tracks.map(([s]) => s.length));
  const out = new Float64Array(len);
  for (const [samples, offsetSamples = 0] of tracks) {
    for (let i = 0; i < samples.length; i++) {
      const idx = i + offsetSamples;
      if (idx < len) out[idx] += samples[i];
    }
  }
  // Normalise to prevent clipping
  const max = Math.max(...out.map(Math.abs));
  if (max > 1) out.forEach((_, i) => out[i] /= max);
  return Array.from(out);
}

function offset(ms) {
  return Math.floor(SAMPLE_RATE * ms / 1000);
}

// ── SOUND DEFINITIONS ──────────────────────────────────

/** correct.wav — cheerful ascending 3-note chime (C5-E5-G5) */
const correct = mix(
  [sine(523.25, 280, 0.5)],               // C5
  [sine(659.25, 280, 0.45), offset(120)], // E5
  [sine(783.99, 380, 0.4),  offset(240)], // G5
);

/** wrong.wav — gentle descending two-note (low, not scary) */
const wrong = mix(
  [sine(349.23, 220, 0.35)],              // F4
  [sine(293.66, 300, 0.32), offset(150)], // D4
);

/** pop.wav — short satisfying tap pop */
const pop = mix(
  [sine(700, 60, 0.45, 5)],
  [sine(900, 40, 0.25, 5), offset(15)],
);

/** cheer.wav — C5-E5-G5-C6 fanfare */
const cheer = mix(
  [sine(523.25, 200, 0.5)],              // C5
  [sine(659.25, 200, 0.45), offset(110)],// E5
  [sine(783.99, 200, 0.4),  offset(220)],// G5
  [sine(1046.5, 380, 0.45), offset(330)],// C6
);

// ── WRITE ──────────────────────────────────────────────
const sounds = { correct, wrong, pop, cheer };

for (const [name, samples] of Object.entries(sounds)) {
  const filepath = path.join(OUT_DIR, `${name}.wav`);
  fs.writeFileSync(filepath, buildWav(samples));
  console.log(`✅ Generated: public/sounds/${name}.wav`);
}

console.log("\n🎵 All sounds generated! Replace with professional .mp3 files for production.\n");

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
function buildWav(samples, sampleRate = SAMPLE_RATE) {
  const numSamples = samples.length;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
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
  buf.writeUInt32LE(sampleRate,   24);
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
const SAMPLE_RATE = 44100;

/** Sine wave tone with fade-in / fade-out */
function sine(freq, durationMs, vol = 0.5, fadeMs = 20, rate = SAMPLE_RATE) {
  const n = Math.floor(rate * durationMs / 1000);
  const fade = Math.floor(rate * fadeMs / 1000);
  return Array.from({ length: n }, (_, i) => {
    let env = 1;
    if (i < fade) env = i / fade;
    else if (i > n - fade) env = (n - i) / fade;
    return vol * env * Math.sin(2 * Math.PI * freq * i / rate);
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
  let max = 0;
  for (let i = 0; i < len; i++) max = Math.max(max, Math.abs(out[i]));
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

// ── music.wav family — ambient background loops (soft lullaby arpeggios) ──
// Three rotating progressions so a single loop never wears on parents'
// ears; the engine cross-fades between them every ~90 s.
// 22050 Hz is plenty for ambient pads and halves the file size.
const MUSIC_RATE = 22050;

const BAR_MS = 1600; // one chord per bar → loop = 6.4 s
const notesPerBar = 4;
const noteMs = BAR_MS / notesPerBar;

/** Overlapping arpeggio track (each note bleeds into the next for smoothness) */
function arpeggioTrack(chords, vol) {
  const totalMs = BAR_MS * chords.length;
  const n = Math.floor(MUSIC_RATE * totalMs / 1000);
  const out = new Float64Array(n);
  chords.forEach((chord, ci) => {
    chord.forEach((freq, ni) => {
      const startMs = ci * BAR_MS + ni * noteMs;
      const start = Math.floor(MUSIC_RATE * startMs / 1000);
      // Long bleed (1.2× note length) + slow attack for a pad-like feel
      const note = sine(freq, noteMs * 1.2, vol, noteMs * 0.3, MUSIC_RATE);
      for (let i = 0; i < note.length; i++) {
        const idx = start + i;
        if (idx < n) out[idx] += note[i];
      }
    });
  });
  return out;
}

/** Soft low pad holding the root of each chord (sews the arpeggio together) */
function padTrack(chords, vol) {
  const totalMs = BAR_MS * chords.length;
  const n = Math.floor(MUSIC_RATE * totalMs / 1000);
  const out = new Float64Array(n);
  chords.forEach((chord, ci) => {
    const rootLow = chord[0] / 2; // one octave down
    const note = sine(rootLow, BAR_MS, vol, BAR_MS * 0.25, MUSIC_RATE);
    const start = Math.floor(MUSIC_RATE * ci * BAR_MS / 1000);
    for (let i = 0; i < note.length; i++) {
      const idx = start + i;
      if (idx < n) out[idx] += note[i];
    }
  });
  return out;
}

// Loopable: notes that ring past the end wrap around to the start,
// so the loop point is seamless.
const MUSIC_FILL = Math.floor(MUSIC_RATE * noteMs * 1.3 / 1000);
function makeWrapable(track) {
  const head = track.slice(0, MUSIC_FILL);
  for (let i = 0; i < head.length; i++) {
    const tailIdx = track.length - MUSIC_FILL + i;
    const avg = (track[tailIdx] + head[i]) / 2;
    track[tailIdx] = avg;
    track[i] = avg;
  }
  return track;
}

function writeMusicLoop(name, progression) {
  const track = makeWrapable(
    mix(
      [arpeggioTrack(progression, 0.16)],
      [padTrack(progression, 0.12)],
      [arpeggioTrack(progression.map((c) => c.slice(1, 3)), 0.07), Math.floor(MUSIC_RATE * 0.6)],
    )
  );

  // Re-normalise the wrapped track
  let max = 0;
  for (let i = 0; i < track.length; i++) max = Math.max(max, Math.abs(track[i]));
  if (max > 0) track.forEach((_, i) => (track[i] /= max / 0.9));

  const filepath = path.join(OUT_DIR, `${name}.wav`);
  fs.writeFileSync(filepath, buildWav(Array.from(track), MUSIC_RATE));
  console.log(`✅ Generated: public/sounds/${name}.wav (${track.length / MUSIC_RATE | 0}s loop @ ${MUSIC_RATE}Hz)`);
}

// 1. C major — gentle & familiar (the original lullaby)
writeMusicLoop("music", [
  [261.63, 329.63, 392.00, 523.25], // Cmaj4
  [220.00, 261.63, 329.63, 440.00], // Am4
  [174.61, 220.00, 261.63, 349.23], // Fmaj4
  [196.00, 246.94, 293.66, 392.00], // Gmaj4
]);

// 2. F major — warm & round
writeMusicLoop("music2", [
  [174.61, 220.00, 261.63, 349.23], // Fmaj4
  [146.83, 174.61, 220.00, 293.66], // Dm4
  [233.08, 293.66, 349.23, 466.16], // B♭maj4
  [261.63, 329.63, 392.00, 523.25], // Cmaj4
]);

// 3. A major — bright & bouncy
writeMusicLoop("music3", [
  [220.00, 277.18, 329.63, 440.00], // Amaj4
  [185.00, 220.00, 277.18, 369.99], // F♯m4
  [146.83, 185.00, 220.00, 293.66], // Dmaj4
  [164.81, 207.65, 246.94, 329.63], // Emaj4
]);

console.log("\n🎵 All sounds generated! Replace with professional .mp3 files for production.\n");

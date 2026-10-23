#!/usr/bin/env node
// scripts/generate-icons.mjs
//
// Generates the Joyo PWA app icons as PNG files — pure Node, zero deps
// (built-in zlib). Output: public/icons/{icon-192,icon-512,apple-touch-icon}.png
//
// Run: npm run gen:icons
//
// Design: Joyo brand yellow rounded-square + the koala mascot (cream,
// green inner ears) — matches the in-app character exactly.

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/icons");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── PNG ENCODER (pure-node) ────────────────────────────
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array of length w*h*4 */
function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  // filter 0, no interlace for the remaining bytes (already zero-filled)

  // Filter type 0 per scanline
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── VECTOR HELPERS (2D predicates) ─────────────────────
const hex = (h) => {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function inRoundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const dx = Math.max(x0 + r - x, x - (x1 - r), 0);
  const dy = Math.max(y0 + r - y, y - (y1 - r), 0);
  return dx * dx + dy * dy <= r * r;
}

/** Distance from point to a quadratic-bezier smile (stroke test) */
function onStroke(x, y, p0, p1, p2, width) {
  const nx = ((p1[0] - p0[0]) * x + (p1[0] - p0[0]) * 0 + 0, 0); // unused guard
  void nx;
  let best = Infinity;
  for (let t = 0; t <= 24; t++) {
    const s = t / 24;
    const omt = 1 - s;
    const bx = omt * omt * p0[0] + 2 * omt * s * p1[0] + s * s * p2[0];
    const by = omt * omt * p0[1] + 2 * omt * s * p1[1] + s * s * p2[1];
    const d = Math.hypot(x - bx, y - by);
    if (d < best) best = d;
  }
  return best <= width / 2;
}

// ── KOALA ICON COMPOSITION (drawn in a 512×512 space) ──
// The koala geometry mirrors components/game/AnimalCharacter.tsx (120-viewBox
// scaled ×3.2 and centered on the brand-yellow tile).
const S = 3.2;          // scale of the 120-unit character space
const OX = 64;          // 512-square centering offset
const OY = 64;

const cream   = hex("#FFF8E7");
const earIn   = hex("#A5D6A7");
const muzzle  = hex("#F5E6D3");
const dark    = hex("#37474F");
const eye     = hex("#212121");
const white   = hex("#FFFFFF");
const cheek   = hex("#EF9A9A");
const yellow  = hex("#F5C518");

// Painter's list order → z-index (features first, base shapes last).
// Coordinates live in the 120-unit character space and are mapped on render.

function koalaPixel(x, y) {
  const px = (x - OX) / S, py = (y - OY) / S; // character space (120 units)

  // ── Eye glints (over eyes) ──
  if (inCircle(px, py, 49.5, 58.5, 2.5) || inCircle(px, py, 73.5, 58.5, 2.5))
    return white;
  // ── Eyes ──
  if (inCircle(px, py, 48, 60, 6) || inCircle(px, py, 72, 60, 6)) return eye;
  // ── Nose glint ──
  if (inCircle(px, py, 62, 62, 3)) return white;
  // ── Nose ──
  if (inEllipse(px, py, 60, 64, 8, 8)) return dark;
  // ── Smile stroke ──
  if (onStroke(px, py, [52, 80], [60, 87], [68, 80], 3.2)) return dark;
  // ── Cheeks ──
  if (inEllipse(px, py, 44, 72, 5, 5) || inEllipse(px, py, 76, 72, 5, 5))
    return cheek;
  // ── Muzzle ──
  if (inEllipse(px, py, 60, 78, 22, 14)) return muzzle;
  // ── Inner ears ──
  if (inEllipse(px, py, 38, 44, 10, 12) || inEllipse(px, py, 82, 44, 10, 12))
    return earIn;
  // ── Outer ears ──
  if (inEllipse(px, py, 38, 46, 16, 18) || inEllipse(px, py, 82, 46, 16, 18))
    return cream;
  // ── Head ──
  if (inCircle(px, py, 60, 68, 34)) return cream;
  return null;
}

function iconPixel(x, y) {
  // Brand tile — full-bleed (maskable-safe), with a subtle diagonal lift
  if (inRoundedRect(x, y, -60, -60, 572, 572, 130)) {
    const ko = koalaPixel(x, y);
    if (ko) return ko;
    const lift = ((512 - x) / 512) * 8 + ((512 - y) / 512) * 8;
    return [
      Math.min(255, yellow[0] + lift),
      Math.min(255, yellow[1] + lift),
      Math.min(255, yellow[2] + lift),
    ];
  }
  return null; // transparent outside
}

// ── RENDER (2×2 supersampled → box downsample) ─────────
function render(size) {
  const ss = 2;
  const W = size * ss;
  const canvas = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = x * ss + sx + 0.5;
          const py = y * ss + sy + 0.5;
          const c = iconPixel((px / W) * 512, (py / W) * 512);
          if (c) {
            r += c[0]; g += c[1]; b += c[2]; n++;
          }
        }
      }
      const i = (y * size + x) * 4;
      if (n) {
        canvas[i]     = Math.min(255, Math.round(r / n));
        canvas[i + 1] = Math.min(255, Math.round(g / n));
        canvas[i + 2] = Math.min(255, Math.round(b / n));
        canvas[i + 3] = 255;
      }
    }
  }
  return canvas;
}

const ICONS = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of ICONS) {
  fs.writeFileSync(path.join(OUT_DIR, name), encodePng(size, size, render(size)));
  console.log(`✅ Generated: public/icons/${name}`);
}

console.log("\n🎨 All icons generated (pure-node PNG encoder, no deps).\n");

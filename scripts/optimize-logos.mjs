#!/usr/bin/env node
/**
 * Convert local radio logo PNG/JPG assets to WebP (and AVIF when tools exist).
 *
 * Usage:
 *   node scripts/optimize-logos.mjs
 *   node scripts/optimize-logos.mjs --avif
 *   node scripts/optimize-logos.mjs --dir assets/images/radios
 *
 * Requires ImageMagick `convert` and/or `ffmpeg`. Optional: `avifenc` (libavif).
 * Does not delete originals; writes sibling .webp / .avif files.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const wantAvif = args.includes("--avif");
const dirArg = args.find((a) => a.startsWith("--dir="))?.slice(6)
  ?? (args.includes("--dir") ? args[args.indexOf("--dir") + 1] : null)
  ?? "assets/images/radios";

const root = process.cwd();
const targetDir = path.resolve(root, dirArg);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

function hasBin(name) {
  const r = spawnSync(name, ["-version"], { encoding: "utf8" });
  if (r.error) {
    const which = spawnSync("which", [name], { encoding: "utf8" });
    return which.status === 0;
  }
  return r.status === 0 || r.status === 1;
}

const hasConvert = hasBin("convert");
const hasFfmpeg = hasBin("ffmpeg");
const hasAvifenc = hasBin("avifenc");

if (!hasConvert && !hasFfmpeg) {
  console.error("Need ImageMagick `convert` or `ffmpeg` on PATH.");
  process.exit(1);
}

const INPUT_EXT = new Set([".png", ".jpg", ".jpeg"]);
const files = fs.readdirSync(targetDir)
  .filter((f) => INPUT_EXT.has(path.extname(f).toLowerCase()))
  .sort();

if (!files.length) {
  console.log(`No PNG/JPG files in ${targetDir}`);
  process.exit(0);
}

function toWebp(input, output) {
  if (hasConvert) {
    const r = spawnSync("convert", [input, "-strip", "-quality", "82", output], { encoding: "utf8" });
    return r.status === 0;
  }
  const r = spawnSync("ffmpeg", ["-y", "-i", input, "-c:v", "libwebp", "-quality", "82", output], {
    encoding: "utf8",
  });
  return r.status === 0;
}

function toAvif(input, output) {
  if (hasAvifenc) {
    const r = spawnSync("avifenc", ["--min", "20", "--max", "28", input, output], { encoding: "utf8" });
    return r.status === 0;
  }
  if (hasFfmpeg) {
    const r = spawnSync(
      "ffmpeg",
      ["-y", "-i", input, "-c:v", "libaom-av1", "-crf", "30", "-still-picture", "1", output],
      { encoding: "utf8" },
    );
    return r.status === 0;
  }
  return false;
}

let webpOk = 0;
let avifOk = 0;

for (const file of files) {
  const input = path.join(targetDir, file);
  const base = file.replace(/\.(png|jpe?g)$/i, "");
  const webpOut = path.join(targetDir, `${base}.webp`);
  const avifOut = path.join(targetDir, `${base}.avif`);
  const inSize = fs.statSync(input).size;

  if (toWebp(input, webpOut)) {
    const outSize = fs.statSync(webpOut).size;
    const saved = ((1 - outSize / inSize) * 100).toFixed(1);
    console.log(`webp  ${file} → ${base}.webp  (${inSize} → ${outSize}, ${saved}% smaller)`);
    webpOk += 1;
  } else {
    console.warn(`webp  FAILED ${file}`);
  }

  if (wantAvif) {
    if (toAvif(input, avifOut)) {
      const outSize = fs.statSync(avifOut).size;
      console.log(`avif  ${file} → ${base}.avif  (${inSize} → ${outSize})`);
      avifOk += 1;
    } else {
      console.warn(`avif  SKIP/FAIL ${file} (install avifenc or ffmpeg with libaom)`);
    }
  }
}

console.log(`\nDone: ${webpOk} WebP, ${avifOk} AVIF. Update LOCAL_LOGOS requires to .webp where desired.`);

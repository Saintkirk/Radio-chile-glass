#!/usr/bin/env node
/**
 * Live HLS latency probe against editorial catalog streams.
 * Usage: node scripts/probe-hls-latency.mjs
 */

const HLS_URLS = [
  { id: "agricultura", url: "https://unlimited4-us.dps.live/agricultura/gotardis/audio/now/livestream1.m3u8" },
  { id: "oasis", url: "https://mdstrm.com/audio/5c915497c6fd7c085b29169d/live.m3u8" },
  { id: "la-clave", url: "https://unlimited1-cl-isp.dps.live/laclavetv/laclavetv.smil/playlist.m3u8" },
];

function parseM3u8(body) {
  const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const isMaster = lines.some((l) => l.startsWith("#EXT-X-STREAM-INF"));
  let targetDurationSec = null;
  const segmentUris = [];
  const variantUris = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXT-X-TARGETDURATION:")) targetDurationSec = Number(line.split(":")[1]) || null;
    else if (line.startsWith("#EXT-X-STREAM-INF")) {
      const next = lines[i + 1];
      if (next && !next.startsWith("#")) variantUris.push(next);
    } else if (line.startsWith("#EXTINF")) {
      const next = lines[i + 1];
      if (next && !next.startsWith("#")) segmentUris.push(next);
    }
  }
  return { isMaster, targetDurationSec, segmentUris, variantUris };
}

function resolve(base, uri) {
  try { return new URL(uri, base).href; } catch { return uri; }
}

async function probe(url, timeoutMs = 12000) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const t0 = Date.now();
    let res = await fetch(url, {
      headers: { Accept: "application/vnd.apple.mpegurl, */*", "User-Agent": "RadioChileGlass/1.0 hls-latency" },
      signal: controller.signal,
    });
    const ttfb = Date.now() - t0;
    let body = await res.text();
    let parsed = parseM3u8(body);
    let mediaUrl = url;
    if (parsed.isMaster && parsed.variantUris[0]) {
      mediaUrl = resolve(url, parsed.variantUris[0]);
      res = await fetch(mediaUrl, { headers: { "User-Agent": "RadioChileGlass/1.0 hls-latency" }, signal: controller.signal });
      body = await res.text();
      parsed = parseM3u8(body);
    }
    if (!parsed.segmentUris.length) {
      return { ok: false, ttfb, total: Date.now() - started, error: "no segments", targetDurationSec: parsed.targetDurationSec };
    }
    const segUrl = resolve(mediaUrl, parsed.segmentUris[0]);
    const s0 = Date.now();
    const segRes = await fetch(segUrl, {
      headers: { Range: "bytes=0-2047", "User-Agent": "RadioChileGlass/1.0 hls-latency" },
      signal: controller.signal,
    });
    await segRes.arrayBuffer();
    const segmentMs = Date.now() - s0;
    return {
      ok: res.ok && (segRes.ok || segRes.status === 206),
      ttfb,
      segmentMs,
      total: Date.now() - started,
      targetDurationSec: parsed.targetDurationSec,
      segments: parsed.segmentUris.length,
      windowSec: parsed.targetDurationSec != null ? parsed.segmentUris.length * parsed.targetDurationSec : null,
    };
  } catch (e) {
    return { ok: false, total: Date.now() - started, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

const rows = [];
for (const item of HLS_URLS) {
  process.stdout.write(`probing ${item.id}... `);
  const result = await probe(item.url);
  rows.push({ id: item.id, ...result });
  console.log(result.ok ? `OK total=${result.total}ms ttfb=${result.ttfb}ms seg=${result.segmentMs}ms window=${result.windowSec}s` : `FAIL ${result.error}`);
}

const ok = rows.filter((r) => r.ok).length;
console.log(`\n${ok}/${rows.length} HLS streams healthy`);
process.exit(ok === rows.length ? 0 : 1);

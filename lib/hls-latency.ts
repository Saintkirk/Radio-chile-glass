/**
 * HLS stream latency and health probes for Radio Chile Glass.
 * Measures playlist TTFB, parse quality, and first-segment readiness.
 */

export type HlsProbeStatus = "ok" | "timeout" | "http_error" | "parse_error" | "empty" | "network_error";

export type HlsLatencyResult = {
  url: string;
  status: HlsProbeStatus;
  /** Time to first byte / response headers (ms) */
  ttfbMs: number | null;
  /** Full playlist download time (ms) */
  playlistMs: number | null;
  /** First media segment fetch time (ms), if measured */
  segmentMs: number | null;
  /** Total wall time for the probe (ms) */
  totalMs: number;
  httpStatus: number | null;
  contentType: string | null;
  isMasterPlaylist: boolean;
  targetDurationSec: number | null;
  mediaSequence: number | null;
  segmentCount: number;
  /** Estimated live edge latency from playlist window (segments * targetDuration) */
  windowLatencySec: number | null;
  /** Chosen media playlist URL (after master resolution) */
  mediaPlaylistUrl: string | null;
  /** First segment URI resolved to absolute URL */
  firstSegmentUrl: string | null;
  error?: string;
};

export type HlsProbeOptions = {
  /** Overall timeout in ms (default 12_000) */
  timeoutMs?: number;
  /** Whether to also fetch the first media segment (default true) */
  fetchFirstSegment?: boolean;
  /** Custom fetch implementation (for tests) */
  fetchImpl?: typeof fetch;
  /** Optional radio id for logging context */
  radioId?: string;
};

const DEFAULT_TIMEOUT_MS = 12_000;

export function isHlsUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes(".m3u8") || lower.includes("application/vnd.apple.mpegurl");
}

export function collectHlsRadios<T extends { streamUrl: string }>(radios: T[]): T[] {
  return radios.filter((radio) => isHlsUrl(radio.streamUrl));
}

/** Resolve a possibly relative URI against a base playlist URL. */
export function resolvePlaylistUri(baseUrl: string, uri: string): string {
  try {
    return new URL(uri, baseUrl).href;
  } catch {
    return uri;
  }
}

export type ParsedPlaylist = {
  isMaster: boolean;
  targetDurationSec: number | null;
  mediaSequence: number | null;
  segmentUris: string[];
  variantUris: string[];
};

export function parseM3u8(body: string): ParsedPlaylist {
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const isMaster = lines.some((line) => line.startsWith("#EXT-X-STREAM-INF"));
  let targetDurationSec: number | null = null;
  let mediaSequence: number | null = null;
  const segmentUris: string[] = [];
  const variantUris: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXT-X-TARGETDURATION:")) {
      const value = Number(line.split(":")[1]);
      if (Number.isFinite(value)) targetDurationSec = value;
    } else if (line.startsWith("#EXT-X-MEDIA-SEQUENCE:")) {
      const value = Number(line.split(":")[1]);
      if (Number.isFinite(value)) mediaSequence = value;
    } else if (line.startsWith("#EXT-X-STREAM-INF")) {
      const next = lines[i + 1];
      if (next && !next.startsWith("#")) variantUris.push(next);
    } else if (line.startsWith("#EXTINF")) {
      const next = lines[i + 1];
      if (next && !next.startsWith("#")) segmentUris.push(next);
    } else if (!line.startsWith("#") && !isMaster && line.length > 0) {
      if (!segmentUris.includes(line) && (line.includes(".ts") || line.includes(".m4s") || line.includes(".aac"))) {
        segmentUris.push(line);
      }
    }
  }

  return { isMaster, targetDurationSec, mediaSequence, segmentUris, variantUris };
}

function emptyResult(url: string, totalMs: number, status: HlsProbeStatus, error?: string): HlsLatencyResult {
  return {
    url,
    status,
    ttfbMs: null,
    playlistMs: null,
    segmentMs: null,
    totalMs,
    httpStatus: null,
    contentType: null,
    isMasterPlaylist: false,
    targetDurationSec: null,
    mediaSequence: null,
    segmentCount: 0,
    windowLatencySec: null,
    mediaPlaylistUrl: null,
    firstSegmentUrl: null,
    error,
  };
}

async function fetchText(
  url: string,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean; status: number; contentType: string | null; body: string; ttfbMs: number; totalMs: number; error?: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.apple.mpegurl, application/x-mpegURL, audio/mpegurl, */*",
        "User-Agent": "RadioChileGlass/1.0 hls-latency-probe",
      },
      signal: controller.signal,
    });
    const ttfbMs = Date.now() - started;
    const contentType = response.headers.get("content-type");
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      contentType,
      body,
      ttfbMs,
      totalMs: Date.now() - started,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      status: 0,
      contentType: null,
      body: "",
      ttfbMs: Date.now() - started,
      totalMs: Date.now() - started,
      error: isAbort ? `Timeout after ${timeoutMs}ms` : message,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probe an HLS URL for latency characteristics.
 * Resolves master → media playlist, measures TTFB and optional first segment.
 */
export async function probeHlsLatency(url: string, options: HlsProbeOptions = {}): Promise<HlsLatencyResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const fetchFirstSegment = options.fetchFirstSegment !== false;
  const wallStart = Date.now();

  if (!url || typeof url !== "string") {
    return emptyResult(url ?? "", 0, "empty", "URL vacía");
  }

  const playlist = await fetchText(url, timeoutMs, fetchImpl);
  if (playlist.error?.startsWith("Timeout")) {
    return { ...emptyResult(url, Date.now() - wallStart, "timeout", playlist.error), ttfbMs: playlist.ttfbMs, playlistMs: playlist.totalMs };
  }
  if (!playlist.ok) {
    const status: HlsProbeStatus = playlist.status === 0 ? "network_error" : "http_error";
    return {
      ...emptyResult(url, Date.now() - wallStart, status, playlist.error ?? `HTTP ${playlist.status}`),
      ttfbMs: playlist.ttfbMs,
      playlistMs: playlist.totalMs,
      httpStatus: playlist.status || null,
      contentType: playlist.contentType,
    };
  }

  if (!playlist.body.trim()) {
    return {
      ...emptyResult(url, Date.now() - wallStart, "empty", "Playlist vacío"),
      ttfbMs: playlist.ttfbMs,
      playlistMs: playlist.totalMs,
      httpStatus: playlist.status,
      contentType: playlist.contentType,
    };
  }

  let parsed = parseM3u8(playlist.body);
  let mediaPlaylistUrl = url;
  let ttfbMs = playlist.ttfbMs;
  let playlistMs = playlist.totalMs;
  let contentType = playlist.contentType;
  let httpStatus = playlist.status;

  if (parsed.isMaster && parsed.variantUris.length > 0) {
    mediaPlaylistUrl = resolvePlaylistUri(url, parsed.variantUris[0]);
    const remaining = Math.max(2_000, timeoutMs - (Date.now() - wallStart));
    const media = await fetchText(mediaPlaylistUrl, remaining, fetchImpl);
    if (!media.ok || !media.body.trim()) {
      return {
        url,
        status: media.error?.startsWith("Timeout") ? "timeout" : "http_error",
        ttfbMs,
        playlistMs,
        segmentMs: null,
        totalMs: Date.now() - wallStart,
        httpStatus: media.status || httpStatus,
        contentType: media.contentType ?? contentType,
        isMasterPlaylist: true,
        targetDurationSec: null,
        mediaSequence: null,
        segmentCount: 0,
        windowLatencySec: null,
        mediaPlaylistUrl,
        firstSegmentUrl: null,
        error: media.error ?? `Media playlist HTTP ${media.status}`,
      };
    }
    parsed = parseM3u8(media.body);
    ttfbMs = media.ttfbMs;
    playlistMs = media.totalMs;
    contentType = media.contentType ?? contentType;
    httpStatus = media.status;
  }

  if (parsed.segmentUris.length === 0) {
    return {
      url,
      status: "parse_error",
      ttfbMs,
      playlistMs,
      segmentMs: null,
      totalMs: Date.now() - wallStart,
      httpStatus,
      contentType,
      isMasterPlaylist: parsed.isMaster,
      targetDurationSec: parsed.targetDurationSec,
      mediaSequence: parsed.mediaSequence,
      segmentCount: 0,
      windowLatencySec: null,
      mediaPlaylistUrl,
      firstSegmentUrl: null,
      error: "No se encontraron segmentos en el playlist",
    };
  }

  const firstSegmentUrl = resolvePlaylistUri(mediaPlaylistUrl, parsed.segmentUris[0]);
  let segmentMs: number | null = null;

  if (fetchFirstSegment) {
    const remaining = Math.max(2_000, timeoutMs - (Date.now() - wallStart));
    const segmentStart = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remaining);
    try {
      const response = await fetchImpl(firstSegmentUrl, {
        method: "GET",
        headers: { "User-Agent": "RadioChileGlass/1.0 hls-latency-probe", Range: "bytes=0-2047" },
        signal: controller.signal,
      });
      await response.arrayBuffer();
      segmentMs = Date.now() - segmentStart;
      if (!response.ok && response.status !== 206) {
        return {
          url,
          status: "http_error",
          ttfbMs,
          playlistMs,
          segmentMs,
          totalMs: Date.now() - wallStart,
          httpStatus: response.status,
          contentType,
          isMasterPlaylist: false,
          targetDurationSec: parsed.targetDurationSec,
          mediaSequence: parsed.mediaSequence,
          segmentCount: parsed.segmentUris.length,
          windowLatencySec:
            parsed.targetDurationSec != null
              ? parsed.segmentUris.length * parsed.targetDurationSec
              : null,
          mediaPlaylistUrl,
          firstSegmentUrl,
          error: `Segmento HTTP ${response.status}`,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isAbort = error instanceof Error && error.name === "AbortError";
      return {
        url,
        status: isAbort ? "timeout" : "network_error",
        ttfbMs,
        playlistMs,
        segmentMs: Date.now() - segmentStart,
        totalMs: Date.now() - wallStart,
        httpStatus,
        contentType,
        isMasterPlaylist: false,
        targetDurationSec: parsed.targetDurationSec,
        mediaSequence: parsed.mediaSequence,
        segmentCount: parsed.segmentUris.length,
        windowLatencySec:
          parsed.targetDurationSec != null
            ? parsed.segmentUris.length * parsed.targetDurationSec
            : null,
        mediaPlaylistUrl,
        firstSegmentUrl,
        error: isAbort ? `Timeout segmento after ${remaining}ms` : message,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  const windowLatencySec =
    parsed.targetDurationSec != null ? parsed.segmentUris.length * parsed.targetDurationSec : null;

  return {
    url,
    status: "ok",
    ttfbMs,
    playlistMs,
    segmentMs,
    totalMs: Date.now() - wallStart,
    httpStatus,
    contentType,
    isMasterPlaylist: false,
    targetDurationSec: parsed.targetDurationSec,
    mediaSequence: parsed.mediaSequence,
    segmentCount: parsed.segmentUris.length,
    windowLatencySec,
    mediaPlaylistUrl,
    firstSegmentUrl,
  };
}

export type HlsLatencySummary = {
  total: number;
  ok: number;
  failed: number;
  results: HlsLatencyResult[];
  medianTotalMs: number | null;
  maxTotalMs: number | null;
};

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export async function probeHlsLatencyBatch(
  urls: string[],
  options: HlsProbeOptions = {},
): Promise<HlsLatencySummary> {
  const results: HlsLatencyResult[] = [];
  for (const url of urls) {
    results.push(await probeHlsLatency(url, options));
  }
  const okResults = results.filter((r) => r.status === "ok");
  const totals = okResults.map((r) => r.totalMs);
  return {
    total: results.length,
    ok: okResults.length,
    failed: results.length - okResults.length,
    results,
    medianTotalMs: median(totals),
    maxTotalMs: totals.length ? Math.max(...totals) : null,
  };
}

export const HLS_LATENCY_BUDGETS = {
  playlistTtfbMs: 3_000,
  totalMs: 8_000,
  totalHardMs: 12_000,
  targetDurationMaxSec: 15,
} as const;

export function evaluateHlsLatency(result: HlsLatencyResult): {
  pass: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (result.status !== "ok") {
    reasons.push(`status=${result.status}${result.error ? `: ${result.error}` : ""}`);
    return { pass: false, reasons };
  }
  if (result.ttfbMs != null && result.ttfbMs > HLS_LATENCY_BUDGETS.playlistTtfbMs) {
    reasons.push(`ttfb ${result.ttfbMs}ms > ${HLS_LATENCY_BUDGETS.playlistTtfbMs}ms`);
  }
  if (result.totalMs > HLS_LATENCY_BUDGETS.totalHardMs) {
    reasons.push(`total ${result.totalMs}ms > ${HLS_LATENCY_BUDGETS.totalHardMs}ms`);
  }
  if (result.targetDurationSec != null && result.targetDurationSec > HLS_LATENCY_BUDGETS.targetDurationMaxSec) {
    reasons.push(`targetDuration ${result.targetDurationSec}s > ${HLS_LATENCY_BUDGETS.targetDurationMaxSec}s`);
  }
  if (result.segmentCount < 1) {
    reasons.push("sin segmentos");
  }
  return { pass: reasons.length === 0, reasons };
}

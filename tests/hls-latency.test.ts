import { describe, expect, it, vi } from "vitest";
import {
  HLS_LATENCY_BUDGETS,
  collectHlsRadios,
  evaluateHlsLatency,
  isHlsUrl,
  parseM3u8,
  probeHlsLatency,
  probeHlsLatencyBatch,
  resolvePlaylistUri,
  type HlsLatencyResult,
} from "../lib/hls-latency";

const MEDIA_PLAYLIST = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:100
#EXTINF:6.0,
seg100.ts
#EXTINF:6.0,
seg101.ts
#EXTINF:6.0,
seg102.ts
#EXT-X-ENDLIST
`;

const MASTER_PLAYLIST = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=128000,CODECS="mp4a.40.2"
media/playlist.m3u8
`;

describe("isHlsUrl", () => {
  it("detecta playlists m3u8", () => {
    expect(isHlsUrl("https://cdn.example/live.m3u8")).toBe(true);
    expect(isHlsUrl("https://cdn.example/stream.M3U8?token=1")).toBe(true);
  });

  it("rechaza streams progresivos", () => {
    expect(isHlsUrl("https://cdn.example/stream.mp3")).toBe(false);
    expect(isHlsUrl("")).toBe(false);
  });
});

describe("collectHlsRadios", () => {
  it("filtra solo URLs HLS del catálogo", () => {
    const radios = [
      { id: "a", streamUrl: "https://x/live.m3u8" },
      { id: "b", streamUrl: "https://x/audio.mp3" },
      { id: "c", streamUrl: "https://x/playlist.m3u8" },
    ];
    expect(collectHlsRadios(radios).map((r) => r.id)).toEqual(["a", "c"]);
  });
});

describe("parseM3u8", () => {
  it("parsea playlist de medios con target duration y segmentos", () => {
    const parsed = parseM3u8(MEDIA_PLAYLIST);
    expect(parsed.isMaster).toBe(false);
    expect(parsed.targetDurationSec).toBe(6);
    expect(parsed.mediaSequence).toBe(100);
    expect(parsed.segmentUris).toEqual(["seg100.ts", "seg101.ts", "seg102.ts"]);
  });

  it("parsea master playlist y expone variantes", () => {
    const parsed = parseM3u8(MASTER_PLAYLIST);
    expect(parsed.isMaster).toBe(true);
    expect(parsed.variantUris).toEqual(["media/playlist.m3u8"]);
    expect(parsed.segmentUris).toEqual([]);
  });
});

describe("resolvePlaylistUri", () => {
  it("resuelve URIs relativas contra la base del playlist", () => {
    expect(resolvePlaylistUri("https://cdn.example/live/index.m3u8", "seg1.ts")).toBe(
      "https://cdn.example/live/seg1.ts",
    );
    expect(resolvePlaylistUri("https://cdn.example/live/index.m3u8", "/abs/seg1.ts")).toBe(
      "https://cdn.example/abs/seg1.ts",
    );
  });
});

describe("probeHlsLatency", () => {
  it("mide TTFB y primer segmento en un media playlist", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith(".m3u8")) {
        return new Response(MEDIA_PLAYLIST, {
          status: 200,
          headers: { "Content-Type": "application/vnd.apple.mpegurl" },
        });
      }
      return new Response(new Uint8Array([0, 1, 2, 3]), {
        status: 206,
        headers: { "Content-Type": "video/mp2t" },
      });
    }) as unknown as typeof fetch;

    const result = await probeHlsLatency("https://cdn.example/live.m3u8", {
      fetchImpl,
      timeoutMs: 5_000,
    });

    expect(result.status).toBe("ok");
    expect(result.httpStatus).toBe(200);
    expect(result.segmentCount).toBe(3);
    expect(result.targetDurationSec).toBe(6);
    expect(result.windowLatencySec).toBe(18);
    expect(result.firstSegmentUrl).toBe("https://cdn.example/seg100.ts");
    expect(result.ttfbMs).toBeTypeOf("number");
    expect(result.segmentMs).toBeTypeOf("number");
    expect(result.totalMs).toBeGreaterThan(0);
  });

  it("resuelve master → media antes de medir segmentos", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/master.m3u8")) {
        return new Response(MASTER_PLAYLIST, { status: 200 });
      }
      if (url.includes("media/playlist.m3u8")) {
        return new Response(MEDIA_PLAYLIST, { status: 200 });
      }
      return new Response(new Uint8Array([9, 9]), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await probeHlsLatency("https://cdn.example/master.m3u8", { fetchImpl });
    expect(result.status).toBe("ok");
    expect(result.mediaPlaylistUrl).toBe("https://cdn.example/media/playlist.m3u8");
    expect(result.segmentCount).toBe(3);
  });

  it("marca timeout cuando el fetch aborta", async () => {
    const fetchImpl = vi.fn(async () => {
      const error = new Error("Aborted");
      error.name = "AbortError";
      throw error;
    }) as unknown as typeof fetch;

    const result = await probeHlsLatency("https://cdn.example/live.m3u8", {
      fetchImpl,
      timeoutMs: 50,
    });
    expect(result.status).toBe("timeout");
  });

  it("marca parse_error si no hay segmentos", async () => {
    const fetchImpl = vi.fn(async () => new Response("#EXTM3U\n#EXT-X-TARGETDURATION:4\n", { status: 200 })) as unknown as typeof fetch;
    const result = await probeHlsLatency("https://cdn.example/empty.m3u8", { fetchImpl });
    expect(result.status).toBe("parse_error");
  });
});

describe("evaluateHlsLatency", () => {
  it("aprueba un resultado sano dentro de presupuesto", () => {
    const result: HlsLatencyResult = {
      url: "https://x/live.m3u8",
      status: "ok",
      ttfbMs: 200,
      playlistMs: 250,
      segmentMs: 300,
      totalMs: 600,
      httpStatus: 200,
      contentType: "application/vnd.apple.mpegurl",
      isMasterPlaylist: false,
      targetDurationSec: 6,
      mediaSequence: 1,
      segmentCount: 4,
      windowLatencySec: 24,
      mediaPlaylistUrl: "https://x/live.m3u8",
      firstSegmentUrl: "https://x/seg.ts",
    };
    expect(evaluateHlsLatency(result).pass).toBe(true);
  });

  it("falla si TTFB excede el presupuesto", () => {
    const result: HlsLatencyResult = {
      url: "https://x/live.m3u8",
      status: "ok",
      ttfbMs: HLS_LATENCY_BUDGETS.playlistTtfbMs + 500,
      playlistMs: 4_000,
      segmentMs: 100,
      totalMs: 4_200,
      httpStatus: 200,
      contentType: null,
      isMasterPlaylist: false,
      targetDurationSec: 6,
      mediaSequence: 1,
      segmentCount: 3,
      windowLatencySec: 18,
      mediaPlaylistUrl: "https://x/live.m3u8",
      firstSegmentUrl: "https://x/seg.ts",
    };
    const evaluation = evaluateHlsLatency(result);
    expect(evaluation.pass).toBe(false);
    expect(evaluation.reasons.some((r) => r.includes("ttfb"))).toBe(true);
  });
});

describe("probeHlsLatencyBatch", () => {
  it("agrega ok/failed y mediana", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("bad")) {
        return new Response("nope", { status: 500 });
      }
      if (url.endsWith(".m3u8")) {
        return new Response(MEDIA_PLAYLIST, { status: 200 });
      }
      return new Response(new Uint8Array([1]), { status: 200 });
    }) as unknown as typeof fetch;

    const summary = await probeHlsLatencyBatch(
      ["https://cdn.example/good.m3u8", "https://cdn.example/bad.m3u8"],
      { fetchImpl },
    );
    expect(summary.total).toBe(2);
    expect(summary.ok).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.medianTotalMs).toBeTypeOf("number");
  });
});

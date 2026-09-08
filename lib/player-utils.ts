import type { Radio } from "./radios";

export function toggleFavoriteId(favorites: string[], radioId: string): string[] {
  return favorites.includes(radioId)
    ? favorites.filter((id) => id !== radioId)
    : [...favorites, radioId];
}

export function isRadioPlaying(currentRadio: Radio | null, radioId: string, isPlaying: boolean): boolean {
  return isPlaying && currentRadio?.id === radioId;
}

export function playbackStatus(isLoading: boolean, isPlaying: boolean): "connecting" | "playing" | "ready" {
  if (isLoading) return "connecting";
  return isPlaying ? "playing" : "ready";
}

export type PlaybackStatusSnapshot = {
  playing?: boolean;
  isLoaded?: boolean;
  isBuffering?: boolean;
};

/**
 * Live radio streams often report isBuffering=true in short bursts while
 * already audible. Treat playing+loaded as confirmed; buffering alone must
 * not drop the "en vivo" / isPlaying UI or tear down the player.
 */
export function isPlaybackConfirmed(status: PlaybackStatusSnapshot): boolean {
  return status.playing === true && status.isLoaded !== false;
}

export const MAX_PLAYBACK_RETRIES = 3;

export function isCurrentPlaybackRequest(requestId: number, currentRequestId: number): boolean {
  return requestId === currentRequestId;
}

/** Reject metadata or controls produced by a station that is no longer active. */
export function isCurrentRadioId(activeRadioId: string | null | undefined, candidateRadioId: string | null | undefined): boolean {
  return Boolean(activeRadioId && candidateRadioId && activeRadioId === candidateRadioId);
}

/** Adaptive retry delay with exponential backoff and jitter for different error types */
export function adaptiveRetryDelayMs(attempt: number, errorType?: 'network' | 'timeout' | 'stream'): number {
  const baseDelay = attempt === 0 ? 0 : Math.pow(2, attempt - 1) * 1000;
  const jitter = baseDelay * 0.2 * (Math.random() - 0.5) * 2;
  const typeMultiplier = errorType === 'network' ? 1.5 : errorType === 'stream' ? 0.8 : 1.0;
  return Math.round((baseDelay + jitter) * typeMultiplier);
}

/** A crossfade is valid only while both its request and cancellation token are current. */
export function shouldContinueCrossfade(requestId: number, currentRequestId: number, token: number, currentToken: number): boolean {
  return requestId === currentRequestId && token === currentToken;
}

export type CarouselSettleMode = "gesture" | "instant" | "entrance";

/**
 * Gesture flings settle with a softer ease; programmatic entrance and
 * index snaps use a slightly tighter curve so the cover stays readable.
 */
export function carouselSettleEasing(mode: CarouselSettleMode = "gesture"): [number, number, number, number] {
  if (mode === "entrance") return [0.22, 1, 0.36, 1];
  if (mode === "instant") return [0.2, 0.8, 0.2, 1];
  return [0.16, 1, 0.3, 1];
}

export function carouselSettleDurationMs(distance: number, mode: CarouselSettleMode = "gesture"): number {
  const abs = Math.abs(distance);
  if (mode === "instant") return Math.min(320, 140 + abs * 0.28);
  if (mode === "entrance") return Math.min(520, 220 + abs * 0.38);
  return Math.min(480, 180 + abs * 0.42);
}

export function retryDelayMs(attempt: number): number {
  return [0, 800, 1800, 3500][Math.max(0, Math.min(attempt, MAX_PLAYBACK_RETRIES))];
}

export function adjacentPlayableRadioIndex(
  radios: Radio[],
  fromIndex: number,
  direction: 1 | -1,
  isBlocked: (radio: Radio) => boolean,
): number {
  if (radios.length === 0) return -1;
  let index = fromIndex;
  for (let i = 0; i < radios.length; i += 1) {
    index = (index + direction + radios.length) % radios.length;
    if (!isBlocked(radios[index])) return index;
  }
  return -1;
}

export type LockScreenMetadata = {
  radioId: string;
  title: string;
  artist: string;
  albumTitle?: string;
  artworkUrl?: string;
};

export function lockScreenMetadata(radio: Radio, nowPlaying?: string | null): LockScreenMetadata {
  return {
    radioId: radio.id,
    title: nowPlaying?.trim() || radio.name,
    artist: radio.name,
    albumTitle: radio.city ? `${radio.city} · Chile` : "Radio Chile Glass",
    artworkUrl: radio.logoUrl,
  };
}

export function isLockScreenAudioCandidate(radio: Radio | null | undefined): boolean {
  return Boolean(radio?.streamUrl);
}

export function audioFocusAction(
  change: "gain" | "loss" | "loss_transient" | "loss_transient_can_duck" | "unknown",
): "resume" | "pause" | "duck" | "ignore" {
  if (change === "gain") return "resume";
  if (change === "loss" || change === "loss_transient") return "pause";
  if (change === "loss_transient_can_duck") return "duck";
  return "ignore";
}

export function validateStreamUrl(url: string | undefined | null): { ok: boolean; reason?: string } {
  if (!url || typeof url !== "string") return { ok: false, reason: "URL vacía" };
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, reason: "URL vacía" };
  try {
    const parsed = new URL(trimmed);
    if (!/^https?:$/i.test(parsed.protocol)) return { ok: false, reason: "Protocolo no soportado" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "URL malformada" };
  }
}

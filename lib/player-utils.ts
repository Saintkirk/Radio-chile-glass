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

/** Only finish the connection state after the native player is ready and audible. */
export function isPlaybackConfirmed(status: PlaybackStatusSnapshot): boolean {
  return status.playing === true && status.isLoaded === true && status.isBuffering !== true;
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
  // Base delays increase exponentially: 0, 1000, 2000, 4000, 8000
  const baseDelay = attempt === 0 ? 0 : Math.pow(2, attempt - 1) * 1000;
  
  // Add jitter (+-20%) to prevent thundering herd
  const jitter = baseDelay * 0.2 * (Math.random() - 0.5) * 2;
  
  // Network errors may need more time, stream errors less
  const typeMultiplier = errorType === 'network' ? 1.5 : errorType === 'stream' ? 0.8 : 1.0;
  
  return Math.round((baseDelay + jitter) * typeMultiplier);
}


/** A crossfade is valid only while both its request and cancellation token are current. */
export function shouldContinueCrossfade(requestId: number, currentRequestId: number, token: number, currentToken: number): boolean {
  return requestId === currentRequestId && token === currentToken;
}

export type CarouselSettleMode = "gesture" | "instant" | "entrance";

/** Selects the visual settle path after the active station changes. */
export function carouselSettleMode(committedBySwipe: boolean, reduceMotion: boolean): CarouselSettleMode {
  if (reduceMotion) return "instant";
  return committedBySwipe ? "gesture" : "entrance";
}

export function retryDelayMs(attempt: number): number {
  return [0, 800, 1800, 3500][Math.max(0, Math.min(attempt, MAX_PLAYBACK_RETRIES))];
}

export type AudioFocusEventName = "gain" | "loss" | "loss_transient" | "loss_transient_can_duck" | "unknown";
export type AudioFocusAction = "restore" | "pause" | "duck" | "none";

export function audioFocusAction(change: AudioFocusEventName): AudioFocusAction {
  if (change === "gain") return "restore";
  if (change === "loss" || change === "loss_transient") return "pause";
  if (change === "loss_transient_can_duck") return "duck";
  return "none";
}

export function adjacentRadioIndex(length: number, currentIndex: number, direction: -1 | 1): number {
  if (length < 1 || currentIndex < 0) return -1;
  return (currentIndex + direction + length) % length;
}

/** Known video/HLS entries are kept in the catalogue but skipped by transport controls. */
export function isLockScreenAudioCandidate(radioId: string): boolean {
  return !radioId.startsWith("remote-") && radioId !== "13c" && radioId !== "la-clave";
}

/** Finds the next transport-safe station without landing on a known non-audio entry. */
export function adjacentPlayableRadioIndex(
  radios: ReadonlyArray<{ id: string }>,
  currentIndex: number,
  direction: -1 | 1,
  isCandidate: (radio: { id: string }) => boolean = (radio) => isLockScreenAudioCandidate(radio.id),
): number {
  if (radios.length < 2 || currentIndex < 0 || currentIndex >= radios.length) return -1;
  for (let step = 1; step <= radios.length; step += 1) {
    const index = (currentIndex + direction * step + radios.length * 2) % radios.length;
    if (isCandidate(radios[index])) return index;
  }
  return -1;
}

/** Keeps a carousel index inside the available catalog, or returns -1 when empty/invalid. */
export function safeRadioIndex(length: number, currentIndex: number): number {
  if (length < 1 || !Number.isFinite(currentIndex)) return -1;
  return Math.max(0, Math.min(length - 1, Math.trunc(currentIndex)));
}

/** Wraps a logical carousel position so duplicated visual slots never expose a gap. */
export function wrapCarouselIndex(index: number, length: number): number {
  if (length < 1 || !Number.isFinite(index)) return -1;
  return ((Math.trunc(index) % length) + length) % length;
}

/** Returns the station that a completed multi-turn spin should land on. */
export function spinLandingIndex(currentIndex: number, travelledSlots: number, length: number): number {
  if (length < 1 || !Number.isFinite(currentIndex) || !Number.isFinite(travelledSlots)) return -1;
  return wrapCarouselIndex(currentIndex + Math.trunc(travelledSlots), length);
}

/** Converts a pixel offset to the nearest centered slot. */
export function nearestCarouselSlot(offset: number, step: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(step) || step <= 0) return 0;
  return Math.round(offset / step);
}

/** Returns whether opening a station should start or restart its stream. */
export type PlaybackHandoff = "start" | "resume" | "none";

/** Keeps route/card handoffs on the singleton player instead of recreating the same stream. */
export function playbackHandoff(
  currentRadioId: string | null | undefined,
  targetRadioId: string,
  isPlaying: boolean,
  isLoading: boolean,
  hasError: boolean,
): PlaybackHandoff {
  if (currentRadioId !== targetRadioId || hasError) return "start";
  if (!isPlaying && !isLoading) return "resume";
  return "none";
}

export function shouldAutoplayStation(currentRadioId: string | null | undefined, targetRadioId: string, isPlaying: boolean): boolean {
  return currentRadioId !== targetRadioId || !isPlaying;
}

/** Classifies a horizontal gesture using distance plus a small velocity projection. */
export function horizontalSwipeDirection(
  translationX: number,
  velocityX: number,
  options: { distance?: number; velocity?: number; projectionFactor?: number } = {},
): -1 | 0 | 1 {
  const distance = options.distance ?? 34;
  const velocity = options.velocity ?? 300;
  const projectionFactor = options.projectionFactor ?? 0.2;
  const projectedTranslation = translationX + velocityX * projectionFactor;
  if (Math.abs(projectedTranslation) < distance && Math.abs(velocityX) < velocity) return 0;
  return projectedTranslation < 0 ? 1 : -1;
}

export type LockScreenMetadata = {
  title: string;
  artist: string;
  albumTitle: string;
  artworkUrl?: string;
  radioId?: string;
};

export type LockScreenNowPlaying = {
  available?: boolean;
  title?: string | null;
  artist?: string | null;
};

export function lockScreenMetadata(radio: Radio, nowPlaying?: LockScreenNowPlaying): LockScreenMetadata {
  const title = nowPlaying?.title?.trim();
  const artist = nowPlaying?.artist?.trim();
  const hasIcyMetadata = Boolean(nowPlaying?.available && (title || artist));

  return {
    title: hasIcyMetadata && title ? title : radio.name,
    artist: hasIcyMetadata && artist ? artist : `${radio.frequency} · ${radio.genre}`,
    albumTitle: "Radio Chile Glass",
    radioId: radio.id,
    ...(radio.favicon ? { artworkUrl: radio.favicon } : {}),
  };
}

/**
 * Parses ICY stream metadata to extract artist and title.
 * Common format: "Artist - Title" or just "Title"
 */
export function parseICYMetadata(streamTitle: string): { artist?: string; title?: string } {
  if (!streamTitle || typeof streamTitle !== 'string') {
    return { title: undefined, artist: undefined };
  }
  
  const trimmed = streamTitle.trim();
  if (!trimmed) {
    return { title: undefined, artist: undefined };
  }
  
  // Try to split by " - " (common ICY format)
  const parts = trimmed.split(' - ');
  
  if (parts.length >= 2) {
    // First part is artist, rest is title (in case title contains " - ")
    const artist = parts[0].trim();
    const title = parts.slice(1).join(' - ').trim();
    
    // Validate that artist looks like an artist name (not empty or too short)
    if (artist.length > 1 && title.length > 0) {
      return { artist, title };
    }
  }
  
  // If no valid split, treat entire string as title
  return { title: trimmed, artist: undefined };
}

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

/** Keeps a carousel index inside the available catalog, or returns -1 when empty/invalid. */
export function safeRadioIndex(length: number, currentIndex: number): number {
  if (length < 1 || !Number.isFinite(currentIndex)) return -1;
  return Math.max(0, Math.min(length - 1, Math.trunc(currentIndex)));
}

/** Returns whether opening a station should start or restart its stream. */
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

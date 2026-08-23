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

export const MAX_PLAYBACK_RETRIES = 3;

export function retryDelayMs(attempt: number): number {
  return [0, 800, 1800, 3500][Math.max(0, Math.min(attempt, MAX_PLAYBACK_RETRIES))];
}

export function adjacentRadioIndex(length: number, currentIndex: number, direction: -1 | 1): number {
  if (length < 1 || currentIndex < 0) return -1;
  return (currentIndex + direction + length) % length;
}

export type LockScreenMetadata = {
  title: string;
  artist: string;
  albumTitle: string;
  artworkUrl?: string;
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
    ...(radio.favicon ? { artworkUrl: radio.favicon } : {}),
  };
}

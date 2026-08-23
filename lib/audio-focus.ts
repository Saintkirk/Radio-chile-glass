import type { EventSubscription } from "expo-modules-core";

export type AudioFocusChange = "gain" | "loss" | "loss_transient" | "loss_transient_can_duck" | "unknown";

export type AudioFocusChangeEvent = {
  change: AudioFocusChange;
  rawChange: number;
};

/**
 * Safe fallback until a compiled native AudioFocus module is present.
 * expo-audio still owns playback and background media behavior.
 */
export function addAudioFocusChangeListener(
  _listener: (event: AudioFocusChangeEvent) => void,
): EventSubscription {
  return { remove: () => undefined } as EventSubscription;
}

export function requestAudioFocus(): "granted" | "delayed" | "failed" | "unavailable" {
  return "granted";
}

export function abandonAudioFocus(): void {
  // No native focus handle to release in the safe fallback.
}

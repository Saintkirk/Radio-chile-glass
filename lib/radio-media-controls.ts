import { DeviceEventEmitter, NativeModules, Platform } from "react-native";

export type RadioMediaAction = "play" | "pause" | "next" | "previous" | "stop";

export type RadioMediaMetadata = {
  title: string;
  artist: string;
  artworkUrl?: string;
  radioId?: string;
};

const nativeControls = Platform.OS === "android" ? NativeModules.RadioMediaControls : undefined;
const EVENT_NAME = "RadioMediaControls.action";

export function setNativeMediaSession(metadata: RadioMediaMetadata, playing: boolean): void {
  if (!nativeControls) return;
  try {
    nativeControls.activate(metadata.title, metadata.artist, metadata.artworkUrl ?? null, playing, metadata.radioId ?? null);
  } catch {
    // Native controls are optional; regular in-app playback must remain functional.
  }
}

export function updateNativeMediaState(playing: boolean): void {
  if (!nativeControls) return;
  try {
    nativeControls.updatePlaybackState(playing);
  } catch {
    // No-op on unsupported or unavailable native builds.
  }
}

export function updateNativeMediaMetadata(metadata: RadioMediaMetadata): void {
  if (!nativeControls) return;
  try {
    nativeControls.updateMetadata(metadata.title, metadata.artist, metadata.artworkUrl ?? null, metadata.radioId ?? null);
  } catch {
    // No-op on unsupported or unavailable native builds.
  }
}

export function clearNativeMediaSession(): void {
  if (!nativeControls) return;
  try {
    nativeControls.deactivate();
  } catch {
    // No-op on unsupported or unavailable native builds.
  }
}

export function subscribeToNativeMediaActions(listener: (action: RadioMediaAction) => void): { remove: () => void } {
  if (!nativeControls) return { remove: () => undefined };
  const subscription = DeviceEventEmitter.addListener(EVENT_NAME, (event: { action?: RadioMediaAction }) => {
    if (event?.action) listener(event.action);
  });
  return subscription;
}

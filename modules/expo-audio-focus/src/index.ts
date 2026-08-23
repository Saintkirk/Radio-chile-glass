import { NativeModule, requireOptionalNativeModule } from "expo";
import type { EventSubscription } from "expo-modules-core";

export type AudioFocusChange = "gain" | "loss" | "loss_transient" | "loss_transient_can_duck" | "unknown";

export type AudioFocusChangeEvent = {
  change: AudioFocusChange;
  rawChange: number;
};

type AudioFocusEvents = {
  onAudioFocusChange: (event: AudioFocusChangeEvent) => void;
};

class ExpoAudioFocusModule extends NativeModule<AudioFocusEvents> {
  requestFocus!: () => "granted" | "delayed" | "failed";
  abandonFocus!: () => void;
}

const nativeModule = requireOptionalNativeModule<ExpoAudioFocusModule>("ExpoAudioFocus");

export function addAudioFocusChangeListener(listener: (event: AudioFocusChangeEvent) => void): EventSubscription {
  if (!nativeModule) return { remove: () => undefined } as EventSubscription;
  return nativeModule.addListener("onAudioFocusChange", listener);
}

export function requestAudioFocus(): "granted" | "delayed" | "failed" | "unavailable" {
  return nativeModule?.requestFocus() ?? "unavailable";
}

export function abandonAudioFocus(): void {
  nativeModule?.abandonFocus();
}

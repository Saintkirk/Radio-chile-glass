import type { EventSubscription } from "expo-modules-core";
import { DeviceEventEmitter, NativeModules, Platform } from "react-native";

export type AudioFocusChange = "gain" | "loss" | "loss_transient" | "loss_transient_can_duck" | "unknown";
export type AudioFocusRequestResult = "granted" | "delayed" | "failed" | "unavailable";

export type AudioFocusChangeEvent = {
  change: AudioFocusChange;
  rawChange: number;
};

export const NATIVE_AUDIO_FOCUS_EVENT = "RadioMediaControls.audioFocus";
export const AUDIO_FOCUS_REQUEST_TIMEOUT_MS = 1200;

export type NativeAudioFocusModule = {
  requestAudioFocus?: () => Promise<AudioFocusRequestResult>;
  abandonAudioFocus?: () => void;
};

function getNativeAudioFocusModule(): NativeAudioFocusModule | null {
  if (Platform.OS !== "android") return null;
  return (NativeModules.RadioMediaControls as NativeAudioFocusModule | undefined) ?? null;
}

export function normalizeAudioFocusRequestResult(result: unknown): AudioFocusRequestResult {
  return result === "granted" || result === "delayed" || result === "failed" || result === "unavailable" ? result : "failed";
}

export function normalizeNativeAudioFocusChange(rawChange: number): AudioFocusChange {
  if (rawChange === 1) return "gain";
  if (rawChange === -1) return "loss";
  if (rawChange === -2) return "loss_transient";
  if (rawChange === -3) return "loss_transient_can_duck";
  return "unknown";
}

export function addAudioFocusChangeListener(
  listener: (event: AudioFocusChangeEvent) => void,
): EventSubscription {
  if (Platform.OS !== "android" || !getNativeAudioFocusModule()) {
    return { remove: () => undefined } as EventSubscription;
  }

  return DeviceEventEmitter.addListener(NATIVE_AUDIO_FOCUS_EVENT, (payload?: { rawChange?: number; change?: AudioFocusChange }) => {
    const rawChange = typeof payload?.rawChange === "number" ? payload.rawChange : 0;
    const change = payload?.change ?? normalizeNativeAudioFocusChange(rawChange);
    listener({ rawChange, change });
  });
}

/** Requests media focus from an injected module so the timeout is deterministic in tests. */
export async function requestAudioFocusFromModule(
  nativeModule: NativeAudioFocusModule | null | undefined,
  timeoutMs = AUDIO_FOCUS_REQUEST_TIMEOUT_MS,
): Promise<AudioFocusRequestResult> {
  if (!nativeModule?.requestAudioFocus) return "unavailable";

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<AudioFocusRequestResult>((resolve) => {
      timeoutHandle = setTimeout(() => resolve("unavailable"), timeoutMs);
    });
    const result = await Promise.race([nativeModule.requestAudioFocus(), timeout]);
    return normalizeAudioFocusRequestResult(result);
  } catch {
    return "failed";
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

/** Requests media focus and reports the native Android result. */
export async function requestAudioFocus(): Promise<AudioFocusRequestResult> {
  return requestAudioFocusFromModule(getNativeAudioFocusModule());
}

export function abandonAudioFocus(): void {
  const nativeModule = getNativeAudioFocusModule();
  try {
    nativeModule?.abandonAudioFocus?.();
  } catch {
    // Focus cleanup is best effort during teardown.
  }
}

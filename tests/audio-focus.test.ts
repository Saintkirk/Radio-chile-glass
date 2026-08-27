import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  DeviceEventEmitter: { addListener: vi.fn(() => ({ remove: vi.fn() })) },
  NativeModules: {},
  Platform: { OS: "web" },
}));

import {
  addAudioFocusChangeListener,
  abandonAudioFocus,
  normalizeAudioFocusRequestResult,
  normalizeNativeAudioFocusChange,
  requestAudioFocus,
  requestAudioFocusFromModule,
} from "../lib/audio-focus";

describe("safe audio focus fallback", () => {
  it("reports unavailable when native focus is unavailable", async () => {
    await expect(requestAudioFocus()).resolves.toBe("unavailable");
  });

  it("returns a removable no-op subscription outside Android", () => {
    const subscription = addAudioFocusChangeListener(vi.fn());
    expect(() => subscription.remove()).not.toThrow();
    expect(() => abandonAudioFocus()).not.toThrow();
  });
});

describe("audio focus request with native module", () => {
  it("returns the native granted result", async () => {
    const nativeModule = { requestAudioFocus: vi.fn().mockResolvedValue("granted") };

    await expect(requestAudioFocusFromModule(nativeModule, 20)).resolves.toBe("granted");
    expect(nativeModule.requestAudioFocus).toHaveBeenCalledTimes(1);
  });

  it("normalizes a native rejection as failed", async () => {
    const nativeModule = { requestAudioFocus: vi.fn().mockRejectedValue(new Error("focus error")) };

    await expect(requestAudioFocusFromModule(nativeModule, 20)).resolves.toBe("failed");
  });

  it("does not block playback when the native promise never resolves", async () => {
    vi.useFakeTimers();
    try {
      const nativeModule = {
        requestAudioFocus: vi.fn(() => new Promise<"granted">(() => undefined)),
      };
      const resultPromise = requestAudioFocusFromModule(nativeModule, 100);

      await vi.advanceTimersByTimeAsync(100);
      await expect(resultPromise).resolves.toBe("unavailable");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("audio focus request result normalization", () => {
  it.each([
    ["granted", "granted"],
    ["delayed", "delayed"],
    ["failed", "failed"],
    ["unavailable", "unavailable"],
    ["unexpected", "failed"],
    [null, "failed"],
  ] as const)("normalizes %s to %s", (result, expected) => {
    expect(normalizeAudioFocusRequestResult(result)).toBe(expected);
  });
});

describe("native audio focus normalization", () => {
  it.each([
    [1, "gain"],
    [-1, "loss"],
    [-2, "loss_transient"],
    [-3, "loss_transient_can_duck"],
    [0, "unknown"],
  ] as const)("maps Android change %s to %s", (rawChange, expected) => {
    expect(normalizeNativeAudioFocusChange(rawChange)).toBe(expected);
  });
});

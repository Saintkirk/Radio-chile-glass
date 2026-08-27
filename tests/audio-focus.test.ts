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

describe("audio focus request result normalization", () => {
  it.each([
    ["granted", "granted"],
    ["delayed", "delayed"],
    ["failed", "failed"],
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

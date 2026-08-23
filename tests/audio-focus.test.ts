import { describe, expect, it, vi } from "vitest";

import { addAudioFocusChangeListener, abandonAudioFocus, requestAudioFocus } from "../lib/audio-focus";

describe("safe audio focus fallback", () => {
  it("allows playback when native focus is unavailable", () => {
    expect(requestAudioFocus()).toBe("granted");
  });

  it("returns a removable no-op subscription", () => {
    const subscription = addAudioFocusChangeListener(vi.fn());
    expect(() => subscription.remove()).not.toThrow();
    expect(() => abandonAudioFocus()).not.toThrow();
  });
});

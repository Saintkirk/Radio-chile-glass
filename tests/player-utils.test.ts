import { describe, expect, it } from "vitest";
import { adjacentRadioIndex, isRadioPlaying, playbackStatus, retryDelayMs, toggleFavoriteId } from "../lib/player-utils";

const radio = {
  id: "fmlatina",
  name: "FM Latina",
  frequency: "89.1 FM",
  city: "Santiago",
  genre: "Pop latino",
  description: "Radio chilena.",
  streamUrl: "https://example.com/live",
  initials: "FL",
  accent: "#D94B4B",
} as const;

describe("player interaction utilities", () => {
  it("adds and removes a favorite without mutating the original list", () => {
    const original = ["cooperativa"];
    const added = toggleFavoriteId(original, "fmlatina");
    const removed = toggleFavoriteId(added, "cooperativa");

    expect(added).toEqual(["cooperativa", "fmlatina"]);
    expect(removed).toEqual(["fmlatina"]);
    expect(original).toEqual(["cooperativa"]);
  });

  it("only reports playing when the active radio matches", () => {
    expect(isRadioPlaying(radio, "fmlatina", true)).toBe(true);
    expect(isRadioPlaying(radio, "cooperativa", true)).toBe(false);
    expect(isRadioPlaying(radio, "fmlatina", false)).toBe(false);
  });

  it("maps loading and playback state to accessible labels", () => {
    expect(playbackStatus(true, false)).toBe("connecting");
    expect(playbackStatus(false, true)).toBe("playing");
    expect(playbackStatus(false, false)).toBe("ready");
  });

  it("wraps previous and next navigation around the radio catalog", () => {
    expect(adjacentRadioIndex(4, 0, -1)).toBe(3);
    expect(adjacentRadioIndex(4, 3, 1)).toBe(0);
    expect(adjacentRadioIndex(0, 0, 1)).toBe(-1);
  });

  it("uses bounded progressive retry delays", () => {
    expect(retryDelayMs(0)).toBe(0);
    expect(retryDelayMs(1)).toBe(800);
    expect(retryDelayMs(2)).toBe(1800);
    expect(retryDelayMs(3)).toBe(3500);
    expect(retryDelayMs(99)).toBe(3500);
  });
});

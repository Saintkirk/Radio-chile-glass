import { describe, expect, it } from "vitest";
import { adjacentRadioIndex, audioFocusAction, isCurrentPlaybackRequest, isRadioPlaying, lockScreenMetadata, playbackStatus, retryDelayMs, toggleFavoriteId } from "../lib/player-utils";

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

  it("ignores stale playback callbacks after a newer station request", () => {
    expect(isCurrentPlaybackRequest(4, 4)).toBe(true);
    expect(isCurrentPlaybackRequest(3, 4)).toBe(false);
  });

  it("maps Android audio focus transitions to safe player actions", () => {
    expect(audioFocusAction("gain")).toBe("restore");
    expect(audioFocusAction("loss")).toBe("pause");
    expect(audioFocusAction("loss_transient")).toBe("pause");
    expect(audioFocusAction("loss_transient_can_duck")).toBe("duck");
    expect(audioFocusAction("unknown")).toBe("none");
  });

  it("uses bounded progressive retry delays", () => {
    expect(retryDelayMs(0)).toBe(0);
    expect(retryDelayMs(1)).toBe(800);
    expect(retryDelayMs(2)).toBe(1800);
    expect(retryDelayMs(3)).toBe(3500);
    expect(retryDelayMs(99)).toBe(3500);
  });

  it("builds lock screen metadata from the active station", () => {
    expect(lockScreenMetadata({ ...radio, favicon: "https://example.com/logo.png" })).toEqual({
      title: "FM Latina",
      artist: "89.1 FM · Pop latino",
      albumTitle: "Radio Chile Glass",
      artworkUrl: "https://example.com/logo.png",
      radioId: "fmlatina",
    });
  });

  it("uses dynamic ICY title and artist when available", () => {
    expect(lockScreenMetadata(radio, { available: true, title: "Lamento Boliviano", artist: "Los Enanitos Verdes" })).toMatchObject({
      title: "Lamento Boliviano",
      artist: "Los Enanitos Verdes",
    });
  });

  it("keeps station fallback when ICY metadata is unavailable", () => {
    expect(lockScreenMetadata(radio, { available: false, title: null, artist: null })).toMatchObject({
      title: "FM Latina",
      artist: "89.1 FM · Pop latino",
    });
  });
});

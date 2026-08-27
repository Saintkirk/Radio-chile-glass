import { describe, expect, it } from "vitest";
import { adjacentRadioIndex, audioFocusAction, carouselSettleMode, horizontalSwipeDirection, isCurrentPlaybackRequest, isCurrentRadioId, isPlaybackConfirmed, isRadioPlaying, lockScreenMetadata, playbackStatus, retryDelayMs, safeRadioIndex, shouldAutoplayStation, shouldContinueCrossfade, toggleFavoriteId } from "../lib/player-utils";

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

  it("does not confirm a player while it is buffering", () => {
    expect(isPlaybackConfirmed({ playing: false, isLoaded: false, isBuffering: true })).toBe(false);
    expect(isPlaybackConfirmed({ playing: true, isLoaded: true, isBuffering: true })).toBe(false);
  });

  it("confirms playback only after the native player is loaded and audible", () => {
    expect(isPlaybackConfirmed({ playing: true, isLoaded: true, isBuffering: false })).toBe(true);
    expect(isPlaybackConfirmed({ playing: true, isLoaded: false, isBuffering: false })).toBe(false);
    expect(isPlaybackConfirmed({ playing: false, isLoaded: true, isBuffering: false })).toBe(false);
  });

  it("wraps previous and next navigation around the radio catalog", () => {
    expect(adjacentRadioIndex(4, 0, -1)).toBe(3);
    expect(adjacentRadioIndex(4, 3, 1)).toBe(0);
    expect(adjacentRadioIndex(0, 0, 1)).toBe(-1);
  });

  it("starts autoplay when opening a different or paused station", () => {
    expect(shouldAutoplayStation("fmlatina", "cooperativa", true)).toBe(true);
    expect(shouldAutoplayStation("fmlatina", "fmlatina", false)).toBe(true);
    expect(shouldAutoplayStation("fmlatina", "fmlatina", true)).toBe(false);
  });

  it("clamps invalid carousel indexes without creating out-of-range access", () => {
    expect(safeRadioIndex(4, -10)).toBe(0);
    expect(safeRadioIndex(4, 99)).toBe(3);
    expect(safeRadioIndex(4, 1.9)).toBe(1);
    expect(safeRadioIndex(0, 0)).toBe(-1);
    expect(safeRadioIndex(4, Number.NaN)).toBe(-1);
  });

  it("accepts short flicks and keeps tiny taps centered", () => {
    expect(horizontalSwipeDirection(-20, -100)).toBe(1);
    expect(horizontalSwipeDirection(0, 420)).toBe(-1);
    expect(horizontalSwipeDirection(8, 20)).toBe(0);
  });

  it("keeps extreme flicks bounded to one navigation direction", () => {
    expect(horizontalSwipeDirection(-500, -2200)).toBe(1);
    expect(horizontalSwipeDirection(500, 2200)).toBe(-1);
  });

  it("ignores stale playback callbacks after a newer station request", () => {
    expect(isCurrentPlaybackRequest(4, 4)).toBe(true);
    expect(isCurrentPlaybackRequest(3, 4)).toBe(false);
  });

  it("invalidates a crossfade when its request or token is stale", () => {
    expect(shouldContinueCrossfade(4, 4, 8, 8)).toBe(true);
    expect(shouldContinueCrossfade(4, 5, 8, 8)).toBe(false);
    expect(shouldContinueCrossfade(4, 4, 7, 8)).toBe(false);
  });

  it("accepts metadata only from the current radio", () => {
    expect(isCurrentRadioId("fmlatina", "fmlatina")).toBe(true);
    expect(isCurrentRadioId("fmlatina", "cooperativa")).toBe(false);
    expect(isCurrentRadioId("fmlatina", null)).toBe(false);
    expect(isCurrentRadioId(null, "fmlatina")).toBe(false);
  });

  it("keeps the deck continuous after a swipe commit", () => {
    expect(carouselSettleMode(true, false)).toBe("gesture");
    expect(carouselSettleMode(false, false)).toBe("entrance");
    expect(carouselSettleMode(true, true)).toBe("instant");
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

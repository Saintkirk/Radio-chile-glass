import { describe, expect, it } from "vitest";
import {
  dialStatusLabel,
  isLiveBadgeVisible,
  playbackControlLabel,
  stationPlaybackPhase,
} from "../lib/player-utils";

describe("stationPlaybackPhase", () => {
  it("is idle when another station is active", () => {
    expect(stationPlaybackPhase("adn", "futuro", true, false, false)).toBe("idle");
  });

  it("prioritizes error over loading for the active station", () => {
    expect(stationPlaybackPhase("adn", "adn", false, true, true)).toBe("error");
  });

  it("reports connecting then playing", () => {
    expect(stationPlaybackPhase("adn", "adn", false, true, false)).toBe("connecting");
    expect(stationPlaybackPhase("adn", "adn", true, false, false)).toBe("playing");
  });
});

describe("live badge and dial copy", () => {
  it("only shows EN VIVO while playing", () => {
    expect(isLiveBadgeVisible("playing")).toBe(true);
    expect(isLiveBadgeVisible("connecting")).toBe(false);
    expect(isLiveBadgeVisible("idle")).toBe(false);
    expect(isLiveBadgeVisible("error")).toBe(false);
  });

  it("maps labels for each phase", () => {
    expect(dialStatusLabel("connecting")).toBe("CONECTANDO");
    expect(dialStatusLabel("playing")).toBe("REPRODUCIENDO");
    expect(dialStatusLabel("error")).toBe("SIN SEÑAL");
    expect(dialStatusLabel("idle")).toBe("LISTA PARA ESCUCHAR");
    expect(playbackControlLabel("error", "ADN")).toBe("Reintentar ADN");
    expect(playbackControlLabel("playing", "ADN")).toBe("Pausar ADN");
  });
});

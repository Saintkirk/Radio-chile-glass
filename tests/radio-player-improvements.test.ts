import { describe, it, expect, beforeEach, vi } from "vitest";
import { validateStreamUrl } from "../lib/radios";
import { adaptiveRetryDelayMs, parseICYMetadata, shouldContinueCrossfade } from "../lib/player-utils";

describe("Mejoras de Radio Player", () => {
  describe("validateStreamUrl", () => {
    it("debe validar URLs HTTPS válidas", () => {
      const result = validateStreamUrl("https://stream.example.com/radio.mp3");
      expect(result.valid).toBe(true);
    });

    it("debe validar URLs HTTP válidas (con warning)", () => {
      const result = validateStreamUrl("http://stream.example.com/radio.mp3");
      expect(result.valid).toBe(true);
    });

    it("debe rechazar URLs vacías", () => {
      const result = validateStreamUrl("");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("vacía");
    });

    it("debe rechazar URLs mal formadas", () => {
      const result = validateStreamUrl("not-a-url");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("mal formada");
    });

    it("debe rechazar streams conocidos como rotos", () => {
      const result = validateStreamUrl("http://radio.digitalfm.cl:8000/stream");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("roto");
    });

    it("debe rechazar protocolos no soportados", () => {
      const result = validateStreamUrl("ftp://example.com/stream");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Protocolo no soportado");
    });
  });

  describe("adaptiveRetryDelayMs", () => {
    it("debe retornar 0 para el primer intento", () => {
      const delay = adaptiveRetryDelayMs(0);
      expect(delay).toBe(0);
    });

    it("debe incrementar exponencialmente con jitter", () => {
      const delays = Array.from({ length: 5 }, (_, i) => adaptiveRetryDelayMs(i));
      expect(delays[0]).toBe(0);
      expect(delays[1]).toBeGreaterThan(500);
      expect(delays[2]).toBeGreaterThan(delays[1]);
      expect(delays[3]).toBeGreaterThan(delays[2]);
    });

    it("debe aplicar multiplicador para errores de red", () => {
      const networkDelay = adaptiveRetryDelayMs(2, 'network');
      const streamDelay = adaptiveRetryDelayMs(2, 'stream');
      expect(networkDelay).toBeGreaterThan(streamDelay);
    });

    it("debe tener jitter aleatorio", () => {
      const delays = Array.from({ length: 10 }, () => adaptiveRetryDelayMs(2));
      const uniqueDelays = new Set(delays);
      // Con jitter, deberíamos ver variación en al menos algunos valores
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });

  describe("parseICYMetadata", () => {
    it("debe parsear formato 'Artista - Título'", () => {
      const result = parseICYMetadata("Queen - Bohemian Rhapsody");
      expect(result.artist).toBe("Queen");
      expect(result.title).toBe("Bohemian Rhapsody");
    });

    it("debe manejar títulos con ' - ' múltiples", () => {
      const result = parseICYMetadata("Artist - Title - Remix");
      expect(result.artist).toBe("Artist");
      expect(result.title).toBe("Title - Remix");
    });

    it("debe retornar solo título si no hay separador", () => {
      const result = parseICYMetadata("Solo Titulo");
      expect(result.artist).toBeUndefined();
      expect(result.title).toBe("Solo Titulo");
    });

    it("debe manejar strings vacíos", () => {
      const result = parseICYMetadata("");
      expect(result.artist).toBeUndefined();
      expect(result.title).toBeUndefined();
    });

    it("debe manejar null/undefined", () => {
      const result1 = parseICYMetadata(null as any);
      expect(result1.artist).toBeUndefined();
      expect(result1.title).toBeUndefined();
      
      const result2 = parseICYMetadata(undefined as any);
      expect(result2.artist).toBeUndefined();
      expect(result2.title).toBeUndefined();
    });

    it("debe trimitear espacios", () => {
      const result = parseICYMetadata("  Artist  -  Title  ");
      expect(result.artist).toBe("Artist");
      expect(result.title).toBe("Title");
    });
  });

  describe("shouldContinueCrossfade", () => {
    it("debe continuar cuando requestId y token coinciden", () => {
      const result = shouldContinueCrossfade(1, 1, 1, 1);
      expect(result).toBe(true);
    });

    it("debe cancelar si requestId cambia", () => {
      const result = shouldContinueCrossfade(1, 2, 1, 1);
      expect(result).toBe(false);
    });

    it("debe cancelar si token cambia", () => {
      const result = shouldContinueCrossfade(1, 1, 1, 2);
      expect(result).toBe(false);
    });
  });
});

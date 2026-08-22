import { describe, expect, it } from "vitest";
import { RADIOS } from "../lib/radios";

describe("catálogo de radios chilenas", () => {
  it("incluye FM Latina como radio destacada", () => {
    const fmLatina = RADIOS.find((radio) => radio.id === "fmlatina");
    expect(fmLatina?.name).toBe("FM Latina");
    expect(fmLatina?.featured).toBe(true);
  });

  it("mantiene stream, frecuencia y ciudad en cada emisora", () => {
    expect(RADIOS.length).toBeGreaterThanOrEqual(6);
    RADIOS.forEach((radio) => {
      expect(radio.streamUrl.startsWith("http")).toBe(true);
      expect(radio.frequency.length).toBeGreaterThan(0);
      expect(radio.city.length).toBeGreaterThan(0);
    });
  });
});

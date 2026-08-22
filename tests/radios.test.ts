import { describe, expect, it } from "vitest";
import { mergeCatalog, normalizeRemoteStations, RADIOS } from "../lib/radios";

describe("catálogo de radios chilenas", () => {
  it("incluye FM Latina como radio destacada", () => {
    const fmLatina = RADIOS.find((radio) => radio.id === "fmlatina");
    expect(fmLatina?.name).toBe("FM Latina");
    expect(fmLatina?.featured).toBe(true);
  });

  it("mantiene stream, frecuencia y ciudad en cada emisora editorial", () => {
    expect(RADIOS.length).toBeGreaterThanOrEqual(6);
    RADIOS.forEach((radio) => {
      expect(radio.streamUrl.startsWith("http")).toBe(true);
      expect(radio.frequency.length).toBeGreaterThan(0);
      expect(radio.city.length).toBeGreaterThan(0);
    });
  });

  it("normaliza estaciones chilenas válidas y descarta duplicados o streams rotos", () => {
    const result = normalizeRemoteStations([
      { stationuuid: "1", name: " Radio Nueva ", country: "Chile", state: "Valparaíso", tags: "pop", url_resolved: "https://example.com/live", lastcheckok: 1 },
      { stationuuid: "2", name: "Duplicada", country: "Chile", url_resolved: "https://example.com/live", lastcheckok: 1 },
      { stationuuid: "3", name: "Rota", country: "Chile", url_resolved: "https://example.com/off", lastcheckok: 0 },
      { stationuuid: "4", name: "Otro país", country: "Argentina", url_resolved: "https://example.com/ar", lastcheckok: 1 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Radio Nueva");
    expect(result[0].city).toBe("Valparaíso");
  });

  it("fusiona el remoto sin eliminar FM Latina", () => {
    const merged = mergeCatalog([{ id: "remote-1", name: "Nueva FM", frequency: "En línea", city: "Chile", genre: "Música", description: "", streamUrl: "https://new.example/live", initials: "NF", accent: "#64D8FF" }]);
    expect(merged.some((radio) => radio.id === "fmlatina")).toBe(true);
    expect(merged.some((radio) => radio.name === "Nueva FM")).toBe(true);
  });
});

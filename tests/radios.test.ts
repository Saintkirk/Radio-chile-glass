import { describe, expect, it } from "vitest";
import { mergeCatalog, normalizeRemoteStations, RADIOS } from "../lib/radios";

describe("catálogo de radios chilenas", () => {
  it("incluye FM Latina como radio destacada", () => {
    const fmLatina = RADIOS.find((radio) => radio.id === "fmlatina");
    expect(fmLatina?.name).toBe("FM Latina");
    expect(fmLatina?.featured).toBe(true);
    expect(fmLatina?.homepage).toBe("https://www.radiofmlatina.com/");
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

  it("excluye endpoints Digital FM que no responden", () => {
    const result = normalizeRemoteStations([
      { stationuuid: "digital", name: "Digital FM Concepción", country: "Chile", state: "Biobío", tags: "music", url_resolved: "https://radio.digitalfm.cl:8000/concepcion1", lastcheckok: 1 },
      { stationuuid: "healthy", name: "Radio Saludable", country: "Chile", state: "Santiago", tags: "music", url_resolved: "https://healthy.example/live", lastcheckok: 1 },
    ]);
    expect(result.map((radio) => radio.name)).toEqual(["Radio Saludable"]);
  });

  it("usa el favicon del homepage cuando la fuente remota no entrega uno", () => {
    const result = normalizeRemoteStations([
      { stationuuid: "home", name: "Radio Homepage", country: "Chile", homepage: "https://radio.example.cl/", url_resolved: "https://radio.example.cl/live", lastcheckok: 1 },
    ]);
    expect(result[0].favicon).toBe("https://radio.example.cl/favicon.ico");
  });

  it("fusiona el remoto sin eliminar FM Latina", () => {
    const merged = mergeCatalog([{ id: "remote-1", name: "Nueva FM", frequency: "En línea", city: "Chile", genre: "Música", description: "", streamUrl: "https://new.example/live", initials: "NF", accent: "#64D8FF" }]);
    expect(merged.some((radio) => radio.id === "fmlatina")).toBe(true);
    expect(merged.some((radio) => radio.name === "Nueva FM")).toBe(true);
  });
});

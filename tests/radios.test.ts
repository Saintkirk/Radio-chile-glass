import { describe, expect, it } from "vitest";
import { mergeCatalog, normalizeRemoteStations, RADIOS, regionFromCity, selectStartupRadio } from "../lib/radios";

describe("catálogo de radios chilenas", () => {
  it("incluye FM Latina como radio destacada", () => {
    const fmLatina = RADIOS.find((radio) => radio.id === "fmlatina");
    expect(fmLatina?.name).toBe("FM Latina");
    expect(fmLatina?.featured).toBe(true);
    expect(fmLatina?.homepage).toBe("https://www.radiofmlatina.com/");
  });

  it("mantiene la señal y el logo oficial de Radio Carolina", () => {
    const carolina = RADIOS.find((radio) => radio.id === "carolina");
    expect(carolina?.frequency).toBe("99.3 FM");
    expect(carolina?.streamUrl).toBe("https://stream.zeno.fm/sri2de2qdlivv");
    expect(carolina?.favicon).toContain("carolina-online.png");
  });

  it("usa el stream MP3 vigente y la identidad oficial de Radio Cooperativa", () => {
    const cooperativa = RADIOS.find((radio) => radio.id === "cooperativa");
    expect(cooperativa?.frequency).toBe("93.3 FM");
    expect(cooperativa?.streamUrl).toBe("https://redirector.dps.live/cooperativafm/mp3/icecast.audio");
    expect(cooperativa?.homepage).toBe("https://cooperativa.cl/");
    expect(cooperativa?.favicon).toBe("https://www.cooperativa.cl/favicon.ico");
  });

  it("mantiene stream, frecuencia y ciudad en cada emisora editorial", () => {
    expect(RADIOS.length).toBeGreaterThanOrEqual(6);
    RADIOS.forEach((radio) => {
      expect(radio.streamUrl.startsWith("http")).toBe(true);
      expect(radio.frequency.length).toBeGreaterThan(0);
      expect(radio.city.length).toBeGreaterThan(0);
    });
  });

  it("mantiene una selección amplia de emisoras destacadas para Inicio", () => {
    expect(RADIOS.filter((radio) => radio.featured).length).toBeGreaterThanOrEqual(15);
    expect(RADIOS.filter((radio) => radio.featured && radio.favicon).length).toBeGreaterThanOrEqual(15);
  });

  it("entrega portada para cada emisora editorial destacada", () => {
    const featured = RADIOS.filter((radio) => radio.featured);
    expect(featured.length).toBeGreaterThan(0);
    featured.forEach((radio) => expect(radio.favicon, radio.id).toMatch(/^https?:\/\//));
  });

  it("incluye emisoras adicionales verificadas de Santiago", () => {
    expect(RADIOS.map((radio) => radio.id)).toEqual(expect.arrayContaining(["play-fm", "conquistador", "rock-pop", "la-clave", "13c", "la-mexicana", "carnaval-la-serena"]));
    expect(RADIOS.some((radio) => radio.id === "radio-maria")).toBe(false);
    expect(RADIOS.filter((radio) => radio.city === "Santiago").length).toBeGreaterThanOrEqual(20);
  });

  it("mantiene homepage y logo verificable en las nuevas emisoras editoriales", () => {
    ["13c", "la-mexicana", "carnaval-la-serena", "radio-recuerdos", "rock-pop"].forEach((id) => {
      const radio = RADIOS.find((item) => item.id === id);
      expect(radio?.homepage?.startsWith("http")).toBe(true);
      expect(radio?.favicon?.startsWith("http")).toBe(true);
      expect(radio?.region).toBeTruthy();
    });
  });

  it("clasifica ciudades chilenas en sus regiones", () => {
    expect(regionFromCity("Santiago")).toBe("Región Metropolitana");
    expect(regionFromCity("Valparaíso")).toBe("Valparaíso");
    expect(regionFromCity("Temuco")).toBe("La Araucanía");
    expect(regionFromCity("Puerto Montt")).toBe("Los Lagos");
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

  it("conserva un fallback de iniciales cuando falta el logo", () => {
    const result = normalizeRemoteStations([
      { stationuuid: "no-logo", name: "Radio Sin Logo", country: "Chile", url_resolved: "https://radio.example.cl/live", lastcheckok: 1 },
    ]);
    expect(result[0].favicon).toBeUndefined();
    expect(result[0].initials).toBe("RS");
  });

  it("selecciona la última emisora válida al arrancar sin conexión", () => {
    expect(selectStartupRadio(RADIOS, "carolina")?.id).toBe("carolina");
  });

  it("usa la primera emisora del catálogo cuando la última ya no existe", () => {
    expect(selectStartupRadio(RADIOS, "radio-eliminada")?.id).toBe(RADIOS[0].id);
  });

  it("usa el fallback editorial cuando el catálogo offline está vacío", () => {
    expect(selectStartupRadio([], null)?.id).toBe(RADIOS[0].id);
  });

  it("mantiene textos largos seguros para renderizar en tarjetas", () => {
    const longName = "Radio Metropolitana de Noticias y Música en Vivo";
    const result = normalizeRemoteStations([
      { stationuuid: "long-text", name: longName, country: "Chile", url_resolved: "https://radio.example.cl/live", lastcheckok: 1 },
    ]);
    expect(result[0].name).toBe(longName);
    expect(result[0].name.length).toBeGreaterThan(32);
  });

  it("fusiona el remoto sin eliminar FM Latina", () => {
    const merged = mergeCatalog([{ id: "remote-1", name: "Nueva FM", frequency: "En línea", city: "Chile", genre: "Música", description: "", streamUrl: "https://new.example/live", initials: "NF", accent: "#64D8FF" }]);
    expect(merged.some((radio) => radio.id === "fmlatina")).toBe(true);
    expect(merged.some((radio) => radio.name === "Nueva FM")).toBe(true);
  });
});

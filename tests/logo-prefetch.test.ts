import { describe, expect, it } from "vitest";
import { getLogoPrefetchUris } from "../lib/logo-prefetch";

describe("ventana de precarga de portadas", () => {
  it("prioriza el centro y luego los vecinos sin duplicar URIs", () => {
    const radios = [
      { id: "a", favicon: "https://img/a.png" },
      { id: "b", favicon: "https://img/shared.png" },
      { id: "c", favicon: "https://img/c.png" },
      { id: "d", favicon: "https://img/shared.png" },
    ];

    expect(getLogoPrefetchUris(radios, 1, 1)).toEqual([
      "https://img/shared.png",
      "https://img/a.png",
      "https://img/c.png",
    ]);
  });

  it("envuelve la ventana al llegar al principio o al final", () => {
    const radios = [
      { id: "a", favicon: "https://img/a.png" },
      { id: "b", favicon: "https://img/b.png" },
      { id: "c", favicon: "https://img/c.png" },
    ];

    expect(getLogoPrefetchUris(radios, 0, 1)).toEqual([
      "https://img/a.png",
      "https://img/c.png",
      "https://img/b.png",
    ]);
  });

  it("ignora radios sin favicon y un catálogo vacío", () => {
    expect(getLogoPrefetchUris([], 0)).toEqual([]);
    expect(getLogoPrefetchUris([{ id: "sin-logo" }], 0)).toEqual([]);
  });
});


describe("identidad monotónica del artwork", () => {
  it("solo permite promover el callback de la emisora vigente", async () => {
    const { canCommitLogo, getLogoSourceKey } = await import("../lib/logo-transition");
    const currentKey = getLogoSourceKey("radio-nueva", "nueva.png");
    const previousKey = getLogoSourceKey("radio-anterior", "anterior.png");

    expect(currentKey).toBe("radio-nueva:nueva.png");
    expect(previousKey).toBe("radio-anterior:anterior.png");
    expect(canCommitLogo(currentKey, previousKey)).toBe(false);
    expect(canCommitLogo(currentKey, currentKey)).toBe(true);
    expect(getLogoSourceKey("radio-nueva", "otra-nueva.png")).not.toBe(currentKey);
  });
});

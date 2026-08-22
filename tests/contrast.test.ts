import { describe, expect, it } from "vitest";
import { contrastRatio } from "../lib/contrast";

type ContrastCase = { name: string; foreground: string; background: string; minimum: number };

const cardContrastCases: ContrastCase[] = [
  { name: "texto principal claro", foreground: "#172033", background: "#FFFFFF", minimum: 4.5 },
  { name: "metadato claro", foreground: "#5B667B", background: "#FFFFFF", minimum: 4.5 },
  { name: "corazón activo claro", foreground: "#D64E4A", background: "#FFFFFF", minimum: 3 },
  { name: "control claro", foreground: "#F8FAFC", background: "#172033", minimum: 3 },
  { name: "texto principal oscuro", foreground: "#F5F3EE", background: "#151718", minimum: 4.5 },
  { name: "metadato oscuro", foreground: "#8D95A7", background: "#151718", minimum: 4.5 },
  { name: "corazón activo oscuro", foreground: "#FF6B5F", background: "#151718", minimum: 3 },
  { name: "control oscuro", foreground: "#F5F3EE", background: "#1D2333", minimum: 3 },
];

describe("Accesibilidad visual de tarjetas", () => {
  it.each(cardContrastCases)("cumple contraste mínimo: $name", ({ foreground, background, minimum }) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });

  it("calcula correctamente la relación de contraste máxima", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });
});

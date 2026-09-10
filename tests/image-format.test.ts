import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "android", Version: 34 },
}));

describe("modern image format cascade", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("prefers AVIF then WebP then original on Android 12+", async () => {
    vi.doMock("react-native", () => ({
      Platform: { OS: "android", Version: 34 },
    }));
    const { modernImageSources, preferredImageUri, imagePrefetchCandidates } = await import(
      "../lib/image-format"
    );
    const uri = "https://cdn.example.com/logos/adn.png";
    expect(modernImageSources(uri).map((s) => s.uri)).toEqual([
      "https://cdn.example.com/logos/adn.avif",
      "https://cdn.example.com/logos/adn.webp",
      "https://cdn.example.com/logos/adn.png",
    ]);
    expect(preferredImageUri(uri)).toBe("https://cdn.example.com/logos/adn.avif");
    expect(imagePrefetchCandidates(uri)[0]).toContain(".avif");
  });

  it("skips AVIF on older Android but still offers WebP", async () => {
    vi.doMock("react-native", () => ({
      Platform: { OS: "android", Version: 28 },
    }));
    const { modernImageSources } = await import("../lib/image-format");
    expect(modernImageSources("https://x.test/a.jpg").map((s) => s.uri)).toEqual([
      "https://x.test/a.webp",
      "https://x.test/a.jpg",
    ]);
  });

  it("preserves query strings when swapping extensions", async () => {
    vi.doMock("react-native", () => ({
      Platform: { OS: "ios", Version: "17.2" },
    }));
    const { replaceImageExtension, modernImageSources } = await import("../lib/image-format");
    expect(replaceImageExtension("https://cdn/x.png?w=128", "webp")).toBe(
      "https://cdn/x.webp?w=128",
    );
    const sources = modernImageSources("https://cdn/x.png?w=128");
    expect(sources.at(-1)?.uri).toBe("https://cdn/x.png?w=128");
    expect(sources[0]?.uri).toContain(".avif?w=128");
  });

  it("does not rewrite data URIs or SVG/GIF/ICO", async () => {
    vi.doMock("react-native", () => ({
      Platform: { OS: "android", Version: 34 },
    }));
    const { modernImageSources } = await import("../lib/image-format");
    expect(modernImageSources("data:image/png;base64,abc")).toEqual([
      { uri: "data:image/png;base64,abc" },
    ]);
    expect(modernImageSources("https://cdn/icon.svg").map((s) => s.uri)).toEqual([
      "https://cdn/icon.svg",
    ]);
    expect(modernImageSources(null)).toEqual([]);
  });
});

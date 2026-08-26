import { describe, expect, it } from "vitest";

import {
  APP_LOADER_DURATION_MS,
  APP_LOADER_EMERGENCY_FALLBACK_MS,
  REDUCED_APP_LOADER_DURATION_MS,
  getAppLoaderDuration,
} from "../lib/app-loader";

describe("animated app loader", () => {
  it("uses a short branded entrance before revealing the app", () => {
    expect(getAppLoaderDuration(false)).toBe(APP_LOADER_DURATION_MS);
    expect(APP_LOADER_DURATION_MS).toBeGreaterThan(800);
    expect(APP_LOADER_DURATION_MS).toBeLessThan(1500);
  });

  it("honors reduced motion with a shorter safe fallback", () => {
    expect(getAppLoaderDuration(true)).toBe(REDUCED_APP_LOADER_DURATION_MS);
    expect(REDUCED_APP_LOADER_DURATION_MS).toBeLessThan(APP_LOADER_DURATION_MS);
    expect(REDUCED_APP_LOADER_DURATION_MS).toBeGreaterThan(0);
  });

  it("keeps an emergency escape hatch longer than the branded animation", () => {
    expect(APP_LOADER_EMERGENCY_FALLBACK_MS).toBeGreaterThan(APP_LOADER_DURATION_MS);
    expect(APP_LOADER_EMERGENCY_FALLBACK_MS).toBeLessThan(5000);
  });
});

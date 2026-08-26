export const APP_LOADER_DURATION_MS = 1150;
export const REDUCED_APP_LOADER_DURATION_MS = 320;
export const APP_LOADER_EMERGENCY_FALLBACK_MS = 3200;

export function getAppLoaderDuration(reduceMotion: boolean): number {
  return reduceMotion ? REDUCED_APP_LOADER_DURATION_MS : APP_LOADER_DURATION_MS;
}

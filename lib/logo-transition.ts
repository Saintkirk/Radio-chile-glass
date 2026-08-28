/**
 * Stable identity for the artwork currently assigned to a station.
 * A favicon change is a new visual resource even when the station id is unchanged.
 */
export function getLogoSourceKey(stationId: string, favicon?: string | null) {
  return `${stationId}:${favicon ?? ""}`;
}

/**
 * A late image callback must never replace the artwork for a newer station.
 */
export function canCommitLogo(currentSourceKey: string, callbackSourceKey: string) {
  return currentSourceKey === callbackSourceKey;
}

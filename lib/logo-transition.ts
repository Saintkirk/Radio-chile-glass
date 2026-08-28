/**
 * A late image callback must never replace the artwork for a newer station.
 */
export function canCommitLogo(currentSourceKey: string, callbackSourceKey: string) {
  return currentSourceKey === callbackSourceKey;
}

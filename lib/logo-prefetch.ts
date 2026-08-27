export type LogoPrefetchCandidate = { id: string; favicon?: string | null };

/** Devuelve URIs únicas desde el centro hacia los slots que el usuario puede alcanzar enseguida. */
export function getLogoPrefetchUris(
  radios: LogoPrefetchCandidate[],
  centerIndex: number,
  radius = 5,
): string[] {
  if (!radios.length) return [];
  const uniqueUris = new Set<string>();
  for (let distance = 0; distance <= radius; distance += 1) {
    const indexes = distance === 0 ? [centerIndex] : [centerIndex - distance, centerIndex + distance];
    for (const index of indexes) {
      const radio = radios[(index + radios.length) % radios.length];
      if (radio?.favicon) uniqueUris.add(radio.favicon);
    }
  }
  return [...uniqueUris];
}

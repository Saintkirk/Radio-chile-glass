import { StyleSheet, Text, View } from "react-native";

import { trpc } from "@/lib/trpc";

export function NowPlayingLabel({ streamUrl, compact = false }: { streamUrl: string; compact?: boolean }) {
  const { data, isFetching } = trpc.metadata.nowPlaying.useQuery(
    { streamUrl },
    { enabled: Boolean(streamUrl), refetchInterval: 20_000, staleTime: 15_000, retry: 1 },
  );

  const hasMetadata = Boolean(data?.available && (data.title || data.artist));
  const title = data?.title || "Información no disponible";
  const artist = data?.artist || (hasMetadata ? "Emisión en vivo" : "La emisora no publica artista y pista");

  return (
    <View 
      style={[styles.wrap, compact && styles.compactWrap]} 
      accessibilityLiveRegion="polite"
      accessible={true}
      accessibilityLabel={
        isFetching && !data 
          ? "Buscando información de la pista..." 
          : hasMetadata 
            ? `Ahora suena: ${title} por ${artist}` 
            : "Información de la pista no disponible"
      }
      accessibilityHint="Esta información se actualiza automáticamente cada 20 segundos"
    >
      <View style={[styles.dot, data?.available && styles.dotActive]} accessible={false} />
      <View style={styles.copy}>
        {compact ? (
          <Text style={styles.compactLine} numberOfLines={1} accessible={false}>{isFetching && !data ? "Buscando pista…" : hasMetadata ? `${artist} · ${title}` : "Metadatos no disponibles"}</Text>
        ) : (
          <>
            <Text style={styles.kicker} numberOfLines={1} accessible={false}>{isFetching && !data ? "BUSCANDO AHORA" : hasMetadata ? "AHORA SUENA" : "EN VIVO"}</Text>
            <Text style={styles.title} numberOfLines={1} accessible={false}>{title}</Text>
            <Text style={styles.artist} numberOfLines={1} accessible={false}>{artist}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 3, maxWidth: "100%" },
  compactWrap: { marginTop: 0, marginBottom: 0, gap: 7, flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#7C8494" },
  dotActive: { backgroundColor: "#1ED760" },
  copy: { flex: 1, minWidth: 0 },
  kicker: { color: "#1ED760", fontSize: 9, fontWeight: "800", letterSpacing: 1.25 },
  compactKicker: { fontSize: 8, letterSpacing: 1 },
  title: { color: "#F5F3EE", fontSize: 14, fontWeight: "700", marginTop: 2 },
  compactTitle: { fontSize: 11, marginTop: 1 },
  artist: { color: "#9EA7B5", fontSize: 11, marginTop: 2 },
  compactArtist: { fontSize: 9, marginTop: 1 },
  compactLine: { color: "#AEB5C2", fontSize: 10, marginTop: 3 },
});

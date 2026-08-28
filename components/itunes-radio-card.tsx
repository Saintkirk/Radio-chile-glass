import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";
import { platformShadow } from "@/lib/platform-styles";

export function ItunesRadioCard({
  radio,
  onOpen,
  onPlay,
    playing,
    loading = false,
    lightMode = false,
  trailing,
}: {
  radio: Radio;
  onOpen: () => void;
  onPlay: () => void;
  playing: boolean;
  loading?: boolean;
  lightMode?: boolean;
  trailing?: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const leaving = useRef(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => () => progress.stopAnimation(), [progress]);

  const openWithCoverFlow = () => {
    if (leaving.current) return;
    leaving.current = true;
    // La navegación debe comenzar de inmediato; el destino ya tiene su propia
    // transición de entrada. Mantener esta tarjeta visible evita un cuadro negro
    // entre la lista y el reproductor.
    progress.stopAnimation();
    progress.setValue(0);
    onOpen();
  };

  const cardTransform = {
    opacity: progress.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 0.88, 0], extrapolate: "clamp" }),
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -34] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) },
    ],
  };

  return (
    <Animated.View style={cardTransform}>
      <Pressable
        onPress={openWithCoverFlow}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${radio.name}`}
        style={({ pressed }) => [
          styles.card,
          lightMode && styles.cardLight,
          hovered && styles.cardHovered,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={[styles.coverStage, { backgroundColor: `${radio.accent}18` }]}>
          <View style={[styles.coverBack, { borderColor: `${radio.accent}55` }]} />
          <StationLogo
            key={`list-logo-${radio.id}:${radio.favicon ?? ""}`}
            radio={radio}
            size={54}
            radius={16}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, lightMode && styles.nameLight]} numberOfLines={1}>{radio.name}</Text>
          <Text style={[styles.meta, lightMode && styles.metaLight]} numberOfLines={1}>{radio.frequency}  ·  {radio.genre}</Text>
        </View>
        <Pressable
          onPress={(event) => { event.stopPropagation(); onPlay(); }}
          accessibilityRole="button"
          disabled={loading}
          accessibilityLabel={loading ? `Conectando con ${radio.name}` : playing ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`}
          style={({ pressed }) => [styles.play, lightMode && styles.playLight, { backgroundColor: playing ? radio.accent : `${radio.accent}D9` }, loading && styles.playLoading, pressed && styles.controlPressed]}
        >
          {loading ? <ActivityIndicator size="small" color="#F5F3EE" /> : <IconSymbol name={playing ? "pause.fill" : "play.fill"} size={20} color="#F5F3EE" />}
        </Pressable>
        {trailing}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 116, borderRadius: 24, backgroundColor: "#14151BD9", borderWidth: 1, borderColor: "#FFFFFF2A", padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", ...platformShadow({ color: "#000", opacity: 0.3, radius: 16, offsetY: 8, elevation: 6 }) },
  cardLight: { backgroundColor: "#14151BD9", borderColor: "#FFFFFF2A" },
  cardHovered: { backgroundColor: "#1ED76016", borderColor: "#1ED76066", ...platformShadow({ color: "#1ED760", opacity: 0.22, radius: 16, offsetY: 4, elevation: 4 }) },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  coverStage: { width: 86, height: 86, borderRadius: 20, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF22", ...platformShadow({ color: "#000", opacity: 0.5, radius: 12, offsetY: 5, elevation: 5 }) },
  coverBack: { position: "absolute", width: 68, height: 68, borderRadius: 18, borderWidth: 1, transform: [{ translateX: 9 }, { rotate: "8deg" }], opacity: 0.75 },
  info: { flex: 1, marginLeft: 14, minWidth: 0 },
  name: { color: "#F5F3EE", fontSize: 17, fontWeight: "700" },
  nameLight: { color: "#172033" },
  meta: { color: "#C0C5D2", fontSize: 13, marginTop: 7 },
  metaLight: { color: "#5B667B" },
  play: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", marginLeft: 8, ...platformShadow({ color: "#FF5E67", opacity: 0.32, radius: 14, offsetY: 5, elevation: 7 }) },
  playLight: { backgroundColor: "#172033" },
  playActive: { backgroundColor: "#15883E" },
  playLoading: { backgroundColor: "#D94B4B" },
  controlPressed: { opacity: 0.62, transform: [{ scale: 0.92 }] },
});

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";

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
    Animated.timing(progress, { toValue: 1, duration: 230, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onOpen();
    });
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
          <StationLogo radio={radio} size={54} radius={16} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, lightMode && styles.nameLight]} numberOfLines={1}>{radio.name}</Text>
          <Text style={[styles.meta, lightMode && styles.metaLight]} numberOfLines={1}>{radio.frequency}  ·  {radio.genre}</Text>
        </View>
        {trailing}
        <Pressable
          onPress={(event) => { event.stopPropagation(); onPlay(); }}
          accessibilityRole="button"
          disabled={loading}
          accessibilityLabel={loading ? `Conectando con ${radio.name}` : playing ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`}
          style={({ pressed }) => [styles.play, lightMode && styles.playLight, playing && styles.playActive, loading && styles.playLoading, pressed && styles.controlPressed]}
        >
          {loading ? <ActivityIndicator size="small" color="#F5F3EE" /> : <IconSymbol name={playing ? "pause.fill" : "play.fill"} size={16} color="#F5F3EE" />}
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 78, borderRadius: 20, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF0E", padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  cardLight: { backgroundColor: "#FFFFFFD9", borderColor: "#D9E0EC" },
  cardHovered: { backgroundColor: "#1ED76016", borderColor: "#1ED76066", shadowColor: "#1ED760", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  coverStage: { width: 58, height: 58, borderRadius: 17, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  coverBack: { position: "absolute", width: 46, height: 46, borderRadius: 14, borderWidth: 1, transform: [{ translateX: 7 }, { rotate: "8deg" }], opacity: 0.75 },
  info: { flex: 1, marginLeft: 13, minWidth: 0 },
  name: { color: "#F5F3EE", fontSize: 15, fontWeight: "700" },
  nameLight: { color: "#172033" },
  meta: { color: "#8D95A7", fontSize: 12, marginTop: 5 },
  metaLight: { color: "#5B667B" },
  play: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  playLight: { backgroundColor: "#172033" },
  playActive: { backgroundColor: "#15883E" },
  playLoading: { backgroundColor: "#D94B4B" },
  controlPressed: { opacity: 0.62, transform: [{ scale: 0.92 }] },
});

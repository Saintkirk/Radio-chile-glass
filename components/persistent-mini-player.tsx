import { usePathname, useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { StationLogo } from "@/components/station-logo";
import { AudioEqualizer } from "@/components/audio-equalizer";
import { NowPlayingLabel } from "@/components/now-playing-label";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { dialStatusLabel, playbackControlLabel, stationPlaybackPhase } from "@/lib/player-utils";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { platformShadow } from "@/lib/platform-styles";

export const PersistentMiniPlayer = memo(function PersistentMiniPlayer({ bottomOffset }: { bottomOffset: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const { currentRadio, isPlaying, isLoading, playbackError, playRadio, playAdjacent, togglePlay } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const colors = useColors(colorScheme);
  const [miniRadio, setMiniRadio] = useState<Radio | null>(currentRadio);
  const progress = useRef(new Animated.Value(currentRadio ? 1 : 0)).current;
  const containerRef = useRef<View>(null);
  const logoRef = useRef<View>(null);

  useEffect(() => {
    let active = true;
    if (currentRadio) {
      setMiniRadio(currentRadio);
      Animated.timing(progress, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      return () => { active = false; };
    }
    Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: true }).start(({ finished }) => {
      if (finished && active) setMiniRadio(null);
    });
    return () => { active = false; };
  }, [currentRadio, progress]);

  const openDetail = (radio: Radio) => {
    containerRef.current?.measureInWindow((containerX, containerY, containerWidth, containerHeight) => {
      logoRef.current?.measureInWindow((originX, originY, originWidth, originHeight) => {
        router.push({ pathname: "/radio/[id]", params: {
          id: radio.id,
          originX: originX.toFixed(2), originY: originY.toFixed(2),
          originWidth: originWidth.toFixed(2), originHeight: originHeight.toFixed(2),
          containerX: containerX.toFixed(2), containerY: containerY.toFixed(2),
          containerWidth: containerWidth.toFixed(2), containerHeight: containerHeight.toFixed(2),
          viewportWidth: viewportWidth.toFixed(2), viewportHeight: viewportHeight.toFixed(2),
        }});
      });
    });
  };

  const displayRadio = currentRadio ?? miniRadio;
  if (!displayRadio || pathname === "/" || pathname === "/(tabs)" || pathname.startsWith("/radio/")) return null;
  const lightMode = colorScheme === "light";
  const bottom = bottomOffset;
  const phase = stationPlaybackPhase(
    currentRadio?.id,
    displayRadio.id,
    isPlaying,
    isLoading,
    Boolean(playbackError),
  );
  const connecting = phase === "connecting";

  return (
    <Animated.View ref={containerRef} collapsable={false} style={[styles.container, { backgroundColor: lightMode ? "#F5F3EEF2" : "#171D2BF7", bottom, opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
      <Pressable
        onPress={() => openDetail(displayRadio)}
        accessibilityRole="button"
        accessibilityLabel={`Abrir reproductor de ${displayRadio.name}`}
        style={styles.main}
      >
        <View ref={logoRef} collapsable={false}>
          <StationLogo
            key={`mini-logo-${displayRadio.id}:${displayRadio.favicon ?? ""}`}
            radio={displayRadio}
            size={48}
            radius={14}
          />
        </View>
        <View style={styles.info} accessible={false}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>{displayRadio.name}</Text>
          {phase === "connecting" ? (
            <Text style={[styles.meta, { color: colors.muted }]}>{dialStatusLabel(phase)}</Text>
          ) : phase === "error" ? (
            <Text style={[styles.meta, { color: "#FF6B5A" }]} numberOfLines={1}>Toca para reintentar</Text>
          ) : phase === "playing" ? (
            <NowPlayingLabel streamUrl={displayRadio.streamUrl} compact />
          ) : (
            <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>{dialStatusLabel(phase)}</Text>
          )}
        </View>
        <AudioEqualizer playing={phase === "playing"} color={lightMode ? "#C2413E" : displayRadio.accent} barCount={5} compact accessible={false} />
      </Pressable>
      <Pressable
        onPress={() => void playAdjacent(-1, displayRadio.id)}
        accessibilityRole="button"
        accessibilityLabel="Emisora anterior"
        accessibilityHint="Cambia a la emisora anterior en la lista"
        style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
      >
        <IconSymbol name="chevron.left" size={17} color={lightMode ? "#172033" : "#F5F3EE"} />
      </Pressable>
      <Pressable
        onPress={() => phase === "error" ? void playRadio(displayRadio) : togglePlay()}
        disabled={connecting}
        accessibilityRole="button"
        accessibilityState={{ disabled: connecting, busy: connecting }}
        accessibilityLabel={playbackControlLabel(phase, displayRadio.name)}
        accessibilityHint={
          phase === "error"
            ? "Intenta reproducir la emisora nuevamente"
            : phase === "playing"
              ? "Pausa la reproducción actual"
              : phase === "connecting"
                ? "Espera mientras se establece la conexión"
                : "Inicia la reproducción de la emisora"
        }
        style={({ pressed }) => [styles.control, pressed && !connecting && styles.pressed]}
      >
        {connecting ? (
          <ActivityIndicator size="small" color={lightMode ? "#172033" : "#F5F3EE"} />
        ) : (
          <IconSymbol
            name={phase === "playing" ? "pause.fill" : phase === "error" ? "arrow.clockwise" : "play.fill"}
            size={20}
            color={lightMode ? "#172033" : "#F5F3EE"}
          />
        )}
      </Pressable>
      <Pressable
        onPress={() => void playAdjacent(1, displayRadio.id)}
        accessibilityRole="button"
        accessibilityLabel="Emisora siguiente"
        accessibilityHint="Cambia a la emisora siguiente en la lista"
        style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
      >
        <IconSymbol name="chevron.right" size={17} color={lightMode ? "#172033" : "#F5F3EE"} />
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { position: "absolute", left: 16, right: 16, minHeight: 68, borderRadius: 20, backgroundColor: "#171D2BF7", borderWidth: 1, borderColor: "#FFFFFF22", padding: 9, flexDirection: "row", alignItems: "center", gap: 12, ...platformShadow({ color: "#000", opacity: 0.24, radius: 18, offsetY: 8, elevation: 8 }) },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  info: { flex: 1 },
  name: { color: "#F5F3EE", fontSize: 14, fontWeight: "700" },
  meta: { color: "#9AA2B3", fontSize: 11, marginTop: 4 },
  control: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF14" },
  skip: { width: 28, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF0A" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});

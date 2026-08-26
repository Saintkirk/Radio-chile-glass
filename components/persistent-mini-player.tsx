import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { StationLogo } from "@/components/station-logo";
import { AudioEqualizer } from "@/components/audio-equalizer";
import { NowPlayingLabel } from "@/components/now-playing-label";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { platformShadow } from "@/lib/platform-styles";

export function PersistentMiniPlayer({ bottomOffset }: { bottomOffset: number }) {
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
      Animated.timing(progress, { toValue: 1, duration: 240, useNativeDriver: true }).start();
      return () => { active = false; };
    }
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
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
        } });
      });
    });
  };

  const displayRadio = currentRadio ?? miniRadio;
  // Inicio ya muestra el control completo dentro de cada tarjeta; el mini reproductor
  // permanece visible en las otras pestañas y rutas para no cubrir el Cover Flow.
  if (!displayRadio || pathname === "/" || pathname === "/(tabs)") return null;
  const lightMode = colorScheme === "light";
  // bottomOffset ya incluye la altura de la barra y el inset inferior; no duplicarlo.
  const bottom = bottomOffset;

  return (
    <Animated.View ref={containerRef} collapsable={false} style={[styles.container, { backgroundColor: lightMode ? "#FFFFFFF5" : "#171D2BF7", borderColor: lightMode ? "#D9E0EC" : "#FFFFFF22", bottom, opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }] }]}>
      <Pressable onPress={() => openDetail(displayRadio)} accessibilityRole="button" accessibilityLabel={`Abrir reproductor de ${displayRadio.name}`} style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
        <View ref={logoRef} collapsable={false}><StationLogo radio={displayRadio} size={48} radius={14} /></View>
        <View style={styles.info}><Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>{displayRadio.name}</Text>{isLoading ? <Text style={[styles.meta, { color: colors.muted }]}>Conectando...</Text> : playbackError ? <Text style={[styles.meta, { color: colors.primary }]} numberOfLines={1}>Toca para reintentar</Text> : <NowPlayingLabel streamUrl={displayRadio.streamUrl} compact />}</View>
        <AudioEqualizer playing={isPlaying} color={lightMode ? "#C2413E" : displayRadio.accent} barCount={5} compact />
      </Pressable>
      <Pressable onPress={() => void playAdjacent(-1, displayRadio.id)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.skip, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={17} color={lightMode ? "#172033" : "#F5F3EE"} /></Pressable>
      <Pressable onPress={() => playbackError ? playRadio(displayRadio) : togglePlay()} accessibilityRole="button" accessibilityLabel={playbackError ? `Reintentar ${displayRadio.name}` : isPlaying ? `Pausar ${displayRadio.name}` : `Reproducir ${displayRadio.name}`} style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
        {isLoading ? <ActivityIndicator size="small" color={lightMode ? "#172033" : "#F5F3EE"} /> : <IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={20} color={lightMode ? "#172033" : "#F5F3EE"} />}
      </Pressable>
      <Pressable onPress={() => void playAdjacent(1, displayRadio.id)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.skip, pressed && styles.pressed]}><IconSymbol name="chevron.right" size={17} color={lightMode ? "#172033" : "#F5F3EE"} /></Pressable>
    </Animated.View>
  );
}

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

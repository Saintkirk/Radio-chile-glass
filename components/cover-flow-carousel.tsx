import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";

export function CoverFlowCarousel({ radios, activeIndex, onChange, onPlay, isPlaying, currentRadioId, lightMode = false }: { radios: Radio[]; activeIndex: number; onChange: (direction: number) => void; onPlay: () => void; isPlaying: boolean; currentRadioId?: string; lightMode?: boolean }) {
  const motion = useRef(new Animated.Value(1)).current;
  const direction = useRef(1);
  const active = radios[activeIndex];
  const previous = radios.length ? radios[(activeIndex - 1 + radios.length) % radios.length] : undefined;
  const next = radios.length ? radios[(activeIndex + 1) % radios.length] : undefined;

  useEffect(() => {
    motion.setValue(0);
    Animated.timing(motion, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [activeIndex, motion]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 48 || Math.abs(gesture.dx) < Math.abs(gesture.dy) * 1.15) return;
      direction.current = gesture.dx < 0 ? 1 : -1;
      onChange(direction.current);
    },
  }), [onChange]);

  if (!active) return null;

  const requestChange = (nextDirection: number) => {
    direction.current = nextDirection < 0 ? -1 : 1;
    onChange(direction.current);
  };

  const cardStyle = (side: -1 | 0 | 1) => {
    const endX = side * 112;
    const startX = side === 0 ? direction.current * 230 : side === -direction.current ? 0 : side * 228;
    return {
    opacity: side === 0 ? motion.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.35, 0.8, 1] }) : motion.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] }),
    transform: [
      { translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [startX, endX] }) },
      { scale: side === 0 ? motion.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] }) : motion.interpolate({ inputRange: [0, 1], outputRange: [0.68, 0.82] }) },
      { rotateY: side === -1 ? "34deg" : side === 1 ? "-34deg" : "0deg" },
    ],
    };
  };

  const sideCard = (radio: Radio | undefined, side: -1 | 1) => radio ? (
    <Pressable onPress={() => requestChange(side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={[styles.sideSlot, side === -1 ? styles.sideLeft : styles.sideRight]}>
      <Animated.View style={[styles.cover, styles.sideCover, cardStyle(side), { backgroundColor: `${radio.accent}32` }]}>
        <StationLogo radio={radio} size={124} radius={20} />
        <View style={styles.sideShade} />
      </Animated.View>
      <View style={styles.reflection}><StationLogo radio={radio} size={124} radius={20} /></View>
    </Pressable>
  ) : null;

  return (
    <View {...panResponder.panHandlers} style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Carrusel de emisoras">
      <View style={styles.stage}>
        {sideCard(previous, -1)}
        <Animated.View style={[styles.centerSlot, cardStyle(0)]}>
          <View style={[styles.cover, styles.centerCover, { backgroundColor: `${active.accent}32` }]}>
            <Pressable onPress={onPlay} accessibilityRole="button" accessibilityLabel={currentRadioId === active.id && isPlaying ? `Pausar ${active.name}` : `Reproducir ${active.name}`} style={styles.centerPressable}>
              <StationLogo radio={active} size={184} radius={27} />
              <View style={styles.centerGloss} />
            </Pressable>
          </View>
          <View style={styles.centerReflection}><StationLogo radio={active} size={184} radius={27} /></View>
        </Animated.View>
        {sideCard(next, 1)}
      </View>
      <View style={styles.captionRow}>
        <Pressable onPress={() => requestChange(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={20} color="#F5F3EE" /></Pressable>
        <View style={styles.caption}><Text style={[styles.stationName, lightMode && styles.stationNameLight]} numberOfLines={1}>{active.name}</Text><Text style={[styles.stationMeta, lightMode && styles.stationMetaLight]}>{active.frequency}  ·  {active.genre}</Text><Text style={styles.counter}>{activeIndex + 1} / {radios.length}</Text></View>
        <Pressable onPress={() => requestChange(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.right" size={20} color="#F5F3EE" /></Pressable>
      </View>
      <View style={styles.dots} accessibilityElementsHidden><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} /><View style={styles.dot} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 356, borderRadius: 0, overflow: "hidden", backgroundColor: "#000000", borderWidth: 1, borderColor: "#171717", marginBottom: 28, paddingTop: 4 },
  rootLight: { backgroundColor: "#0A0A0A", borderColor: "#1A1A1A" },
  stage: { height: 262, alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" },
  sideSlot: { position: "absolute", top: 24, width: 150, height: 222, zIndex: 1, alignItems: "center" },
  sideLeft: { left: -4 },
  sideRight: { right: -4 },
  centerSlot: { width: 204, height: 242, zIndex: 3, alignItems: "center" },
  cover: { overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF45", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.62, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
  sideCover: { width: 150, height: 202, borderRadius: 4 },
  centerCover: { width: 204, height: 224, borderRadius: 4, shadowRadius: 30, shadowOpacity: 0.78 },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000038" },
  centerGloss: { position: "absolute", top: 9, left: 14, right: 14, height: 52, backgroundColor: "#FFFFFF12" },
  reflection: { position: "absolute", top: 206, width: 150, height: 62, opacity: 0.18, transform: [{ scaleY: -1 }], overflow: "hidden" },
  centerReflection: { width: 204, height: 72, opacity: 0.15, transform: [{ scaleY: -1 }], overflow: "hidden" },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 4 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 20, fontWeight: "700", letterSpacing: -0.4 },
  stationNameLight: { color: "#F5F3EE" },
  stationMeta: { color: "#B7C0D0", fontSize: 12, marginTop: 5 },
  stationMetaLight: { color: "#B7C0D0" },
  counter: { color: "#1ED760", fontSize: 10, fontWeight: "700", marginTop: 6 },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFFFFF1C" },
  pressed: { opacity: 0.62, transform: [{ scale: 0.93 }] },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#687184" },
  dotActive: { width: 18, backgroundColor: "#1ED760" },
});

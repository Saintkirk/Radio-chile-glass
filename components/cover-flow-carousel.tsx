import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";

export function CoverFlowCarousel({
  radios,
  activeIndex,
  onChange,
  onPlay,
  isPlaying,
  currentRadioId,
  lightMode = false,
}: {
  radios: Radio[];
  activeIndex: number;
  onChange: (direction: number) => void;
  onPlay: () => void;
  isPlaying: boolean;
  currentRadioId?: string;
  lightMode?: boolean;
}) {
  const motion = useRef(new Animated.Value(1)).current;
  const direction = useRef(1);
  const panStart = useRef({ x: 0, y: 0 });
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
    onPanResponderGrant: (_, gesture) => { panStart.current = { x: gesture.x0, y: gesture.y0 }; },
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 48 || Math.abs(gesture.dx) < Math.abs(gesture.dy) * 1.15) return;
      direction.current = gesture.dx < 0 ? 1 : -1;
      onChange(direction.current);
    },
  }), [onChange]);

  if (!active) return null;

  const cardStyle = (side: -1 | 0 | 1) => ({
    opacity: side === 0 ? motion.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) : 0.72,
    transform: [
      { translateX: side === 0 ? motion.interpolate({ inputRange: [0, 1], outputRange: [direction.current * 44, 0] }) : side * 112 },
      { scale: side === 0 ? motion.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) : 0.72 },
      { rotateY: side === -1 ? "28deg" : side === 1 ? "-28deg" : "0deg" },
    ],
  });

  const sideCard = (radio: Radio | undefined, side: -1 | 1) => radio ? (
    <Pressable onPress={() => onChange(side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={[styles.sideSlot, side === -1 ? styles.sideLeft : styles.sideRight]}>
      <Animated.View style={[styles.cover, styles.sideCover, cardStyle(side), { backgroundColor: `${radio.accent}28` }]}>
        <StationLogo radio={radio} size={96} radius={18} />
        <View style={styles.sideShade} />
      </Animated.View>
    </Pressable>
  ) : null;

  return (
    <View {...panResponder.panHandlers} style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Carrusel de emisoras">
      <View style={styles.stage}>
        {sideCard(previous, -1)}
        <Animated.View style={[styles.cover, styles.centerCover, cardStyle(0), { backgroundColor: `${active.accent}28` }]}>
          <Pressable onPress={onPlay} accessibilityRole="button" accessibilityLabel={currentRadioId === active.id && isPlaying ? `Pausar ${active.name}` : `Reproducir ${active.name}`} style={styles.centerPressable}>
            <StationLogo radio={active} size={170} radius={25} />
            <View style={styles.centerGloss} />
          </Pressable>
        </Animated.View>
        {sideCard(next, 1)}
      </View>
      <View style={styles.captionRow}>
        <Pressable onPress={() => onChange(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={20} color="#F5F3EE" /></Pressable>
        <View style={styles.caption}><Text style={[styles.stationName, lightMode && styles.stationNameLight]} numberOfLines={1}>{active.name}</Text><Text style={[styles.stationMeta, lightMode && styles.stationMetaLight]}>{active.frequency}  ·  {active.genre}</Text><Text style={styles.counter}>{activeIndex + 1} / {radios.length}</Text></View>
        <Pressable onPress={() => onChange(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.right" size={20} color="#F5F3EE" /></Pressable>
      </View>
      <View style={styles.dots} accessibilityElementsHidden><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} /><View style={styles.dot} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 315, borderRadius: 28, overflow: "hidden", backgroundColor: "#0D111B", borderWidth: 1, borderColor: "#FFFFFF24", marginBottom: 28, paddingTop: 8 },
  rootLight: { backgroundColor: "#F5F7FC", borderColor: "#CBD5E1" },
  stage: { height: 224, alignItems: "center", justifyContent: "center", position: "relative" },
  sideSlot: { position: "absolute", top: 20, width: 112, height: 174, zIndex: 1 },
  sideLeft: { left: -22 },
  sideRight: { right: -22 },
  cover: { borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF38", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  sideCover: { width: 112, height: 174 },
  centerCover: { width: 190, height: 190, zIndex: 3, shadowRadius: 28, shadowOpacity: 0.55 },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#05070B55" },
  centerGloss: { position: "absolute", top: 10, left: 16, right: 16, height: 48, borderRadius: 30, backgroundColor: "#FFFFFF12" },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 3 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 20, fontWeight: "700", letterSpacing: -0.4 },
  stationNameLight: { color: "#172033" },
  stationMeta: { color: "#B7C0D0", fontSize: 12, marginTop: 5 },
  stationMetaLight: { color: "#5B667B" },
  counter: { color: "#1ED760", fontSize: 10, fontWeight: "700", marginTop: 6 },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFFFFF1C" },
  pressed: { opacity: 0.62, transform: [{ scale: 0.93 }] },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#687184" },
  dotActive: { width: 18, backgroundColor: "#1ED760" },
});

import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";

export function CoverFlowCarousel({ radios, activeIndex, onChange, onPlay, isPlaying, currentRadioId, lightMode = false }: { radios: Radio[]; activeIndex: number; onChange: (direction: number) => void; onPlay: () => void; isPlaying: boolean; currentRadioId?: string; lightMode?: boolean }) {
  const motion = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const direction = useRef(1);
  const active = radios[activeIndex];
  const previous = radios.length ? radios[(activeIndex - 1 + radios.length) % radios.length] : undefined;
  const next = radios.length ? radios[(activeIndex + 1) % radios.length] : undefined;

  useEffect(() => {
    motion.stopAnimation();
    if (reduceMotion) {
      motion.setValue(1);
      return undefined;
    }
    motion.setValue(0);
    const transition = Animated.timing(motion, {
      toValue: 1,
      duration: 460,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    });
    transition.start();
    return () => transition.stop();
  }, [activeIndex, motion, reduceMotion]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    glow.stopAnimation();
    if (reduceMotion || !isPlaying || currentRadioId !== active.id) {
      glow.setValue(0);
      return undefined;
    }
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1250, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1250, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, [active.id, currentRadioId, glow, isPlaying, reduceMotion]);

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
    // Las ranuras laterales ya están posicionadas en los extremos del escenario.
    // El movimiento final debe ser sutil para conservar las tres carátulas visibles.
    const endX = side === 0 ? 0 : side * 8;
    const startX = side === 0 ? direction.current * 230 : side === -direction.current ? side * 156 : side * 190;
    return {
    opacity: side === 0 ? motion.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.35, 0.8, 1] }) : motion.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] }),
    transform: [
      { perspective: 900 },
      { translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [startX, endX] }) },
      { translateY: side === 0 ? motion.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) : motion.interpolate({ inputRange: [0, 1], outputRange: [12, 4] }) },
      { scale: side === 0 ? motion.interpolate({ inputRange: [0, 0.72, 1], outputRange: [0.84, 0.96, 1] }) : motion.interpolate({ inputRange: [0, 1], outputRange: [0.68, 0.82] }) },
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
          <Animated.View pointerEvents="none" style={[styles.outerGlow, { backgroundColor: active.accent, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.32] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) }] }]} />
          <View style={[styles.cover, styles.centerCover, { backgroundColor: `${active.accent}32` }]}>
            <Animated.View pointerEvents="none" style={[styles.innerGlow, { backgroundColor: active.accent, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] }) }]} />
            <Pressable onPress={onPlay} accessibilityRole="button" accessibilityLabel={currentRadioId === active.id && isPlaying ? `Pausar ${active.name}` : `Reproducir ${active.name}`} style={styles.centerPressable}>
              <StationLogo radio={active} size={184} radius={27} />
              <View pointerEvents="none" style={styles.diagonalSheen} />
              <View pointerEvents="none" style={styles.centerGloss} />
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
  root: { height: 388, borderRadius: 0, overflow: "hidden", backgroundColor: "#090A10", borderWidth: 1, borderColor: "#29202F", marginBottom: 28, paddingTop: 4 },
  rootLight: { backgroundColor: "#090A10", borderColor: "#29202F" },
  stage: { height: 286, alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" },
  sideSlot: { position: "absolute", top: 36, width: 128, height: 222, zIndex: 1, alignItems: "center" },
  sideLeft: { left: 6 },
  sideRight: { right: 6 },
  centerSlot: { width: 218, height: 250, zIndex: 3, alignItems: "center" },
  outerGlow: { position: "absolute", width: 246, height: 246, borderRadius: 28, shadowColor: "#FF5E67", shadowOpacity: 0.9, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 14 },
  cover: { overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF45", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.62, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
  sideCover: { width: 128, height: 210, borderRadius: 12 },
  centerCover: { width: 218, height: 232, borderRadius: 18, shadowRadius: 30, shadowOpacity: 0.78 },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  innerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 4 },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000038" },
  centerGloss: { position: "absolute", top: 9, left: 14, right: 14, height: 52, backgroundColor: "#FFFFFF12" },
  diagonalSheen: { position: "absolute", width: 280, height: 34, top: 74, left: -36, backgroundColor: "#FFFFFF18", transform: [{ rotate: "-28deg" }] },
  reflection: { position: "absolute", top: 212, width: 128, height: 52, opacity: 0.18, transform: [{ scaleY: -1 }], overflow: "hidden" },
  centerReflection: { width: 218, height: 72, opacity: 0.15, transform: [{ scaleY: -1 }], overflow: "hidden" },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 4 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  stationNameLight: { color: "#F5F3EE" },
  stationMeta: { color: "#B7C0D0", fontSize: 12, marginTop: 5 },
  stationMetaLight: { color: "#B7C0D0" },
  counter: { color: "#1ED760", fontSize: 10, fontWeight: "700", marginTop: 6 },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFFFFF1C" },
  pressed: { opacity: 0.62, transform: [{ scale: 0.93 }] },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#687184" },
  dotActive: { width: 18, backgroundColor: "#FF6B5A" },
});

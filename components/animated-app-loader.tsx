import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, StyleSheet, Text, View } from "react-native";

import { APP_LOADER_EMERGENCY_FALLBACK_MS, getAppLoaderDuration } from "@/lib/app-loader";
import { nonInteractiveStyle, platformShadow } from "@/lib/platform-styles";

export function AnimatedAppLoader({ visible, onFinished }: { visible: boolean; onFinished: () => void }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const glowOpacity = useRef(new Animated.Value(0.08)).current;
  const onFinishedRef = useRef(onFinished);
  const finishedRef = useRef(false);

  const finishOnce = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishedRef.current();
  };

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    finishedRef.current = false;
    opacity.setValue(1);
    logoOpacity.setValue(0);
    logoScale.setValue(0.86);
    glowOpacity.setValue(0.08);

    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: reduceMotion ? 90 : 260, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: reduceMotion ? 120 : 460, useNativeDriver: true }),
    ]);
    const pulse = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1.035, duration: 760, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.24, duration: 760, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1, duration: 760, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.1, duration: 760, useNativeDriver: true }),
      ]),
    ]));
    const exit = Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 100 : 260, useNativeDriver: true });

    entrance.start(() => {
      if (!reduceMotion) pulse.start();
    });

    const finishTimer = setTimeout(() => {
      pulse.stop();
      exit.start(({ finished }) => {
        if (finished) finishOnce();
      });
    }, getAppLoaderDuration(reduceMotion));
    const emergencyTimer = setTimeout(() => {
      pulse.stop();
      exit.stop();
      finishOnce();
    }, APP_LOADER_EMERGENCY_FALLBACK_MS);

    return () => {
      clearTimeout(finishTimer);
      clearTimeout(emergencyTimer);
      entrance.stop();
      pulse.stop();
      exit.stop();
    };
  }, [glowOpacity, logoOpacity, logoScale, opacity, reduceMotion, visible]);

  if (!visible) return null;

  return (
    <Animated.View accessibilityRole="progressbar" accessibilityLabel="Cargando Radio Chile Glass" style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity }]}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }, nonInteractiveStyle]} />
        <Animated.View style={[styles.logoFrame, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={require("../assets/images/icon.png")} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
        </Animated.View>
        <Text style={styles.title}><Text style={styles.titleRadio}>Radio</Text> Chile <Text style={styles.titleGlass}>Glass</Text></Text>
        <Text style={styles.subtitle}>LO MEJOR SUENA AQUÍ</Text>
        <View style={styles.loadingRow}>
          <View style={styles.loadingDot} />
          <Text style={styles.loadingText}>Preparando tus emisoras</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 1000, elevation: 1000 },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#08090F", paddingHorizontal: 32 },
  glow: { position: "absolute", width: 270, height: 270, borderRadius: 135, backgroundColor: "#6A35A5", ...platformShadow({ color: "#FF6B5A", opacity: 0.7, radius: 70, elevation: 10 }) },
  logoFrame: { width: 142, height: 142, borderRadius: 38, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF12", borderWidth: 1, borderColor: "#FFFFFF3B", ...platformShadow({ color: "#FF6B5A", opacity: 0.34, radius: 24, offsetY: 10, elevation: 12 }) },
  logo: { width: 112, height: 112, borderRadius: 28 },
  title: { color: "#F5F3EE", fontSize: 29, fontWeight: "500", letterSpacing: -0.8, marginTop: 28 },
  titleRadio: { color: "#FF6B5A" },
  titleGlass: { color: "#B66BFF" },
  subtitle: { color: "#D5CBD8", fontSize: 9, fontWeight: "700", letterSpacing: 3.1, marginTop: 7 },
  loadingRow: { flexDirection: "row", alignItems: "center", marginTop: 34, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF1A" },
  loadingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF6B5A", marginRight: 8, ...platformShadow({ color: "#FF6B5A", opacity: 0.9, radius: 8, elevation: 3 }) },
  loadingText: { color: "#A8B0C2", fontSize: 12, fontWeight: "600" },
});

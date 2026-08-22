import * as WebBrowser from "expo-web-browser";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AudioEqualizer } from "@/components/audio-equalizer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StationLogo } from "@/components/station-logo";
import { useRadioPlayer } from "@/lib/radio-player";
import { useThemeContext } from "@/lib/theme-provider";
import { detailOpenedHaptic } from "@/lib/haptics";

export default function RadioDetailScreen() {
  const router = useRouter();
  const { id, originX, originY, originWidth, originHeight, containerX, containerY, containerWidth, containerHeight, viewportWidth, viewportHeight } = useLocalSearchParams<{ id: string; originX?: string; originY?: string; originWidth?: string; originHeight?: string; containerX?: string; containerY?: string; containerWidth?: string; containerHeight?: string; viewportWidth?: string; viewportHeight?: string }>();
  const { radios, currentRadio, isPlaying, isLoading, playRadio, toggleFavorite, isFavorite } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const lightMode = colorScheme === "light";
  const radio = radios.find((item) => item.id === id);
  const dismissY = useRef(new Animated.Value(0)).current;
  const entryProgress = useRef(new Animated.Value(0)).current;
  const artworkRef = useRef<View>(null);
  const entryHapticSent = useRef(false);
  const [entryOrigin, setEntryOrigin] = useState({ scale: 0.52, translateX: 0, translateY: 210 });
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);
  const hasMeasuredOrigin = [originX, originY, originWidth, originHeight].every((value) => value !== undefined && Number.isFinite(Number(value)));
  const hasMeasuredContainer = [containerX, containerY, containerWidth, containerHeight].every((value) => value !== undefined && Number.isFinite(Number(value)));
  const sourceViewportWidth = Number(viewportWidth) || windowWidth;
  const sourceViewportHeight = Number(viewportHeight) || windowHeight;
  const viewportScaleX = sourceViewportWidth > 0 ? windowWidth / sourceViewportWidth : 1;
  const viewportScaleY = sourceViewportHeight > 0 ? windowHeight / sourceViewportHeight : 1;
  const measureArtworkOrigin = useCallback(() => {
    artworkRef.current?.measureInWindow((targetX, targetY, targetWidth, targetHeight) => {
      if (!hasMeasuredOrigin) return;
      const sourceX = Number(originX) * viewportScaleX;
      const sourceY = Number(originY) * viewportScaleY;
      const sourceWidth = Number(originWidth) * viewportScaleX;
      const sourceHeight = Number(originHeight) * viewportScaleY;
      setEntryOrigin({
        scale: Math.min(sourceWidth / targetWidth, sourceHeight / targetHeight),
        translateX: sourceX + sourceWidth / 2 - (targetX + targetWidth / 2),
        translateY: sourceY + sourceHeight / 2 - (targetY + targetHeight / 2),
      });
    });
  }, [hasMeasuredOrigin, originHeight, originWidth, originX, originY, viewportScaleX, viewportScaleY]);
  useEffect(() => {
    if (!hasMeasuredOrigin) {
      const animation = Animated.timing(entryProgress, { toValue: 1, duration: 300, useNativeDriver: true });
      animation.start(({ finished }) => {
        if (finished && !entryHapticSent.current) {
          entryHapticSent.current = true;
          detailOpenedHaptic();
        }
      });
      return () => animation.stop();
    }
    return undefined;
  }, [entryProgress, hasMeasuredOrigin]);
  useEffect(() => {
    if (!hasMeasuredOrigin) return;
    measureArtworkOrigin();
  }, [hasMeasuredOrigin, measureArtworkOrigin, windowWidth, windowHeight]);
  useEffect(() => {
    if (!hasMeasuredOrigin) return;
    const animation = Animated.timing(entryProgress, { toValue: 1, duration: 300, useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished && !entryHapticSent.current) {
        entryHapticSent.current = true;
        detailOpenedHaptic();
      }
    });
    return () => animation.stop();
  }, [entryOrigin, entryProgress, hasMeasuredOrigin]);
  const currentIndex = radios.findIndex((item) => item.id === radio?.id);
  const stationTransition = useRef(new Animated.Value(1)).current;
  const stationDirection = useRef(1);
  useEffect(() => {
    stationTransition.stopAnimation();
    if (reduceMotion) {
      stationTransition.setValue(1);
      return undefined;
    }
    stationTransition.setValue(0);
    Animated.timing(stationTransition, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start();
    return () => stationTransition.stopAnimation();
  }, [radio?.id, reduceMotion, stationTransition]);
  const changeRadio = useCallback((direction: number) => {
    if (radios.length < 2 || currentIndex < 0) return;
    const nextIndex = (currentIndex + direction + radios.length) % radios.length;
    const nextRadio = radios[nextIndex];
    stationDirection.current = direction < 0 ? -1 : 1;
    playRadio(nextRadio);
    router.replace(`/radio/${nextRadio.id}`);
  }, [currentIndex, playRadio, radios, router]);
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => dismissY.stopAnimation(),
    onPanResponderMove: (_, gesture) => dismissY.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 100 || gesture.vy > 0.8) {
        Animated.timing(dismissY, { toValue: 420, duration: 260, useNativeDriver: true }).start(({ finished }) => {
          if (finished) {
            router.back();
            dismissY.setValue(0);
          }
        });
      } else {
        Animated.timing(dismissY, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      }
    },
  }), [dismissY, router]);
  const artworkResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.15,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 48) return;
      changeRadio(gesture.dx < 0 ? 1 : -1);
    },
  }), [changeRadio]);

  if (!radio) return <ScreenContainer containerClassName="bg-[#0B0B0B]" className="px-5 pt-3"><Pressable onPress={() => router.back()} style={styles.back}><IconSymbol name="chevron.left" size={22} color="#F5F3EE" /></Pressable><View style={styles.notFound}><Text style={styles.notFoundTitle}>Radio no encontrada</Text><Text style={styles.notFoundText}>La emisora pudo haber cambiado en la última actualización.</Text></View></ScreenContainer>;

  const active = currentRadio?.id === radio.id && isPlaying;
  const containerStyle = hasMeasuredContainer ? { left: Number(containerX) * viewportScaleX, top: Number(containerY) * viewportScaleY - insets.top, width: Number(containerWidth) * viewportScaleX, height: Number(containerHeight) * viewportScaleY, borderRadius: 20 } : null;
  const openOfficialSite = async () => { if (radio.homepage) await WebBrowser.openBrowserAsync(radio.homepage); };
  const stationMotionStyle = { opacity: stationTransition.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1], extrapolate: "clamp" }), transform: [{ translateX: stationTransition.interpolate({ inputRange: [0, 1], outputRange: [stationDirection.current * Math.min(windowWidth * 0.72, 300), 0], extrapolate: "clamp" }) }, { scale: stationTransition.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1], extrapolate: "clamp" }) }] };
  return <ScreenContainer containerClassName="bg-[#0B0B0B]" className="px-5 pt-3"><Animated.View {...panResponder.panHandlers} style={{ flex: 1, opacity: dismissY.interpolate({ inputRange: [0, 160], outputRange: [1, 0.72], extrapolate: "clamp" }), transform: [{ translateY: dismissY }] }}>{containerStyle && <Animated.View pointerEvents="none" style={[styles.ghostMini, containerStyle, { opacity: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 0], extrapolate: "clamp" }) }]} />}
{radio.favicon ? <Image source={{ uri: radio.favicon }} style={styles.dynamicBackground} contentFit="cover" cachePolicy="disk" /> : <LinearGradient colors={[`${radio.accent}55`, "#0B0B0B"]} style={styles.dynamicBackground} />}{radio.favicon && <BlurView intensity={78} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.dynamicBackground} />}<LinearGradient colors={["#0B0B0BB8", "#0B0B0BF5"]} style={styles.backgroundOverlay} pointerEvents="none" /><Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={{ flex: 1 }}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><IconSymbol name="chevron.left" size={22} color="#F5F3EE" /></Pressable><Pressable onPress={() => toggleFavorite(radio.id)} style={styles.back}><IconSymbol name={isFavorite(radio.id) ? "heart.fill" : "heart"} size={20} color={isFavorite(radio.id) ? "#1DB954" : "#F5F3EE"} /></Pressable></View><Animated.View style={[stationMotionStyle, { transform: [{ scale: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.scale, 1], extrapolate: "clamp" }) }, { translateX: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.translateX, 0], extrapolate: "clamp" }) }, { translateY: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.translateY, 0], extrapolate: "clamp" }) }, { scale: dismissY.interpolate({ inputRange: [0, 420], outputRange: [1, 0.52], extrapolate: "clamp" }) }, { translateY: dismissY.interpolate({ inputRange: [0, 420], outputRange: [0, 210], extrapolate: "clamp" }) }, ...(stationMotionStyle.transform ?? [])] }]}><View {...artworkResponder.panHandlers} ref={artworkRef} collapsable={false} onLayout={measureArtworkOrigin} accessible accessibilityRole="image" accessibilityLabel={`${radio.name}. Desliza horizontalmente para cambiar de emisora. También puedes usar las flechas laterales.`} style={[styles.artwork, { backgroundColor: `${radio.accent}${lightMode ? "18" : "32"}` }, lightMode && styles.artworkLight]}><View style={[styles.artGlow, { backgroundColor: `${radio.accent}${lightMode ? "35" : "55"}` }]} /><StationLogo radio={radio} size={156} radius={42} /><Pressable onPress={() => changeRadio(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" hitSlop={8} style={({ pressed }) => [styles.artworkArrow, styles.artworkArrowLeft, pressed && styles.navPressed]}><IconSymbol name="chevron.left" size={24} color="#F5F3EE" /></Pressable><Pressable onPress={() => changeRadio(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" hitSlop={8} style={({ pressed }) => [styles.artworkArrow, styles.artworkArrowRight, pressed && styles.navPressed]}><IconSymbol name="chevron.right" size={24} color="#F5F3EE" /></Pressable></View></Animated.View><AudioEqualizer playing={active} color={lightMode ? "#C2413E" : radio.accent} /><Text style={styles.eyebrow}>ESTÁS ESCUCHANDO</Text><Text style={styles.name}>{radio.name}</Text><Text style={styles.meta}>{radio.frequency}  ·  {radio.city}  ·  {radio.genre}</Text><Animated.View style={stationMotionStyle}><View style={styles.actions}><Pressable onPress={() => playRadio(radio)} accessibilityRole="button" accessibilityLabel={active ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`} style={({ pressed }) => [styles.playButton, pressed && { transform: [{ scale: 0.97 }] }]}><IconSymbol name={active ? "pause.fill" : "play.fill"} size={24} color="#0B0B0B" /><Text style={styles.playText}>{isLoading ? "Conectando" : active ? "Pausar" : "Reproducir"}</Text></Pressable><Pressable onPress={openOfficialSite} disabled={!radio.homepage} accessibilityRole="button" accessibilityLabel={`Abrir sitio oficial de ${radio.name}`} style={({ pressed }) => [styles.siteButton, !radio.homepage && styles.disabled, pressed && { opacity: 0.75 }]}><IconSymbol name="globe" size={20} color="#F5F3EE" /><Text style={styles.siteText}>Web oficial</Text></Pressable></View><View style={styles.stationNav}><Pressable onPress={() => changeRadio(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.stationNavButton, pressed && styles.navPressed]}><IconSymbol name="chevron.left" size={23} color="#F5F3EE" /></Pressable><Text style={styles.stationCounter}>{currentIndex >= 0 ? `${currentIndex + 1} / ${radios.length}` : "—"}</Text><Pressable onPress={() => changeRadio(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.stationNavButton, pressed && styles.navPressed]}><IconSymbol name="chevron.right" size={23} color="#F5F3EE" /></Pressable></View></Animated.View><View style={styles.infoCard}><Text style={styles.infoLabel}>SOBRE LA EMISORA</Text><Text style={styles.description}>{radio.description}</Text>{radio.homepage ? <Text style={styles.url} numberOfLines={1}>{radio.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Text> : <Text style={styles.unavailable}>Página oficial no disponible</Text>}</View></Animated.ScrollView></Animated.View></ScreenContainer>;
}
const styles = StyleSheet.create({ ghostMini: { position: "absolute", zIndex: 4, backgroundColor: "#1D2333F2", borderWidth: 1, borderColor: "#FFFFFF1C" }, dynamicBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.62 }, backgroundOverlay: { ...StyleSheet.absoluteFillObject }, content: { paddingBottom: 35 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }, back: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF12", alignItems: "center", justifyContent: "center" }, artworkLight: { borderColor: "#D6DCEC" }, artwork: { height: 270, borderRadius: 34, alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 28, borderWidth: 1, borderColor: "#FFFFFF18" }, artGlow: { position: "absolute", width: 230, height: 230, borderRadius: 130, top: 20, opacity: 0.55 }, artworkArrow: { position: "absolute", top: "50%", marginTop: -24, width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#0B0B0BB8", borderWidth: 1, borderColor: "#FFFFFF2E", shadowColor: "#000000", shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }, artworkArrowLeft: { left: 14 }, artworkArrowRight: { right: 14 }, equalizer: { marginBottom: 12 }, eyebrow: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 }, name: { color: "#F5F3EE", fontSize: 31, fontWeight: "700", letterSpacing: -0.8 }, meta: { color: "#A8B0C2", fontSize: 14, marginTop: 8 }, actions: { flexDirection: "row", gap: 10, marginTop: 26, marginBottom: 14 }, stationNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 30, paddingHorizontal: 4 }, stationNavButton: { width: 54, minHeight: 42, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF18", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },  stationCounter: { color: "#A7A7A7", fontSize: 12, fontWeight: "700" }, navPressed: { opacity: 0.65, transform: [{ scale: 0.96 }] }, playButton: { flex: 1, minHeight: 52, borderRadius: 18, backgroundColor: "#F5F3EE", flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "center" }, playText: { color: "#0B0B0B", fontSize: 14, fontWeight: "700" }, siteButton: { flex: 1, minHeight: 52, borderRadius: 18, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF18", flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" }, siteText: { color: "#F5F3EE", fontSize: 14, fontWeight: "600" }, disabled: { opacity: 0.45 }, infoCard: { borderRadius: 22, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF12", padding: 20 }, infoLabel: { color: "#A8B0C2", fontSize: 10, fontWeight: "700", letterSpacing: 1.4, marginBottom: 12 }, description: { color: "#E5E4E1", fontSize: 15, lineHeight: 23 }, url: { color: "#1ED760", fontSize: 12, marginTop: 15 }, unavailable: { color: "#777F91", fontSize: 12, marginTop: 15 }, notFound: { paddingTop: 100, alignItems: "center" }, notFoundTitle: { color: "#F5F3EE", fontSize: 20, fontWeight: "700" }, notFoundText: { color: "#8D95A7", fontSize: 13, textAlign: "center", marginTop: 10 } });

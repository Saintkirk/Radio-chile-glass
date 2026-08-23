import * as WebBrowser from "expo-web-browser";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AudioEqualizer } from "@/components/audio-equalizer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CoverFlowCarousel } from "@/components/cover-flow-carousel";
import { NowPlayingLabel } from "@/components/now-playing-label";
import { useRadioPlayer } from "@/lib/radio-player";
import { useThemeContext } from "@/lib/theme-provider";
import { detailOpenedHaptic } from "@/lib/haptics";
import { adjacentRadioIndex } from "@/lib/player-utils";

export default function RadioDetailScreen() {
  const router = useRouter();
  const { id, originX, originY, originWidth, originHeight, containerX, containerY, containerWidth, containerHeight, viewportWidth, viewportHeight } = useLocalSearchParams<{ id: string; originX?: string; originY?: string; originWidth?: string; originHeight?: string; containerX?: string; containerY?: string; containerWidth?: string; containerHeight?: string; viewportWidth?: string; viewportHeight?: string }>();
  const { radios, currentRadio, isPlaying, isLoading, playbackError, playRadio, togglePlay, toggleFavorite, isFavorite } = useRadioPlayer();
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
  const changeRadio = useCallback((direction: number) => {
    if (radios.length < 2 || currentIndex < 0) return;
    const nextIndex = adjacentRadioIndex(radios.length, currentIndex, direction === -1 ? -1 : 1);
    const nextRadio = radios[nextIndex];
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

  if (!radio) return <ScreenContainer containerClassName="bg-[#0B0B0B]" className="px-5 pt-3"><Pressable onPress={() => router.back()} style={styles.back}><IconSymbol name="chevron.left" size={22} color="#F5F3EE" /></Pressable><View style={styles.notFound}><Text style={styles.notFoundTitle}>Radio no encontrada</Text><Text style={styles.notFoundText}>La emisora pudo haber cambiado en la última actualización.</Text></View></ScreenContainer>;

  const active = currentRadio?.id === radio.id && isPlaying;
  const containerStyle = hasMeasuredContainer ? { left: Number(containerX) * viewportScaleX, top: Number(containerY) * viewportScaleY - insets.top, width: Number(containerWidth) * viewportScaleX, height: Number(containerHeight) * viewportScaleY, borderRadius: 20 } : null;
  const openOfficialSite = async () => { if (radio.homepage) await WebBrowser.openBrowserAsync(radio.homepage); };
  return <ScreenContainer containerClassName="bg-[#07090D]" className="px-5 pt-3"><Animated.View {...panResponder.panHandlers} style={{ flex: 1, opacity: dismissY.interpolate({ inputRange: [0, 160], outputRange: [1, 0.72], extrapolate: "clamp" }), transform: [{ translateY: dismissY }] }}>{containerStyle && <Animated.View pointerEvents="none" style={[styles.ghostMini, containerStyle, { opacity: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 0], extrapolate: "clamp" }) }]} />}
{radio.favicon ? <Image source={{ uri: radio.favicon }} style={styles.dynamicBackground} contentFit="cover" cachePolicy="disk" /> : <LinearGradient colors={[`${radio.accent}66`, "#07090D"]} style={styles.dynamicBackground} />}{radio.favicon && <BlurView intensity={92} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.dynamicBackground} />}<LinearGradient colors={["#07090DCC", "#07090DF7"]} style={styles.backgroundOverlay} pointerEvents="none" /><Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={{ flex: 1 }}><View style={styles.header}><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cerrar reproductor" style={styles.back}><IconSymbol name="chevron.down" size={25} color="#F7F7F2" /></Pressable><View style={styles.headerCenter}><Text style={styles.headerTitle}>Radio Chile Glass</Text><Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">{radio.name}</Text></View><Pressable onPress={() => toggleFavorite(radio.id)} accessibilityRole="button" accessibilityLabel={isFavorite(radio.id) ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} style={styles.back}><IconSymbol name={isFavorite(radio.id) ? "heart.fill" : "heart"} size={22} color={isFavorite(radio.id) ? "#1ED760" : "#F7F7F2"} /></Pressable></View><Animated.View style={{ opacity: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1], extrapolate: "clamp" }), transform: [{ scale: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.scale, 1], extrapolate: "clamp" }) }, { translateX: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.translateX, 0], extrapolate: "clamp" }) }, { translateY: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.translateY, 0], extrapolate: "clamp" }) }, { scale: dismissY.interpolate({ inputRange: [0, 420], outputRange: [1, 0.52], extrapolate: "clamp" }) }, { translateY: dismissY.interpolate({ inputRange: [0, 420], outputRange: [0, 210], extrapolate: "clamp" }) }] }}><View ref={artworkRef} collapsable={false} onLayout={measureArtworkOrigin} style={styles.artworkFlowWrap}><CoverFlowCarousel radios={radios} activeIndex={currentIndex} onChange={changeRadio} onPlay={() => currentRadio?.id === radio.id ? togglePlay() : playRadio(radio)} isPlaying={isPlaying} currentRadioId={currentRadio?.id} lightMode={lightMode} /></View></Animated.View><View style={styles.liveMeta}><View style={styles.liveDot} /><Text style={styles.liveLabel}>EN VIVO</Text><Text style={styles.liveSeparator}>·</Text><Text style={styles.liveFrequency}>{radio.frequency}</Text></View><Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{radio.name}</Text><Text style={styles.meta}>{radio.city}  ·  {radio.genre}</Text>{playbackError ? <Pressable onPress={() => playRadio(radio)} accessibilityRole="button" accessibilityLabel={`Reintentar conexión con ${radio.name}`} style={styles.reconnectNotice}><Text style={styles.reconnectTitle}>No se pudo conectar</Text><Text style={styles.reconnectText}>Toca para reintentar la emisora.</Text></Pressable> : <NowPlayingLabel streamUrl={radio.streamUrl} />}<View style={styles.dialSection}><Pressable onPress={() => changeRadio(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.dialSkip, pressed && styles.navPressed]}><IconSymbol name="chevron.left" size={27} color="#F7F7F2" /></Pressable><Animated.View style={styles.liveDial}><View style={[styles.dialRing, { borderColor: `${radio.accent}88` }]} /><View style={[styles.dialRingInner, { borderColor: `${radio.accent}55` }]} /><View style={styles.dialCenter}><Pressable onPress={() => currentRadio?.id === radio.id ? togglePlay() : playRadio(radio)} accessibilityRole="button" accessibilityLabel={active ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`} style={({ pressed }) => [styles.dialButton, active && styles.dialButtonActive, pressed && styles.dialPressed]}><IconSymbol name={active ? "pause.fill" : "play.fill"} size={30} color="#F7F7F2" /></Pressable><Text style={styles.dialStatus}>{isLoading ? "CONECTANDO" : active ? "REPRODUCIENDO" : "LISTA PARA ESCUCHAR"}</Text><Text style={styles.dialCounter}>{currentIndex >= 0 ? `${currentIndex + 1} / ${radios.length}` : "—"}</Text></View></Animated.View><Pressable onPress={() => changeRadio(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.dialSkip, pressed && styles.navPressed]}><IconSymbol name="chevron.right" size={27} color="#F7F7F2" /></Pressable></View><View style={styles.signalRow}><AudioEqualizer playing={active} color={lightMode ? "#B9F6C5" : radio.accent} /><Text style={styles.signalText}>Señal en vivo · {radio.genre}</Text></View><View style={styles.actions}><Pressable onPress={openOfficialSite} disabled={!radio.homepage} accessibilityRole="button" accessibilityLabel={`Abrir sitio oficial de ${radio.name}`} style={({ pressed }) => [styles.siteButton, !radio.homepage && styles.disabled, pressed && { opacity: 0.75 }]}><IconSymbol name="globe" size={19} color="#F7F7F2" /><Text style={styles.siteText}>Web oficial</Text></Pressable><Pressable onPress={() => toggleFavorite(radio.id)} accessibilityRole="button" accessibilityLabel={isFavorite(radio.id) ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} style={({ pressed }) => [styles.favoriteButton, isFavorite(radio.id) && styles.favoriteButtonActive, pressed && styles.dialPressed]}><IconSymbol name={isFavorite(radio.id) ? "heart.fill" : "heart"} size={19} color={isFavorite(radio.id) ? "#0B0B0B" : "#F7F7F2"} /><Text style={[styles.favoriteText, isFavorite(radio.id) && styles.favoriteTextActive]}>{isFavorite(radio.id) ? "En favoritos" : "Guardar"}</Text></Pressable></View><View style={styles.infoCard}><Text style={styles.infoLabel}>SOBRE LA EMISORA</Text><Text style={styles.description} numberOfLines={6} ellipsizeMode="tail">{radio.description}</Text>{radio.homepage ? <Text style={styles.url} numberOfLines={1}>{radio.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Text> : <Text style={styles.unavailable}>Página oficial no disponible</Text>}</View></Animated.ScrollView></Animated.View></ScreenContainer>;
}
const styles = StyleSheet.create({ ghostMini: { position: "absolute", zIndex: 4, backgroundColor: "#151A24F2", borderWidth: 1, borderColor: "#FFFFFF1C" }, dynamicBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.72 }, backgroundOverlay: { ...StyleSheet.absoluteFillObject }, content: { paddingBottom: 42 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }, headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 }, headerTitle: { color: "#F7F7F2", fontSize: 16, fontWeight: "600" }, headerSubtitle: { color: "#AEB5C2", fontSize: 12, marginTop: 4 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF18", alignItems: "center", justifyContent: "center" }, artworkFlowWrap: { marginHorizontal: -20, marginBottom: 8, alignSelf: "stretch", overflow: "visible" }, artworkLight: { borderColor: "#D6DCEC" }, artwork: { height: 338, borderRadius: 34, alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 18, borderWidth: 1, borderColor: "#FFFFFF24" }, artGlow: { position: "absolute", width: 300, height: 300, borderRadius: 160, opacity: 0.48 }, coverFrame: { width: 230, height: 230, borderRadius: 38, backgroundColor: "#0B0D12CC", borderWidth: 1, borderColor: "#FFFFFF36", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 28, shadowOffset: { width: 0, height: 18 }, elevation: 10 }, coverShine: { position: "absolute", top: 20, left: 28, right: 28, height: 80, borderRadius: 70, backgroundColor: "#FFFFFF0A" }, artworkArrow: { position: "absolute", top: "50%", marginTop: -25, width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#05070BCC", borderWidth: 1, borderColor: "#FFFFFF30" }, artworkArrowLeft: { left: 13 }, artworkArrowRight: { right: 13 }, liveMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }, liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1ED760" }, liveLabel: { color: "#1ED760", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 }, liveSeparator: { color: "#798292", fontSize: 14 }, liveFrequency: { color: "#C8CDD6", fontSize: 13, fontWeight: "600" }, equalizer: { marginBottom: 12 }, name: { color: "#F7F7F2", fontSize: 31, fontWeight: "700", letterSpacing: -0.8, marginTop: 9 }, meta: { color: "#AEB5C2", fontSize: 14, marginTop: 7 }, dialSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 18 }, liveDial: { width: 178, height: 178, alignItems: "center", justifyContent: "center" }, dialRing: { position: "absolute", width: 174, height: 174, borderRadius: 100, borderWidth: 1 }, dialRingInner: { position: "absolute", width: 148, height: 148, borderRadius: 100, borderWidth: 1, opacity: 0.8 }, dialCenter: { alignItems: "center", justifyContent: "center" }, dialButton: { width: 78, height: 78, borderRadius: 40, backgroundColor: "#FFFFFF18", borderWidth: 1, borderColor: "#FFFFFF44", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 }, dialButtonActive: { backgroundColor: "#1ED760", borderColor: "#B9F6C5" }, dialStatus: { color: "#E5E9EF", fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginTop: 8 }, dialCounter: { color: "#8992A1", fontSize: 11, marginTop: 4, fontWeight: "600" }, dialSkip: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFFFFF0C", borderWidth: 1, borderColor: "#FFFFFF1C", alignItems: "center", justifyContent: "center" }, signalRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }, signalText: { color: "#9EA7B5", fontSize: 11, letterSpacing: 0.3 }, actions: { flexDirection: "row", gap: 10, marginBottom: 24 }, siteButton: { flex: 1, minHeight: 50, borderRadius: 18, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF20", flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" }, siteText: { color: "#F7F7F2", fontSize: 13, fontWeight: "600" }, favoriteButton: { flex: 1, minHeight: 50, borderRadius: 18, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF20", flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" }, favoriteButtonActive: { backgroundColor: "#1ED760", borderColor: "#B9F6C5" }, favoriteText: { color: "#F7F7F2", fontSize: 13, fontWeight: "600" }, favoriteTextActive: { color: "#0B0B0B" }, disabled: { opacity: 0.45 }, infoCard: { borderRadius: 22, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF14", padding: 20 }, infoLabel: { color: "#AEB5C2", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12 }, description: { color: "#E5E7EB", fontSize: 15, lineHeight: 23 }, url: { color: "#1ED760", fontSize: 12, marginTop: 15 }, unavailable: { color: "#7E8795", fontSize: 12, marginTop: 15 }, navPressed: { opacity: 0.65, transform: [{ scale: 0.96 }] }, dialPressed: { transform: [{ scale: 0.96 }], opacity: 0.82 }, notFound: { paddingTop: 100, alignItems: "center" }, notFoundTitle: { color: "#F7F7F2", fontSize: 20, fontWeight: "700" }, notFoundText: { color: "#8992A1", fontSize: 13, textAlign: "center", marginTop: 10 }, reconnectNotice: { borderRadius: 18, backgroundColor: "#FF6B5A18", borderWidth: 1, borderColor: "#FF6B5A66", paddingHorizontal: 16, paddingVertical: 12, marginTop: 14 }, reconnectTitle: { color: "#FF9A8E", fontSize: 13, fontWeight: "800" }, reconnectText: { color: "#D7B5B2", fontSize: 12, marginTop: 4 } });


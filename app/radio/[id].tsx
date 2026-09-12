import * as WebBrowser from "expo-web-browser";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AudioEqualizer } from "@/components/audio-equalizer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CoverFlowCarousel } from "@/components/cover-flow-carousel";
import { NowPlayingLabel } from "@/components/now-playing-label";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { dialStatusLabel, isLiveBadgeVisible, playbackControlLabel, playbackHandoff, stationPlaybackPhase } from "@/lib/player-utils";
import { useThemeContext } from "@/lib/theme-provider";
import { detailOpenedHaptic } from "@/lib/haptics";
import { nonInteractiveStyle, platformShadow } from "@/lib/platform-styles";

export default function RadioDetailScreen() {
  const router = useRouter();
  const { id, originX, originY, originWidth, originHeight, containerX, containerY, containerWidth, containerHeight, viewportWidth, viewportHeight } = useLocalSearchParams<{ id: string; originX?: string; originY?: string; originWidth?: string; originHeight?: string; containerX?: string; containerY?: string; containerWidth?: string; containerHeight?: string; viewportWidth?: string; viewportHeight?: string }>();
  const { radios, currentRadio, isPlaying, isLoading, playbackError, playRadio, togglePlay, toggleFavorite, isFavorite } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const lightMode = colorScheme === "light";
  const [selectedRadioId, setSelectedRadioId] = useState(id);
  const routePlaybackStartedRef = useRef<string | null>(null);
  const routeInitialisedRef = useRef(false);
  const radio = radios.find((item) => item.id === selectedRadioId);
  const backgroundRadio = radio;
  const dismissY = useRef(new Animated.Value(0)).current;
  const entryProgress = useRef(new Animated.Value(0)).current;
  const artworkRef = useRef<View>(null);
  const entryHapticSent = useRef(false);
  const entryAnimationStarted = useRef(false);
  const [entryOrigin, setEntryOrigin] = useState({ scale: 0.52, translateX: 0, translateY: 210 });

  useEffect(() => {
    routePlaybackStartedRef.current = null;
    routeInitialisedRef.current = false;
    if (id) setSelectedRadioId(id);
  }, [id]);

  useEffect(() => {
    if (!id || !radio || selectedRadioId !== id || routePlaybackStartedRef.current === id) return;
    routePlaybackStartedRef.current = id;
    const handoff = playbackHandoff(currentRadio?.id, id, isPlaying, isLoading, Boolean(playbackError));
    if (handoff === "start") void playRadio(radio, true);
    else if (handoff === "resume") togglePlay();
  }, [currentRadio?.id, id, isLoading, isPlaying, playRadio, playbackError, radio, selectedRadioId, togglePlay]);

  useEffect(() => {
    if (!routeInitialisedRef.current) {
      routeInitialisedRef.current = true;
      return;
    }
    if (isLoading || !currentRadio || currentRadio.id === selectedRadioId) return;
    setSelectedRadioId(currentRadio.id);
  }, [currentRadio?.id, isLoading, selectedRadioId]);

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
    if (hasMeasuredOrigin || entryAnimationStarted.current) return undefined;
    entryAnimationStarted.current = true;
    const animation = Animated.timing(entryProgress, { toValue: 1, duration: 240, useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished && !entryHapticSent.current) {
        entryHapticSent.current = true;
        detailOpenedHaptic();
      }
    });
    return () => animation.stop();
  }, [entryProgress, hasMeasuredOrigin]);

  useEffect(() => {
    if (!hasMeasuredOrigin) return;
    measureArtworkOrigin();
  }, [hasMeasuredOrigin, measureArtworkOrigin, windowWidth, windowHeight]);

  useEffect(() => {
    if (!hasMeasuredOrigin || entryAnimationStarted.current) return undefined;
    entryAnimationStarted.current = true;
    const animation = Animated.timing(entryProgress, { toValue: 1, duration: 240, useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished && !entryHapticSent.current) {
        entryHapticSent.current = true;
        detailOpenedHaptic();
      }
    });
    return () => animation.stop();
  }, [entryProgress, hasMeasuredOrigin]);

  const currentIndex = radios.findIndex((item) => item.id === radio?.id);
  const selectRadio = useCallback((nextRadio: Radio) => {
    setSelectedRadioId(nextRadio.id);
    void playRadio(nextRadio, nextRadio.id !== currentRadio?.id);
  }, [currentRadio?.id, playRadio]);

  const changeRadio = useCallback((direction: number) => {
    if (radios.length < 2 || currentIndex < 0) return;
    const nextIndex = (currentIndex + (direction < 0 ? -1 : 1) + radios.length) % radios.length;
    selectRadio(radios[nextIndex]);
  }, [currentIndex, radios, selectRadio]);

  const dismissDetail = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => dismissY.stopAnimation(),
    onPanResponderMove: (_, gesture) => dismissY.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 100 || gesture.vy > 0.8) {
        Animated.timing(dismissY, { toValue: 420, duration: 220, useNativeDriver: true }).start(({ finished }) => {
          if (finished) {
            dismissDetail();
            dismissY.setValue(0);
          }
        });
      } else {
        Animated.timing(dismissY, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      }
    },
  }), [dismissDetail, dismissY]);

  if (!radio) {
    return (
      <ScreenContainer containerClassName="bg-[#0B0B0B]" className="px-5 pt-3">
        <Pressable onPress={dismissDetail} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cerrar reproductor" style={styles.back}>
          <IconSymbol name="chevron.left" size={22} color="#F5F3EE" />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Radio no encontrada</Text>
          <Text style={styles.notFoundText}>La emisora pudo haber cambiado en la última actualización.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const phase = stationPlaybackPhase(currentRadio?.id, radio.id, isPlaying, isLoading, Boolean(playbackError));
  const active = phase === "playing";
  const connecting = phase === "connecting";
  const showLive = isLiveBadgeVisible(phase);
  const containerStyle = hasMeasuredContainer
    ? {
        left: Number(containerX) * viewportScaleX,
        top: Number(containerY) * viewportScaleY - insets.top,
        width: Number(containerWidth) * viewportScaleX,
        height: Number(containerHeight) * viewportScaleY,
        borderRadius: 20,
      }
    : null;

  const openOfficialSite = async () => {
    if (radio.homepage) await WebBrowser.openBrowserAsync(radio.homepage);
  };

  return (
    <ScreenContainer containerClassName="bg-[#07090D]" className="px-5 pt-3">
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          flex: 1,
          opacity: dismissY.interpolate({ inputRange: [0, 160], outputRange: [1, 0.72], extrapolate: "clamp" }),
          transform: [{ translateY: dismissY }],
        }}
      >
        {containerStyle && (
          <Animated.View
            style={[
              styles.ghostMini,
              containerStyle,
              { opacity: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 0], extrapolate: "clamp" }) },
              nonInteractiveStyle,
            ]}
          />
        )}
        {backgroundRadio?.favicon ? (
          <Image
            key={`background-${backgroundRadio.id}-${backgroundRadio.favicon}`}
            source={{ uri: backgroundRadio.favicon }}
            style={styles.dynamicBackground}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
          />
        ) : (
          <LinearGradient
            key={`background-${backgroundRadio?.id ?? "empty"}`}
            colors={[`${backgroundRadio?.accent ?? "#2D4159"}66`, "#07090D"]}
            style={styles.dynamicBackground}
          />
        )}
        {backgroundRadio?.favicon && (
          <BlurView key={`blur-${backgroundRadio.id}`} intensity={48} tint="dark" style={styles.dynamicBackground} />
        )}
        <LinearGradient colors={["#07090DCC", "#07090DF7"]} style={[styles.backgroundOverlay, nonInteractiveStyle]} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={{ flex: 1 }}>
          <View style={styles.header}>
            <Pressable onPress={dismissDetail} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cerrar reproductor" style={[styles.back, styles.headerAction]}>
              <IconSymbol name="chevron.down" size={25} color="#F7F7F2" />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Radio Chile Glass</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">{radio.name}</Text>
            </View>
            <Pressable onPress={() => toggleFavorite(radio.id)} accessibilityRole="button" accessibilityLabel={isFavorite(radio.id) ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} style={styles.back}>
              <IconSymbol name={isFavorite(radio.id) ? "heart.fill" : "heart"} size={22} color={isFavorite(radio.id) ? "#1ED760" : "#F7F7F2"} />
            </Pressable>
          </View>
          <Animated.View
            style={{
              opacity: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1], extrapolate: "clamp" }),
              transform: [
                { scale: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.scale, 1], extrapolate: "clamp" }) },
                { translateX: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.translateX, 0], extrapolate: "clamp" }) },
                { translateY: entryProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOrigin.translateY, 0], extrapolate: "clamp" }) },
                { scale: dismissY.interpolate({ inputRange: [0, 420], outputRange: [1, 0.52], extrapolate: "clamp" }) },
                { translateY: dismissY.interpolate({ inputRange: [0, 420], outputRange: [0, 210], extrapolate: "clamp" }) },
              ],
            }}
          >
            <View ref={artworkRef} collapsable={false} onLayout={measureArtworkOrigin} style={styles.artworkFlowWrap}>
              <CoverFlowCarousel
                radios={radios}
                activeIndex={currentIndex}
                onSelect={selectRadio}
                onPlay={() => (currentRadio?.id === radio.id ? togglePlay() : playRadio(radio, true))}
                isPlaying={isPlaying}
                isLoading={isLoading && currentRadio?.id === radio.id}
                currentRadioId={currentRadio?.id}
                lightMode={lightMode}
              />
            </View>
          </Animated.View>
          <View style={styles.liveMeta}>
            {showLive ? (
              <>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>EN VIVO</Text>
                <Text style={styles.liveSeparator}>·</Text>
              </>
            ) : connecting ? (
              <>
                <View style={[styles.liveDot, styles.liveDotConnecting]} />
                <Text style={styles.liveLabelConnecting}>CONECTANDO</Text>
                <Text style={styles.liveSeparator}>·</Text>
              </>
            ) : phase === "error" ? (
              <>
                <View style={[styles.liveDot, styles.liveDotError]} />
                <Text style={styles.liveLabelError}>SIN SEÑAL</Text>
                <Text style={styles.liveSeparator}>·</Text>
              </>
            ) : null}
            <Text style={styles.liveFrequency}>{radio.frequency}</Text>
          </View>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{radio.name}</Text>
          <Text style={styles.meta}>{radio.city}  ·  {radio.genre}</Text>
          {playbackError ? (
            <Pressable onPress={() => playRadio(radio)} accessibilityRole="button" accessibilityLabel={`Reintentar conexión con ${radio.name}`} style={styles.reconnectNotice}>
              <Text style={styles.reconnectTitle}>No se pudo conectar</Text>
              <Text style={styles.reconnectText}>Toca para reintentar la emisora.</Text>
            </Pressable>
          ) : (
            <NowPlayingLabel streamUrl={radio.streamUrl} />
          )}
          <View style={styles.dialSection}>
            <Pressable onPress={() => changeRadio(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.dialSkip, pressed && styles.navPressed]}>
              <IconSymbol name="chevron.left" size={27} color="#F7F7F2" />
            </Pressable>
            <Animated.View style={styles.liveDial}>
              <View style={[styles.dialRing, { borderColor: `${radio.accent}88` }]} />
              <View style={[styles.dialRingInner, { borderColor: `${radio.accent}55` }]} />
              <View style={styles.dialCenter}>
                <Pressable
                  onPress={() => {
                    if (phase === "error") void playRadio(radio, true);
                    else if (currentRadio?.id === radio.id) togglePlay();
                    else void playRadio(radio, true);
                  }}
                  disabled={connecting}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: connecting, busy: connecting }}
                  accessibilityLabel={playbackControlLabel(phase, radio.name)}
                  style={({ pressed }) => [
                    styles.dialButton,
                    active && styles.dialButtonActive,
                    connecting && styles.dialButtonConnecting,
                    phase === "error" && styles.dialButtonError,
                    pressed && !connecting && styles.dialPressed,
                  ]}
                >
                  {connecting ? (
                    <ActivityIndicator size="large" color="#F7F7F2" />
                  ) : (
                    <IconSymbol
                      name={active ? "pause.fill" : phase === "error" ? "arrow.clockwise" : "play.fill"}
                      size={30}
                      color="#F7F7F2"
                    />
                  )}
                </Pressable>
                <Text style={[styles.dialStatus, active && styles.dialStatusActive, phase === "error" && styles.dialStatusError]}>
                  {dialStatusLabel(phase)}
                </Text>
                <Text style={styles.dialCounter}>{currentIndex >= 0 ? `${currentIndex + 1} / ${radios.length}` : "—"}</Text>
              </View>
            </Animated.View>
            <Pressable onPress={() => changeRadio(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.dialSkip, pressed && styles.navPressed]}>
              <IconSymbol name="chevron.right" size={27} color="#F7F7F2" />
            </Pressable>
          </View>
          <View style={styles.signalRow}>
            <AudioEqualizer playing={active} color={lightMode ? "#B9F6C5" : radio.accent} />
            <Text style={styles.signalText}>Señal en vivo · {radio.genre}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={openOfficialSite} disabled={!radio.homepage} accessibilityRole="button" accessibilityLabel={`Abrir sitio oficial de ${radio.name}`} style={({ pressed }) => [styles.siteButton, !radio.homepage && styles.disabled, pressed && { opacity: 0.75 }]}>
              <IconSymbol name="globe" size={19} color="#F7F7F2" />
              <Text style={styles.siteText}>Web oficial</Text>
            </Pressable>
            <Pressable onPress={() => toggleFavorite(radio.id)} accessibilityRole="button" accessibilityLabel={isFavorite(radio.id) ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} style={({ pressed }) => [styles.favoriteButton, isFavorite(radio.id) && styles.favoriteButtonActive, pressed && styles.dialPressed]}>
              <IconSymbol name={isFavorite(radio.id) ? "heart.fill" : "heart"} size={19} color={isFavorite(radio.id) ? "#0B0B0B" : "#F7F7F2"} />
              <Text style={[styles.favoriteText, isFavorite(radio.id) && styles.favoriteTextActive]}>{isFavorite(radio.id) ? "En favoritos" : "Guardar"}</Text>
            </Pressable>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SOBRE LA EMISORA</Text>
            <Text style={styles.description} numberOfLines={6} ellipsizeMode="tail">{radio.description}</Text>
            {radio.homepage ? (
              <Text style={styles.url} numberOfLines={1}>{radio.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Text>
            ) : (
              <Text style={styles.unavailable}>Página oficial no disponible</Text>
            )}
          </View>
        </Animated.ScrollView>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ghostMini: { position: "absolute", zIndex: 4, backgroundColor: "#151A24F2", borderWidth: 1, borderColor: "#FFFFFF1C" },
  dynamicBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.72 },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject },
  content: { paddingBottom: 42 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  headerTitle: { color: "#F7F7F2", fontSize: 16, fontWeight: "600" },
  headerSubtitle: { color: "#AEB5C2", fontSize: 12, marginTop: 4 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF18", alignItems: "center", justifyContent: "center" },
  headerAction: { zIndex: 30, elevation: 12 },
  artworkFlowWrap: { marginHorizontal: -20, marginBottom: 8, alignSelf: "stretch", overflow: "visible" },
  liveMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1ED760" },
  liveDotConnecting: { backgroundColor: "#F5A524" },
  liveDotError: { backgroundColor: "#FF6B5A" },
  liveLabel: { color: "#1ED760", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },
  liveLabelConnecting: { color: "#F5A524", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },
  liveLabelError: { color: "#FF6B5A", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },
  liveSeparator: { color: "#798292", fontSize: 14 },
  liveFrequency: { color: "#C8CDD6", fontSize: 13, fontWeight: "600" },
  name: { color: "#F7F7F2", fontSize: 31, fontWeight: "700", letterSpacing: -0.8, marginTop: 9 },
  meta: { color: "#AEB5C2", fontSize: 14, marginTop: 7 },
  dialSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 18 },
  liveDial: { width: 178, height: 178, alignItems: "center", justifyContent: "center" },
  dialRing: { position: "absolute", width: 174, height: 174, borderRadius: 87, borderWidth: 2 },
  dialRingInner: { position: "absolute", width: 148, height: 148, borderRadius: 74, borderWidth: 1 },
  dialCenter: { alignItems: "center", justifyContent: "center", gap: 8 },
  dialButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center" },
  dialButtonActive: { backgroundColor: "#1ED76033" },
  dialButtonConnecting: { backgroundColor: "#F5A52433" },
  dialButtonError: { backgroundColor: "#FF6B5A33" },
  dialPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  dialStatus: { color: "#AEB5C2", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  dialStatusActive: { color: "#1ED760" },
  dialStatusError: { color: "#FF6B5A" },
  dialCounter: { color: "#798292", fontSize: 11 },
  dialSkip: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFFFFF0D", alignItems: "center", justifyContent: "center" },
  navPressed: { opacity: 0.7 },
  signalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  signalText: { color: "#AEB5C2", fontSize: 13 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 18 },
  siteButton: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: "#FFFFFF12", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  siteText: { color: "#F7F7F2", fontSize: 14, fontWeight: "600" },
  favoriteButton: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: "#FFFFFF12", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  favoriteButtonActive: { backgroundColor: "#1ED760" },
  favoriteText: { color: "#F7F7F2", fontSize: 14, fontWeight: "600" },
  favoriteTextActive: { color: "#0B0B0B" },
  disabled: { opacity: 0.4 },
  infoCard: { borderRadius: 18, backgroundColor: "#FFFFFF0A", borderWidth: 1, borderColor: "#FFFFFF12", padding: 16 },
  infoLabel: { color: "#798292", fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  description: { color: "#C8CDD6", fontSize: 14, lineHeight: 21 },
  url: { color: "#1ED760", fontSize: 12, marginTop: 10 },
  unavailable: { color: "#798292", fontSize: 12, marginTop: 10 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  notFoundTitle: { color: "#F7F7F2", fontSize: 18, fontWeight: "700" },
  notFoundText: { color: "#AEB5C2", fontSize: 14, marginTop: 8, textAlign: "center" },
  reconnectNotice: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: "#FF6B5A22", borderWidth: 1, borderColor: "#FF6B5A44" },
  reconnectTitle: { color: "#FF6B5A", fontSize: 13, fontWeight: "800" },
  reconnectText: { color: "#D7B5B2", fontSize: 12, marginTop: 4 },
});

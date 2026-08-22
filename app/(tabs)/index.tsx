import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { StationLogo } from "@/components/station-logo";
import { AudioEqualizer } from "@/components/audio-equalizer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useThemeContext } from "@/lib/theme-provider";
import { favoriteAddedHaptic, favoriteRemovedHaptic } from "@/lib/haptics";
import { FavoriteToast } from "@/components/favorite-toast";
import { AnimatedFavoriteIcon } from "@/components/animated-favorite-icon";

function RadioRow({ radio, onOpen, onPlay, onFavorite, favorite, lightMode, loading, playing }: { radio: Radio; onOpen: () => void; onPlay: () => void; onFavorite: () => void; favorite: boolean; lightMode: boolean; loading: boolean; playing: boolean }) {
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.radioRow, lightMode && styles.radioRowLight, pressed && styles.pressed]}>
      <StationLogo radio={radio} size={54} radius={16} />
      <View style={styles.radioInfo}>
        <Text style={[styles.radioName, lightMode && styles.radioNameLight]}>{radio.name}</Text>
        <Text style={[styles.radioMeta, lightMode && styles.radioMetaLight]}>{radio.frequency}  ·  {radio.genre}</Text>
      </View>
      <Pressable onPress={onFavorite} hitSlop={10} accessibilityRole="button" accessibilityLabel={favorite ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} accessibilityState={{ selected: favorite }} style={({ pressed }) => [styles.iconButton, favorite && styles.iconButtonActive, pressed && styles.controlPressed]}>

        <AnimatedFavoriteIcon active={favorite} color={favorite ? "#D64E4A" : lightMode ? "#667085" : "#A8B0C2"} />
      </Pressable>
      <Pressable onPress={onPlay} accessibilityRole="button" accessibilityLabel={loading ? `Conectando con ${radio.name}` : playing ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`} style={({ pressed }) => [styles.playMini, lightMode && styles.playMiniLight, playing && styles.playMiniActive, pressed && styles.controlPressed]}>{loading ? <ActivityIndicator size="small" color={lightMode ? "#F8FAFC" : "#F5F3EE"} /> : <IconSymbol name={playing ? "pause.fill" : "play.fill"} size={16} color={lightMode ? "#F8FAFC" : "#F5F3EE"} />}</Pressable>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { currentRadio, isPlaying, isLoading, playRadio, togglePlay, toggleFavorite, isFavorite, radios, refreshCatalog, isRefreshingCatalog, catalogSource } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const lightMode = colorScheme === "light";
  const [query, setQuery] = useState("");
  const [favoriteNotice, setFavoriteNotice] = useState<string | null>(null);
  const [miniRadio, setMiniRadio] = useState<Radio | null>(currentRadio);
  const miniProgress = useRef(new Animated.Value(currentRadio ? 1 : 0)).current;
  const miniLogoRef = useRef<View>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  useEffect(() => {
    let active = true;
    if (currentRadio) {
      setMiniRadio(currentRadio);
      Animated.timing(miniProgress, { toValue: 1, duration: 240, useNativeDriver: true }).start();
      return () => { active = false; };

    }
    Animated.timing(miniProgress, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished && active) setMiniRadio(null);
    });
    return () => { active = false; };
  }, [currentRadio, miniProgress]);
  const handleFavorite = (id: string, name: string) => { const saved = !isFavorite(id); toggleFavorite(id); if (saved) favoriteAddedHaptic(); else favoriteRemovedHaptic(); setFavoriteNotice(saved ? `${name} guardada en favoritos` : `${name} quitada de favoritos`); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setFavoriteNotice(null), 1700); };
  const filtered = useMemo(() => radios.filter((radio) => `${radio.name} ${radio.genre} ${radio.city}`.toLowerCase().includes(query.toLowerCase())), [query, radios]);
  const openMiniDetail = (radio: Radio) => {
    miniLogoRef.current?.measureInWindow((x, y, width, height) => {
      router.push({ pathname: "/radio/[id]", params: { id: radio.id, originX: x.toFixed(2), originY: y.toFixed(2), originWidth: width.toFixed(2), originHeight: height.toFixed(2) } });
    });
  };
  const featured = currentRadio ?? radios[0];

  return (
    <ScreenContainer containerClassName="bg-[#090B12]" className="px-5 pt-3">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <View><Text style={styles.eyebrow}>RADIO CHILE</Text><Text style={styles.title}>Escucha lo que{`\n`}te mueve.</Text></View>
              <Pressable onPress={() => refreshCatalog()} style={styles.settingsButton}><IconSymbol name="slider.horizontal.3" size={21} color="#F5F3EE" /></Pressable>
            </View>
            <View style={styles.searchWrap}><IconSymbol name="magnifyingglass" size={18} color="#A8B0C2" /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar radio, ciudad o género" placeholderTextColor="#7F8799" style={styles.searchInput} /></View>
            <View style={styles.syncRow}><Text style={styles.sectionLabel}>AHORA SONANDO</Text><Text style={styles.syncText}>{isRefreshingCatalog ? "Actualizando..." : catalogSource === "remote" ? "Catálogo actualizado" : "Modo sin conexión"}</Text></View>
            <Pressable onPress={() => playRadio(featured)} style={({ pressed }) => [styles.hero, lightMode && styles.heroLight, pressed && styles.pressed]}>
              <LinearGradient colors={lightMode ? [`${featured.accent}CC`, "#EEF2FF", "#F8FAFC"] : [`${featured.accent}AA`, "#1A2033", "#101522"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={[styles.heroOrb, lightMode && styles.heroOrbLight]} /><View style={styles.heroLogo}><StationLogo radio={featured} size={104} radius={30} /></View><View style={styles.heroTop}><View style={[styles.liveDot, { backgroundColor: isPlaying ? "#76E0B5" : "#FFB86B" }]} /><Text style={[styles.liveText, lightMode && styles.heroTextLight]}>{isPlaying ? "EN VIVO" : "LISTA PARA ESCUCHAR"}</Text><Text style={[styles.heroFreq, lightMode && styles.heroTextLight]}>{featured.frequency}</Text></View>
              <View style={styles.heroBottom}><Text style={[styles.heroName, lightMode && styles.heroTextLight]}>{featured.name}</Text><Text style={[styles.heroGenre, lightMode && styles.heroSubtextLight]}>{featured.city}  ·  {featured.genre}</Text></View>
              <Pressable onPress={togglePlay} style={[styles.heroPlay, lightMode && styles.heroPlayLight]}><IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={25} color={lightMode ? "#F8FAFC" : "#090B12"} /></Pressable>
            </Pressable>
            <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>PARA TI</Text><Pressable onPress={() => router.push("/explore")}><Text style={styles.seeAll}>Ver todas</Text></Pressable></View>
          </>
        }
        renderItem={({ item }) => <RadioRow radio={item} lightMode={lightMode} loading={isLoading && currentRadio?.id === item.id} playing={isPlaying && currentRadio?.id === item.id} onOpen={() => router.push(`/radio/${item.id}`)} onPlay={() => playRadio(item)} onFavorite={() => handleFavorite(item.id, item.name)} favorite={isFavorite(item.id)} />}
        ListEmptyComponent={<Text style={styles.empty}>No encontramos una radio con ese nombre.</Text>}
        ListFooterComponent={<View style={{ height: currentRadio ? 96 : 24 }} />}
      />
      {miniRadio && <Animated.View style={[styles.miniPlayer, { opacity: miniProgress, transform: [{ translateY: miniProgress.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }] }]}><Pressable onPress={() => openMiniDetail(miniRadio)} style={({ pressed }) => [styles.miniMain, pressed && { opacity: 0.78 }]}><View ref={miniLogoRef} collapsable={false}><StationLogo radio={miniRadio} size={48} radius={14} /></View><View style={{ flex: 1 }}><Text style={styles.miniName}>{miniRadio.name}</Text><Text style={styles.miniMeta}>{isLoading ? "Conectando..." : isPlaying ? "Reproduciendo ahora" : "En pausa"}</Text></View><AudioEqualizer playing={isPlaying} color={lightMode ? "#C2413E" : miniRadio.accent} barCount={5} compact /></Pressable><Pressable onPress={togglePlay} style={({ pressed }) => [styles.miniControl, pressed && { opacity: 0.72 }]}><IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={20} color="#F5F3EE" /></Pressable></Animated.View>}
    <FavoriteToast message={favoriteNotice} /></ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  eyebrow: { color: "#FF8C7F", fontSize: 12, fontWeight: "700", letterSpacing: 2.1, marginBottom: 8 },
  title: { color: "#F5F3EE", fontSize: 34, lineHeight: 39, fontWeight: "700", letterSpacing: -1.2 },
  settingsButton: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, borderColor: "#FFFFFF1C", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF0D" },
  searchWrap: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF14", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 28 },
  searchInput: { flex: 1, marginLeft: 10, color: "#F5F3EE", fontSize: 14 },
  sectionLabel: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 },
  syncRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  syncText: { color: "#76E0B5", fontSize: 10, fontWeight: "600", marginBottom: 12 },
  heroLight: { borderColor: "#CBD5E1" }, hero: { height: 210, borderRadius: 26, overflow: "hidden", padding: 20, marginBottom: 28, borderWidth: 1, borderColor: "#FFFFFF20", justifyContent: "space-between" },
  heroLogo: { position: "absolute", right: 18, top: 54, opacity: 0.96 },
  heroTextLight: { color: "#172033" }, heroSubtextLight: { color: "#46536B" }, heroPlayLight: { backgroundColor: "#172033" },
  heroOrbLight: { backgroundColor: "#FFFFFF55", borderColor: "#FFFFFFAA" }, heroOrb: { position: "absolute", width: 190, height: 190, borderRadius: 100, right: -35, top: -48, backgroundColor: "#FFFFFF0B", borderWidth: 1, borderColor: "#FFFFFF10" },
  heroTop: { flexDirection: "row", alignItems: "center" },
  liveDot: { width: 8, height: 8, borderRadius: 5, marginRight: 8 },
  liveText: { color: "#F5F3EE", fontSize: 10, fontWeight: "700", letterSpacing: 1.3 },
  heroFreq: { marginLeft: "auto", color: "#D8D9E0", fontSize: 12, fontWeight: "600" },
  heroBottom: { marginBottom: 2 },
  heroName: { color: "#F5F3EE", fontSize: 27, fontWeight: "700", letterSpacing: -0.5 },
  heroGenre: { color: "#D0D3DD", fontSize: 13, marginTop: 5 },
  heroPlay: { position: "absolute", right: 20, bottom: 18, width: 52, height: 52, borderRadius: 26, backgroundColor: "#F5F3EE", alignItems: "center", justifyContent: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  seeAll: { color: "#FF8C7F", fontSize: 13, fontWeight: "600", marginBottom: 12 },
  controlPressed: { opacity: 0.62, transform: [{ scale: 0.94 }] }, iconButtonActive: { backgroundColor: "#FF6B5F1C", borderRadius: 12 }, playMiniActive: { backgroundColor: "#D64E4A" },
  radioRowLight: { backgroundColor: "#FFFFFFD9", borderColor: "#D9E0EC" }, radioNameLight: { color: "#172033" }, radioMetaLight: { color: "#5B667B" }, playMiniLight: { backgroundColor: "#172033" },
  radioRow: { minHeight: 75, borderRadius: 19, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF0E", padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  radioInfo: { flex: 1, marginLeft: 13 },
  radioName: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" },
  radioMeta: { color: "#8D95A7", fontSize: 12, marginTop: 5 },
  iconButton: { padding: 8 },
  playMini: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", marginLeft: 4 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  empty: { color: "#A8B0C2", textAlign: "center", paddingVertical: 30 },
  miniPlayer: { position: "absolute", left: 16, right: 16, bottom: 8, minHeight: 68, borderRadius: 20, backgroundColor: "#1D2333F2", borderWidth: 1, borderColor: "#FFFFFF1C", padding: 9, flexDirection: "row", alignItems: "center", gap: 12 },
  miniMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 }, miniControl: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },   miniName: { color: "#F5F3EE", fontSize: 14, fontWeight: "700" },
  miniMeta: { color: "#9AA2B3", fontSize: 11, marginTop: 4 },
});

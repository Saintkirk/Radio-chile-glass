import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ItunesRadioCard } from "@/components/itunes-radio-card";
import { CoverFlowCarousel } from "@/components/cover-flow-carousel";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useThemeContext } from "@/lib/theme-provider";
import { favoriteAddedHaptic, favoriteRemovedHaptic } from "@/lib/haptics";
import { FavoriteToast } from "@/components/favorite-toast";
import { AnimatedFavoriteIcon } from "@/components/animated-favorite-icon";
import { prefetchLogo } from "@/lib/logo-cache";

const prefetchedFeaturedLogos = new Set<string>();

function RadioRow({ radio, onOpen, onPlay, onFavorite, favorite, lightMode, playing }: { radio: Radio; onOpen: () => void; onPlay: () => void; onFavorite: () => void; favorite: boolean; lightMode: boolean; loading: boolean; playing: boolean }) {
  return <ItunesRadioCard
    radio={radio}
    onOpen={onOpen}
    onPlay={onPlay}
    playing={playing}
    lightMode={lightMode}
    trailing={<Pressable onPress={(event) => { event.stopPropagation(); onFavorite(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={favorite ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} accessibilityState={{ selected: favorite }} style={({ pressed }) => [styles.iconButton, favorite && styles.iconButtonActive, pressed && styles.controlPressed]}><AnimatedFavoriteIcon active={favorite} color={favorite ? "#B83E46" : lightMode ? "#667085" : "#A8B0C2"} /></Pressable>}
  />;
}

export default function HomeScreen() {
  const router = useRouter();
  const { currentRadio, isPlaying, isLoading, playRadio, togglePlay, toggleFavorite, isFavorite, radios, refreshCatalog, isRefreshingCatalog, catalogSource } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const lightMode = colorScheme === "light";
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("Todo");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [favoriteNotice, setFavoriteNotice] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  useEffect(() => {
    const featuredLogos = radios.filter((radio) => radio.featured && radio.favicon).map((radio) => radio.favicon as string);
    const pendingLogos = featuredLogos.filter((uri) => !prefetchedFeaturedLogos.has(uri));
    pendingLogos.forEach((uri) => prefetchedFeaturedLogos.add(uri));
    if (pendingLogos.length) void Promise.allSettled(pendingLogos.map((uri) => prefetchLogo(uri)));
  }, [radios]);
  const handleFavorite = (id: string, name: string) => { const saved = !isFavorite(id); toggleFavorite(id); if (saved) favoriteAddedHaptic(); else favoriteRemovedHaptic(); setFavoriteNotice(saved ? `${name} guardada en favoritos` : `${name} quitada de favoritos`); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setFavoriteNotice(null), 1700); };
  const filtered = useMemo(() => {
    const matching = radios.filter((radio) => {
      const matchesQuery = `${radio.name} ${radio.genre} ${radio.city}`.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = activeGenre === "Todo" || radio.genre.toLowerCase().includes(activeGenre.toLowerCase());
      return matchesQuery && matchesGenre;
    });
    return matching.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [activeGenre, query, radios]);
  useEffect(() => { setFeaturedIndex((index) => filtered.length ? index % filtered.length : 0); }, [filtered.length]);
  const browseFeatured = (direction: number) => {
    const total = filtered.length;
    if (!total) return;
    const nextIndex = (featuredIndex + direction + total) % total;
    const nextRadio = filtered[nextIndex];
    setFeaturedIndex(nextIndex);
    void playRadio(nextRadio);
  };
  const featured = filtered[featuredIndex] ?? currentRadio ?? radios[0];

  return (
    <ScreenContainer containerClassName="bg-background" className="px-5 pt-3">
      <View pointerEvents="none" style={styles.ambientLayer}><ImageBackground source={{ uri: "/manus-storage/santiago-radio-background_b74a8a21.jpg" }} resizeMode="cover" style={styles.ambient} imageStyle={styles.ambientImage}><View style={styles.ambientTint} /><View style={styles.ambientCoral} /><View style={styles.ambientViolet} /><View style={styles.ambientHorizon} /></ImageBackground></View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.push("/explore")} accessibilityRole="button" accessibilityLabel="Abrir exploración" style={({ pressed }) => [styles.headerButton, pressed && styles.controlPressed]}><IconSymbol name="line.3.horizontal" size={22} color="#F5F3EE" /></Pressable>
              <View style={styles.brandLockup}><View style={styles.brandLine}><Text style={styles.brandRadio}>Radio</Text><Text style={[styles.brandChile, lightMode && styles.brandChileLight]}> Chile </Text><Text style={styles.brandGlass}>Glass</Text></View><Text style={styles.brandTagline}>LO MEJOR SUENA AQUÍ</Text></View>
              <Pressable onPress={() => router.push("/settings")} accessibilityRole="button" accessibilityLabel="Abrir ajustes" style={({ pressed }) => [styles.headerButton, pressed && styles.controlPressed]}><IconSymbol name="slider.horizontal.3" size={21} color="#F5F3EE" /></Pressable>
            </View>
            <View style={[styles.searchWrap, lightMode && styles.searchWrapLight]}><IconSymbol name="magnifyingglass" size={18} color={lightMode ? "#667085" : "#A8B0C2"} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar radio, ciudad o género" placeholderTextColor={lightMode ? "#667085" : "#7F8799"} style={[styles.searchInput, lightMode && styles.searchInputLight]} /></View>
            <View style={styles.genreRail}>{["Todo", "Noticias", "Música", "Rock", "Romántica", "Clásica"].map((genre) => <Pressable key={genre} onPress={() => setActiveGenre(genre)} style={[styles.genreChip, lightMode && styles.genreChipLight, activeGenre === genre && styles.genreChipActive]}><Text style={[styles.genreChipText, lightMode && styles.genreChipTextLight, activeGenre === genre && styles.genreChipTextActive]}>{genre}</Text></Pressable>)}</View>
            <View style={[styles.syncRow, lightMode && styles.syncRowLight]}><Text style={[styles.sectionLabel, lightMode && styles.sectionLabelLight]}>AHORA SONANDO</Text><Pressable onPress={() => refreshCatalog()} accessibilityRole="button" accessibilityLabel="Actualizar catálogo de radios" style={({ pressed }) => [styles.syncButton, pressed && styles.controlPressed]}><Text style={styles.syncText}>{isRefreshingCatalog ? "Actualizando..." : catalogSource === "remote" ? "CATÁLOGO EN VIVO" : "MODO SIN CONEXIÓN"}</Text></Pressable></View>
            <CoverFlowCarousel radios={filtered} activeIndex={featuredIndex} onChange={browseFeatured} onPlay={() => currentRadio?.id === featured.id ? togglePlay() : playRadio(featured)} isPlaying={isPlaying} currentRadioId={currentRadio?.id} lightMode={lightMode} />
            <View style={styles.sectionHeader}><Text style={[styles.sectionLabel, lightMode && styles.sectionLabelLight]}>EMISORAS DESTACADAS</Text><Pressable onPress={() => router.push("/explore")}><Text style={styles.seeAll}>Ver todas</Text></Pressable></View>
          </>
        }
        renderItem={({ item }) => <RadioRow radio={item} lightMode={lightMode} loading={isLoading && currentRadio?.id === item.id} playing={isPlaying && currentRadio?.id === item.id} onOpen={() => router.push(`/radio/${item.id}`)} onPlay={() => currentRadio?.id === item.id ? togglePlay() : playRadio(item)} onFavorite={() => handleFavorite(item.id, item.name)} favorite={isFavorite(item.id)} />}
        ListEmptyComponent={<Text style={styles.empty}>No encontramos una radio con ese nombre.</Text>}
        ListFooterComponent={<View style={{ height: currentRadio ? 96 : 24 }} />}
      />
    <FavoriteToast message={favoriteNotice} /></ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  ambientLayer: { ...StyleSheet.absoluteFillObject }, ambient: { ...StyleSheet.absoluteFillObject, overflow: "hidden", backgroundColor: "#08090E" }, ambientImage: { opacity: 0.66 }, ambientTint: { ...StyleSheet.absoluteFillObject, backgroundColor: "#05060B7A" }, ambientCoral: { position: "absolute", width: 330, height: 240, borderRadius: 180, top: 80, left: -100, backgroundColor: "#B52F3C38", transform: [{ rotate: "-12deg" }] }, ambientViolet: { position: "absolute", width: 300, height: 260, borderRadius: 180, top: 110, right: -120, backgroundColor: "#6A35A53D", transform: [{ rotate: "18deg" }] }, ambientHorizon: { position: "absolute", left: -40, right: -40, top: 270, height: 2, backgroundColor: "#FF6B5A66", opacity: 0.45 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  brandLockup: { alignItems: "center", flex: 1 }, brandLine: { flexDirection: "row", alignItems: "baseline" }, brandRadio: { color: "#FF6B5A", fontSize: 25, fontWeight: "400", letterSpacing: -1 }, brandChile: { color: "#F5F3EE", fontSize: 25, fontWeight: "400", letterSpacing: -1 }, brandChileLight: { color: "#241B24" }, brandGlass: { color: "#B66BFF", fontSize: 25, fontWeight: "400", letterSpacing: -1 }, brandTagline: { color: "#C7B9C3", fontSize: 9, letterSpacing: 3.7, marginTop: 5 },
  headerButton: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, borderColor: "#FFFFFF1C", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF0D" },
  eyebrow: { color: "#FF6B5A", fontSize: 12, fontWeight: "700", letterSpacing: 2.1, marginBottom: 8 },
  title: { color: "#F5F3EE", fontSize: 34, lineHeight: 39, fontWeight: "700", letterSpacing: -1.2 }, titleLight: { color: "#172033" },
  settingsButton: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, borderColor: "#FFFFFF1C", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF0D" },
  searchWrap: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF14", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 28 }, searchWrapLight: { backgroundColor: "#FFFFFF", borderColor: "#D9E0EC" },
  searchInput: { flex: 1, marginLeft: 10, color: "#F5F3EE", fontSize: 14 }, searchInputLight: { color: "#172033" },
  sectionLabel: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 }, sectionLabelLight: { color: "#5B667B" },
  syncRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, syncRowLight: { },
  syncButton: { marginBottom: 12 }, syncText: { color: "#FF6B5A", fontSize: 10, fontWeight: "600" },
  heroLight: { borderColor: "#CBD5E1" }, hero: { height: 244, borderRadius: 26, overflow: "hidden", padding: 20, marginBottom: 28, borderWidth: 1, borderColor: "#FFFFFF20", justifyContent: "space-between" },
  heroLogo: { position: "absolute", right: 24, top: 48, opacity: 0.98, transform: [{ rotate: "3deg" }] },
  heroTextLight: { color: "#172033" }, heroSubtextLight: { color: "#46536B" }, heroPlayLight: { backgroundColor: "#172033" },
  heroOrbLight: { backgroundColor: "#FFFFFF55", borderColor: "#FFFFFFAA" }, heroOrb: { position: "absolute", width: 190, height: 190, borderRadius: 100, right: -35, top: -48, backgroundColor: "#FFFFFF0B", borderWidth: 1, borderColor: "#FFFFFF10" },
  heroTop: { flexDirection: "row", alignItems: "center" },
  liveDot: { width: 8, height: 8, borderRadius: 5, marginRight: 8 },
  liveText: { color: "#F5F3EE", fontSize: 10, fontWeight: "700", letterSpacing: 1.3 },
  heroFreq: { marginLeft: "auto", color: "#D8D9E0", fontSize: 12, fontWeight: "600" },
  heroNav: { position: "absolute", right: 20, bottom: 78, flexDirection: "row", alignItems: "center", gap: 6 }, heroNavButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF24", alignItems: "center", justifyContent: "center" }, heroNavLabel: { color: "#D0D3DD", fontSize: 10, fontWeight: "700", minWidth: 34, textAlign: "center" },
  heroBottom: { marginBottom: 2 },
  heroName: { color: "#F5F3EE", fontSize: 27, fontWeight: "700", letterSpacing: -0.5 },
  heroGenre: { color: "#D0D3DD", fontSize: 13, marginTop: 5 },
  heroPlay: { position: "absolute", right: 20, bottom: 18, width: 52, height: 52, borderRadius: 26, backgroundColor: "#F5F3EE", alignItems: "center", justifyContent: "center" },
  genreRail: { flexDirection: "row", gap: 8, marginBottom: 18 }, genreChip: { borderRadius: 18, borderWidth: 1, borderColor: "#FFFFFF18", backgroundColor: "#FFFFFF0A", paddingHorizontal: 13, paddingVertical: 8 }, genreChipLight: { borderColor: "#D9E0EC", backgroundColor: "#FFFFFF" }, genreChipActive: { backgroundColor: "#D94B4B", borderColor: "#D94B4B" }, genreChipText: { color: "#A8B0C2", fontSize: 12, fontWeight: "700" }, genreChipTextLight: { color: "#5B667B" }, genreChipTextActive: { color: "#160F14" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  seeAll: { color: "#FF6B5A", fontSize: 13, fontWeight: "600", marginBottom: 12 },
  controlPressed: { opacity: 0.62, transform: [{ scale: 0.94 }] }, iconButtonActive: { backgroundColor: "#D94B4B1C", borderRadius: 12 }, playMiniActive: { backgroundColor: "#B83E46" },
  radioRowLight: { backgroundColor: "#FFFFFFD9", borderColor: "#D9E0EC" }, radioNameLight: { color: "#172033" }, radioMetaLight: { color: "#5B667B" }, playMiniLight: { backgroundColor: "#172033" },
  radioRow: { minHeight: 75, borderRadius: 19, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF0E", padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  radioRowHovered: { backgroundColor: "#FF6B5A16", borderColor: "#FF6B5A66", shadowColor: "#FF6B5A", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4, transform: [{ translateY: -1 }] },
  radioInfo: { flex: 1, marginLeft: 13 },
  radioName: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" },
  radioMeta: { color: "#8D95A7", fontSize: 12, marginTop: 5 },
  iconButton: { padding: 8 },
  playMini: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", marginLeft: 4 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  empty: { color: "#A8B0C2", textAlign: "center", paddingVertical: 30 },
});

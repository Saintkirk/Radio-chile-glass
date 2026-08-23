import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { regionFromCity } from "@/lib/radios";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { favoriteAddedHaptic, favoriteRemovedHaptic } from "@/lib/haptics";
import { FavoriteToast } from "@/components/favorite-toast";
import { AnimatedFavoriteIcon } from "@/components/animated-favorite-icon";

const GENRE_FILTERS = ["Todas", "Pop latino", "Noticias", "Música", "Actualidad"];
const REGION_FILTERS = ["Todas", "Nacional / Online", "Región Metropolitana", "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"];
type RadioSection = { title: string; data: Radio[] };

function RadioListItem({ radio, onFavorite }: { radio: Radio; onFavorite: (id: string, name: string) => void }) {
  const router = useRouter();
  const { playRadio, isFavorite, currentRadio, isLoading, isPlaying, togglePlay } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const colors = useColors(colorScheme);
  const lightMode = colorScheme === "light";
  const active = isPlaying && currentRadio?.id === radio.id;
  return <Pressable onPress={() => router.push(`/radio/${radio.id}`)} style={({ pressed }) => [styles.item, lightMode && styles.itemLight, pressed && { opacity: 0.75 }]}><StationLogo radio={radio} size={54} radius={16} /><View style={{ flex: 1 }}><Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>{radio.name}</Text><Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>{radio.frequency}  ·  {radio.city}</Text></View><Pressable onPress={() => onFavorite(radio.id, radio.name)} hitSlop={10} accessibilityRole="button" accessibilityLabel={isFavorite(radio.id) ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`} accessibilityState={{ selected: isFavorite(radio.id) }} style={({ pressed }) => [styles.favoriteButton, isFavorite(radio.id) && styles.favoriteButtonActive, pressed && styles.controlPressed]}><AnimatedFavoriteIcon active={isFavorite(radio.id)} color={isFavorite(radio.id) ? "#15883E" : lightMode ? "#667085" : "#8D95A7"} /></Pressable><Pressable onPress={() => active ? togglePlay() : playRadio(radio)} accessibilityRole="button" accessibilityLabel={isLoading && currentRadio?.id === radio.id ? `Conectando con ${radio.name}` : active ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`} style={({ pressed }) => [styles.play, lightMode && styles.playLight, active && styles.playActive, pressed && styles.controlPressed]}>{isLoading && currentRadio?.id === radio.id ? <ActivityIndicator size="small" color="#F8FAFC" /> : <IconSymbol name={active ? "pause.fill" : "play.fill"} size={14} color="#F8FAFC" />}</Pressable></Pressable>;
}

export default function ExploreScreen() {
  const { radios, isFavorite, toggleFavorite } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const [favoriteNotice, setFavoriteNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Todas");
  const [region, setRegion] = useState("Todas");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const handleFavorite = (id: string, name: string) => { const saved = !isFavorite(id); toggleFavorite(id); if (saved) favoriteAddedHaptic(); else favoriteRemovedHaptic(); setFavoriteNotice(saved ? `${name} guardada en favoritos` : `${name} quitada de favoritos`); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setFavoriteNotice(null), 1700); };
  const sections = useMemo<RadioSection[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const grouped = new Map<string, Radio[]>();
    radios.forEach((radio) => {
      const radioRegion = radio.region ?? regionFromCity(radio.city);
      const matchesGenre = genre === "Todas" || radio.genre === genre;
      const matchesRegion = region === "Todas" || radioRegion === region;
      const haystack = `${radio.name} ${radio.city} ${radio.genre} ${radioRegion}`.toLowerCase();
      if (!matchesGenre || !matchesRegion || !haystack.includes(normalizedQuery)) return;
      const bucket = grouped.get(radioRegion) ?? [];
      bucket.push(radio);
      grouped.set(radioRegion, bucket);
    });
    return REGION_FILTERS.slice(1).filter((name) => grouped.has(name)).map((title) => ({ title, data: grouped.get(title) ?? [] }));
  }, [genre, query, radios, region]);
  const count = sections.reduce((sum, section) => sum + section.data.length, 0);
    const colors = useColors(colorScheme);
  return <ScreenContainer containerClassName="bg-background" className="px-5 pt-3"><SectionList sections={sections} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }} ListHeaderComponent={<><View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>DIRECTORIO REGIONAL</Text><Text style={[styles.title, { color: colors.foreground }]}>Explora Chile</Text></View><View style={styles.count}><Text style={styles.countText}>{count}</Text></View></View><View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="magnifyingglass" size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar emisora, ciudad o género" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} /></View><Text style={styles.filterLabel}>REGIÓN</Text><FlatList data={REGION_FILTERS} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(x) => x} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable onPress={() => setRegion(item)} accessibilityRole="button" accessibilityState={{ selected: region === item }} style={[styles.chip, { backgroundColor: region === item ? colors.primary : colors.surface, borderColor: region === item ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: region === item ? colors.background : colors.muted }]}>{item}</Text></Pressable>} /><Text style={styles.filterLabel}>GÉNERO</Text><FlatList data={GENRE_FILTERS} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(x) => x} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable onPress={() => setGenre(item)} accessibilityRole="button" accessibilityState={{ selected: genre === item }} style={[styles.chip, { backgroundColor: genre === item ? colors.primary : colors.surface, borderColor: genre === item ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: genre === item ? colors.background : colors.muted }]}>{item}</Text></Pressable>} /></>} renderSectionHeader={({ section }) => <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text><Text style={[styles.sectionCount, { color: colors.primary }]}>{section.data.length} radios</Text></View>} renderItem={({ item }) => <RadioListItem radio={item} onFavorite={handleFavorite} />} ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No hay radios para este filtro</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Prueba otra región o búsqueda. El catálogo remoto se actualiza automáticamente.</Text></View>} /><FavoriteToast message={favoriteNotice} /></ScreenContainer>;
}

const styles = StyleSheet.create({ header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }, eyebrow: { color: "#1ED760", fontSize: 11, fontWeight: "700", letterSpacing: 1.8, marginBottom: 7 }, title: { color: "#F5F3EE", fontSize: 32, fontWeight: "700", letterSpacing: -1 }, count: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#FFFFFF0D", alignItems: "center", justifyContent: "center" }, countText: { color: "#1ED760", fontWeight: "700" }, search: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF14", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 12 }, input: { flex: 1, color: "#F5F3EE", marginLeft: 10, fontSize: 14 }, filterLabel: { color: "#687184", fontSize: 10, fontWeight: "700", letterSpacing: 1.4, marginTop: 6, marginBottom: 8 }, chips: { gap: 8, paddingBottom: 12 }, chip: { borderRadius: 99, paddingHorizontal: 15, height: 34, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF0A", borderWidth: 1, borderColor: "#FFFFFF10" }, chipActive: { backgroundColor: "#15883E", borderColor: "#15883E" }, chipText: { color: "#9AA2B3", fontSize: 12, fontWeight: "600" }, chipTextActive: { color: "#FFFFFF" }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 13, marginBottom: 12 }, sectionTitle: { color: "#F5F3EE", fontSize: 18, fontWeight: "700" }, sectionCount: { color: "#1ED760", fontSize: 12, fontWeight: "700" }, itemLight: { backgroundColor: "#FFFFFFD9", borderColor: "#D9E0EC" }, nameLight: { color: "#172033" }, metaLight: { color: "#5B667B" }, playLight: { backgroundColor: "#172033" }, playActive: { backgroundColor: "#15883E" }, favoriteButton: { padding: 8, borderRadius: 12 }, favoriteButtonActive: { backgroundColor: "#1DB9541C" }, controlPressed: { opacity: 0.62, transform: [{ scale: 0.94 }] }, item: { minHeight: 75, borderRadius: 19, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF0E", padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 13 }, name: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" }, meta: { color: "#8D95A7", fontSize: 12, marginTop: 5 }, play: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center" }, empty: { alignItems: "center", paddingTop: 30, paddingHorizontal: 25 }, emptyTitle: { color: "#F5F3EE", fontSize: 17, fontWeight: "700", marginBottom: 7 }, emptyText: { color: "#8D95A7", textAlign: "center", lineHeight: 19 } });

import { useMemo, useState } from "react";
import { FlatList, Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ItunesRadioCard } from "@/components/itunes-radio-card";
import { regionFromCity } from "@/lib/radios";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useRouter } from "expo-router";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";

const REGION_OPTIONS = ["Todas", "Región Metropolitana", "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"];

type RadioSection = { title: string; data: Radio[] };

export default function ExploreScreen() {
  const router = useRouter();
  const { radios, playRadio, togglePlay, isPlaying, currentRadio } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const colors = useColors(colorScheme);
  const lightMode = colorScheme === "light";
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Todas");

  const sections = useMemo<RadioSection[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const grouped = new Map<string, Radio[]>();
    radios.forEach((radio) => {
      const radioRegion = radio.region ?? regionFromCity(radio.city);
      const matchesRegion = region === "Todas" || radioRegion === region;
      const haystack = `${radio.name} ${radio.city} ${radio.genre} ${radioRegion}`.toLowerCase();
      if (!matchesRegion || !haystack.includes(normalizedQuery)) return;
      const bucket = grouped.get(radioRegion) ?? [];
      bucket.push(radio);
      grouped.set(radioRegion, bucket);
    });
    return REGION_OPTIONS.slice(1).filter((item) => grouped.has(item)).map((title) => ({ title, data: grouped.get(title) ?? [] }));
  }, [radios, query, region]);

  const visibleCount = sections.reduce((total, section) => total + section.data.length, 0);
  return <ScreenContainer containerClassName="bg-background" className="px-5 pt-3">
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => { const playing = isPlaying && currentRadio?.id === item.id; return <ItunesRadioCard radio={item} lightMode={lightMode} onOpen={() => router.push(`/radio/${item.id}`)} onPlay={() => playing ? togglePlay() : playRadio(item)} playing={playing} />; }}
      renderSectionHeader={({ section }) => <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text><Text style={[styles.sectionCount, { color: colors.primary }]}>{section.data.length}</Text></View>}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<View><Text style={[styles.eyebrow, { color: colors.primary }]}>EXPLORA POR REGIÓN</Text><Text style={[styles.title, { color: colors.foreground }]}>Radios de Chile</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Descubre señales locales y nacionales organizadas por territorio.</Text><View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="magnifyingglass" size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar radio, ciudad o género" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} /></View><FlatList data={REGION_OPTIONS} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable onPress={() => setRegion(item)} accessibilityRole="button" accessibilityState={{ selected: region === item }} style={[styles.chip, { backgroundColor: region === item ? colors.primary : colors.surface, borderColor: region === item ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: region === item ? colors.background : colors.muted }]}>{item}</Text></Pressable>} /><View style={styles.resultRow}><Text style={[styles.section, { color: colors.muted }]}>SEÑALES DISPONIBLES</Text><Text style={[styles.count, { color: colors.primary }]}>{visibleCount}</Text></View></View>}
      ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No encontramos esa señal</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Prueba otra región o búsqueda. El catálogo remoto se actualiza automáticamente.</Text></View>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 }, eyebrow: { color: "#FF6B5A", fontSize: 11, fontWeight: "700", letterSpacing: 1.8, marginBottom: 8 }, title: { color: "#F5F3EE", fontSize: 32, fontWeight: "700", letterSpacing: -1 }, subtitle: { color: "#A8B0C2", fontSize: 14, marginTop: 8, marginBottom: 22 }, search: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF14", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 14 }, input: { flex: 1, marginLeft: 10, color: "#F5F3EE", fontSize: 14 }, chips: { gap: 8, paddingBottom: 24 }, chip: { borderRadius: 18, borderWidth: 1, borderColor: "#FFFFFF18", backgroundColor: "#FFFFFF0A", paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: "#D94B4B", borderColor: "#D94B4B" }, chipText: { color: "#A8B0C2", fontSize: 12, fontWeight: "600" }, chipTextActive: { color: "#160F14" }, resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, section: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 }, count: { color: "#FF6B5A", fontSize: 12, marginBottom: 12 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 12 }, sectionTitle: { color: "#F5F3EE", fontSize: 18, fontWeight: "700" }, sectionCount: { color: "#FF6B5A", fontSize: 12, fontWeight: "700" }, empty: { alignItems: "center", paddingTop: 70, paddingHorizontal: 34 }, emptyTitle: { color: "#F5F3EE", fontSize: 18, fontWeight: "700", marginBottom: 8 }, emptyText: { color: "#8D95A7", fontSize: 13, lineHeight: 20, textAlign: "center" } });

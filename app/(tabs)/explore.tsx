import { useMemo, useState } from "react";
import { FlatList, Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ItunesRadioCard } from "@/components/itunes-radio-card";
import { regionFromCity } from "@/lib/radios";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useRouter } from "expo-router";

const REGION_OPTIONS = ["Todas", "Región Metropolitana", "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"];

type RadioSection = { title: string; data: Radio[] };

export default function ExploreScreen() {
  const router = useRouter();
  const { radios, playRadio, togglePlay, isPlaying, currentRadio } = useRadioPlayer();
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
  const renderRadio = ({ item }: { item: Radio }) => {
    const playing = isPlaying && currentRadio?.id === item.id;
    return <ItunesRadioCard radio={item} onOpen={() => router.push(`/radio/${item.id}`)} onPlay={() => playing ? togglePlay() : playRadio(item)} playing={playing} />;
  };

  return <ScreenContainer containerClassName="bg-[#0B0B0B]" className="px-5 pt-3">
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderRadio}
      renderSectionHeader={({ section }) => <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.sectionCount}>{section.data.length}</Text></View>}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<View><Text style={styles.eyebrow}>EXPLORA POR REGIÓN</Text><Text style={styles.title}>Radios de Chile</Text><Text style={styles.subtitle}>Descubre señales locales y nacionales organizadas por territorio.</Text><View style={styles.search}><IconSymbol name="magnifyingglass" size={18} color="#A8B0C2" /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar radio, ciudad o género" placeholderTextColor="#7F8799" style={styles.input} /></View><FlatList data={REGION_OPTIONS} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable onPress={() => setRegion(item)} accessibilityRole="button" accessibilityState={{ selected: region === item }} style={[styles.chip, region === item && styles.chipActive]}><Text style={[styles.chipText, region === item && styles.chipTextActive]}>{item}</Text></Pressable>} /><View style={styles.resultRow}><Text style={styles.section}>SEÑALES DISPONIBLES</Text><Text style={styles.count}>{visibleCount}</Text></View></View>}
      ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No encontramos esa señal</Text><Text style={styles.emptyText}>Prueba otra región o búsqueda. El catálogo remoto se actualiza automáticamente.</Text></View>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 }, eyebrow: { color: "#1ED760", fontSize: 11, fontWeight: "700", letterSpacing: 1.8, marginBottom: 8 }, title: { color: "#F5F3EE", fontSize: 32, fontWeight: "700", letterSpacing: -1 }, subtitle: { color: "#A8B0C2", fontSize: 14, marginTop: 8, marginBottom: 22 }, search: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF14", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 14 }, input: { flex: 1, marginLeft: 10, color: "#F5F3EE", fontSize: 14 }, chips: { gap: 8, paddingBottom: 24 }, chip: { borderRadius: 18, borderWidth: 1, borderColor: "#FFFFFF18", backgroundColor: "#FFFFFF0A", paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: "#1DB954", borderColor: "#1DB954" }, chipText: { color: "#A8B0C2", fontSize: 12, fontWeight: "600" }, chipTextActive: { color: "#160F14" }, resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, section: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 }, count: { color: "#1ED760", fontSize: 12, marginBottom: 12 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 12 }, sectionTitle: { color: "#F5F3EE", fontSize: 18, fontWeight: "700" }, sectionCount: { color: "#1ED760", fontSize: 12, fontWeight: "700" }, empty: { alignItems: "center", paddingTop: 70, paddingHorizontal: 34 }, emptyTitle: { color: "#F5F3EE", fontSize: 18, fontWeight: "700", marginBottom: 8 }, emptyText: { color: "#8D95A7", fontSize: 13, lineHeight: 20, textAlign: "center" } });

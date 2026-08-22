import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useRouter } from "expo-router";

const CITY_OPTIONS = ["Todas", "Valparaíso", "Temuco", "La Serena", "Concepción", "Rancagua", "Chillán", "Puerto Montt", "Iquique"];

export default function ExploreScreen() {
  const router = useRouter();
  const { radios, playRadio, isPlaying, currentRadio } = useRadioPlayer();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Todas");
  const regionalRadios = useMemo(() => radios.filter((radio) => radio.regional || (radio.city !== "Santiago" && radio.city !== "Cubre Chile")), [radios]);
  const filtered = useMemo(() => regionalRadios.filter((radio) => {
    const matchesCity = city === "Todas" || radio.city.toLowerCase().includes(city.toLowerCase());
    const haystack = `${radio.name} ${radio.city} ${radio.genre}`.toLowerCase();
    return matchesCity && haystack.includes(query.trim().toLowerCase());
  }), [city, query, regionalRadios]);

  const renderRadio = ({ item }: { item: Radio }) => {
    const playing = isPlaying && currentRadio?.id === item.id;
    return <Pressable onPress={() => router.push(`/radio/${item.id}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <StationLogo radio={item} size={54} radius={16} />
      <View style={styles.info}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.city}  ·  {item.genre}</Text></View>
      <Pressable onPress={() => playRadio(item)} accessibilityRole="button" accessibilityLabel={playing ? `Pausar ${item.name}` : `Reproducir ${item.name}`} style={({ pressed }) => [styles.play, playing && styles.playActive, pressed && styles.pressed]}><IconSymbol name={playing ? "pause.fill" : "play.fill"} size={17} color="#F5F3EE" /></Pressable>
    </Pressable>;
  };

  return <ScreenContainer containerClassName="bg-[#090B12]" className="px-5 pt-3">
    <FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={renderRadio} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}
      ListHeaderComponent={<View><Text style={styles.eyebrow}>EXPLORA POR CIUDAD</Text><Text style={styles.title}>Radios regionales</Text><Text style={styles.subtitle}>Descubre señales locales de todo Chile.</Text><View style={styles.search}><IconSymbol name="magnifyingglass" size={18} color="#A8B0C2" /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar radio, ciudad o género" placeholderTextColor="#7F8799" style={styles.input} /></View><FlatList data={CITY_OPTIONS} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable onPress={() => setCity(item)} style={[styles.chip, city === item && styles.chipActive]}><Text style={[styles.chipText, city === item && styles.chipTextActive]}>{item}</Text></Pressable>} /><View style={styles.resultRow}><Text style={styles.section}>SEÑALES LOCALES</Text><Text style={styles.count}>{filtered.length}</Text></View></View>}
      ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No encontramos esa señal</Text><Text style={styles.emptyText}>Prueba otra ciudad o búsqueda. El catálogo remoto se actualiza automáticamente.</Text></View>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 }, eyebrow: { color: "#FF8C7F", fontSize: 11, fontWeight: "700", letterSpacing: 1.8, marginBottom: 8 }, title: { color: "#F5F3EE", fontSize: 32, fontWeight: "700", letterSpacing: -1 }, subtitle: { color: "#A8B0C2", fontSize: 14, marginTop: 8, marginBottom: 22 }, search: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF0D", borderWidth: 1, borderColor: "#FFFFFF14", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 14 }, input: { flex: 1, marginLeft: 10, color: "#F5F3EE", fontSize: 14 }, chips: { gap: 8, paddingBottom: 24 }, chip: { borderRadius: 18, borderWidth: 1, borderColor: "#FFFFFF18", backgroundColor: "#FFFFFF0A", paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: "#FF6B5F", borderColor: "#FF6B5F" }, chipText: { color: "#A8B0C2", fontSize: 12, fontWeight: "600" }, chipTextActive: { color: "#160F14" }, resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, section: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 }, count: { color: "#76E0B5", fontSize: 12, marginBottom: 12 }, row: { minHeight: 75, borderRadius: 19, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF0E", padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" }, info: { flex: 1, marginLeft: 13 }, name: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" }, meta: { color: "#8D95A7", fontSize: 12, marginTop: 5 }, play: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center" }, playActive: { backgroundColor: "#D64E4A" }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] }, empty: { alignItems: "center", paddingTop: 70, paddingHorizontal: 34 }, emptyTitle: { color: "#F5F3EE", fontSize: 18, fontWeight: "700", marginBottom: 8 }, emptyText: { color: "#8D95A7", fontSize: 13, lineHeight: 20, textAlign: "center" },
});

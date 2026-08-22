import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ItunesRadioCard } from "@/components/itunes-radio-card";
import { useRadioPlayer } from "@/lib/radio-player";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, currentRadio, isPlaying, playRadio, togglePlay, radios: catalog } = useRadioPlayer();
  const radios = catalog.filter((radio) => favorites.includes(radio.id));
  return <ScreenContainer containerClassName="bg-[#0B0B0B]" className="px-5 pt-3"><View style={styles.header}><View><Text style={styles.eyebrow}>TU COLECCIÓN</Text><Text style={styles.title}>Favoritos</Text></View><Text style={styles.count}>{radios.length}</Text></View><FlatList data={radios} keyExtractor={(r) => r.id} showsVerticalScrollIndicator={false} renderItem={({ item }) => {
    const playing = currentRadio?.id === item.id && isPlaying;
    return <ItunesRadioCard radio={item} onOpen={() => router.push(`/radio/${item.id}`)} onPlay={() => playing ? togglePlay() : playRadio(item)} playing={playing} trailing={<IconSymbol name="heart.fill" size={20} color="#1DB954" />} />;
  }} ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><IconSymbol name="heart" size={28} color="#1ED760" /></View><Text style={styles.emptyTitle}>Aún no tienes favoritos</Text><Text style={styles.emptyText}>Guarda tus radios preferidas para encontrarlas aquí.</Text></View>} /></ScreenContainer>;
}
const styles = StyleSheet.create({ header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }, eyebrow: { color: "#1ED760", fontSize: 11, fontWeight: "700", letterSpacing: 1.8, marginBottom: 7 }, title: { color: "#F5F3EE", fontSize: 32, fontWeight: "700", letterSpacing: -1 }, count: { color: "#A8B0C2", fontSize: 14 }, empty: { alignItems: "center", paddingTop: 100, paddingHorizontal: 34 }, emptyIcon: { width: 68, height: 68, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#1DB95418", marginBottom: 18 }, emptyTitle: { color: "#F5F3EE", fontSize: 19, fontWeight: "700", marginBottom: 8 }, emptyText: { color: "#8D95A7", fontSize: 13, lineHeight: 20, textAlign: "center" } });

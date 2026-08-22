import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { RADIOS, useRadioPlayer, type Radio } from "@/lib/radio-player";

function RadioRow({ radio, onPlay, onFavorite, favorite }: { radio: Radio; onPlay: () => void; onFavorite: () => void; favorite: boolean }) {
  return (
    <Pressable onPress={onPlay} style={({ pressed }) => [styles.radioRow, pressed && styles.pressed]}>
      <LinearGradient colors={[`${radio.accent}44`, "#161B2A"]} style={styles.radioLogo}>
        <Text style={styles.radioInitials}>{radio.initials}</Text>
      </LinearGradient>
      <View style={styles.radioInfo}>
        <Text style={styles.radioName}>{radio.name}</Text>
        <Text style={styles.radioMeta}>{radio.frequency}  ·  {radio.genre}</Text>
      </View>
      <Pressable onPress={onFavorite} hitSlop={10} style={styles.iconButton}>
        <IconSymbol name={favorite ? "heart.fill" : "heart"} size={20} color={favorite ? "#FF6B5F" : "#A8B0C2"} />
      </Pressable>
      <View style={styles.playMini}><IconSymbol name="play.fill" size={16} color="#F5F3EE" /></View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { currentRadio, isPlaying, isLoading, playRadio, togglePlay, toggleFavorite, isFavorite } = useRadioPlayer();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => RADIOS.filter((radio) => `${radio.name} ${radio.genre} ${radio.city}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const featured = currentRadio ?? RADIOS[0];

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
              <Pressable onPress={() => router.push("/settings")} style={styles.settingsButton}><IconSymbol name="slider.horizontal.3" size={21} color="#F5F3EE" /></Pressable>
            </View>
            <View style={styles.searchWrap}><IconSymbol name="magnifyingglass" size={18} color="#A8B0C2" /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar radio, ciudad o género" placeholderTextColor="#7F8799" style={styles.searchInput} /></View>
            <Text style={styles.sectionLabel}>AHORA SONANDO</Text>
            <Pressable onPress={() => playRadio(featured)} style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
              <LinearGradient colors={[`${featured.accent}AA`, "#1A2033", "#101522"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={styles.heroOrb} /><View style={styles.heroTop}><View style={[styles.liveDot, { backgroundColor: isPlaying ? "#76E0B5" : "#FFB86B" }]} /><Text style={styles.liveText}>{isPlaying ? "EN VIVO" : "LISTA PARA ESCUCHAR"}</Text><Text style={styles.heroFreq}>{featured.frequency}</Text></View>
              <View style={styles.heroBottom}><Text style={styles.heroName}>{featured.name}</Text><Text style={styles.heroGenre}>{featured.city}  ·  {featured.genre}</Text></View>
              <Pressable onPress={togglePlay} style={styles.heroPlay}><IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={25} color="#090B12" /></Pressable>
            </Pressable>
            <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>PARA TI</Text><Pressable onPress={() => router.push("/explore")}><Text style={styles.seeAll}>Ver todas</Text></Pressable></View>
          </>
        }
        renderItem={({ item }) => <RadioRow radio={item} onPlay={() => playRadio(item)} onFavorite={() => toggleFavorite(item.id)} favorite={isFavorite(item.id)} />}
        ListEmptyComponent={<Text style={styles.empty}>No encontramos una radio con ese nombre.</Text>}
        ListFooterComponent={<View style={{ height: currentRadio ? 96 : 24 }} />}
      />
      {currentRadio && <Pressable onPress={togglePlay} style={styles.miniPlayer}><View style={[styles.miniArtwork, { backgroundColor: `${currentRadio.accent}CC` }]}><Text style={styles.miniInitials}>{currentRadio.initials}</Text></View><View style={{ flex: 1 }}><Text style={styles.miniName}>{currentRadio.name}</Text><Text style={styles.miniMeta}>{isLoading ? "Conectando..." : isPlaying ? "Reproduciendo ahora" : "En pausa"}</Text></View><IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={20} color="#F5F3EE" /></Pressable>}
    </ScreenContainer>
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
  hero: { height: 210, borderRadius: 26, overflow: "hidden", padding: 20, marginBottom: 28, borderWidth: 1, borderColor: "#FFFFFF20", justifyContent: "space-between" },
  heroOrb: { position: "absolute", width: 190, height: 190, borderRadius: 100, right: -35, top: -48, backgroundColor: "#FFFFFF0B", borderWidth: 1, borderColor: "#FFFFFF10" },
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
  radioRow: { minHeight: 75, borderRadius: 19, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF0E", padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  radioLogo: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  radioInitials: { color: "#F5F3EE", fontSize: 15, fontWeight: "800", letterSpacing: 0.6 },
  radioInfo: { flex: 1, marginLeft: 13 },
  radioName: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" },
  radioMeta: { color: "#8D95A7", fontSize: 12, marginTop: 5 },
  iconButton: { padding: 8 },
  playMini: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", marginLeft: 4 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  empty: { color: "#A8B0C2", textAlign: "center", paddingVertical: 30 },
  miniPlayer: { position: "absolute", left: 16, right: 16, bottom: 8, minHeight: 68, borderRadius: 20, backgroundColor: "#1D2333F2", borderWidth: 1, borderColor: "#FFFFFF1C", padding: 9, flexDirection: "row", alignItems: "center", gap: 12 },
  miniArtwork: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  miniInitials: { color: "#090B12", fontSize: 13, fontWeight: "800" },
  miniName: { color: "#F5F3EE", fontSize: 14, fontWeight: "700" },
  miniMeta: { color: "#9AA2B3", fontSize: 11, marginTop: 4 },
});

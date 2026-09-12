import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ItunesRadioCard } from "@/components/itunes-radio-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer, type Radio } from "@/lib/radio-player";
import { useThemeContext } from "@/lib/theme-provider";
import { favoriteAddedHaptic, favoriteRemovedHaptic } from "@/lib/haptics";
import { FavoriteToast } from "@/components/favorite-toast";
import { AnimatedFavoriteIcon } from "@/components/animated-favorite-icon";
import { prefetchLogo } from "@/lib/logo-cache";
import { platformShadow } from "@/lib/platform-styles";

const prefetchedFeaturedLogos = new Set<string>();

function RadioRow({
  radio,
  onOpen,
  onPlay,
  onFavorite,
  favorite,
  lightMode,
  loading,
  playing,
}: {
  radio: Radio;
  onOpen: () => void;
  onPlay: () => void;
  onFavorite: () => void;
  favorite: boolean;
  lightMode: boolean;
  loading: boolean;
  playing: boolean;
}) {
  return (
    <ItunesRadioCard
      radio={radio}
      onOpen={onOpen}
      onPlay={onPlay}
      playing={playing}
      loading={loading}
      lightMode={lightMode}
      trailing={
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorite ? `Quitar ${radio.name} de favoritos` : `Guardar ${radio.name} en favoritos`}
          accessibilityState={{ selected: favorite }}
          style={({ pressed }) => [styles.iconButton, favorite && styles.iconButtonActive, pressed && styles.controlPressed]}
        >
          <AnimatedFavoriteIcon active={favorite} color={favorite ? "#B83E46" : lightMode ? "#667085" : "#A8B0C2"} />
        </Pressable>
      }
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentRadio,
    isPlaying,
    isLoading,
    playRadio,
    togglePlay,
    toggleFavorite,
    isFavorite,
    radios,
    refreshCatalog,
    isRefreshingCatalog,
    catalogSource,
  } = useRadioPlayer();
  const { colorScheme } = useThemeContext();
  const lightMode = colorScheme === "light";
  const [favoriteNotice, setFavoriteNotice] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    const featuredLogos = radios.filter((radio) => radio.featured && radio.favicon).map((radio) => radio.favicon as string);
    const pendingLogos = featuredLogos.filter((uri) => !prefetchedFeaturedLogos.has(uri));
    pendingLogos.forEach((uri) => prefetchedFeaturedLogos.add(uri));
    if (pendingLogos.length) void Promise.allSettled(pendingLogos.map((uri) => prefetchLogo(uri)));
  }, [radios]);

  const handleFavorite = (id: string, name: string) => {
    const saved = !isFavorite(id);
    toggleFavorite(id);
    if (saved) favoriteAddedHaptic();
    else favoriteRemovedHaptic();
    setFavoriteNotice(saved ? `${name} guardada en favoritos` : `${name} quitada de favoritos`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setFavoriteNotice(null), 1700);
  };

  const filtered = useMemo(
    () => [...radios].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
    [radios],
  );

  const playFromList = useCallback(
    (radio: Radio) => {
      if (currentRadio?.id === radio.id) {
        togglePlay();
        return;
      }
      void playRadio(radio, Boolean(currentRadio && currentRadio.id !== radio.id));
    },
    [currentRadio, playRadio, togglePlay],
  );

  return (
    <ScreenContainer edges={["top"]} className="px-5">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View>
                <Text style={[styles.brandRadio, lightMode && styles.brandRadioLight]}>RADIO</Text>
                <View style={styles.brandRow}>
                  <Text style={[styles.brandChile, lightMode && styles.brandChileLight]}>CHILE</Text>
                  <Text style={styles.brandGlass}> GLASS</Text>
                </View>
                <Text style={styles.brandTagline}>SEÑAL EN VIVO</Text>
              </View>
              <Pressable
                onPress={() => router.push("/settings")}
                accessibilityRole="button"
                accessibilityLabel="Abrir ajustes"
                style={({ pressed }) => [styles.headerButton, pressed && styles.controlPressed]}
              >
                <IconSymbol name="slider.horizontal.3" size={20} color={lightMode ? "#172033" : "#F5F3EE"} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push("/explore")}
              accessibilityRole="button"
              accessibilityLabel="Buscar emisoras"
              style={[styles.searchWrap, lightMode && styles.searchWrapLight]}
            >
              <IconSymbol name="magnifyingglass" size={18} color={lightMode ? "#5B667B" : "#A8B0C2"} />
              <Text style={[styles.searchInput, lightMode && styles.searchInputLight]}>Buscar emisoras, ciudad o género</Text>
            </Pressable>
            <View style={styles.catalogHeader}>
              <Text style={[styles.sectionLabel, lightMode && styles.sectionLabelLight]}>EMISORAS</Text>
              <Pressable
                onPress={() => refreshCatalog()}
                accessibilityRole="button"
                accessibilityLabel="Actualizar catálogo de radios"
                style={({ pressed }) => [styles.syncButton, pressed && styles.controlPressed]}
              >
                <Text style={styles.syncText}>
                  {isRefreshingCatalog ? "Actualizando..." : catalogSource === "remote" ? "CATÁLOGO EN VIVO" : "MODO SIN CONEXIÓN"}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <RadioRow
            radio={item}
            lightMode={lightMode}
            loading={isLoading && currentRadio?.id === item.id}
            playing={isPlaying && currentRadio?.id === item.id}
            onOpen={() => {
              router.push(`/radio/${item.id}`);
            }}
            onPlay={() => playFromList(item)}
            onFavorite={() => handleFavorite(item.id, item.name)}
            favorite={isFavorite(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay emisoras disponibles por ahora.</Text>}
      />
      <FavoriteToast message={favoriteNotice} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 120 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, marginTop: 6 },
  brandRadio: { color: "#F5F3EE", fontSize: 13, fontWeight: "800", letterSpacing: 3.2 },
  brandRadioLight: { color: "#172033" },
  brandRow: { flexDirection: "row", alignItems: "baseline" },
  brandChile: { color: "#F5F3EE", fontSize: 29, fontWeight: "400", letterSpacing: -1 },
  brandChileLight: { color: "#241B24" },
  brandGlass: { color: "#B66BFF", fontSize: 29, fontWeight: "400", letterSpacing: -1 },
  brandTagline: { color: "#E2D5DF", fontSize: 10, letterSpacing: 3.7, marginTop: 5 },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFFFFF2E",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF12",
    ...platformShadow({ color: "#FFFFFF", opacity: 0.08, radius: 10, offsetY: 4, elevation: 3 }),
  },
  searchWrap: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF0D",
    borderWidth: 1,
    borderColor: "#FFFFFF14",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 22,
  },
  searchWrapLight: { backgroundColor: "#FFFFFF", borderColor: "#D9E0EC" },
  searchInput: { flex: 1, marginLeft: 10, color: "#A8B0C2", fontSize: 14 },
  searchInputLight: { color: "#5B667B" },
  catalogHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionLabel: { color: "#D8DCE6", fontSize: 11, fontWeight: "800", letterSpacing: 1.8, marginBottom: 12 },
  sectionLabelLight: { color: "#5B667B" },
  syncButton: { marginBottom: 12 },
  syncText: { color: "#FF6B5A", fontSize: 10, fontWeight: "600" },
  controlPressed: { opacity: 0.62, transform: [{ scale: 0.94 }] },
  iconButtonActive: { backgroundColor: "#D94B4B1C", borderRadius: 12 },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF22",
    backgroundColor: "#FFFFFF0A",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { color: "#A8B0C2", textAlign: "center", paddingVertical: 30 },
});

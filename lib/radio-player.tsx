import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadCatalog, RADIOS, type Radio } from "./radios";

export { RADIOS, type Radio } from "./radios";

type PlayerContextValue = { currentRadio: Radio | null; isPlaying: boolean; isLoading: boolean; favorites: string[]; radios: Radio[]; catalogUpdatedAt: string | null; catalogSource: "remote" | "cache" | "local"; isRefreshingCatalog: boolean; backgroundPlaybackEnabled: boolean; setBackgroundPlaybackEnabled: (enabled: boolean) => void; refreshCatalog: () => Promise<void>; playRadio: (radio: Radio) => Promise<void>; togglePlay: () => void; toggleFavorite: (radioId: string) => void; isFavorite: (radioId: string) => boolean };
const PlayerContext = createContext<PlayerContextValue | null>(null);

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["fmlatina"]);
  const [radios, setRadios] = useState<Radio[]>(RADIOS);
  const [catalogUpdatedAt, setCatalogUpdatedAt] = useState<string | null>(null);
  const [catalogSource, setCatalogSource] = useState<"remote" | "cache" | "local">("local");
  const [isRefreshingCatalog, setIsRefreshingCatalog] = useState(false);
  const [backgroundPlaybackEnabled, setBackgroundPlaybackEnabled] = useState(true);

  const refreshCatalog = async () => {
    setIsRefreshingCatalog(true);
    try { const result = await loadCatalog(); setRadios(result.radios); setCatalogUpdatedAt(result.updatedAt); setCatalogSource(result.source); }
    finally { setIsRefreshingCatalog(false); }
  };

  useEffect(() => {
    AsyncStorage.getItem("radio-favorites").then((value) => { if (value) setFavorites(JSON.parse(value)); });
    AsyncStorage.getItem("radio-background-playback").then((value) => { if (value !== null) setBackgroundPlaybackEnabled(value !== "false"); });
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => undefined);
    refreshCatalog().catch(() => undefined);
    return () => { playerRef.current?.remove(); playerRef.current = null; };
  }, []);

  useEffect(() => { setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: backgroundPlaybackEnabled }).catch(() => undefined); }, [backgroundPlaybackEnabled]);
  const updateBackgroundPlayback = (enabled: boolean) => { setBackgroundPlaybackEnabled(enabled); AsyncStorage.setItem("radio-background-playback", String(enabled)).catch(() => undefined); };

  const playRadio = async (radio: Radio) => {
    setIsLoading(true);
    try { if (currentRadio?.id !== radio.id) { playerRef.current?.remove(); playerRef.current = createAudioPlayer({ uri: radio.streamUrl }); setCurrentRadio(radio); } playerRef.current?.play(); setIsPlaying(true); }
    catch { setIsPlaying(false); }
    finally { setIsLoading(false); }
  };
  const togglePlay = () => { if (!playerRef.current) return; if (isPlaying) { playerRef.current.pause(); setIsPlaying(false); } else { playerRef.current.play(); setIsPlaying(true); } };
  const toggleFavorite = (radioId: string) => { setFavorites((previous) => { const next = previous.includes(radioId) ? previous.filter((id) => id !== radioId) : [...previous, radioId]; AsyncStorage.setItem("radio-favorites", JSON.stringify(next)).catch(() => undefined); return next; }); };
  const value = useMemo(() => ({ currentRadio, isPlaying, isLoading, favorites, radios, catalogUpdatedAt, catalogSource, isRefreshingCatalog, backgroundPlaybackEnabled, setBackgroundPlaybackEnabled: updateBackgroundPlayback, refreshCatalog, playRadio, togglePlay, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) }), [currentRadio, isPlaying, isLoading, favorites, radios, catalogUpdatedAt, catalogSource, isRefreshingCatalog, backgroundPlaybackEnabled]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
export function useRadioPlayer() { const value = useContext(PlayerContext); if (!value) throw new Error("useRadioPlayer must be used inside RadioPlayerProvider"); return value; }

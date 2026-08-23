import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadCatalog, RADIOS, type Radio } from "./radios";
import { loadFavoriteIds, saveFavoriteIds } from "./favorites-storage";
import { lockScreenMetadata, MAX_PLAYBACK_RETRIES, retryDelayMs, toggleFavoriteId, audioFocusAction, type LockScreenMetadata } from "./player-utils";
import { addAudioFocusChangeListener, abandonAudioFocus, requestAudioFocus } from "@/lib/audio-focus";

export { RADIOS, type Radio } from "./radios";

type PlayerContextValue = { currentRadio: Radio | null; isPlaying: boolean; isLoading: boolean; playbackError: string | null; favorites: string[]; radios: Radio[]; catalogUpdatedAt: string | null; catalogSource: "remote" | "cache" | "local"; isRefreshingCatalog: boolean; backgroundPlaybackEnabled: boolean; setBackgroundPlaybackEnabled: (enabled: boolean) => void; updateLockScreenMetadata: (metadata: LockScreenMetadata) => void; refreshCatalog: () => Promise<void>; playRadio: (radio: Radio) => Promise<void>; togglePlay: () => void; toggleFavorite: (radioId: string) => void; isFavorite: (radioId: string) => boolean };
const PlayerContext = createContext<PlayerContextValue | null>(null);

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const playerStatusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const playRequestRef = useRef(0);
  const [favorites, setFavorites] = useState<string[]>(["fmlatina"]);
  const [radios, setRadios] = useState<Radio[]>(RADIOS);
  const [catalogUpdatedAt, setCatalogUpdatedAt] = useState<string | null>(null);
  const [catalogSource, setCatalogSource] = useState<"remote" | "cache" | "local">("local");
  const [isRefreshingCatalog, setIsRefreshingCatalog] = useState(false);
  const [backgroundPlaybackEnabled, setBackgroundPlaybackEnabled] = useState(true);
  const resumeAfterFocusGainRef = useRef(false);

  const syncLockScreenControls = (player: ReturnType<typeof createAudioPlayer>, radio: Radio, enabled: boolean) => {
    try {
      if (!enabled) {
        player.clearLockScreenControls();
        return;
      }
      player.setActiveForLockScreen(true, lockScreenMetadata(radio), {
        showSeekForward: true,
        showSeekBackward: true,
      });
    } catch {
      // Lock screen controls are only available in a native build; web stays functional without them.
    }
  };

  const disposeCurrentPlayer = () => {
    playerStatusSubscriptionRef.current?.remove();
    playerStatusSubscriptionRef.current = null;
    try { playerRef.current?.clearLockScreenControls(); } catch { /* no-op on web */ }
    playerRef.current?.remove();
    playerRef.current = null;
    abandonAudioFocus();
  };

  const refreshCatalog = async () => {
    setIsRefreshingCatalog(true);
    try { const result = await loadCatalog(); setRadios(result.radios); setCatalogUpdatedAt(result.updatedAt); setCatalogSource(result.source); }
    finally { setIsRefreshingCatalog(false); }
  };

  useEffect(() => {
    loadFavoriteIds().then((stored) => { if (stored.length > 0) setFavorites(stored); }).catch(() => undefined);
    AsyncStorage.getItem("radio-background-playback").then((value) => { if (value !== null) setBackgroundPlaybackEnabled(value !== "false"); });
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => undefined);
    refreshCatalog().catch(() => undefined);
    return () => disposeCurrentPlayer();
  }, []);

  useEffect(() => { setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: backgroundPlaybackEnabled }).catch(() => undefined); }, [backgroundPlaybackEnabled]);

  useEffect(() => {
    const subscription = addAudioFocusChangeListener(({ change }) => {
      const action = audioFocusAction(change);
      const player = playerRef.current;
      if (!player) return;
      if (action === "pause") {
        resumeAfterFocusGainRef.current = isPlaying;
        player.pause();
        setIsPlaying(false);
      } else if (action === "duck") {
        player.volume = 0.35;
      } else if (action === "restore") {
        player.volume = 1;
        resumeAfterFocusGainRef.current = false;
      }
    });
    return () => subscription.remove();
  }, [isPlaying]);
  const updateBackgroundPlayback = (enabled: boolean) => {
    setBackgroundPlaybackEnabled(enabled);
    if (playerRef.current && currentRadio) syncLockScreenControls(playerRef.current, currentRadio, enabled);
    AsyncStorage.setItem("radio-background-playback", String(enabled)).catch(() => undefined);
  };
  const updateLockScreenMetadata = useCallback((metadata: LockScreenMetadata) => {
    if (!backgroundPlaybackEnabled || !playerRef.current) return;
    try { playerRef.current.updateLockScreenMetadata(metadata); } catch { /* no-op when native controls are unavailable */ }
  }, [backgroundPlaybackEnabled]);

  const playRadio = async (radio: Radio) => {
    const requestId = ++playRequestRef.current;
    disposeCurrentPlayer();
    setIsPlaying(false);
    setIsLoading(true);
    setPlaybackError(null);
    for (let attempt = 0; attempt <= MAX_PLAYBACK_RETRIES; attempt += 1) {
      if (requestId !== playRequestRef.current) return;
      const delay = retryDelayMs(attempt);
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        if (requestId !== playRequestRef.current) return;
        const focusResult = requestAudioFocus();
        if (focusResult === "failed") throw new Error("Audio focus unavailable");
        disposeCurrentPlayer();
        const player = createAudioPlayer({ uri: radio.streamUrl });
        playerRef.current = player;
        setCurrentRadio(radio);
        syncLockScreenControls(player, radio, backgroundPlaybackEnabled);
        playerStatusSubscriptionRef.current = player.addListener("playbackStatusUpdate", (status) => {
          setIsPlaying(status.playing);
        });
        player.play();
        setIsPlaying(true);
        setPlaybackError(null);
        setIsLoading(false);
        return;
      } catch {
        if (requestId !== playRequestRef.current) return;
        if (attempt === MAX_PLAYBACK_RETRIES) {
          setIsPlaying(false);
          setPlaybackError(`No se pudo conectar con ${radio.name}`);
          setIsLoading(false);
        }
      }
    }
  };
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      const focusResult = requestAudioFocus();
      if (focusResult === "failed") return;
      playerRef.current.play();
      setIsPlaying(true);
    }
  };
  const toggleFavorite = (radioId: string) => { setFavorites((previous) => { const next = toggleFavoriteId(previous, radioId); saveFavoriteIds(next).catch(() => undefined); return next; }); };
  const value = useMemo(() => ({ currentRadio, isPlaying, isLoading, playbackError, favorites, radios, catalogUpdatedAt, catalogSource, isRefreshingCatalog, backgroundPlaybackEnabled, setBackgroundPlaybackEnabled: updateBackgroundPlayback, updateLockScreenMetadata, refreshCatalog, playRadio, togglePlay, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) }), [currentRadio, isPlaying, isLoading, playbackError, favorites, radios, catalogUpdatedAt, catalogSource, isRefreshingCatalog, backgroundPlaybackEnabled, updateLockScreenMetadata]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
export function useRadioPlayer() { const value = useContext(PlayerContext); if (!value) throw new Error("useRadioPlayer must be used inside RadioPlayerProvider"); return value; }

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadCatalog, RADIOS, type Radio } from "./radios";
import { loadFavoriteIds, saveFavoriteIds } from "./favorites-storage";
import { lockScreenMetadata, MAX_PLAYBACK_RETRIES, retryDelayMs, toggleFavoriteId, audioFocusAction, isCurrentPlaybackRequest, type LockScreenMetadata } from "./player-utils";
import { addAudioFocusChangeListener, abandonAudioFocus, requestAudioFocus } from "@/lib/audio-focus";
import { clearNativeMediaSession, setNativeMediaSession, subscribeToNativeMediaActions, updateNativeMediaMetadata, updateNativeMediaState } from "@/lib/radio-media-controls";

export { RADIOS, type Radio } from "./radios";

type PlayerContextValue = {
  currentRadio: Radio | null;
  isPlaying: boolean;
  isLoading: boolean;
  playbackError: string | null;
  favorites: string[];
  radios: Radio[];
  catalogUpdatedAt: string | null;
  catalogSource: "remote" | "cache" | "local";
  isRefreshingCatalog: boolean;
  backgroundPlaybackEnabled: boolean;
  setBackgroundPlaybackEnabled: (enabled: boolean) => void;
  updateLockScreenMetadata: (metadata: LockScreenMetadata) => void;
  refreshCatalog: () => Promise<void>;
  playRadio: (radio: Radio, preserveMediaSession?: boolean) => Promise<void>;
  playAdjacent: (direction: -1 | 1, fromId?: string) => Promise<void>;
  togglePlay: () => void;
  toggleFavorite: (radioId: string) => void;
  isFavorite: (radioId: string) => boolean;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const playerStatusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const playRequestRef = useRef(0);
  const startupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(["fmlatina"]);
  const [radios, setRadios] = useState<Radio[]>(RADIOS);
  const [catalogUpdatedAt, setCatalogUpdatedAt] = useState<string | null>(null);
  const [catalogSource, setCatalogSource] = useState<"remote" | "cache" | "local">("local");
  const [isRefreshingCatalog, setIsRefreshingCatalog] = useState(false);
  const [backgroundPlaybackEnabled, setBackgroundPlaybackEnabled] = useState(true);
  const resumeAfterFocusGainRef = useRef(false);

  const disposeCurrentPlayer = useCallback((preserveMediaSession = false) => {
    if (startupTimeoutRef.current) {
      clearTimeout(startupTimeoutRef.current);
      startupTimeoutRef.current = null;
    }
    playerStatusSubscriptionRef.current?.remove();
    playerStatusSubscriptionRef.current = null;
    const player = playerRef.current;
    playerRef.current = null;
    if (player) {
      try { player.pause(); } catch { /* no-op */ }
      try { player.remove(); } catch { /* no-op */ }
    }
    if (!preserveMediaSession) {
      clearNativeMediaSession();
      abandonAudioFocus();
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    setIsRefreshingCatalog(true);
    try {
      const result = await loadCatalog();
      setRadios(result.radios);
      setCatalogUpdatedAt(result.updatedAt);
      setCatalogSource(result.source);
    } finally {
      setIsRefreshingCatalog(false);
    }
  }, []);

  const syncLockScreenControls = useCallback((player: ReturnType<typeof createAudioPlayer>, radio: Radio, enabled: boolean, playing: boolean) => {
    const metadata = lockScreenMetadata(radio);
    if (!enabled) {
      clearNativeMediaSession();
      try { player.clearLockScreenControls(); } catch { /* no-op on unsupported builds */ }
      return;
    }
    // Android uses one custom MediaSession for station actions and one foreground
    // notification id. Avoid registering expo-audio's second session, which can
    // leave stale metadata or show seek controls for a live radio stream.
    setNativeMediaSession(metadata, playing);
  }, []);

  const playRadio = useCallback(async (radio: Radio, preserveMediaSession = false) => {
    const requestId = ++playRequestRef.current;
    if (preserveMediaSession && backgroundPlaybackEnabled) {
      setNativeMediaSession(lockScreenMetadata(radio), false);
    }
    disposeCurrentPlayer(preserveMediaSession);
    setCurrentRadio(radio);
    setIsPlaying(false);
    setIsLoading(true);
    setPlaybackError(null);

    for (let attempt = 0; attempt <= MAX_PLAYBACK_RETRIES; attempt += 1) {
      if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
      const delay = retryDelayMs(attempt);
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
      let candidate: ReturnType<typeof createAudioPlayer> | null = null;
      try {
        const focusResult = requestAudioFocus();
        if (focusResult === "failed") throw new Error("Audio focus unavailable");
        candidate = createAudioPlayer({ uri: radio.streamUrl });
        if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) {
          try { candidate.pause(); } catch { /* no-op */ }
          candidate.remove();
          return;
        }
        playerRef.current = candidate;
        syncLockScreenControls(candidate, radio, backgroundPlaybackEnabled, false);
        playerStatusSubscriptionRef.current = candidate.addListener("playbackStatusUpdate", (status) => {
          if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
          setIsPlaying(status.playing);
          updateNativeMediaState(status.playing);
          if (status.playing) {
            if (startupTimeoutRef.current) {
              clearTimeout(startupTimeoutRef.current);
              startupTimeoutRef.current = null;
            }
            setPlaybackError(null);
            setIsLoading(false);
            setNativeMediaSession(lockScreenMetadata(radio), true);
          }
        });
        const activeCandidate = candidate;
        activeCandidate.play();
        setTimeout(() => {
          if (isCurrentPlaybackRequest(requestId, playRequestRef.current) && playerRef.current === activeCandidate && !activeCandidate.playing) {
            try { activeCandidate.play(); } catch { /* status listener reports the real failure */ }
          }
        }, 350);
        startupTimeoutRef.current = setTimeout(() => {
          if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
          setIsPlaying(false);
          setIsLoading(false);
          setPlaybackError(`No se pudo iniciar el audio de ${radio.name}`);
          try { candidate?.pause(); } catch { /* no-op */ }
          try { candidate?.remove(); } catch { /* no-op */ }
          playerRef.current = null;
          clearNativeMediaSession();
          abandonAudioFocus();
        }, 8000);
        if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) {
          try { candidate.pause(); } catch { /* no-op */ }
          try { candidate.remove(); } catch { /* no-op */ }
          return;
        }
        // Do not claim success immediately: network streams can accept play() while still buffering.
        // The playbackStatusUpdate event is the source of truth for the visible playing state.
        return;
      } catch {
        if (candidate && candidate !== playerRef.current) {
          try { candidate.pause(); } catch { /* no-op */ }
          try { candidate.remove(); } catch { /* no-op */ }
        }
        if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
        if (attempt === MAX_PLAYBACK_RETRIES) {
          setIsPlaying(false);
          setPlaybackError(`No se pudo conectar con ${radio.name}`);
          setIsLoading(false);
          clearNativeMediaSession();
        }
      }
    }
  }, [backgroundPlaybackEnabled, disposeCurrentPlayer, syncLockScreenControls]);

  const playAdjacent = useCallback(async (direction: -1 | 1, fromId?: string) => {
    const sourceId = fromId ?? currentRadio?.id;
    const currentIndex = radios.findIndex((radio) => radio.id === sourceId);
    if (currentIndex < 0 || radios.length < 2) return;
    const nextIndex = (currentIndex + direction + radios.length) % radios.length;
    await playRadio(radios[nextIndex], true);
  }, [currentRadio?.id, playRadio, radios]);

  const setPlayingState = useCallback((shouldPlay: boolean) => {
    const player = playerRef.current;
    if (!player) return;
    if (!shouldPlay) {
      player.pause();
      setIsPlaying(false);
      updateNativeMediaState(false);
      if (currentRadio) setNativeMediaSession(lockScreenMetadata(currentRadio), false);
      return;
    }
    const focusResult = requestAudioFocus();
    if (focusResult === "failed") return;
    player.play();
    setIsPlaying(true);
    updateNativeMediaState(true);
    if (currentRadio) setNativeMediaSession(lockScreenMetadata(currentRadio), true);
  }, [currentRadio]);

  const togglePlay = useCallback(() => {
    setPlayingState(!isPlaying);
  }, [isPlaying, setPlayingState]);

  const updateBackgroundPlayback = useCallback((enabled: boolean) => {
    setBackgroundPlaybackEnabled(enabled);
    if (!enabled) clearNativeMediaSession();
    if (enabled && playerRef.current && currentRadio) syncLockScreenControls(playerRef.current, currentRadio, true, isPlaying);
    AsyncStorage.setItem("radio-background-playback", String(enabled)).catch(() => undefined);
  }, [currentRadio, isPlaying, syncLockScreenControls]);

  const updateLockScreenMetadata = useCallback((metadata: LockScreenMetadata) => {
    if (!backgroundPlaybackEnabled) return;
    try { playerRef.current?.updateLockScreenMetadata(metadata); } catch { /* no-op */ }
    updateNativeMediaMetadata(metadata);
  }, [backgroundPlaybackEnabled]);

  useEffect(() => {
    loadFavoriteIds().then((stored) => { if (stored.length > 0) setFavorites(stored); }).catch(() => undefined);
    AsyncStorage.getItem("radio-background-playback").then((value) => { if (value !== null) setBackgroundPlaybackEnabled(value !== "false"); });
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => undefined);
    refreshCatalog().catch(() => undefined);
    return () => disposeCurrentPlayer();
  }, [disposeCurrentPlayer, refreshCatalog]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: backgroundPlaybackEnabled }).catch(() => undefined);
  }, [backgroundPlaybackEnabled]);

  useEffect(() => {
    const subscription = addAudioFocusChangeListener(({ change }) => {
      const action = audioFocusAction(change);
      const player = playerRef.current;
      if (!player) return;
      if (action === "pause") {
        resumeAfterFocusGainRef.current = isPlaying;
        player.pause();
        setIsPlaying(false);
        updateNativeMediaState(false);
      } else if (action === "duck") {
        player.volume = 0.35;
      } else if (action === "restore") {
        player.volume = 1;
        resumeAfterFocusGainRef.current = false;
      }
    });
    return () => subscription.remove();
  }, [isPlaying]);

  useEffect(() => {
    const subscription = subscribeToNativeMediaActions((action) => {
      if (action === "next") void playAdjacent(1);
      else if (action === "previous") void playAdjacent(-1);
      else if (action === "play") setPlayingState(true);
      else if (action === "pause") setPlayingState(false);
      else if (action === "stop") {
        disposeCurrentPlayer();
        setIsPlaying(false);
        setIsLoading(false);
      }
    });
    return () => subscription.remove();
  }, [disposeCurrentPlayer, playAdjacent, setPlayingState]);

  const toggleFavorite = useCallback((radioId: string) => {
    setFavorites((previous) => {
      const next = toggleFavoriteId(previous, radioId);
      saveFavoriteIds(next).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo<PlayerContextValue>(() => ({
    currentRadio,
    isPlaying,
    isLoading,
    playbackError,
    favorites,
    radios,
    catalogUpdatedAt,
    catalogSource,
    isRefreshingCatalog,
    backgroundPlaybackEnabled,
    setBackgroundPlaybackEnabled: updateBackgroundPlayback,
    updateLockScreenMetadata,
    refreshCatalog,
    playRadio,
    playAdjacent,
    togglePlay,
    toggleFavorite,
    isFavorite: (id: string) => favorites.includes(id),
  }), [backgroundPlaybackEnabled, catalogSource, catalogUpdatedAt, currentRadio, favorites, isLoading, isPlaying, isRefreshingCatalog, playAdjacent, playRadio, playbackError, radios, refreshCatalog, toggleFavorite, togglePlay, updateBackgroundPlayback, updateLockScreenMetadata]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function useRadioPlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("useRadioPlayer must be used inside RadioPlayerProvider");
  return value;
}

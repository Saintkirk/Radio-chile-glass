import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadCatalog, RADIOS, selectStartupRadio, type Radio, validateStreamUrl } from "./radios";
import { prefetchFrequentLogos } from "./logo-cache";
import { loadFavoriteIds, saveFavoriteIds } from "./favorites-storage";
import { adjacentPlayableRadioIndex, isLockScreenAudioCandidate, lockScreenMetadata, MAX_PLAYBACK_RETRIES, retryDelayMs, adaptiveRetryDelayMs, toggleFavoriteId, audioFocusAction, isCurrentPlaybackRequest, isCurrentRadioId, isPlaybackConfirmed, shouldContinueCrossfade, type LockScreenMetadata } from "./player-utils";
import { addAudioFocusChangeListener, abandonAudioFocus, requestAudioFocus } from "./audio-focus";
import { clearNativeMediaSession, setNativeMediaSession, subscribeToNativeMediaActions, updateNativeMediaMetadata, updateNativeMediaState } from "./radio-media-controls";

// Performance logging utilities for production debugging
const PERF_LOGS_ENABLED = __DEV__ || process.env.NODE_ENV === "development";

interface PerformanceMetric {
  event: string;
  timestamp: number;
  duration?: number;
  radioId?: string;
  success?: boolean;
  error?: string;
}

const logPerformance = (metric: PerformanceMetric) => {
  if (!PERF_LOGS_ENABLED) return;
  console.log(`[PERF] ${metric.event}`, {
    time: new Date(metric.timestamp).toISOString(),
    duration: metric.duration ? `${metric.duration}ms` : undefined,
    radioId: metric.radioId,
    success: metric.success,
    error: metric.error,
  });
};

const measureDuration = <T,>(event: string, radioId: string | undefined, fn: () => T): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    logPerformance({ event, timestamp: Date.now(), duration, radioId, success: true });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logPerformance({ 
      event, 
      timestamp: Date.now(), 
      duration, 
      radioId, 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    throw error;
  }
};

type RadioAudioPlayer = ReturnType<typeof createAudioPlayer>;

function pauseAndRemovePlayer(player: RadioAudioPlayer | null) {
  if (!player) return;
  try { player.pause(); } catch { /* no-op */ }
  try { player.remove(); } catch { /* no-op */ }
}

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
  refreshCatalog: () => Promise<Radio[]>;
  playRadio: (radio: Radio, preserveMediaSession?: boolean) => Promise<void>;
  playAdjacent: (direction: -1 | 1, fromId?: string) => Promise<void>;
  togglePlay: () => void;
  toggleFavorite: (radioId: string) => void;
  isFavorite: (radioId: string) => boolean;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);
const LAST_RADIO_KEY = "radio-last-played-id";
const FAILED_RADIO_COOLDOWN_MS = 5 * 60 * 1000;

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const playerStatusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const playRequestRef = useRef(0);
  const startupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossfadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crossfadeTokenRef = useRef(0);
  const crossfadeStartedRequestRef = useRef(0);
  const crossfadeOutgoingRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
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
  const autoplayStartedRef = useRef(false);
  const playbackIntentRef = useRef(false);
  const currentRadioRef = useRef<Radio | null>(null);
  const failedRadioUntilRef = useRef(new Map<string, number>());

  const cleanupCrossfadeOutgoing = useCallback((except: RadioAudioPlayer | null = null) => {
    const outgoing = crossfadeOutgoingRef.current;
    crossfadeOutgoingRef.current = null;
    if (outgoing && outgoing !== except) pauseAndRemovePlayer(outgoing);
  }, []);

  const disposeCurrentPlayer = useCallback((preserveMediaSession = false) => {
    crossfadeTokenRef.current += 1;
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
    cleanupCrossfadeOutgoing(playerRef.current);
    if (startupTimeoutRef.current) {
      clearTimeout(startupTimeoutRef.current);
      startupTimeoutRef.current = null;
    }
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
    playerStatusSubscriptionRef.current?.remove();
    playerStatusSubscriptionRef.current = null;
    const player = playerRef.current;
    playerRef.current = null;
    if (player) {
      try { player.clearLockScreenControls(); } catch { /* no-op on unsupported builds */ }
    }
    pauseAndRemovePlayer(player);
    if (!preserveMediaSession) {
      clearNativeMediaSession();
      abandonAudioFocus();
    }
  }, [cleanupCrossfadeOutgoing]);

  const detachCurrentPlayerForCrossfade = useCallback(() => {
    if (startupTimeoutRef.current) {
      clearTimeout(startupTimeoutRef.current);
      startupTimeoutRef.current = null;
    }
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
    playerStatusSubscriptionRef.current?.remove();
    playerStatusSubscriptionRef.current = null;
    const outgoing = playerRef.current;
    playerRef.current = null;
    if (outgoing) {
      try { outgoing.clearLockScreenControls(); } catch { /* no-op on unsupported builds */ }
    }
    return outgoing;
  }, []);

  const startCrossfade = useCallback((outgoing: ReturnType<typeof createAudioPlayer> | null, incoming: ReturnType<typeof createAudioPlayer>, requestId: number) => {
    // Implement real crossfade with 400ms fade duration
    if (outgoing && outgoing !== incoming) {
      crossfadeOutgoingRef.current = outgoing;
      crossfadeStartedRequestRef.current = requestId;

      let volume = 1;
      const fadeDuration = 400; // ms
      const fadeInterval = 50; // ms
      const fadeSteps = fadeDuration / fadeInterval;
      const volumeStep = 1 / fadeSteps;

      // Fade out outgoing player
      const fadeTimer = setInterval(() => {
        if (!shouldContinueCrossfade(requestId, playRequestRef.current, crossfadeTokenRef.current, crossfadeTokenRef.current)) {
          clearInterval(fadeTimer);
          pauseAndRemovePlayer(outgoing);
          crossfadeOutgoingRef.current = null;
          return;
        }

        volume -= volumeStep;
        if (volume <= 0) {
          clearInterval(fadeTimer);
          try { outgoing.volume = 0; } catch { /* no-op */ }
          try { outgoing.pause(); } catch { /* no-op */ }
          crossfadeOutgoingRef.current = null;
        } else {
          try { outgoing.volume = Math.max(0, volume); } catch { /* no-op */ }
        }
      }, fadeInterval);

      crossfadeTimerRef.current = fadeTimer;
    }

    // Ensure incoming player starts at full volume
    try { incoming.volume = 1; } catch { /* no-op */ }
  }, [shouldContinueCrossfade]);

  const refreshCatalog = useCallback(async (): Promise<Radio[]> => {
    setIsRefreshingCatalog(true);
    try {
      const result = await loadCatalog();
      setRadios(result.radios);
      setCatalogUpdatedAt(result.updatedAt);
      setCatalogSource(result.source);
      void prefetchFrequentLogos(result.radios);
      return result.radios;
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
    // Every UI surface calls this same function. If the requested station is
    // already loading or audible, treat the request as idempotent instead of
    // creating a second native player for the same stream.
    if (currentRadioRef.current?.id === radio.id && (playbackIntentRef.current || playerRef.current?.playing)) return;

    const startTime = Date.now();
    logPerformance({ event: 'playRadio_start', timestamp: startTime, radioId: radio.id });
    
    const requestId = ++playRequestRef.current;
    crossfadeTokenRef.current += 1;
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
    cleanupCrossfadeOutgoing();
    const outgoingPlayer = detachCurrentPlayerForCrossfade();
    // Stop the old stream before opening the new one. A live radio must never
    // leave two audible players during the handoff; the paused instance remains
    // available only as a silent fallback if the new stream fails.
    if (outgoingPlayer) {
      try { outgoingPlayer.volume = 0; } catch { /* no-op */ }
      try { outgoingPlayer.pause(); } catch { /* no-op */ }
    }
    if (preserveMediaSession && backgroundPlaybackEnabled) {
      setNativeMediaSession(lockScreenMetadata(radio), false);
    }
    resumeAfterFocusGainRef.current = false;
    failedRadioUntilRef.current.delete(radio.id);
    currentRadioRef.current = radio;
    setCurrentRadio(radio);
    AsyncStorage.setItem(LAST_RADIO_KEY, radio.id).catch(() => undefined);
    // La intención se registra de inmediato, pero el estado audible solo se
    // confirma cuando Expo Audio informa que el player está listo y reproduciendo.
    playbackIntentRef.current = true;
    setIsPlaying(false);
    setIsLoading(true);
    setPlaybackError(null);

    // Validate stream URL before attempting playback
    const urlValidation = validateStreamUrl(radio.streamUrl);
    if (!urlValidation.valid) {
      const errorTime = Date.now();
      logPerformance({ 
        event: 'playRadio_error', 
        timestamp: errorTime, 
        radioId: radio.id, 
        success: false, 
        error: `URL inválida: ${urlValidation.reason}` 
      });
      setPlaybackError(`URL inválida: ${urlValidation.reason}`);
      setIsLoading(false);
      failedRadioUntilRef.current.set(radio.id, Date.now() + FAILED_RADIO_COOLDOWN_MS);
      return;
    }
    
    for (let attempt = 0; attempt <= MAX_PLAYBACK_RETRIES; attempt += 1) {
      if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
      
      // Use adaptive retry delay with error type detection
      const isNetworkError = attempt > 0 && playbackError?.includes('red') || playbackError?.includes('conexión');
      const errorType = isNetworkError ? 'network' : attempt > 0 ? 'stream' : undefined;
      const delay = adaptiveRetryDelayMs(attempt, errorType);
      
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
      let candidate: ReturnType<typeof createAudioPlayer> | null = null;
      try {
        // El foco nativo es best effort. Expo Audio es el dueño del player y
        // debe poder iniciar aunque otro audio mantenga el foco temporalmente;
        // de lo contrario una respuesta nativa incompleta deja todas las radios
        // atrapadas en buffering sin llegar a crear el stream.
        await requestAudioFocus();
        candidate = createAudioPlayer(
          {
            uri: radio.streamUrl,
            headers: {
              "Icy-MetaData": "1",
              "User-Agent": "RadioChileGlass/1.0",
            },
          },
          {
            downloadFirst: false,
            updateInterval: 200,
          }
        );
        if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) {
          try { candidate.pause(); } catch { /* no-op */ }
          candidate.remove();
          return;
        }
        playerRef.current = candidate;
        syncLockScreenControls(candidate, radio, backgroundPlaybackEnabled, false);
        let nativePlaybackConfirmed = false;
        playerStatusSubscriptionRef.current = candidate.addListener("playbackStatusUpdate", (status) => {
          if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
          const confirmed = isPlaybackConfirmed(status);
          // Algunos streams emiten playing=true mientras aún están llenando el
          // buffer. Solo ese estado confirmado termina la conexión y actualiza
          // la MediaSession como reproduciendo.
          if (confirmed) {
            nativePlaybackConfirmed = true;
            failedRadioUntilRef.current.delete(radio.id);
            setIsPlaying(true);
            updateNativeMediaState(true);
          } else if (!status.playing && !status.isBuffering && !playbackIntentRef.current) {
            setIsPlaying(false);
            updateNativeMediaState(false);
          }
          if (confirmed) {
            const successTime = Date.now();
            logPerformance({ 
              event: 'playRadio_success', 
              timestamp: successTime, 
              radioId: radio.id, 
              success: true,
              duration: successTime - startTime 
            });
            if (crossfadeStartedRequestRef.current !== requestId) {
              crossfadeStartedRequestRef.current = requestId;
              startCrossfade(outgoingPlayer, candidate as ReturnType<typeof createAudioPlayer>, requestId);
            }
            playbackIntentRef.current = false;
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
        // La intención se refleja con el indicador de conexión; el estado de
        // reproducción y la MediaSession esperan la confirmación nativa.
        // Mantener isLoading=true hasta que el listener confirme playing o error.
        setIsPlaying(false);
        setIsLoading(true);
        updateNativeMediaState(false);
        setNativeMediaSession(lockScreenMetadata(radio), false);
        if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = setTimeout(() => {
          replayTimeoutRef.current = null;
          if (isCurrentPlaybackRequest(requestId, playRequestRef.current) && playerRef.current === activeCandidate && playbackIntentRef.current && !nativePlaybackConfirmed) {
            try {
              activeCandidate.play();
            } catch { /* status listener reports the real failure */ }
          }
        }, 350);
        startupTimeoutRef.current = setTimeout(() => {
          if (!isCurrentPlaybackRequest(requestId, playRequestRef.current) || !playbackIntentRef.current || nativePlaybackConfirmed) return;
          startupTimeoutRef.current = null;
          playbackIntentRef.current = false;
          setIsPlaying(false);
          setIsLoading(false);
          failedRadioUntilRef.current.set(radio.id, Date.now() + FAILED_RADIO_COOLDOWN_MS);
          setPlaybackError(`No se pudo iniciar el audio de ${radio.name}`);
          try { candidate?.pause(); } catch { /* no-op */ }
          try { candidate?.remove(); } catch { /* no-op */ }
          // Do not silently restore the old stream: it was already detached and
          // may have been reclaimed by Android. Leaving the session paused with an
          // explicit error is safer than reporting a dead station as playing.
          if (outgoingPlayer) pauseAndRemovePlayer(outgoingPlayer);
          playerRef.current = null;
          currentRadioRef.current = radio;
          setCurrentRadio(radio);
          // Mantener la MediaSession visible en estado pausado permite que el usuario
          // intente otra emisora desde la notificación sin cerrar la actividad.
          setNativeMediaSession(lockScreenMetadata(radio), false);
          abandonAudioFocus();
        }, 8000);
        if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) {
          try { candidate.pause(); } catch { /* no-op */ }
          try { candidate.remove(); } catch { /* no-op */ }
          return;
        }
        // El estado visual se actualiza de inmediato y se confirma con playbackStatusUpdate;
        // si el stream no responde, el timeout lo revierte sin destruir la MediaSession.
        return;
      } catch {
        if (candidate) {
          // The candidate can already be playerRef.current when play() or a
          // native callback throws. Detach and remove it in that case too;
          // otherwise a failed handoff can keep emitting beside the fallback.
          if (candidate === playerRef.current) {
            playerStatusSubscriptionRef.current?.remove();
            playerStatusSubscriptionRef.current = null;
            playerRef.current = null;
          }
          pauseAndRemovePlayer(candidate);
        }
        if (!isCurrentPlaybackRequest(requestId, playRequestRef.current)) return;
        if (attempt === MAX_PLAYBACK_RETRIES) {
          const errorTime = Date.now();
          logPerformance({ 
            event: 'playRadio_error', 
            timestamp: errorTime, 
            radioId: radio.id, 
            success: false, 
            error: `No se pudo conectar con ${radio.name}`,
            duration: errorTime - startTime 
          });
          playbackIntentRef.current = false;
          failedRadioUntilRef.current.set(radio.id, Date.now() + FAILED_RADIO_COOLDOWN_MS);
          setPlaybackError(`No se pudo conectar con ${radio.name}`);
          setIsLoading(false);
          if (outgoingPlayer) pauseAndRemovePlayer(outgoingPlayer);
          playerRef.current = null;
          currentRadioRef.current = radio;
          setCurrentRadio(radio);
          setIsPlaying(false);
          setNativeMediaSession(lockScreenMetadata(radio), false);
          abandonAudioFocus();
        }
      }
    }
  }, [backgroundPlaybackEnabled, detachCurrentPlayerForCrossfade, startCrossfade, syncLockScreenControls]);

  const playAdjacent = useCallback(async (direction: -1 | 1, fromId?: string) => {
    const sourceId = fromId ?? currentRadio?.id;
    const currentIndex = radios.findIndex((radio) => radio.id === sourceId);
    if (currentIndex < 0 || radios.length < 2) return;
    const now = Date.now();
    const nextIndex = adjacentPlayableRadioIndex(radios, currentIndex, direction, (candidate) => {
      if (!isLockScreenAudioCandidate(candidate.id)) return false;
      const blockedUntil = failedRadioUntilRef.current.get(candidate.id);
      if (!blockedUntil) return true;
      if (blockedUntil <= now) {
        failedRadioUntilRef.current.delete(candidate.id);
        return true;
      }
      return false;
    });
    if (nextIndex < 0) return;
    await playRadio(radios[nextIndex], true);
  }, [currentRadio?.id, playRadio, radios]);

  const setPlayingState = useCallback(async (shouldPlay: boolean) => {
    const player = playerRef.current;
    if (!player) {
      if (shouldPlay && currentRadio) {
        // A native player can disappear after process reclaim or an interrupted
        // reopen. Reset the intent and re-enter through the same serialized path.
        playbackIntentRef.current = false;
        void playRadio(currentRadio, true);
      }
      return;
    }
    if (!shouldPlay) {
      playbackIntentRef.current = false;
      resumeAfterFocusGainRef.current = false;
      player.pause();
      setIsPlaying(false);
      updateNativeMediaState(false);
      if (currentRadio) setNativeMediaSession(lockScreenMetadata(currentRadio), false);
      return;
    }
    // Audio Focus nativo puede estar temporalmente ocupado; no bloqueamos el
    // player por ese resultado y dejamos que Expo Audio resuelva la ruta real.
    const requestId = playRequestRef.current;
    await requestAudioFocus();
    if (requestId !== playRequestRef.current || playerRef.current !== player) return;
    playbackIntentRef.current = true;
    setPlaybackError(null);
    setIsLoading(true);
    setIsPlaying(false);
    try {
      player.play();
    } catch {
      playbackIntentRef.current = false;
      setIsLoading(false);
      setIsPlaying(false);
      setPlaybackError(`No se pudo reanudar el audio de ${currentRadio?.name ?? "la emisora"}`);
      updateNativeMediaState(false);
      if (currentRadio) setNativeMediaSession(lockScreenMetadata(currentRadio), false);
      return;
    }
    if (startupTimeoutRef.current) clearTimeout(startupTimeoutRef.current);
    const resumeRequestId = requestId;
    startupTimeoutRef.current = setTimeout(() => {
      startupTimeoutRef.current = null;
      if (resumeRequestId !== playRequestRef.current || playerRef.current !== player || !playbackIntentRef.current) return;
      playbackIntentRef.current = false;
      setIsLoading(false);
      setIsPlaying(false);
      setPlaybackError(`No se pudo reanudar el audio de ${currentRadio?.name ?? "la emisora"}`);
      updateNativeMediaState(false);
      if (currentRadio) setNativeMediaSession(lockScreenMetadata(currentRadio), false);
    }, 8000);
    // The playbackStatusUpdate listener is the only source of truth for an
    // audible state. `player.playing` can flip before the stream is loaded.
    setIsPlaying(false);
    setIsLoading(true);
    updateNativeMediaState(false);
    if (currentRadio) setNativeMediaSession(lockScreenMetadata(currentRadio), false);
  }, [currentRadio, playRadio]);

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
    // ICY/now-playing puede resolver después de que el usuario cambió de
    // emisora. Nunca permitas que esa respuesta tardía reviva el título,
    // logo o estado de la radio anterior en la pantalla bloqueada.
    if (!metadata.radioId || !isCurrentRadioId(currentRadioRef.current?.id, metadata.radioId)) return;
    try { playerRef.current?.updateLockScreenMetadata(metadata); } catch { /* no-op */ }
    updateNativeMediaMetadata(metadata);
  }, [backgroundPlaybackEnabled]);

  useEffect(() => {
    let cancelled = false;
    loadFavoriteIds().then((stored) => { if (stored.length > 0) setFavorites(stored); }).catch(() => undefined);
    AsyncStorage.getItem("radio-background-playback").then((value) => { if (value !== null) setBackgroundPlaybackEnabled(value !== "false"); });
    const audioModeReady = setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(() => undefined);
    void prefetchFrequentLogos(RADIOS);

    const startInitialPlayback = async () => {
      const lastRadioId = await AsyncStorage.getItem(LAST_RADIO_KEY).catch(() => null);
      const catalog = await refreshCatalog().catch(() => RADIOS);
      await audioModeReady;
      if (cancelled || autoplayStartedRef.current || playRequestRef.current !== 0) return;
      const initialRadio = selectStartupRadio(catalog, lastRadioId);
      if (!initialRadio) return;
      autoplayStartedRef.current = true;
      await playRadio(initialRadio).catch(() => undefined);
    };
    void startInitialPlayback();
    return () => {
      cancelled = true;
      disposeCurrentPlayer();
    };
  }, [disposeCurrentPlayer, playRadio, refreshCatalog]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: backgroundPlaybackEnabled, interruptionMode: "doNotMix" }).catch(() => undefined);
  }, [backgroundPlaybackEnabled]);

  useEffect(() => {
    const subscription = addAudioFocusChangeListener(({ change }) => {
      const action = audioFocusAction(change);
      const player = playerRef.current;
      if (!player) return;
      // Evita pausar manualmente durante buffering transitorio. Solo pausa
      // por pérdida definitiva de foco, manteniendo la reproducción activa
      // mientras el buffer se llena.
      if (action === "pause") {
        resumeAfterFocusGainRef.current = isPlaying && playbackIntentRef.current;
        player.pause();
        setIsPlaying(false);
        updateNativeMediaState(false);
      } else if (action === "duck") {
        player.volume = 0.35;
      } else if (action === "restore") {
        player.volume = 1;
        if (resumeAfterFocusGainRef.current && !player.playing) {
          // Reuse the serialized resume path. The native status listener, not the
          // focus callback, is the only authority allowed to publish PLAYING.
          void setPlayingState(true);
        }
        resumeAfterFocusGainRef.current = false;
      }
    });
    return () => subscription.remove();
    // Suscribirse solo una vez al montar, usando refs para acceder a estado actualizado
  }, []);

  useEffect(() => {
    const subscription = subscribeToNativeMediaActions((action) => {
      if (action === "next") void playAdjacent(1);
      else if (action === "previous") void playAdjacent(-1);
      else if (action === "play") setPlayingState(true);
      else if (action === "pause") setPlayingState(false);
      else if (action === "stop") {
        playbackIntentRef.current = false;
        resumeAfterFocusGainRef.current = false;
        disposeCurrentPlayer();
        currentRadioRef.current = null;
        setCurrentRadio(null);
        setPlaybackError(null);
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

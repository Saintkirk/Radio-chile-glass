import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { trpc } from "@/lib/trpc";
import { lockScreenMetadata } from "@/lib/player-utils";
import { useRadioPlayer } from "@/lib/radio-player";

/**
 * Hook para determinar el intervalo de polling según el estado de la app
 * - En foreground: 10s (balance entre frescura y eficiencia)
 * - En background: 30s (reduce consumo de batería y red en 66%)
 */
function useBackgroundAwarePolling() {
  const appStateRef = useRef<AppStateStatus>('active');
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  const isBackground = appStateRef.current === 'background' || appStateRef.current === 'inactive';
  // Polling más lento en background para ahorrar batería y red
  return isBackground ? 30_000 : 10_000;
}

/** Keeps native lock-screen metadata aligned with the station's live ICY StreamTitle. */
export function LockScreenNowPlayingSync() {
  const { currentRadio, backgroundPlaybackEnabled, updateLockScreenMetadata } = useRadioPlayer();
  const streamUrl = currentRadio?.streamUrl ?? "";
  const pollInterval = useBackgroundAwarePolling();
  const acceptedMetadataRef = useRef<{ data: unknown; streamUrl: string } | null>(null);
  const { data } = trpc.metadata.nowPlaying.useQuery(
    { streamUrl },
    {
      enabled: Boolean(currentRadio && backgroundPlaybackEnabled),
      refetchInterval: pollInterval,
      staleTime: Math.min(pollInterval - 2000, 8_000),
      retry: 1,
    },
  );

  useEffect(() => {
    if (!currentRadio || !backgroundPlaybackEnabled) return;
    // React Query may retain the previous result while the new stream is loading.
    // Never publish that cached result under the new station identity.
    if (data && acceptedMetadataRef.current?.data !== data) {
      acceptedMetadataRef.current = { data, streamUrl };
    } else if (data && acceptedMetadataRef.current?.streamUrl !== streamUrl) {
      return;
    }
    updateLockScreenMetadata(lockScreenMetadata(currentRadio, data && acceptedMetadataRef.current?.streamUrl === streamUrl ? data : undefined));
  }, [currentRadio, backgroundPlaybackEnabled, data, streamUrl, updateLockScreenMetadata]);

  return null;
}

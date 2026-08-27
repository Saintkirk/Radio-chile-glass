import { useEffect, useRef } from "react";

import { trpc } from "@/lib/trpc";
import { lockScreenMetadata } from "@/lib/player-utils";
import { useRadioPlayer } from "@/lib/radio-player";

/** Keeps native lock-screen metadata aligned with the station's live ICY StreamTitle. */
export function LockScreenNowPlayingSync() {
  const { currentRadio, backgroundPlaybackEnabled, updateLockScreenMetadata } = useRadioPlayer();
  const streamUrl = currentRadio?.streamUrl ?? "";
  const acceptedMetadataRef = useRef<{ data: unknown; streamUrl: string } | null>(null);
  const { data } = trpc.metadata.nowPlaying.useQuery(
    { streamUrl },
    {
      enabled: Boolean(currentRadio && backgroundPlaybackEnabled),
      refetchInterval: 20_000,
      staleTime: 15_000,
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

import { useEffect } from "react";

import { trpc } from "@/lib/trpc";
import { lockScreenMetadata } from "@/lib/player-utils";
import { useRadioPlayer } from "@/lib/radio-player";

/** Keeps native lock-screen metadata aligned with the station's live ICY StreamTitle. */
export function LockScreenNowPlayingSync() {
  const { currentRadio, backgroundPlaybackEnabled, updateLockScreenMetadata } = useRadioPlayer();
  const streamUrl = currentRadio?.streamUrl ?? "";
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
    updateLockScreenMetadata(lockScreenMetadata(currentRadio, data));
  }, [currentRadio, backgroundPlaybackEnabled, data, updateLockScreenMetadata]);

  return null;
}

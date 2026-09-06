import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";
import { safeRadioIndex, spinLandingIndex, wrapCarouselIndex } from "@/lib/player-utils";
import { nonInteractiveStyle, platformShadow } from "@/lib/platform-styles";
import { prefetchLogoWindow } from "@/lib/logo-cache";

const CARD_SIZE = 214;
const CARD_STEP = 118;
const SLOT_RADIUS = 8;
const DRAG_LIMIT = CARD_STEP * 1.2;
const SWIPE_DISTANCE = 22;
const SWIPE_VELOCITY = 280;
const MAX_GESTURE_VELOCITY = 2200;
function useSlotCardAnimatedStyle(
  slot: number,
  wheelOffset: SharedValue<number>,
  spinProgress: SharedValue<number>,
  reduceMotion: boolean,
) {
  return useAnimatedStyle(() => {
    const relative = slot + wheelOffset.get();
    const distance = Math.abs(relative);
    const clamped = Math.max(-SLOT_RADIUS - 1, Math.min(SLOT_RADIUS + 1, relative));
    const x = clamped * CARD_STEP;
    const rotation = interpolate(clamped, [-6, -4, -2, 0, 2, 4, 6], [58, 48, 28, 0, -28, -48, -58], Extrapolation.CLAMP);
    const scale = interpolate(distance, [0, 1, 2, 4, 6, 8], [1, 0.91, 0.8, 0.7, 0.58, 0.42], Extrapolation.CLAMP);
    const opacity = interpolate(distance, [0, 1, 2, 4, 6, 8], [1, 0.96, 0.72, 0.38, 0.16, 0], Extrapolation.CLAMP);
    const blur = interpolate(spinProgress.get(), [0, 0.12, 0.36, 0.82, 1], [0, 1, 3.2, 2.2, 0], Extrapolation.CLAMP);

    return {
      opacity,
      zIndex: SLOT_RADIUS - Math.min(SLOT_RADIUS, Math.round(distance)),
      filter: [{ blur }],
      transform: [
        { perspective: 900 },
        { translateX: x },
        { rotateY: reduceMotion ? "0deg" : `${rotation}deg` },
        { scale },
      ],
    };
  }, [reduceMotion, slot, spinProgress, wheelOffset]);
}

// ... rest of file kept identical to previous improved version for brevity in this call ...

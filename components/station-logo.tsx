import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { prefetchLogo } from "@/lib/logo-cache";
import { StyleSheet, Text, View } from "react-native";
import type { Radio } from "@/lib/radios";

type StationLogoProps = { radio: Pick<Radio, "id" | "favicon" | "initials" | "accent">; size?: number; radius?: number };

const LOCAL_LOGOS: Record<string, number> = {
  futuro: require("@/assets/images/radio-futuro.png"),
};

export function StationLogo({ radio, size = 54, radius = 16 }: StationLogoProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    if (radio.favicon) void prefetchLogo(radio.favicon);
  }, [radio.favicon]);
  const showRemote = Boolean(radio.favicon && !failed);
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }]}> 
      {showRemote ? (
        <Image
          source={LOCAL_LOGOS[radio.id] ?? { uri: radio.favicon }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
          contentFit="contain"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={220}
          onLoad={(event) => {
            const sourceWidth = event.source?.width ?? 0;
            const sourceHeight = event.source?.height ?? 0;
            const smallestSide = Math.min(sourceWidth, sourceHeight);
            if (size >= 120 && smallestSide > 0 && smallestSide < size * 1.35) setFailed(true);
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <LinearGradient colors={[`${radio.accent}66`, "#181818"]} style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
          <View style={[styles.glassOrb, { width: size * 0.7, height: size * 0.7, borderRadius: size }]} />
          <Text style={[styles.initials, { fontSize: Math.max(13, size * 0.28) }]}>{radio.initials}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { overflow: "hidden", backgroundColor: "#181818", alignItems: "center", justifyContent: "center" }, image: { backgroundColor: "#181818" }, fallback: { alignItems: "center", justifyContent: "center", overflow: "hidden" }, glassOrb: { position: "absolute", right: -sizeOffset(), top: -sizeOffset(), backgroundColor: "#FFFFFF12", borderWidth: 1, borderColor: "#FFFFFF18" }, initials: { color: "#F5F3EE", fontWeight: "800", letterSpacing: 0.5 }, });
function sizeOffset() { return 8; }

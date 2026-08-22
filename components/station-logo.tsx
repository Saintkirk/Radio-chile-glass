import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Radio } from "@/lib/radios";

type StationLogoProps = { radio: Pick<Radio, "favicon" | "initials" | "accent">; size?: number; radius?: number };

export function StationLogo({ radio, size = 54, radius = 16 }: StationLogoProps) {
  const [failed, setFailed] = useState(false);
  const showRemote = Boolean(radio.favicon && !failed);
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }]}> 
      {showRemote ? (
        <Image
          source={{ uri: radio.favicon }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
          contentFit="contain"
          cachePolicy="disk"
          transition={180}
          onError={() => setFailed(true)}
        />
      ) : (
        <LinearGradient colors={[`${radio.accent}66`, "#161B2A"]} style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
          <View style={[styles.glassOrb, { width: size * 0.7, height: size * 0.7, borderRadius: size }]} />
          <Text style={[styles.initials, { fontSize: Math.max(13, size * 0.28) }]}>{radio.initials}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { overflow: "hidden", backgroundColor: "#161B2A", alignItems: "center", justifyContent: "center" }, image: { backgroundColor: "#161B2A" }, fallback: { alignItems: "center", justifyContent: "center", overflow: "hidden" }, glassOrb: { position: "absolute", right: -sizeOffset(), top: -sizeOffset(), backgroundColor: "#FFFFFF12", borderWidth: 1, borderColor: "#FFFFFF18" }, initials: { color: "#F5F3EE", fontWeight: "800", letterSpacing: 0.5 }, });
function sizeOffset() { return 8; }

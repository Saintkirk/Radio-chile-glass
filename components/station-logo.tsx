import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { prefetchLogo } from "@/lib/logo-cache";
import type { Radio } from "@/lib/radios";

type StationLogoProps = { radio: Pick<Radio, "id" | "favicon" | "initials" | "accent">; size?: number; radius?: number };

const LOCAL_LOGOS: Record<string, number> = {
  fmlatina: require("@/assets/images/radios/fmlatina.png"),
  cooperativa: require("@/assets/images/radio-cooperativa.png"),
  biobio: require("@/assets/images/radios/biobio.webp"),
  pudahuel: require("@/assets/images/radios/pudahuel.png"),
  corazon: require("@/assets/images/radios/corazon.png"),
  futuro: require("@/assets/images/radios/futuro.png"),
  concierto: require("@/assets/images/radios/concierto.png"),
  activa: require("@/assets/images/radios/activa.png"),
  adn: require("@/assets/images/radios/adn.png"),
  los40: require("@/assets/images/radios/los40.png"),
  fmdos: require("@/assets/images/radios/fmdos.png"),
  imagina: require("@/assets/images/radios/imagina.png"),
  agricultura: require("@/assets/images/radios/agricultura.jpg"),
  duna: require("@/assets/images/radios/duna.jpg"),
  beethoven: require("@/assets/images/radios/beethoven.png"),
  "rock-pop": require("@/assets/images/rock-and-pop.jpg"),
  festival: require("@/assets/images/radios/festival.jpg"),
  carolina: require("@/assets/images/radios/carolina.png"),
  sonar: require("@/assets/images/radios/sonar.png"),
  oasis: require("@/assets/images/radios/oasis.png"),
  "punto7-temuco": require("@/assets/images/radios/punto7-temuco.webp"),
  edelweiss: require("@/assets/images/radios/edelweiss.png"),
};

export const StationLogo = memo(function StationLogo({ radio, size = 54, radius = 16 }: StationLogoProps) {
  const [failed, setFailed] = useState(false);
  const sourceKey = `${radio.id}:${radio.favicon ?? ""}`;
  const currentSourceKeyRef = useRef(sourceKey);
  const hasLocalLogo = Boolean(LOCAL_LOGOS[radio.id]);

  useEffect(() => {
    currentSourceKeyRef.current = sourceKey;
    setFailed(false);
    if (radio.favicon && !hasLocalLogo) void prefetchLogo(radio.favicon);
  }, [hasLocalLogo, radio.favicon, radio.id, sourceKey]);

  const showLogo = Boolean((hasLocalLogo || radio.favicon) && !failed);
  const fallback = (
    <LinearGradient colors={[`${radio.accent}66`, "#181818"]} style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
      <View style={[styles.glassOrb, { width: size * 0.7, height: size * 0.7, borderRadius: size }]} />
      <Text style={[styles.initials, { fontSize: Math.max(13, size * 0.28) }]}>{radio.initials}</Text>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }]}>
      {fallback}
      {showLogo && (
        <Image
          key={sourceKey}
          source={LOCAL_LOGOS[radio.id] ?? { uri: radio.favicon }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
          contentFit="contain"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={hasLocalLogo ? 0 : 120}
          onLoad={(event) => {
            if (currentSourceKeyRef.current !== sourceKey) return;
            const sourceWidth = event.source?.width ?? 0;
            const sourceHeight = event.source?.height ?? 0;
            const smallestSide = Math.min(sourceWidth, sourceHeight);
            if (!hasLocalLogo && size >= 120 && smallestSide > 0 && smallestSide < size * 1.35) setFailed(true);
          }}
          onError={() => {
            if (currentSourceKeyRef.current === sourceKey) setFailed(true);
          }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: "#181818", alignItems: "center", justifyContent: "center" },
  image: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  fallback: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glassOrb: { position: "absolute", right: -8, top: -8, backgroundColor: "#FFFFFF12", borderWidth: 1, borderColor: "#FFFFFF18" },
  initials: { color: "#F5F3EE", fontWeight: "800", letterSpacing: 0.5 },
});

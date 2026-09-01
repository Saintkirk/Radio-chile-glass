import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { prefetchLogo } from "@/lib/logo-cache";
import { canCommitLogo, getLogoSourceKey } from "@/lib/logo-transition";
import type { Radio } from "@/lib/radios";

type StationLogoProps = {
  radio: Pick<Radio, "id" | "favicon" | "initials" | "accent">;
  size?: number;
  radius?: number;
  priority?: "high" | "normal" | "low";
};
type LogoImageSource = number | { uri: string };

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

export const StationLogo = memo(function StationLogo({ 
  radio, 
  size = 54, 
  radius = 16,
  priority = "normal"
}: StationLogoProps) {
  const sourceKey = getLogoSourceKey(radio.id, radio.favicon);
  const hasLocalLogo = Boolean(LOCAL_LOGOS[radio.id]);
  const source: LogoImageSource | null = hasLocalLogo
    ? LOCAL_LOGOS[radio.id]
    : radio.favicon
      ? { uri: radio.favicon }
      : null;
  const [loadedSourceKey, setLoadedSourceKey] = useState<string | null>(() => (source && hasLocalLogo ? sourceKey : null));
  const [failedSourceKey, setFailedSourceKey] = useState<string | null>(null);
  const currentSourceKeyRef = useRef(sourceKey);
  const loadAttemptedRef = useRef(false);
  // Actualizar durante el render cierra la ventana entre el cambio de props y el efecto.
  // Así, un callback tardío nunca puede promover artwork de la emisora anterior.
  currentSourceKeyRef.current = sourceKey;

  const handleLoad = useCallback(() => {
    if (canCommitLogo(currentSourceKeyRef.current, sourceKey)) {
      setLoadedSourceKey(sourceKey);
    }
  }, [sourceKey]);

  const handleError = useCallback(() => {
    if (canCommitLogo(currentSourceKeyRef.current, sourceKey)) {
      setFailedSourceKey(sourceKey);
    }
  }, [sourceKey]);

  useEffect(() => {
    setLoadedSourceKey(hasLocalLogo ? sourceKey : null);
    setFailedSourceKey(null);
    loadAttemptedRef.current = false;
    
    if (radio.favicon && !hasLocalLogo && !loadAttemptedRef.current) {
      loadAttemptedRef.current = true;
      const prefetchLevel = priority === "high" ? "hot" : priority === "normal" ? "warm" : "cold" as const;
      void prefetchLogo(radio.favicon, prefetchLevel);
    }
  }, [hasLocalLogo, radio.favicon, radio.id, sourceKey, priority]);

  const fallback = (
    <LinearGradient
      colors={[`${radio.accent}66`, "#181818"]}
      style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.glassOrb, { width: size * 0.7, height: size * 0.7, borderRadius: size }]} />
      <Text style={[styles.initials, { fontSize: Math.max(13, size * 0.28) }]}>{radio.initials}</Text>
    </LinearGradient>
  );

  const isLoaded = loadedSourceKey === sourceKey;
  const hasFailed = failedSourceKey === sourceKey;
  const canRenderImage = Boolean(source && !hasFailed);
  const transitionDuration = hasLocalLogo ? 0 : isLoaded ? 0 : 180;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }]} accessible={false}>
      {fallback}
      {canRenderImage && source && (
        <Image
          key={sourceKey}
          source={source}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: radius },
            !isLoaded && styles.hiddenImage,
          ]}
          contentFit="contain"
          contentPosition="center"
          cachePolicy="memory-disk"
          recyclingKey={sourceKey}
          transition={transitionDuration}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#181818",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  hiddenImage: { opacity: 0 },
  fallback: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glassOrb: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#FFFFFF12",
    borderWidth: 1,
    borderColor: "#FFFFFF18",
  },
  initials: { color: "#F5F3EE", fontWeight: "800", letterSpacing: 0.5 },
});

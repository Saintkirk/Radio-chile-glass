#!/usr/bin/env python3
from pathlib import Path
p = Path("app/radio/[id].tsx")
t = p.read_text()
if "showLive" in t:
    print("already")
    raise SystemExit(0)
t = t.replace(
    'import { Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";',
    'import { ActivityIndicator, Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";',
)
t = t.replace(
    'import { playbackHandoff } from "@/lib/player-utils";',
    'import { dialStatusLabel, isLiveBadgeVisible, playbackControlLabel, playbackHandoff, stationPlaybackPhase } from "@/lib/player-utils";',
)
t = t.replace(
    "  const active = currentRadio?.id === radio.id && isPlaying;\n",
    "  const phase = stationPlaybackPhase(currentRadio?.id, radio.id, isPlaying, isLoading, Boolean(playbackError));\n  const active = phase === \"playing\";\n  const connecting = phase === \"connecting\";\n  const showLive = isLiveBadgeVisible(phase);\n",
)
old_live = """          <View style={styles.liveMeta}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>EN VIVO</Text>
            <Text style={styles.liveSeparator}>·</Text>
            <Text style={styles.liveFrequency}>{radio.frequency}</Text>
          </View>"""
new_live = """          <View style={styles.liveMeta}>
            {showLive ? (
              <>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>EN VIVO</Text>
                <Text style={styles.liveSeparator}>·</Text>
              </>
            ) : connecting ? (
              <>
                <View style={[styles.liveDot, styles.liveDotConnecting]} />
                <Text style={styles.liveLabelConnecting}>CONECTANDO</Text>
                <Text style={styles.liveSeparator}>·</Text>
              </>
            ) : phase === "error" ? (
              <>
                <View style={[styles.liveDot, styles.liveDotError]} />
                <Text style={styles.liveLabelError}>SIN SEÑAL</Text>
                <Text style={styles.liveSeparator}>·</Text>
              </>
            ) : null}
            <Text style={styles.liveFrequency}>{radio.frequency}</Text>
          </View>"""
if old_live not in t:
    raise SystemExit("live missing")
t = t.replace(old_live, new_live, 1)
old_dial = """                <Pressable
                  onPress={() => (currentRadio?.id === radio.id ? togglePlay() : playRadio(radio, true))}
                  accessibilityRole="button"
                  accessibilityLabel={active ? `Pausar ${radio.name}` : `Reproducir ${radio.name}`}
                  style={({ pressed }) => [styles.dialButton, active && styles.dialButtonActive, pressed && styles.dialPressed]}
                >
                  <IconSymbol name={active ? "pause.fill" : "play.fill"} size={30} color="#F7F7F2" />
                </Pressable>
                <Text style={styles.dialStatus}>{isLoading ? "CONECTANDO" : active ? "REPRODUCIENDO" : "LISTA PARA ESCUCHAR"}</Text>"""
new_dial = """                <Pressable
                  onPress={() => {
                    if (phase === "error") void playRadio(radio, true);
                    else if (currentRadio?.id === radio.id) togglePlay();
                    else void playRadio(radio, true);
                  }}
                  disabled={connecting}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: connecting, busy: connecting }}
                  accessibilityLabel={playbackControlLabel(phase, radio.name)}
                  style={({ pressed }) => [
                    styles.dialButton,
                    active && styles.dialButtonActive,
                    connecting && styles.dialButtonConnecting,
                    phase === "error" && styles.dialButtonError,
                    pressed && !connecting && styles.dialPressed,
                  ]}
                >
                  {connecting ? (
                    <ActivityIndicator size="large" color="#F7F7F2" />
                  ) : (
                    <IconSymbol
                      name={active ? "pause.fill" : phase === "error" ? "arrow.clockwise" : "play.fill"}
                      size={30}
                      color="#F7F7F2"
                    />
                  )}
                </Pressable>
                <Text style={[styles.dialStatus, active && styles.dialStatusActive, phase === "error" && styles.dialStatusError]}>
                  {dialStatusLabel(phase)}
                </Text>"""
if old_dial not in t:
    raise SystemExit("dial missing")
t = t.replace(old_dial, new_dial, 1)
t = t.replace(
    '  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1ED760" },\n  liveLabel: { color: "#1ED760", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },',
    '  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1ED760" },\n  liveDotConnecting: { backgroundColor: "#F5A524" },\n  liveDotError: { backgroundColor: "#FF6B5A" },\n  liveLabel: { color: "#1ED760", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },\n  liveLabelConnecting: { color: "#F5A524", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },\n  liveLabelError: { color: "#FF6B5A", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 },',
    1,
)
t = t.replace(
    '  dialButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center" },\n  dialButtonActive: { backgroundColor: "#1ED76033" },',
    '  dialButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center" },\n  dialButtonActive: { backgroundColor: "#1ED76033" },\n  dialButtonConnecting: { backgroundColor: "#F5A52433" },\n  dialButtonError: { backgroundColor: "#FF6B5A33" },',
    1,
)
t = t.replace(
    '  dialStatus: { color: "#AEB5C2", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },',
    '  dialStatus: { color: "#AEB5C2", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },\n  dialStatusActive: { color: "#1ED760" },\n  dialStatusError: { color: "#FF6B5A" },',
    1,
)
p.write_text(t)
print("radio patched", len(t))

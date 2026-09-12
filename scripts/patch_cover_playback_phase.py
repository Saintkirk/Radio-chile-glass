#!/usr/bin/env python3
from pathlib import Path
p = Path("components/cover-flow-carousel.tsx")
t = p.read_text()
if "isPlaying && !isLoading" in t:
    print("already done")
    raise SystemExit(0)
old = """          {isCenter && (
            <View style={[styles.liveBadge, { borderColor: `${radio.accent}CC`, backgroundColor: `${radio.accent}DD` }, nonInteractiveStyle]}>
              <IconSymbol name="waveform" size={14} color="#FFFFFF" />
              <Text style={styles.liveBadgeText}>EN VIVO</Text>
            </View>
          )}"""
new = """          {isCenter && currentRadioId === radio.id && isPlaying && !isLoading && (
            <View style={[styles.liveBadge, { borderColor: `${radio.accent}CC`, backgroundColor: `${radio.accent}DD` }, nonInteractiveStyle]} accessibilityLabel="En vivo">
              <IconSymbol name="waveform" size={14} color="#FFFFFF" />
              <Text style={styles.liveBadgeText}>EN VIVO</Text>
            </View>
          )}"""
if old not in t:
    raise SystemExit("pattern missing")
t = t.replace(old, new, 1)
t = t.replace("Buffering ${radio.name}", "Conectando con ${radio.name}", 1)
p.write_text(t)
print("cover patched")

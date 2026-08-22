import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRadioPlayer } from "@/lib/radio-player";
import { useThemeContext, type ThemePreference } from "@/lib/theme-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadHapticsPreference, setHapticsEnabled } from "@/lib/haptics";

type PushPreferences = { programming: boolean; favorites: boolean };
const DEFAULT_PUSH: PushPreferences = { programming: false, favorites: false };

export default function SettingsScreen() {
  const router = useRouter();
  const { backgroundPlaybackEnabled, setBackgroundPlaybackEnabled } = useRadioPlayer();
  const { preference, setThemePreference } = useThemeContext();
  const [push, setPush] = useState<PushPreferences>(DEFAULT_PUSH);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [permission, setPermission] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("radio-push-preferences").then((value) => { if (value) setPush({ ...DEFAULT_PUSH, ...JSON.parse(value) }); }).catch(() => undefined);
    Notifications.getPermissionsAsync().then(({ status }) => setPermission(status)).catch(() => setPermission(null));
    loadHapticsPreference().then(setHapticsEnabledState).catch(() => undefined);
  }, []);

  const savePush = (next: PushPreferences) => { setPush(next); AsyncStorage.setItem("radio-push-preferences", JSON.stringify(next)).catch(() => undefined); };
  const toggleHaptics = (enabled: boolean) => { setHapticsEnabledState(enabled); setHapticsEnabled(enabled); };
  const requestPushPermission = async () => {
    const result = await Notifications.requestPermissionsAsync();
    setPermission(result.status);
    return result.status === "granted";
  };
  const togglePush = async (key: keyof PushPreferences, enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const granted = await requestPushPermission();
      if (!granted) return;
    }
    savePush({ ...push, [key]: enabled });
  };
  const openNotificationSettings = () => { if (Platform.OS !== "web") Linking.openSettings().catch(() => undefined); };
  const permissionLabel = permission === "granted" ? "Permiso concedido" : permission === "denied" ? "Permiso bloqueado en el sistema" : "Aún no configurado";

  return <ScreenContainer containerClassName="bg-[#090B12]" className="px-5 pt-3"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><IconSymbol name="chevron.left" size={22} color="#F5F3EE" /></Pressable><Text style={styles.title}>Ajustes</Text><View style={{ width: 38 }} /></View><Text style={styles.eyebrow}>REPRODUCCIÓN</Text><View style={styles.group}><SettingRow icon="moon.fill" title="Seguir reproduciendo" subtitle="Mantén la radio activa al salir" value={backgroundPlaybackEnabled} onChange={setBackgroundPlaybackEnabled} /><View style={styles.divider} /><View style={styles.explanation}><Text style={styles.explanationText}>En Android, el control multimedia y la pantalla de bloqueo requieren un build nativo con reproducción en segundo plano habilitada.</Text></View></View><Text style={styles.eyebrow}>INTERACCIÓN</Text><View style={styles.group}><SettingRow icon="waveform" title="Respuesta háptica" subtitle="Vibraciones suaves al interactuar" value={hapticsEnabled} onChange={toggleHaptics} /></View><Text style={styles.eyebrow}>NOTIFICACIONES</Text><View style={styles.group}><SettingRow icon="bell.fill" title="Avisos de programación" subtitle="Novedades y programas especiales" value={push.programming} onChange={(value) => togglePush("programming", value)} /><View style={styles.divider} /><SettingRow icon="heart.fill" title="Avisos de radios favoritas" subtitle="Actualizaciones de tus emisoras guardadas" value={push.favorites} onChange={(value) => togglePush("favorites", value)} /><View style={styles.permissionRow}><View style={[styles.statusDot, { backgroundColor: permission === "granted" ? "#76E0B5" : "#FFB86B" }]} /><Text style={styles.permissionText}>{permissionLabel}</Text>{permission === "denied" && <Pressable onPress={openNotificationSettings}><Text style={styles.settingsLink}>Abrir ajustes</Text></Pressable>}</View></View><Text style={styles.note}>Las notificaciones editoriales son opcionales y no controlan la reproducción. Los controles multimedia pertenecen a la sesión de audio local.</Text><Text style={styles.eyebrow}>APARIENCIA</Text><View style={styles.themeGroup}><Text style={styles.themeTitle}>Tema visual</Text><Text style={styles.themeSubtitle}>Elige cómo quieres ver Radio Chile Glass.</Text><View style={styles.themeOptions}>{(["system", "light", "dark"] as ThemePreference[]).map((option) => <Pressable key={option} onPress={() => setThemePreference(option)} style={[styles.themeOption, preference === option && styles.themeOptionActive]}><Text style={[styles.themeOptionText, preference === option && styles.themeOptionTextActive]}>{option === "system" ? "Sistema" : option === "light" ? "Claro" : "Oscuro"}</Text></Pressable>)}</View></View><Text style={styles.eyebrow}>ACERCA DE</Text><View style={styles.group}><View style={styles.about}><View style={styles.aboutIcon}><IconSymbol name="radio" size={23} color="#FF8C7F" /></View><View style={{ flex: 1 }}><Text style={styles.aboutTitle}>Radio Chile Glass</Text><Text style={styles.aboutText}>Radios chilenas, en una experiencia simple.</Text></View><Text style={styles.version}>1.0</Text></View></View></ScrollView></ScreenContainer>;
}

function SettingRow({ icon, title, subtitle, value, onChange }: { icon: string; title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void }) { return <View style={styles.row}><View style={styles.rowIcon}><IconSymbol name={icon as never} size={20} color="#C8CBE0" /></View><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSubtitle}>{subtitle}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: "#33394A", true: "#FF6B5F" }} thumbColor="#F5F3EE" /></View>; }

const styles = StyleSheet.create({ content: { paddingBottom: 30 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }, back: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#FFFFFF0D", alignItems: "center", justifyContent: "center" }, title: { color: "#F5F3EE", fontSize: 20, fontWeight: "700" }, eyebrow: { color: "#A8B0C2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 }, group: { borderRadius: 20, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF10", paddingHorizontal: 16, marginBottom: 30 }, row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 13 }, rowIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#FFFFFF0D", alignItems: "center", justifyContent: "center" }, rowTitle: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" }, rowSubtitle: { color: "#8D95A7", fontSize: 12, marginTop: 4 }, divider: { height: 1, backgroundColor: "#FFFFFF0C" }, explanation: { paddingVertical: 14 }, explanationText: { color: "#71798C", fontSize: 12, lineHeight: 18 }, permissionRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8 }, statusDot: { width: 7, height: 7, borderRadius: 4 }, permissionText: { flex: 1, color: "#8D95A7", fontSize: 11 }, settingsLink: { color: "#FF8C7F", fontSize: 11, fontWeight: "700" }, note: { color: "#71798C", fontSize: 12, lineHeight: 18, paddingHorizontal: 4, marginBottom: 30 }, themeGroup: { borderRadius: 20, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF10", padding: 16, marginBottom: 30 }, themeTitle: { color: "#F5F3EE", fontSize: 15, fontWeight: "600" }, themeSubtitle: { color: "#8D95A7", fontSize: 12, marginTop: 4, marginBottom: 14 }, themeOptions: { flexDirection: "row", gap: 8 }, themeOption: { flex: 1, minHeight: 40, borderRadius: 12, backgroundColor: "#FFFFFF08", borderWidth: 1, borderColor: "#FFFFFF10", alignItems: "center", justifyContent: "center" }, themeOptionActive: { backgroundColor: "#FF6B5F22", borderColor: "#FF8C7F" }, themeOptionText: { color: "#9AA2B3", fontSize: 12, fontWeight: "600" }, themeOptionTextActive: { color: "#FFB1A7" }, about: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: 13 }, aboutIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#FF6B5F20", alignItems: "center", justifyContent: "center" }, aboutTitle: { color: "#F5F3EE", fontSize: 15, fontWeight: "700" }, aboutText: { color: "#8D95A7", fontSize: 12, marginTop: 5 }, version: { color: "#8D95A7", fontSize: 12 } });

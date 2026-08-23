# Referencias técnicas: Audio Focus Android y módulos Expo

## Expo Modules API

La guía oficial de Expo recomienda crear módulos locales dentro de `modules/` con `npx create-expo-module@latest --local`. La estructura incluye `android/`, `ios/`, `src/`, `expo-module.config.json` e `index.ts`. Expo Autolinking busca módulos locales en `./modules` por defecto y usa `expo-module.config.json` para registrar nombres completos de clases Kotlin.

Fuente: [Expo Modules API: Get started](https://docs.expo.dev/modules/get-started/)

Fuente: [Expo Autolinking](https://docs.expo.dev/modules/autolinking/)

Fuente: [expo-module.config.json](https://docs.expo.dev/modules/module-config/)

## Audio Focus en Android

Android recomienda solicitar audio focus inmediatamente antes de iniciar la reproducción y abandonar el foco cuando la reproducción termina. Para Android 8.0/API 26 o posterior se utiliza `AudioFocusRequest`; en versiones anteriores se usa la API compatible. Las pérdidas relevantes son `AUDIOFOCUS_LOSS`, `AUDIOFOCUS_LOSS_TRANSIENT` y `AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK`, además de `AUDIOFOCUS_GAIN` para recuperar el foco.

Para radio se utiliza `USAGE_MEDIA` y `CONTENT_TYPE_MUSIC`. La política implementada pausa ante pérdida permanente o transitoria, reduce volumen ante ducking y restaura el volumen cuando recupera foco, sin reanudar automáticamente después de una llamada.

Fuente: [Manage audio focus](https://developer.android.com/media/optimize/audio-focus)

Fuente: [AudioManager.OnAudioFocusChangeListener](https://developer.android.com/reference/android/media/AudioManager.OnAudioFocusChangeListener)

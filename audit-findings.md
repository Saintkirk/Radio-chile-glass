# Hallazgos intermedios de auditoría

## Alcance revisado

Se revisaron la estructura Expo/React Native, configuración de Android, motor de audio, catálogo de emisoras, loader de arranque, puente nativo de MediaSession, componentes del Cover Flow, logo cacheado y workflows de CI/CD.

## Hechos confirmados

- Proyecto móvil Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript 5.9, React 19, Reanimated 4 y Gesture Handler.
- `app.config.ts` usa `com.app.radiochileglass`, versión 1.0.2, orientación portrait, New Architecture, permisos de notificaciones y foreground media playback, además de minificación/shrink de release y arquitectura Android arm64-v8a.
- El arranque combina splash nativo, `AnimatedAppLoader` y dos límites de emergencia; la duración normal es 1150 ms y el fallback interno 3200 ms, con respaldo adicional en el layout raíz.
- `loadCatalog()` intenta catálogo remoto, luego caché AsyncStorage y finalmente catálogo editorial; `selectStartupRadio()` prefiere la emisora guardada y luego la primera del catálogo.
- El motor de audio mantiene un único `playerRef`, invalida solicitudes anteriores, pausa/remueve el reproductor saliente y conserva un fallback silenciado si falla la nueva señal. Tiene reintentos y timeout de 8 segundos.
- La capa JS de audio focus es un fallback: `requestAudioFocus()` siempre devuelve `granted`, `abandonAudioFocus()` no hace nada y el listener no recibe eventos nativos.
- El puente nativo Android implementa MediaSession, notificación foreground, acciones anterior/siguiente/play/pause/stop, metadatos, artwork con guardas de generación y deep link a `/radio/{id}`.
- El Cover Flow usa cinco carátulas, transformaciones Reanimated en UI thread, gesto Pan, inercia con resorte/velocidad inicial, zIndex estable y rasterización/textura hardware para 120 Hz.
- `StationLogo` está memoizado y usa `expo-image` con caché memory-disk, pero cada slot y reflexión monta instancias adicionales.
- El workflow nativo Gradle ejecuta check, tests, lint, Expo config, prebuild, assembleRelease, verificación ZIP/APK y publica artefactos con checksum/provenance.

## Riesgos preliminares

- El audio focus real no está conectado en JS; las interrupciones telefónicas o de otras apps dependen de la implementación nativa y no están demostradas por el adaptador actual.
- La actualización de estado de reproducción se declara optimista inmediatamente después de `play()`, antes de confirmar buffering real; esto puede producir una discrepancia temporal entre UI y audio.
- La pantalla de detalle combina BlurView de intensidad alta, fondo dinámico, gradientes, ScrollView animado y varias capas translúcidas; puede elevar el overdraw en dispositivos de alta tasa de refresco.
- Hay dos workflows Android: uno nativo recomendado y otro histórico basado en EAS, lo que puede confundir futuras entregas si se activa el workflow equivocado.
- La configuración conserva `versionCode: 2` junto con configuración de build remota/histórica; debe mantenerse coordinada con la estrategia de publicación para evitar conflictos de actualización.

## Evidencia pendiente

Ejecutar validaciones completas actuales, revisar logs recientes, verificar Expo Doctor, inspeccionar permisos/manifest generado y comprobar consistencia del workflow nativo con el commit actual. Los riesgos preliminares deben etiquetarse como confirmados o recomendados después de esas comprobaciones.

## Resultados de validación

- `pnpm check`: aprobado.
- `pnpm test`: 47 pruebas aprobadas y 1 prueba de autenticación omitida; 5 archivos de prueba ejecutados.
- `pnpm lint`: aprobado.
- `git diff --check`: aprobado.
- `pnpm exec expo config --type public --json`: válido; nombre, versión 1.0.2, paquete Android y plugins se resolvieron correctamente.
- `pnpm exec expo-doctor` no existe como binario local, pero `pnpm dlx expo-doctor@latest` ejecutó la revisión y obtuvo 17/18 comprobaciones. La única comprobación fallida fue la compatibilidad de versiones de `@react-navigation/bottom-tabs` y `@react-navigation/native` frente a las versiones esperadas por Expo SDK 54.
- El workflow CI más reciente y el workflow Android nativo más reciente terminaron con éxito sobre el commit `0d4967d`. El workflow Android completó prebuild, Gradle release, verificación ZIP/APK, provenance y subida de artefacto.
- El último estado local tiene cambios no comprometidos en `components/cover-flow-carousel.tsx`, `todo.md` y `audit-findings.md`, además del directorio local de artefactos `dist-apk-33005965490/`; la rama local sigue alineada con `github/main` según el estado mostrado.
- `pnpm audit --prod --json` reportó 880 dependencias y 117 vulnerabilidades agregadas: 2 críticas, 66 altas, 43 moderadas y 6 bajas. El resultado incluye dependencias transitivas; requiere triage antes de afirmar que todas son explotables en el runtime móvil.

## Hallazgos confirmados adicionales

- La interfaz de audio focus en JS no gestiona foco real: sus funciones son stubs seguros y siempre conceden el foco. El listener no puede recibir pérdidas, ducking o ganancias nativas con la implementación actual.
- El MediaSession Android sí declara acciones play, pause, next, previous y stop; publica una notificación foreground, carga artwork de forma asíncrona con guardas de generación y abre `/radio/{id}` mediante deep link.
- La configuración Expo deriva permisos `RECORD_AUDIO` y `MODIFY_AUDIO_SETTINGS` desde `expo-audio`, aunque la aplicación se presenta como reproductor y no como grabadora. Esto es una oportunidad de mínimo privilegio que debe revisarse.
- La pantalla de detalle concentra fondo remoto, blur de intensidad 92, gradientes, ScrollView animado y capas translúcidas. Es el principal riesgo de overdraw en dispositivos de alta tasa de refresco.
- La optimización 120 Hz aplicada al carrusel estabiliza `zIndex`, usa `renderToHardwareTextureAndroid` y `shouldRasterizeIOS`, y mantiene los cálculos de movimiento en Reanimated; esto reduce trabajo de jerarquía, pero todavía requiere medición con un dispositivo Android de 120 Hz para afirmar una tasa sostenida.

## Logs y estabilidad del runtime

- El servidor de desarrollo actual se recuperó y volvió a quedar operativo tras reinicios; el bundling reciente terminó sin errores de TypeScript reportados por el health check.
- El log histórico contiene avisos de `props.pointerEvents` provenientes del render web/Expo, además del aviso de `expo-notifications` sobre listeners de tokens push no soportados completamente en web.
- El log histórico también registra varios `ELIFECYCLE` y un `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` durante una sesión de Metro/servidor. No aparece como fallo del workflow Android más reciente, pero es un riesgo operativo real para sesiones de desarrollo y sincronizaciones pesadas.
- La auditoría no encontró archivos rastreados de tamaño extremo; el mayor archivo de código es `lib/radio-player.tsx` (~24 KB) y el mayor activo individual revisado es inferior a 400 KB. El directorio local de artefactos APK debe permanecer fuera del repositorio.

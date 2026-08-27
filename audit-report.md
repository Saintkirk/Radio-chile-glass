# Informe integral de auditoría — Radio Chile Glass

**Autor:** Manus AI
**Fecha:** 26 de agosto de 2026
**Alcance:** proyecto Expo/React Native, runtime Android, reproducción de radio, Cover Flow, accesibilidad, rendimiento, pruebas, configuración y CI/CD.

## Resumen ejecutivo

Radio Chile Glass se encuentra en un estado funcional avanzado. La aplicación compila con TypeScript, la suite automatizada pasa con **47 pruebas aprobadas y 1 omitida**, el lint es correcto, la configuración pública de Expo se resuelve y el workflow nativo de Android ha generado APKs verificadas mediante Gradle. El arranque cuenta con fallback contra el bloqueo en “Preparando tus emisoras”, el catálogo tiene ruta remota, caché y fallback editorial, y el MediaSession Android implementa controles de reproducción y deep linking.

Los riesgos más importantes no están en la compilación actual sino en producción: el adaptador JavaScript de **audio focus todavía es un stub**, existen discrepancias menores de versiones de React Navigation frente a Expo Doctor, el detalle del reproductor tiene alto overdraw por blur y capas translúcidas, y `pnpm audit --prod` reporta vulnerabilidades transitivas que requieren triage. Además, el log histórico registra un agotamiento de memoria de Node durante una sesión de desarrollo, aunque el último workflow Android terminó correctamente.

> **Conclusión:** el proyecto es apto para continuar pruebas físicas en Android, pero no conviene declarar cerrados los escenarios de interrupciones telefónicas, seguridad de dependencias ni rendimiento sostenido a 120 Hz hasta completar las acciones de prioridad alta.

## Estado por área

| Área | Estado | Evidencia | Evaluación |
|---|---|---|---|
| Compilación TypeScript | Aprobado | `pnpm check` | Sin errores de tipos en la revisión actual. |
| Pruebas automatizadas | Aprobado con cobertura limitada | `pnpm test` | 47 aprobadas, 1 omitida; cubre loader, foco esperado, contraste, player utils y catálogo. |
| Lint y formato del diff | Aprobado | `pnpm lint`, `git diff --check` | Sin errores actuales. |
| Expo Doctor | Advertencia | 17/18 comprobaciones | Solo detecta versiones de React Navigation fuera de las esperadas. |
| Configuración Expo/Android | Aprobado con observaciones | `expo config --type public` | Paquete, versión, plugins y permisos se resuelven; revisar mínimo privilegio y versionCode. |
| Arranque | Protegido | loader raíz y fallback | Tiene salida normal y dos límites de emergencia; debe probarse en APK con red lenta y sin red. |
| Catálogo | Robusto | remoto → caché → editorial | Hay fallback offline y selección de última emisora guardada. |
| Audio | Funcional con riesgo de interrupciones | `radio-player.tsx` | Exclusión de reproductores y reintentos implementados; audio focus real no está conectado. |
| MediaSession Android | Implementado | módulo Kotlin | Acciones, metadatos, artwork, notificación foreground y deep link presentes. |
| Cover Flow | Avanzado, sin medición física | Reanimated/Gesture Handler | Tambor cilíndrico, inercia y optimizaciones de capas; falta perfilado en dispositivo 120 Hz. |
| CI/CD Android | Aprobado | workflow Gradle reciente | Ejecuta calidad, prebuild, Gradle, verificación APK y artefacto con checksum. |
| Seguridad de dependencias | Requiere triage | `pnpm audit --prod` | 2 críticas, 66 altas, 43 moderadas y 6 bajas; resultado principalmente transitivo. |

## Hallazgos técnicos

### Arranque, navegación y catálogo

El layout raíz monta los proveedores de reproducción, tema, React Query, gestos y safe area, además de un puente para deep links de notificaciones. El loader tiene una duración normal de 1.150 ms, un fallback interno de 3.200 ms y un respaldo adicional aproximado de 3.450 ms en el layout. Esta arquitectura reduce el riesgo de quedarse indefinidamente en la pantalla de preparación, pero el fallback no sustituye una prueba física de cold start en Android con red lenta, proceso restaurado y catálogo remoto caído.

El catálogo editorial contiene emisoras de Santiago y regiones, incluida FM Latina, y `loadCatalog()` combina Radio Browser, caché AsyncStorage y datos editoriales. La normalización elimina emisoras rotas conocidas, deduplica URLs y deriva género, región e ícono. El riesgo residual es operativo: las URLs de streaming y logos son externas, pueden cambiar sin aviso y no existe una verificación automática de disponibilidad de cada stream en el arranque.

### Audio, foco e interrupciones

El motor de audio mantiene un único reproductor activo, incrementa un identificador de solicitud, cancela timers y crossfades obsoletos, pausa y remueve el reproductor saliente, y conserva un fallback si la señal nueva falla. El estado visual se actualiza optimistamente después de `play()`, mientras el listener y el timeout de 8 segundos intentan corregir fallos posteriores. Esto explica por qué la interfaz puede mostrar “reproduciendo” brevemente antes de que una señal confirme buffering real.

El hallazgo crítico es `lib/audio-focus.ts`: `requestAudioFocus()` siempre devuelve `granted`, `abandonAudioFocus()` no libera un handle nativo y el listener devuelve una suscripción vacía. Por tanto, el proveedor contiene la lógica para pausar, ducking y restaurar, pero **no recibe actualmente eventos reales de AudioManager** mediante ese adaptador. El comportamiento ante llamadas telefónicas, navegación por voz u otra aplicación multimedia debe clasificarse como pendiente de validación nativa.

El puente Kotlin sí implementa `MediaSessionCompat`, acciones anterior/siguiente/play/pause/stop, notificación foreground, artwork asíncrono con guardas de generación y deep link explícito a `/radio/{id}`. El módulo usa un executor de un solo hilo para artwork y captura excepciones de notificación, lo que mejora estabilidad, aunque conviene verificar en distintos fabricantes Android que el servicio foreground y la optimización de batería no sean detenidos por políticas OEM.

### Cover Flow y rendimiento 60/120 Hz

El carrusel ejecuta las transformaciones de las cinco carátulas mediante Reanimated: ángulo cilíndrico, seno/coseno, profundidad visual, escala, opacidad, rotación Y y encaje con inercia. La optimización más reciente reutiliza el progreso de arrastre por frame, mantiene `zIndex` estable y activa `renderToHardwareTextureAndroid`/`shouldRasterizeIOS` para las capas animadas. Estas decisiones reducen reconstrucciones de jerarquía y trabajo del hilo JavaScript.

El principal riesgo visual es el overdraw: el carrusel mueve carátulas, reflejos duplicados, sombras, halo, brillos, buffering y ecualizador; el detalle además superpone fondo remoto, `BlurView` de intensidad 92, gradientes y `Animated.ScrollView`. El código está preparado para una buena respuesta, pero no hay una medición de FPS, frame time o dropped frames tomada en un Android de 120 Hz. La afirmación correcta es **optimizado por diseño, pendiente de perfilado físico**.

### Configuración, permisos y branding

La configuración resuelve correctamente el nombre “Radio Chile Glass”, slug estable, versión 1.0.2, orientación portrait, paquete `com.app.radiochileglass`, iconos adaptativos y plugin nativo de MediaSession. La configuración pública también muestra `RECORD_AUDIO` y `MODIFY_AUDIO_SETTINGS`, derivados del plugin `expo-audio`. Como la aplicación reproduce audio y no graba, debe revisarse si el permiso de micrófono puede eliminarse para aplicar mínimo privilegio sin afectar `expo-audio`.

La configuración conserva `versionCode: 2`. Esto es válido para las pruebas actuales, pero la estrategia de publicación deberá incrementar el versionCode en cada APK distribuible para que Android acepte actualizaciones. La build actual usa una firma indicada como `debug-keystore-testing-only`; es apropiada para pruebas internas, no para una publicación de tienda.

### CI/CD, logs y dependencias

El workflow recomendado es `.github/workflows/android-native.yml`: instala Java 17, Android SDK/NDK, Node 22 y pnpm; ejecuta check, tests y lint; valida Expo config; genera el proyecto nativo; compila `assembleRelease`; verifica ZIP/APK; produce checksum y provenance; y sube el artefacto durante 14 días. Existe además un workflow EAS histórico que debe mantenerse claramente etiquetado para evitar activar por error el flujo sujeto a cuotas de EAS.

Los últimos workflows de CI y Android nativo observados terminaron con éxito. El log de desarrollo contiene avisos históricos de `pointerEvents` emitidos por la capa web/Expo y el aviso de listeners de tokens push de `expo-notifications` no soportados completamente en web. También contiene un agotamiento de memoria de Node (`heap out of memory`) durante una sesión anterior. Aunque el servidor se recuperó y el bundle actual funciona, conviene limitar procesos concurrentes, excluir artefactos APK del repositorio y usar una estrategia de memoria documentada para sesiones Metro pesadas.

`pnpm audit --prod` reportó 880 dependencias y 117 vulnerabilidades agregadas: 2 críticas, 66 altas, 43 moderadas y 6 bajas. El reporte incluye dependencias transitivas, por lo que no debe interpretarse como 117 vulnerabilidades explotables directamente en la app. Sí exige identificar cuáles llegan al bundle/runtime Android, cuáles pertenecen a tooling de Expo y cuáles tienen actualización compatible. La auditoría de seguridad debe ejecutarse de nuevo después de actualizar dependencias.

## Prioridades recomendadas

| Prioridad | Acción | Motivo | Criterio de cierre |
|---|---|---|---|
| P0 | Implementar AudioManager real mediante módulo nativo o integración soportada por Expo y añadir pruebas instrumentadas. | El foco actual siempre se concede y no demuestra respuesta ante llamadas/interrupciones. | Eventos gain/loss/duck observados en Android real y tests nativos en CI. |
| P0 | Hacer triage del `pnpm audit` y actualizar dependencias vulnerables compatibles. | Hay vulnerabilidades críticas/altas agregadas en producción. | Lista de advisories aceptados, corregidos o excluidos con justificación. |
| P1 | Perfilado en Android 120 Hz con frame time y dropped frames. | Las optimizaciones actuales son estructurales, no una medición de rendimiento. | Medición documentada durante arrastre lento, flick rápido y cambio repetido. |
| P1 | Reducir overdraw del detalle y del carrusel en dispositivos de gama media. | Blur, reflejos y capas translúcidas pueden saturar GPU. | Comparativa visual sin pérdida de estética y mejora objetiva de frames. |
| P1 | Alinear las versiones de React Navigation con Expo SDK 54 o documentar la excepción. | Expo Doctor queda en 17/18. | Expo Doctor 18/18 o exclusión justificada en `package.json`. |
| P2 | Revisar y minimizar permisos Android, especialmente micrófono. | La app no requiere grabación aparente. | Manifest mínimo confirmado en APK y reproducción intacta. |
| P2 | Separar claramente workflow nativo recomendado y workflow EAS histórico. | Reduce errores humanos y evita cuotas/fallos del flujo antiguo. | Nombres/documentación y trigger revisados. |
| P2 | Añadir smoke tests de arranque offline, última emisora, deep link y logo. | Son flujos históricamente problemáticos y hoy dependen de pruebas manuales. | Matriz de pruebas reproducible con resultado por dispositivo. |

## Matriz de pruebas recomendada

| Flujo | Resultado esperado | Estado de auditoría |
|---|---|---|
| Cold start con red normal | Loader desaparece y aparece Inicio con catálogo | Validado en web; confirmar APK física |
| Cold start sin red | Loader termina y aparece catálogo local/editorial | Lógica presente; falta prueba física automatizada |
| Última emisora guardada | Se selecciona y reproduce la última emisora válida | Lógica presente; falta confirmar dispositivo |
| Cambio rápido de emisora | Solo queda un stream audible | Lógica de exclusión presente; requiere prueba física |
| Llamada telefónica | Pausa o ducking y posterior restauración | Pendiente por audio focus stub |
| Pantalla bloqueada | Metadata, artwork, play/pause, anterior/siguiente | Puente nativo implementado; validar OEM |
| Apertura desde notificación | Navega a `/radio/{id}` | Deep link implementado; validar cold start |
| Gesto lento del tambor | Sigue el dedo sin salto y encaja suavemente | Validado visualmente; medir FPS |
| Flick rápido del tambor | Inercia proporcional y sin crash | Validado por código/pruebas; medir Android real |
| Logo remoto caído | Fallback de iniciales sin pantalla negra | Implementado en `StationLogo`; probar URLs reales |

## Limitaciones de esta auditoría

No se dispuso de un dispositivo Android físico conectado para medir FPS a 120 Hz, simular una llamada telefónica real, inspeccionar consumo energético OEM ni comprobar simultáneamente dos streams con hardware real. La vista web confirma composición y ausencia de errores de bundling, pero no sustituye el comportamiento nativo de MediaSession, AudioManager y foreground service. El análisis de seguridad proviene de `pnpm audit --prod` y necesita revisión individual de cada advisory antes de tomar decisiones de actualización.

## Referencias

[1]: `components/cover-flow-carousel.tsx` — geometría cilíndrica, gesto, inercia y optimizaciones de capas.
[2]: `lib/radio-player.tsx` — ciclo de vida del reproductor, exclusión, reintentos, timeout y MediaSession.
[3]: `lib/audio-focus.ts` — adaptador actual de foco de audio.
[4]: `plugins/native/RadioMediaControlsModule.kt` — MediaSession, notificación, artwork y deep links Android.
[5]: `app/_layout.tsx`, `components/animated-app-loader.tsx`, `lib/app-loader.ts` — bootstrap y fallbacks del loader.
[6]: `lib/radios.ts` — catálogo editorial, remoto, caché, regiones y selección inicial.
[7]: `.github/workflows/android-native.yml`, `.github/workflows/ci.yml` — pipelines de calidad y APK.
[8]: `package.json`, `app.config.ts`, `/tmp/radio-prod-audit.json` — dependencias, configuración y auditoría de seguridad.

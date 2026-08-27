# Revisión de optimizaciones pendientes — Reproductor y controles multimedia

**Proyecto:** Radio Chile Glass
**Fecha:** 26 de agosto de 2026
**Alcance:** ciclo de vida de players, buffering, reintentos, foco de audio, MediaSession, notificación, metadata, artwork, memoria, background playback y pruebas.

## Conclusión

El reproductor ya tiene una base sólida para una radio en vivo: invalida solicitudes anteriores, pausa y elimina reproductores salientes, limita reintentos, conserva un fallback, actualiza MediaSession y utiliza un servicio foreground Android. La integración de Audio Focus nativo también está implementada en el estado actual, con pausa, ducking y restauración condicional.

Las optimizaciones pendientes más importantes son **confirmar el resultado real de la solicitud de audio focus**, evitar que la interfaz abandone el estado de carga antes de confirmar buffering, estabilizar la suscripción de foco, cancelar descargas de artwork obsoletas y liberar explícitamente el executor nativo. Ninguna de estas observaciones implica que la APK actual no pueda reproducir; son mejoras para reducir inconsistencias, consumo y riesgos de OEM.

## Matriz priorizada

| Prioridad | Optimización | Impacto | Esfuerzo | Estado |
|---|---|---:|---:|---|
| P0 | Confirmar resultado real de `AudioManager.requestAudioFocus` | Alto | Medio | Pendiente de diseño de API nativa |
| P0 | Mantener `isLoading` hasta confirmar `playbackStatusUpdate.playing` o un estado de error | Alto | Bajo | Pendiente |
| P1 | Liberar y cancelar recursos del módulo nativo en `onCatalystInstanceDestroy` | Alto | Bajo | Pendiente |
| P1 | Cancelar artwork obsoleto y desconectar siempre `HttpURLConnection` | Medio/alto | Medio | Pendiente |
| P1 | Evitar recrear la suscripción de Audio Focus en cada cambio de `isPlaying` | Medio | Bajo | Pendiente |
| P2 | Cachear el icono usado como fallback de notificación | Medio | Bajo | Pendiente |
| P2 | Añadir instrumentación de buffering, tiempos de conexión y causa de fallback | Medio | Medio | Pendiente |
| P2 | Añadir pruebas instrumentadas Android para llamadas, ducking y botones multimedia | Alto para confianza | Alto | Pendiente |

## Hallazgos detallados

### 1. Resultado de solicitud de Audio Focus

El módulo nativo solicita `AUDIOFOCUS_GAIN` y registra `OnAudioFocusChangeListener`, pero el adaptador JavaScript devuelve `"granted"` después de invocar el método nativo, sin recibir el código real `AUDIOFOCUS_REQUEST_GRANTED`, `AUDIOFOCUS_REQUEST_FAILED` o `AUDIOFOCUS_REQUEST_DELAYED`. En la práctica, el reproductor puede intentar reproducir aunque otra aplicación conserve el foco.

La mejora recomendada es exponer el resultado mediante una API asíncrona con `Promise`, o publicar el último resultado como evento antes de iniciar el player. El proveedor debe abortar la creación del candidato si el resultado es `failed` y mostrar un estado recuperable si es `delayed`. El fallback permisivo puede mantenerse solo cuando el módulo nativo no exista, por ejemplo en web o Expo Go.

### 2. Estado de buffering optimista

En `playRadio`, después de `activeCandidate.play()`, se llama inmediatamente a `setIsLoading(false)`, `setIsPlaying(true)` y se actualiza la MediaSession. El listener posterior reconoce que algunos streams reportan `playing=false` durante buffering, pero el estado ya fue declarado listo antes de esa confirmación. Esto puede causar que el botón muestre pausa mientras el audio todavía no suena, o que el indicador de buffering desaparezca demasiado pronto.

La optimización de menor riesgo es mantener `isLoading=true` hasta recibir `status.playing === true`, un evento de error o el timeout de 8 segundos. La UI puede mostrar una intención optimista separada, por ejemplo `playbackIntent`, sin confundirla con reproducción confirmada. La notificación puede mostrar estado pausado o conectando hasta que el primer evento de reproducción sea real.

### 3. Liberación del executor nativo

`RadioMediaControlsModule.kt` crea un `Executors.newSingleThreadExecutor()` para descargar artwork, pero no expone una limpieza en `onCatalystInstanceDestroy`. En reinicios de actividad, reloads de desarrollo o destrucción del bridge, el executor puede conservar recursos más tiempo de lo necesario.

Se recomienda implementar `onCatalystInstanceDestroy()` para cancelar la descarga pendiente, llamar a `abandonAudioFocus()`, desactivar la MediaSession y ejecutar `shutdownNow()`. Esta limpieza debe ser idempotente y no debe detener el foreground service durante una recreación normal que conserve playback, salvo que el bridge realmente se esté destruyendo.

### 4. Artwork obsoleto y desconexión HTTP

La carga de logos usa guardas de generación y de URL, lo que evita aplicar una imagen antigua. Sin embargo, el executor es de un solo hilo: una descarga anterior con timeout de hasta 5 segundos puede ocupar la cola y retrasar el artwork de la emisora nueva. Además, `HttpURLConnection.disconnect()` se ejecuta en el camino normal, no dentro de un `finally` que garantice liberación ante excepciones durante lectura o decodificación.

La mejora recomendada es conservar el `Future` de la descarga, cancelarlo al cambiar de artwork y envolver la conexión en `try/finally`. Como protección adicional, el bitmap debe limitarse al tamaño necesario para notificación y liberarse cuando la clave cambie. Las guardas de generación actuales deben conservarse.

### 5. Suscripción de Audio Focus

El efecto de `RadioPlayerProvider` que instala `addAudioFocusChangeListener` depende de `isPlaying`. Cada cambio de reproducción desmonta y vuelve a registrar la suscripción. No es un trabajo por frame, pero puede crear ventanas de re-suscripción y hace más difícil razonar sobre eventos recibidos durante un cambio rápido.

La mejora es registrar el listener una sola vez y leer `isPlaying`, `currentRadio` y la intención de reproducción desde refs actualizadas. La limpieza debe ejecutarse únicamente al desmontar el proveedor. Esto reduce churn y evita que un evento nativo coincida con el intervalo entre dos suscripciones.

### 6. Icono de fallback de notificación

`postNotification()` decodifica el icono de la aplicación mediante `loadAppIcon()` cada vez que actualiza la notificación y no existe artwork cargado. Durante cambios de emisora, estado play/pause y llegada de metadata, esa operación puede repetirse en el hilo principal.

Se recomienda almacenar el bitmap del icono en una propiedad lazy, reutilizarlo mientras el proceso viva y reciclarlo solo en la destrucción del módulo si corresponde. Esto es una optimización de bajo riesgo y no modifica la identidad visual de la notificación.

### 7. Metadata dinámica y consistencia visual

El componente de sincronización consulta metadata now-playing cada 20 segundos. El puente nativo utiliza guardas para que el artwork no vuelva a una emisora anterior, lo cual es correcto. Aun así, conviene incluir un `radioId` y un contador de reproducción en cada actualización de metadata, y descartar en JavaScript respuestas tardías de una emisora que ya no está activa.

La UI debería distinguir entre nombre de la emisora, título ICY confirmado y estado “sin metadata”. Para una radio en vivo, no deben usarse controles de seek como si fuera una pista local; el puente actual ya declara next/previous y no seek, por lo que esa parte está bien encaminada.

### 8. Pruebas nativas pendientes

Las pruebas Vitest cubren normalización de eventos, políticas de foco, reintentos, selección y utilidades, pero no pueden demostrar el comportamiento real de `AudioManager`, `MediaSessionCompat`, notificaciones, llamadas telefónicas o políticas de batería de fabricantes. Deben añadirse pruebas instrumentadas Android con un fake de `AudioManager` y, cuando sea posible, una prueba de integración que emita cambios `LOSS`, `LOSS_TRANSIENT_CAN_DUCK` y `GAIN`.

La matriz mínima debe comprobar que una pausa manual no se revierte en `GAIN`, que una interrupción temporal restaura solo si el player estaba reproduciendo, que ducking no cambia el estado play/pause y que cambiar de emisora durante una interrupción no revive el player anterior.

## Lo que ya está bien resuelto

El proveedor usa un identificador monotónico para invalidar solicitudes antiguas, cancela timers de startup/replay, limpia crossfades, pausa y elimina el player saliente y conserva una ruta de fallback si la emisora nueva falla. El puente Android declara acciones de transporte completas, utiliza un servicio foreground con `START_STICKY`, publica metadata y artwork con guardas de generación, y construye un deep link explícito a la radio activa.

El proyecto también tiene fallback remoto → caché → editorial para catálogo, loader con timeout de emergencia, cacheo de logos y un workflow nativo que ejecuta gates de calidad antes de generar el APK. Estas piezas reducen varios problemas históricos reportados por las pruebas manuales.

## Orden recomendado de implementación

Primero debe corregirse el estado de buffering y formalizar el resultado de `requestAudioFocus`, porque ambos afectan directamente la percepción de reproducción. Después conviene liberar el executor y cancelar artwork obsoleto, ya que son cambios aislados del módulo Kotlin. En tercer lugar debe estabilizarse la suscripción de Audio Focus y cachearse el icono de notificación. Finalmente, deben agregarse las pruebas instrumentadas y un perfilado físico en al menos un dispositivo Android de 120 Hz.

## Referencias del proyecto

[1]: `lib/radio-player.tsx` — ciclo de vida, buffering, reintentos, fallback, foco y MediaSession.
[2]: `lib/audio-focus.ts` — adaptador JavaScript de eventos y solicitud de foco.
[3]: `plugins/native/RadioMediaControlsModule.kt` — AudioManager, MediaSession, artwork, notificación y servicio foreground.
[4]: `plugins/native/RadioKeepAliveService.kt` — persistencia del servicio foreground.
[5]: `components/lock-screen-now-playing-sync.tsx` — actualización periódica de metadata.
[6]: `tests/audio-focus.test.ts`, `tests/player-utils.test.ts` — cobertura determinista actual.
[7]: `app.config.ts`, `.github/workflows/android-native.yml` — permisos, plugins y gates de compilación.

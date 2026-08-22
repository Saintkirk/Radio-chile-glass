# Estrategia de notificaciones push y controles multimedia

## Objetivo

Permitir que Radio Chile Glass continúe reproduciendo una emisora cuando la aplicación pase a segundo plano o el dispositivo se bloquee, ofreciendo controles nativos de reproducción y una notificación persistente. Las notificaciones push se reservarán para avisos editoriales opt-in y no se usarán como mecanismo de reproducción ni como sustituto de la sesión multimedia local.

> **Principio central:** el audio y sus controles deben permanecer en el dispositivo; el push solo comunica novedades y abre una pantalla concreta de la aplicación.

## Arquitectura propuesta

| Capa | Responsabilidad | Tecnología | Disponibilidad |
| --- | --- | --- | --- |
| Reproductor local | Mantener stream, pausa, reanudación, cambio de emisora y stop | `expo-audio` + contexto global | Mientras haya una radio activa |
| Sesión multimedia | Exponer título, artista/emisora, logo y acciones en lock screen y panel de notificaciones | `setActiveForLockScreen` + media session nativa | Build Android real |
| Servicio foreground | Mantener vivo el audio de forma visible para el usuario | Config plugin `expo-audio` con `enableBackgroundPlayback: true` | Android |
| Notificación de reproducción | Mostrar estado y acciones de media, no marketing | Generada por la sesión multimedia | Mientras el audio está activo |
| Push editorial | Avisar de programas, novedades o eventos opt-in | `expo-notifications` + Expo Push Service o FCM | Cuando el usuario concede permiso |
| Navegación | Abrir detalle o destino editorial desde una notificación | Expo Router + URL validada | App abierta, en background o cerrada |

Android documenta que un foreground service es apropiado para tareas perceptibles como un reproductor de música y que debe mostrar una notificación de estado [1]. La configuración actual debe usar el soporte de reproducción en segundo plano de `expo-audio`, que añade el servicio de media playback y las capacidades necesarias para mantener el audio y mostrar controles de lock screen [2].

## Flujo de reproducción en segundo plano

1. El usuario pulsa **Reproducir** en Inicio, el detalle o el mini reproductor.
2. El contexto global crea o actualiza el player con el stream normalizado y configura el modo de audio antes de iniciar la reproducción.
3. Antes de llamar a `play()`, se registra la sesión con `player.setActiveForLockScreen(true, metadata)`. El metadata mínimo debe contener el nombre de la emisora, el programa si existe, la ciudad y `artworkUrl` con el favicon remoto.
4. Android muestra la sesión multimedia en la notificación y en la pantalla de bloqueo. Las acciones mínimas son **play/pause** y **stop**; el cambio de emisora debe seguir siendo una acción dentro de la app para evitar llamadas ambiguas sobre streams en directo.
5. Si el usuario pulsa pausa, se conserva la emisora activa y se actualiza el estado visual; si pulsa stop, se pausa el player, se desactiva `setActiveForLockScreen(false)` y se elimina la notificación multimedia cuando la API lo permita.
6. Si se pierde conectividad, mostrar “Reconectando…” en la app y conservar la intención del usuario. Aplicar backoff corto y limitado; no realizar reintentos infinitos que consuman batería.
7. Si se desconectan auriculares o Bluetooth, tratarlo como una interrupción y pausar el stream; `expo-audio` documenta que el audio se detiene automáticamente ante esa desconexión [3].

### Metadata recomendada

```ts
type MediaMetadata = {
  title: string;          // Programa o “En directo”
  artist: string;         // Nombre de la emisora
  albumTitle?: string;    // Ciudad o género
  artworkUrl?: string;    // favicon remoto; usar fallback si falla
};
```

Para una radio en directo no inventar duración, progreso ni pista actual. Si la fuente no proporciona programa o canción, usar un título honesto como `En directo` y el nombre de la emisora como artista.

## Configuración nativa Android

Mantener en `app.config.ts` el plugin de `expo-audio` con `enableBackgroundPlayback: true`. Según la documentación oficial, esta opción configura `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` y el servicio nativo de controles de audio [2]. Configurar también `setAudioModeAsync({ shouldPlayInBackground: true, interruptionMode: 'doNotMix' })` durante la inicialización del proveedor.

Solicitar `POST_NOTIFICATIONS` de forma contextual, preferiblemente cuando el usuario inicia la primera reproducción o activa avisos editoriales, explicando que permite ver los controles multimedia y recibir novedades. No pedir permiso de micrófono: esta app reproduce streams y no graba audio.

Probar obligatoriamente en un development build o release APK. Expo indica que los push remotos requieren un build de desarrollo en Android y no funcionan en Expo Go desde SDK 53 [4]. La reproducción sostenida, la sesión multimedia y el comportamiento de la pantalla de bloqueo tampoco deben darse por validados solo con el preview web.

## Estrategia de notificaciones push

Separar dos canales de experiencia:

| Canal | Cuándo usarlo | Prioridad | Acción al tocar |
| --- | --- | --- | --- |
| Media playback | Solo mientras una radio reproduce | Baja/ongoing, no promocional | Play/pause/stop nativos |
| Novedades | Programa especial, nueva emisora, aviso editorial | Normal | Abrir `/radio/[id]` o una pantalla editorial |
| Estado técnico | Solo errores accionables, si se decide ofrecerlo | Baja | Abrir la radio afectada o ajustes |

El usuario debe activar por separado **Avisos de programación** y, opcionalmente, **Avisos de emisoras favoritas**. Nunca enviar push para indicar que el audio sigue reproduciéndose: esa información pertenece a la notificación multimedia local.

Registrar el `ExpoPushToken` solo después del consentimiento. Enviar el token a un backend asociado a una instalación anónima, no a un usuario obligatorio. Guardar plataforma, versión de app, fecha de último uso y preferencias de temas; permitir revocar el token y borrar la instalación. Expo recomienda usar el `projectId` al obtener el token y configurar credenciales FCM para Android [4].

El backend debe aceptar un payload reducido y validado:

```ts
type EditorialPush = {
  token: string;
  title: string;
  body: string;
  data: { url: `/radio/${string}` | `/explore` };
  category: 'program' | 'favorite' | 'catalog';
};
```

Validar la URL recibida antes de navegar; no permitir URLs arbitrarias desde el payload. En el servidor, limitar la concurrencia, reintentar con backoff ante 429 o 5xx y revisar los push receipts. Eliminar tokens marcados como `DeviceNotRegistered`, práctica recomendada por Expo para evitar seguir enviando a instalaciones inválidas [5].

## UX y privacidad

En Ajustes, mostrar tres controles independientes: **Reproducción en segundo plano**, **Avisos de programación** y **Avisos de radios favoritas**. El primer control afecta al reproductor local; los dos últimos afectan al registro y uso del token push. Explicar que la reproducción en segundo plano consume batería y datos móviles, y ofrecer una preferencia para reproducir solo con Wi‑Fi si el producto la incorpora más adelante.

Cuando una notificación editorial abre la app, dirigirla al detalle de la emisora, no iniciar audio automáticamente. El usuario debe tocar **Reproducir** de forma explícita. Si la radio ya está sonando, una notificación editorial no debe pausar, cambiar ni sustituir el stream.

## Pruebas y criterios de aceptación

| Escenario | Resultado esperado |
| --- | --- |
| Reproducir y bloquear pantalla | El audio continúa y aparecen metadatos y controles |
| Pulsar pausa desde lock screen | El stream se pausa y la UI refleja el estado |
| Pulsar stop | Se detiene el audio y se cierra la sesión multimedia |
| Cambiar a otra radio desde la app | Se actualizan stream, logo y metadata de lock screen |
| Favicon inválido | La carátula usa fallback de iniciales sin romper audio |
| Denegar notificaciones | La app informa la limitación y mantiene controles internos |
| Push con la app cerrada | Abre solo la ruta validada; no inicia audio automáticamente |
| Token inválido | El backend deja de enviar a ese token |
| Sin red durante reproducción | Se muestra reconexión y no se bloquea la interfaz |
| Llamada, Bluetooth o audio externo | Se respeta la política de interrupciones y se recupera de forma predecible |

Automatizar con mocks de `expo-audio`, `expo-notifications`, `AsyncStorage` y `expo-constants`. Probar la lógica de metadata, consentimiento, registro/revocación de tokens, routing seguro, reintentos y limpieza de tokens con Vitest. Reservar una matriz nativa manual para Android físico: Android 13 con permiso concedido/denegado, Android 14 con foreground service, pantalla bloqueada, Bluetooth, llamada entrante, batería restringida y build release.

## Plan de entrega

Implementar primero la sesión multimedia local y validarla en un APK. Después añadir preferencias y registro de tokens. Finalmente conectar el backend de avisos editoriales y revisar receipts. No mezclar ambos canales en una sola notificación ni activar push antes de tener consentimiento, credenciales FCM y una política de baja.

## Referencias

[1]: https://developer.android.com/develop/background-work/services/fgs "Foreground services overview — Android Developers"
[2]: https://docs.expo.dev/versions/latest/sdk/audio/ "Expo Audio — Background audio playback"
[3]: https://docs.expo.dev/versions/latest/sdk/audio/ "Expo Audio — interruptions and device disconnection"
[4]: https://docs.expo.dev/push-notifications/push-notifications-setup/ "Expo push notifications setup"
[5]: https://docs.expo.dev/push-notifications/sending-notifications/ "Send notifications with the Expo Push Service"

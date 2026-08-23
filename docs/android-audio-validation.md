# Validación Android — audio en segundo plano y pantalla de bloqueo

## Alcance

La configuración actual habilita `shouldPlayInBackground` mediante `expo-audio` y mantiene el estado de reproducción en el proveedor global. La validación definitiva requiere un APK o development build Android real; la preview web no puede confirmar controles multimedia del sistema.

## Checklist manual

| Caso | Resultado esperado |
|---|---|
| Iniciar FM Latina y bloquear la pantalla | El audio continúa reproduciéndose. |
| Pulsar pausa desde la notificación o pantalla de bloqueo | El audio se pausa y la interfaz se sincroniza. |
| Ver la tarjeta multimedia bloqueada | Muestra la canción y artista de StreamTitle ICY cuando están disponibles; si no, muestra emisora, frecuencia/género y logo remoto o fallback. |
| Reanudar desde controles del sistema | El audio continúa desde la radio activa. |
| Cambiar de aplicación | La señal sigue activa si la preferencia está habilitada. |
| Desactivar reproducción en segundo plano | La siguiente salida de la app no mantiene audio en background. |
| Stream caído | Se muestra estado de error o listo para reintentar, sin dejar un loading infinito. |
| Logo ausente | Se muestra el fallback de iniciales con contraste suficiente. |

## Preparación

Generar el build Android desde el flujo de Publish/Build de la plataforma y probar en al menos un teléfono Android físico. No se considera suficiente la ejecución en navegador ni una captura estática. Registrar versión, dispositivo, versión Android, emisora, resultado y logs de audio.

## Matriz de foco de audio Android

| Evento de foco | Acción de Radio Chile Glass | Reanudación automática |
|---|---|---|
| `AUDIOFOCUS_LOSS` | Pausa y conserva la emisora seleccionada | No; requiere acción del usuario |
| `AUDIOFOCUS_LOSS_TRANSIENT` | Pausa mientras dura la llamada o interrupción | No; evita iniciar audio inesperadamente |
| `AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK` | Reduce el volumen al 35% | Sí, restaura el volumen al recuperar el foco |
| `AUDIOFOCUS_GAIN` | Restaura el volumen normal y notifica el foco recuperado | No reanuda una pausa originada por una llamada |

El listener nativo solicita `AUDIOFOCUS_GAIN` con `USAGE_MEDIA` y `CONTENT_TYPE_MUSIC`, usa `setWillPauseWhenDucked(true)` y abandona el foco al detener o cambiar la emisora. Android 8+ utiliza `AudioFocusRequest`; versiones anteriores usan la API compatible. La política evita que una llamada o una app multimedia sea interrumpida por una reanudación automática.

## Criterios de aceptación

El audio debe sobrevivir al bloqueo y al cambio de aplicación cuando la preferencia está activada. La pantalla de bloqueo debe representar la radio activa, actualizar canción y artista desde StreamTitle ICY cuando estén disponibles, mostrar artwork y permitir al menos play/pause. Los errores de stream deben ser recuperables y los logos ausentes no deben romper la composición.

## Validación adicional de reconexión y navegación

| Caso | Resultado esperado |
|---|---|
| Stream no disponible al iniciar | Se muestran reintentos progresivos y limitados, sin congelar la interfaz. |
| Reintento manual después del límite | La emisora vuelve a intentar la conexión desde el detalle o el mini reproductor. |
| Cambiar de emisora durante un reintento | La solicitud anterior se cancela y no reemplaza la emisora elegida. |
| Pulsar anterior/siguiente en el reproductor | La navegación es circular y actualiza portada, nombre y señal activa. |
| Bloquear pantalla durante la reconexión | La sesión conserva un estado coherente y permite reanudar cuando el stream vuelve. |

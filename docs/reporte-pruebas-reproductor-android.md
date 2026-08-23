# Reporte integral de pruebas del reproductor

**Producto:** Radio Chile Glass  
**Plataforma objetivo:** Android físico, APK actualizado desde la revisión `02b3e1d3`  
**Versión funcional evaluada:** 1.0.1  
**Propósito:** validar de forma reproducible la reproducción de radios chilenas, la navegación Cover Flow, la continuidad en segundo plano, los controles de pantalla bloqueada, los metadatos ICY, el foco de audio, los favoritos y la estabilidad de la tarjeta de reproducción.

> Este documento es una guía de ejecución y registro. La preview web sirve para revisar la interfaz, pero no demuestra por sí sola el comportamiento nativo de Android, la notificación multimedia ni la reproducción con la pantalla apagada.

## 1. Criterio general de aprobación

Una compilación se considera **aprobada para pruebas de usuario** cuando todos los casos críticos `P0` pasan, no existe reproducción simultánea, el cambio de emisora sustituye completamente el stream anterior, la tarjeta permanece estable durante la navegación y el APK permite controlar la reproducción desde la pantalla bloqueada cuando la preferencia de segundo plano está activa.

Los casos `P1` pueden quedar pendientes únicamente si existe una incidencia documentada, reproducible y sin impacto sobre la reproducción principal. Cualquier audio duplicado, reproducción que continúe después de detenerla, bloqueo de interfaz, crash, pérdida de controles multimedia o imposibilidad de recuperar un stream debe considerarse bloqueo de liberación.

| Prioridad | Definición | Tratamiento |
|---|---|---|
| P0 | Funcionalidad crítica o pérdida de control del audio | Debe pasar; bloquea la entrega si falla |
| P1 | Funcionalidad importante con alternativa parcial | Debe pasar o quedar documentada |
| P2 | Pulido visual, accesibilidad o comportamiento no crítico | Se corrige según impacto |

## 2. Preparación de la ejecución

Realizar las pruebas en un teléfono Android físico con el APK actualizado. Registrar el modelo, versión de Android, fabricante, conexión utilizada, versión de la aplicación, emisora probada y fecha. Para las pruebas de red conviene repetir al menos una vez con Wi‑Fi y otra con datos móviles.

Antes de empezar, cerrar otras aplicaciones de audio, desconectar dispositivos Bluetooth no necesarios, cargar el teléfono por encima del 20 % y verificar que el volumen multimedia sea audible. Activar las notificaciones para Radio Chile Glass si Android solicita el permiso. En **Ajustes de Radio Chile Glass**, dejar activada la reproducción en segundo plano para la primera ronda; después repetir los casos correspondientes con la opción desactivada.

| Dato de ejecución | Valor a registrar |
|---|---|
| Tester | Nombre o iniciales |
| Fecha y hora | AAAA-MM-DD HH:MM |
| APK / commit | `02b3e1d3` / versión instalada |
| Modelo Android | Ejemplo: Pixel 7, Samsung A54 |
| Versión Android | 13, 14, 15 o 16 |
| Red | Wi‑Fi 2.4/5 GHz o datos móviles |
| Emisora principal | FM Latina u otra señal estable |
| Resultado global | Aprobado / Condicional / Rechazado |

## 3. Datos de prueba recomendados

Usar **FM Latina** como señal de referencia porque es una emisora requerida por el producto. Repetir después con al menos una radio de noticias, una musical y una regional. Seleccionar una emisora con metadatos dinámicos disponibles y otra que no los exponga, para comprobar tanto la información ICY como el fallback de nombre, frecuencia y género.

| Grupo | Datos |
|---|---|
| Señal base | FM Latina, 89.1 FM, Santiago |
| Señal adicional nacional | Una radio musical o informativa de Inicio |
| Señal regional | Una emisora seleccionada desde Explorar por ciudad |
| Señal con error | URL no disponible o emisora que el catálogo marque como caída |
| Señal sin metadata | Stream que no entregue título de canción/artista |
| Favorito | FM Latina y una segunda emisora |

## 4. Pruebas funcionales de reproducción

Cada caso debe registrarse con estado **Pasa**, **Falla**, **No reproducible** o **Bloqueado**. En el campo de evidencia anotar una captura, grabación breve o descripción temporal, por ejemplo: “audio iniciado a las 14:32; cambio completado a las 14:33; no quedó audio residual”.

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| PLY-01 | P0 | Abrir Inicio y tocar el botón de reproducción de FM Latina. | Aparece estado de conexión y luego reproducción; el botón cambia a pausa; el ecualizador se anima. |
| PLY-02 | P0 | Reproducir una emisora y tocar pausa desde la tarjeta principal. | El audio se detiene, el estado deja de indicar reproducción y el ecualizador queda inactivo. |
| PLY-03 | P0 | Pausar y volver a tocar play en la misma emisora. | La señal se reanuda sin crear un segundo reproductor ni reiniciar innecesariamente la interfaz. |
| PLY-04 | P0 | Iniciar una radio A; esperar audio; iniciar una radio B desde Inicio. | A se detiene antes de que B comience; solo se escucha B. |
| PLY-05 | P0 | Pulsar rápidamente A, B, C antes de que termine la conexión. | Solo queda activa la última emisora elegida; ninguna solicitud obsoleta reemplaza la selección final. |
| PLY-06 | P0 | Cambiar de emisora mientras A está en reintento. | El reintento de A no muestra error sobre B ni vuelve a activar A. |
| PLY-07 | P1 | Reproducir una emisora con stream válido durante cinco minutos. | El audio permanece continuo, sin pausas periódicas atribuibles a la interfaz. |
| PLY-08 | P1 | Intentar reproducir una señal no disponible. | Se muestra “No se pudo conectar” o estado equivalente; no queda un loading infinito. |
| PLY-09 | P1 | Desde el error, tocar reintentar en detalle o mini reproductor. | Se inicia una nueva conexión y la interfaz vuelve a conectar o informa el fallo final. |
| PLY-10 | P1 | Apagar y encender la red durante la reproducción. | La app no se bloquea; informa el estado y permite recuperar la señal mediante reintento. |

### Observación específica sobre reproducción única

Este grupo es el más importante de la corrección reciente. Para cada cambio de emisora se debe comprobar con auriculares o volumen bajo que no se perciban dos señales mezcladas. Si es posible, usar dos emisoras con voces o música claramente diferentes y registrar cuál se oye antes y después del cambio. La condición de aprobación es: **en todo momento existe como máximo una señal audible**.

## 5. Pruebas del mini reproductor persistente

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| MINI-01 | P0 | Iniciar una emisora y navegar entre Inicio, Explorar, Favoritos y Ajustes. | El mini reproductor aparece abajo y conserva la emisora activa. |
| MINI-02 | P0 | Tocar el contenido del mini reproductor, no el botón play/pausa. | Se abre directamente el detalle de la emisora activa. |
| MINI-03 | P0 | Tocar play/pausa del mini reproductor. | Solo cambia la reproducción; no abre el detalle ni cambia de estación. |
| MINI-04 | P1 | Observar el logo remoto y el nombre de la emisora. | Se muestra la identidad correcta; si la imagen falla, aparece fallback de iniciales sin romper el layout. |
| MINI-05 | P1 | Reproducir y pausar desde el detalle. | Mini reproductor, botón principal y ecualizador reflejan el mismo estado. |
| MINI-06 | P1 | Provocar un error de conexión desde la emisora activa. | El mini reproductor muestra estado recuperable y permite reintentar. |
| MINI-07 | P1 | Cambiar de estación desde el detalle y volver a Inicio. | El mini reproductor muestra la nueva emisora, sin conservar logo o metadata de la anterior. |
| MINI-08 | P2 | Observar entrada y salida del mini reproductor. | La aparición y desaparición son suaves; no desplaza abruptamente el contenido ni cubre la navegación inferior. |

## 6. Pruebas de pantalla de detalle y Cover Flow

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| FLOW-01 | P0 | Abrir detalle desde el mini reproductor. | La transición parte visualmente del mini reproductor y termina en el detalle sin pantalla blanca ni salto brusco. |
| FLOW-02 | P0 | Tocar flecha izquierda y derecha varias veces. | El índice, logo, nombre, frecuencia y stream cambian juntos. La navegación es circular: anterior del primer elemento lleva al último y siguiente del último lleva al primero. |
| FLOW-03 | P0 | Cambiar emisora desde la carátula central y esperar dos segundos. | El contenedor, fondo, controles y dial permanecen montados; solo se mueve el carrusel y cambia la información asociada. |
| FLOW-04 | P0 | Cambiar emisora mientras el audio está reproduciéndose. | La nueva emisora se reproduce y la anterior deja de sonar; el glow queda solo en la radio activa. |
| FLOW-05 | P1 | Deslizar la carátula horizontalmente hacia la izquierda. | Avanza una emisora con animación horizontal tipo Cover Flow. El gesto debe ser predominantemente horizontal y superar aproximadamente 48 px. |
| FLOW-06 | P1 | Deslizar la carátula horizontalmente hacia la derecha. | Retrocede una emisora con la misma animación y sin cerrar el detalle. |
| FLOW-07 | P1 | Tocar las carátulas laterales o sus flechas. | Se selecciona la emisora lateral correspondiente; el índice visible coincide con la estación activa. |
| FLOW-08 | P1 | Reproducir y observar la carátula central. | La carátula central muestra iluminación/glow animado; las laterales no deben aparentar ser la señal activa. |
| FLOW-09 | P0 | Cambiar cinco veces de emisora observando el fondo. | El fondo dinámico permanece estable con la emisora de entrada; no se reinicia toda la pantalla ni parpadea el contenido. |
| FLOW-10 | P1 | Deslizar verticalmente hacia abajo más de 100 px o con velocidad evidente. | El detalle se cierra y vuelve al mini reproductor; la carátula se reduce suavemente. |
| FLOW-11 | P1 | Hacer un deslizamiento vertical corto. | La pantalla vuelve a su posición sin cerrarse accidentalmente. |
| FLOW-12 | P2 | Activar “Reducir movimiento” en Android y repetir la navegación. | Se conserva la funcionalidad, pero se reducen o eliminan las transformaciones 3D y animaciones intensas. |
| FLOW-13 | P1 | Rotar el dispositivo o repetir en una tableta si está disponible. | Las métricas del origen se recalculan y no aparecen offsets, recortes o carátulas fuera de pantalla. |
| FLOW-14 | P1 | Tocar el botón “Web oficial”. | Se abre el sitio configurado de la emisora; si no existe homepage, el control está deshabilitado y no genera error. |

### Criterio de estabilidad de la tarjeta

Durante FLOW-03 y FLOW-09, el tester debe observar específicamente que el botón de pausa, el fondo y la estructura de la tarjeta no desaparezcan ni vuelvan a entrar desde cero. La evidencia mínima es una grabación de pantalla de tres cambios consecutivos. Se rechaza el caso si se percibe cierre y reapertura completa, parpadeo del fondo, pérdida momentánea de controles o reinicio de la animación de entrada en cada cambio.

## 7. Pruebas de metadatos ICY y estado “Ahora sonando”

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| META-01 | P1 | Reproducir una señal con metadata ICY disponible y esperar hasta 20–30 segundos. | Se actualizan título y artista cuando el backend los devuelve. |
| META-02 | P1 | Mantener el detalle abierto durante dos cambios de metadata. | El texto cambia sin desmontar la tarjeta ni reiniciar el audio. |
| META-03 | P0 | Bloquear la pantalla con metadata disponible. | La notificación o tarjeta multimedia muestra título, artista y artwork de la emisora. |
| META-04 | P1 | Reproducir una señal sin metadata. | Se muestra nombre de emisora y fallback de frecuencia/género; no aparecen textos “undefined”, vacíos o de otra radio. |
| META-05 | P1 | Cambiar de emisora mientras hay metadata de A. | El título de A no permanece asociado a B después del cambio. |
| META-06 | P2 | Forzar una respuesta lenta o error de metadata. | El audio continúa; solo la información vuelve al fallback sin bloquear la reproducción. |

## 8. Pruebas de segundo plano, pantalla bloqueada y widget

Estas pruebas requieren el APK Android, no la preview web.

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| BG-01 | P0 | Activar reproducción en segundo plano, reproducir FM Latina y pulsar Inicio del teléfono. | El audio continúa al salir de la aplicación. |
| BG-02 | P0 | Con el audio en segundo plano, bloquear la pantalla. | El audio continúa y aparece control multimedia del sistema. |
| BG-03 | P0 | Pulsar pausa desde la pantalla bloqueada o notificación. | El audio se pausa y el estado de la app queda coherente al volver. |
| BG-04 | P0 | Pulsar play desde la pantalla bloqueada. | La emisora activa reanuda la reproducción sin abrir dos streams. |
| BG-05 | P1 | Pulsar el control de emisora anterior o retroceso expuesto por el sistema. | Cambia a la emisora anterior o ejecuta exactamente la acción documentada por el build; la metadata y el logo se actualizan. |
| BG-06 | P1 | Pulsar el control de siguiente o avance expuesto por el sistema. | Cambia a la emisora siguiente o ejecuta exactamente la acción documentada por el build; la señal anterior se detiene. |
| BG-07 | P0 | Desactivar reproducción en segundo plano en Ajustes y repetir BG-01/BG-02. | La siguiente salida de la app no mantiene audio en segundo plano; la preferencia queda persistida. |
| BG-08 | P1 | Cambiar de app mientras se reproduce y volver después de un minuto. | La sesión conserva emisora, estado y controles sin crash. |
| BG-09 | P1 | Deslizar/cerrar la notificación multimedia. | El comportamiento coincide con Android y no deja audio huérfano; al volver a la app el estado es coherente. |
| BG-10 | P0 | Detener o cambiar emisora desde la app y revisar la pantalla bloqueada. | El artwork, nombre y controles corresponden a la nueva estación; no queda la notificación de la anterior activa. |

> Si los botones del sistema aparecen como avance/retroceso de posición en lugar de emisora anterior/siguiente, registrar el comportamiento exacto. El reporte debe distinguir entre **cambio de estación** y **seek temporal**, porque son acciones diferentes en Android.

## 9. Pruebas de foco de audio e interrupciones

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| FOCUS-01 | P0 | Reproducir radio y recibir una llamada telefónica. | El audio se pausa durante la llamada y no se reanuda inesperadamente mientras la interrupción está activa. |
| FOCUS-02 | P1 | Finalizar la llamada y volver a la app. | La emisora queda identificada; la reanudación debe seguir la política del producto y no crear un reproductor duplicado. |
| FOCUS-03 | P1 | Reproducir radio y lanzar otra app de audio que solicite foco permanente. | Radio Chile Glass pausa y cede el foco. |
| FOCUS-04 | P1 | Reproducir radio y provocar una interrupción que permita ducking, por ejemplo navegación por voz. | El volumen de la radio baja temporalmente y vuelve al nivel normal al recuperar el foco. |
| FOCUS-05 | P0 | Volver a la app después de una pérdida de foco y pulsar play. | La radio se reanuda solo por acción explícita si la pausa fue causada por una interrupción. |
| FOCUS-06 | P1 | Cambiar emisora mientras existe una interrupción. | El foco anterior se abandona y la nueva emisora no empieza a sonar hasta que el sistema permita reproducir. |

La implementación actual contiene una capa segura de fallback para foco nativo. Por ello, estos casos deben ejecutarse en el APK y registrarse como validación de integración; las pruebas unitarias del fallback no sustituyen una llamada telefónica o una aplicación competidora real.

## 10. Pruebas de favoritos, ajustes y persistencia relacionada

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| PREF-01 | P1 | Guardar FM Latina desde Inicio y abrir Favoritos. | La emisora aparece inmediatamente en Favoritos. |
| PREF-02 | P1 | Quitar la emisora desde el detalle y volver a Favoritos. | Desaparece de la lista y el corazón cambia a estado no guardado. |
| PREF-03 | P1 | Cerrar y volver a abrir la aplicación. | Los favoritos permanecen guardados localmente. |
| PREF-04 | P1 | Cambiar preferencia de reproducción en segundo plano. | El cambio se conserva después de reiniciar la aplicación. |
| PREF-05 | P2 | Cambiar tema claro/oscuro/sistema mientras el reproductor está visible. | Texto, controles, carátura y ecualizador mantienen contraste y no se desmonta el reproductor. |
| PREF-06 | P2 | Activar y desactivar hápticos de navegación y acciones. | Cada preferencia controla su contexto sin impedir el funcionamiento del audio. |
| PREF-07 | P2 | Tocar favorito repetidamente durante una transición. | El toast no se superpone indefinidamente; el último estado queda persistido. |

## 11. Pruebas visuales, accesibilidad y rendimiento

| ID | Prioridad | Procedimiento | Resultado esperado |
|---|---:|---|---|
| VIS-01 | P1 | Revisar Inicio y detalle en modo oscuro. | El texto, logos, controles y ecualizador son legibles sobre el fondo glassmorphism. |
| VIS-02 | P1 | Revisar Inicio y detalle en modo claro. | Las tarjetas y controles conservan contraste, sin texto blanco ilegible sobre superficie clara. |
| VIS-03 | P1 | Activar tamaño de fuente grande del sistema. | Los nombres y estados importantes no se cortan de forma que impidan operar el reproductor. |
| VIS-04 | P1 | Usar TalkBack para enfocar play, pausa, anterior, siguiente, favorito y web. | Cada control anuncia una acción específica y no solo “botón”. |
| VIS-05 | P2 | Pulsar controles repetidamente. | Se percibe feedback pressed/háptico sin doble activación accidental. |
| VIS-06 | P1 | Navegar durante cinco minutos con una emisora activa. | No hay crecimiento visible de memoria, congelamiento ni remounts repetidos de la tarjeta. |
| VIS-07 | P1 | Cambiar diez veces entre emisoras. | La app permanece responsiva y solo existe una señal activa al final. |
| VIS-08 | P2 | Probar con red lenta. | La interfaz mantiene estado de conexión y no presenta pantalla en blanco. |

## 12. Pruebas automatizadas locales y CI

Ejecutar desde la raíz del proyecto antes de cualquier nuevo APK:

```bash
pnpm check
pnpm test
pnpm lint
```

El resultado mínimo esperado es typecheck sin errores, **32 pruebas o más pasando** según la revisión instalada, y lint sin errores bloqueantes. Las pruebas unitarias actuales cubren el cálculo de estación anterior/siguiente, estado de reproducción, favoritos, reintentos acotados, mapeo de foco y construcción de metadata con fallback o valores ICY.

| Suite | Qué demuestra | Qué no demuestra |
|---|---|---|
| `tests/player-utils.test.ts` | Lógica pura de navegación, estados, reintentos, foco y metadata | Audio real, pantalla bloqueada o lifecycle Android |
| `tests/audio-focus.test.ts` | Que el fallback de foco sea seguro y no lance errores | Llamadas telefónicas y foco nativo real |
| `tests/radios.test.ts` | Normalización, catálogo, caché y fallback de emisoras | Que cada URL reproduzca audio en el dispositivo |
| `tests/contrast.test.ts` | Umbrales de contraste definidos para la interfaz | Legibilidad en todos los tamaños y fabricantes |
| Workflow Android | Compilación, validación previa y publicación del APK | Pruebas manuales de reproducción y hardware |

El workflow Android debe revisarse en GitHub Actions. Confirmar que `Verify project before build` pasa antes de EAS, que `Build APK with EAS` termina correctamente, que `Download APK` obtiene un archivo no vacío y que `Upload APK artifact` publica el APK asociado al commit correcto. Las advertencias de plataforma deben registrarse, pero no deben confundirse con fallos funcionales.

### Resultado automatizado de referencia

En la revisión actual, la ejecución local completó correctamente `pnpm check`, `pnpm test` y `pnpm lint`. Vitest reportó **4 archivos de prueba aprobados, 32 pruebas aprobadas y 1 prueba omitida**; el typecheck y ESLint terminaron sin errores. Este resultado valida la lógica pura y la calidad estática, pero no reemplaza los casos manuales `P0` que requieren un teléfono Android, una señal real, pantalla bloqueada o una interrupción del sistema.

La implementación de foco de audio incluye actualmente un fallback seguro en JavaScript; por tanto, `FOCUS-01` a `FOCUS-06` deben considerarse pruebas de integración nativa y no deben marcarse como cubiertas solo porque `tests/audio-focus.test.ts` pase.

## 13. Registro de incidencias y evidencias

Para cada fallo registrar el siguiente formato. Una incidencia de audio debe incluir emisora, hora aproximada, estado de red, acción anterior y si continuó sonando una señal antigua.

```text
ID del caso:
Resultado: Pasa / Falla / Bloqueado
Fecha y hora:
Dispositivo y Android:
APK / commit:
Emisora activa:
Pasos exactos:
Resultado observado:
Resultado esperado:
¿Se oyó más de un stream?: Sí / No / No aplica
¿Se reprodujo después de cerrar o bloquear?: Sí / No / No aplica
Evidencia: captura, vídeo, log o descripción temporal
Severidad: P0 / P1 / P2
```

La evidencia recomendada para la corrección de la tarjeta es un vídeo corto que muestre: apertura desde el mini reproductor, tres cambios consecutivos con flechas, un cambio por gesto horizontal, pausa y reproducción, y cierre mediante gesto vertical. Para la validación nativa, añadir una segunda evidencia con la pantalla bloqueada visible y la notificación multimedia.

## 14. Secuencia rápida de aceptación

Cuando haya poco tiempo, ejecutar primero esta secuencia crítica: reproducir FM Latina; pausar y reanudar; cambiar de A a B y confirmar que A se detiene; cambiar rápidamente entre tres radios; abrir el detalle desde el mini reproductor; usar anterior, siguiente y gesto horizontal; comprobar que la tarjeta no parpadea; bloquear la pantalla; pausar y reanudar desde los controles del sistema; activar una llamada o interrupción; volver a la app; desactivar segundo plano; cerrar y abrir la app; y verificar que favoritos y preferencias persisten.

Si cualquiera de los pasos anteriores produce audio simultáneo, audio huérfano, crash, imposibilidad de pausar o pérdida de control desde la pantalla bloqueada, marcar la versión como **Rechazada** hasta repetir la corrección y regenerar el APK.

## 15. Referencias

[1]: ../docs/android-audio-validation.md "Guía existente de validación Android de audio en segundo plano y pantalla bloqueada"  
[2]: ../lib/radio-player.tsx "Proveedor global de reproducción y sincronización de controles"  
[3]: ../lib/player-utils.ts "Utilidades de estado, navegación, reintentos, foco y metadata"  
[4]: ../components/persistent-mini-player.tsx "Mini reproductor persistente"  
[5]: ../components/cover-flow-carousel.tsx "Carrusel Cover Flow y gestos horizontales"  
[6]: ../app/radio/[id].tsx "Pantalla de detalle y reproductor expandido"  
[7]: https://developer.android.com/media/optimize/media3 "Documentación oficial de Android sobre reproducción multimedia"  
[8]: https://developer.android.com/reference/android/media/AudioFocusRequest "Referencia oficial de AudioFocusRequest"  

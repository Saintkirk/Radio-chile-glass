# Auditoría y limpieza de Radio Chile Glass

**Fecha de ejecución:** 27 de agosto de 2026, 04:30 GMT−4 (Chile)  
**Alcance:** revisión del código, assets, configuración Expo, dependencias, rutas y artefactos acumulados desde la creación del proyecto.

## Resultado ejecutivo

Se encontraron restos de la plantilla inicial que no tenían referencias en las pantallas productivas ni en el grafo de importaciones de la aplicación. Se retiraron únicamente elementos verificablemente huérfanos y se conservó la infraestructura que sí participa en reproducción, metadata ICY, OAuth o el servidor de preview.

La limpieza afecta al repositorio y al proceso de compilación, pero no cambia la API pública del reproductor. Las correcciones de identidad única del player y MediaSession permanecen incluidas.

## Elementos retirados

| Área | Elementos | Motivo | Impacto esperado |
|---|---|---|---|
| Componentes de plantilla | `components/hello-wave.tsx`, `components/parallax-scroll-view.tsx`, `components/external-link.tsx`, `components/ui/collapsible.tsx` | Sin importaciones ni referencias desde la app | Menor superficie de código y menos archivos analizados por Metro/TypeScript |
| Ruta de desarrollo | `app/dev/theme-lab.tsx` | Ruta no enlazada ni necesaria en producción | Menor superficie de rutas Expo Router y menor bundle potencial |
| Assets demo | Logos React, `radio-futuro.png` antiguo y `radios/biobio.ico` | Sin referencias; la app usa otros recursos verificados | Menos assets candidatos para empaquetado y repositorio más limpio |
| Plugin Expo | `expo-asset` en `app.config.ts` y `package.json` | No hay importaciones directas ni configuración que lo necesite | Instalación y prebuild ligeramente más ligeros |
| Plugin de fuentes | Entrada `expo-font` en `app.config.ts` | No hay fuentes personalizadas configuradas | Menos trabajo de configuración nativa; se conserva el paquete porque es peer de `@expo/vector-icons` |
| Artefactos locales | `*.apk` y `dist-apk*/` en `.gitignore` | Son resultados descargables, no código fuente | Evita que los APK aumenten commits o checkpoints futuros |

## Elementos conservados deliberadamente

La infraestructura `tRPC`, el servidor, OAuth y los módulos `_core` no se eliminaron porque todavía tienen referencias activas. En particular, `components/now-playing-label.tsx` y `components/lock-screen-now-playing-sync.tsx` consultan metadata dinámica, mientras que `app/oauth/callback.tsx` utiliza el flujo de autenticación de la plantilla. Retirarlos en esta fase podría eliminar metadata ICY o romper el preview web y el callback de sesión.

Se conservaron también `expo-font` como dependencia, `expo-web-browser`, `expo-audio`, AsyncStorage, los módulos nativos de MediaSession/Audio Focus y todos los logos editoriales usados por `StationLogo`. La carpeta Android generada continúa excluida del repositorio y se regenera mediante `expo prebuild` en CI.

El archivo `eas.json` y los scripts históricos de EAS no participan en el workflow nativo de Gradle. Se dejaron intactos para no eliminar una ruta de recuperación sin una decisión explícita; no se incluyen en el bundle Android.

## Optimización de assets

Se aplicó compresión PNG sin pérdida a dos recursos con reducción real: `android-icon-monochrome.png` pasó de 4.140 a 3.920 bytes y `radios/fmlatina.png` de 125.603 a 117.921 bytes. El icono principal conservó exactamente su contenido y checksum. Un recurso que aumentó de tamaño durante la prueba fue restaurado a su versión original.

## Validación ejecutada

| Validación | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | Correcto; lockfile reproducible |
| `pnpm check` | Correcto |
| `pnpm test` | 64 aprobadas, 1 omitida |
| `pnpm lint` | Correcto |
| `expo config --type public` | Plugins requeridos presentes; `expo-asset` y `expo-font` ausentes como plugins |
| `expo prebuild --platform android --no-install` | Correcto; módulo nativo sincronizado |
| `expo export --platform android` | Correcto; bundle Hermes de 4,99 MB y 49 assets |

La exportación no contiene referencias a la ruta de laboratorio ni a los componentes demo eliminados. La ejecución no mostró errores de Metro, TypeScript ni configuración Expo.

## Pendientes de bajo riesgo

La siguiente limpieza posible sería separar con mayor rigor las dependencias del servidor de las dependencias móviles o retirar la ruta EAS histórica. No se aplicó porque ambas áreas pueden seguir siendo útiles para el preview, el callback OAuth o una recuperación de build. Esa decisión debe hacerse después de confirmar que el proyecto ya no necesita esas funciones.

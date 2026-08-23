# Evaluación de actualización Expo

## Fuentes oficiales consultadas

- [Guía oficial de actualización de Expo SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/): Expo recomienda actualizar un SDK a la vez, ejecutar `expo install --fix` y `expo-doctor`, y regenerar proyectos nativos cuando se usa Continuous Native Generation.
- [Referencia oficial de Expo SDK](https://docs.expo.dev/versions/latest/): la matriz consultada muestra SDK 54 con React Native 0.81, React 19.1 y Node mínimo 20.19; SDK 55 con React Native 0.83 y React 19.2; SDK 56 con React Native 0.85 y React 19.2.3; SDK 57 con React Native 0.86 y React 19.2.3, Node mínimo 22.13.

## Estado del proyecto

Radio Chile Glass está en Expo SDK 54, React Native 0.81, React 19.1, New Architecture activada, EAS Build, expo-audio, expo-notifications, expo-router, Reanimated 4, NativeWind y configuración Android arm64/minificada.

## Riesgo inicial

La actualización puede eliminar parte de las subdependencias heredadas de Expo, pero no garantiza que desaparezcan todas: algunas proceden de la cadena interna de Expo/React Native y otras de herramientas de desarrollo como Drizzle Kit. La migración debe ser incremental y requiere un build nativo nuevo, especialmente por el uso de audio en segundo plano, pantalla de bloqueo, plugins Expo, Reanimated y configuración Android personalizada.

## Recomendación provisional

No saltar directamente a SDK 57. La ruta de menor riesgo es mantener SDK 54 estable o probar SDK 55 en una rama/checkpoint separado, ejecutar `expo install --fix`, `expo-doctor`, typecheck, tests, lint y un APK de prueba. Solo avanzar a SDK 56/57 si SDK 55 reduce realmente los warnings y conserva la reproducción, navegación y build Android.

## Auditoría ejecutada el 23 de agosto de 2026

El proyecto actual resuelve Expo `54.0.37`, React Native `0.81.5` y React `19.1.0`. Las dependencias de audio, imagen, notificaciones, router, splash screen y sistema están alineadas con la familia SDK 54. La instalación congelada, typecheck, lint y 32 pruebas pasan.

El árbol transitivo mantiene `@xmldom/xmldom@0.8.11`, `glob@7.2.3`, `inflight@1.0.6`, `rimraf@3.0.2`, `uuid@7.0.3` y `tar@7.5.2` a través de herramientas internas de Expo/React Native. Drizzle Kit todavía arrastra `@esbuild-kit/esm-loader@2.6.5` y `@esbuild-kit/core-utils@3.3.2`. Estas advertencias no tienen una sustitución segura mediante overrides porque forman parte de cadenas internas y forzar versiones podría romper el prebuild o el build Android.

| Escenario | Beneficio esperado | Riesgo | Recomendación |
|---|---|---|---|
| Mantener SDK 54 | Máxima estabilidad para audio, Cover Flow y APK actual | Conserva parte de los warnings transitivos | Adecuado para producción inmediata |
| Migrar 54 → 55 | React Native 0.83 y React 19.2; posible reducción de dependencias heredadas | Requiere actualizar todos los módulos Expo y regenerar Android | Mejor primer experimento en rama/checkpoint separado |
| Migrar 55 → 56 | React Native 0.85 y React 19.2.3; cadena más reciente | Dos migraciones nativas y posible ajuste de APIs | Solo después de validar SDK 55 |
| Saltar 54 → 57 | Matriz más nueva: RN 0.86, React 19.2.3 y Node 22.13 mínimo | Mayor superficie de breaking changes y riesgo para audio/background playback | No recomendado como primer paso |

La actualización sí puede eliminar parte de los warnings, pero no garantiza eliminarlos todos. La recomendación es probar primero SDK 55 en una rama temporal: crear checkpoint, ejecutar `npx expo install expo@^55.0.0`, `npx expo install --fix`, `npx expo-doctor`, regenerar el proyecto nativo si corresponde y ejecutar el APK Android. Si el audio, la navegación, el Cover Flow y las 32 pruebas permanecen estables, se puede evaluar SDK 56. No debe modificarse la rama estable hasta comparar tamaño, tiempo de build, warnings y comportamiento físico en Android.

### Referencias

[1]: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/ "Upgrade Expo SDK - Expo Documentation"
[2]: https://docs.expo.dev/versions/latest/ "Expo SDK reference - Expo Documentation"

# Configuración de Red y Seguridad para Android

## Network Security Config

Se ha implementado una configuración de seguridad de red específica para dominios de streaming que permite:

### Características Principales

1. **Tráfico HTTP Permitido para Dominios Específicos**
   - Dominios comunes de streaming de radio (icecast.org, shoutcast.com, streamguys.com, etc.)
   - Localhost y direcciones de desarrollo (127.0.0.1, 10.0.2.2)
   
2. **Configuración Base Segura**
   - `cleartextTrafficPermitted="false"` por defecto
   - Solo los dominios explícitamente configurados permiten HTTP
   
3. **Debug Overrides**
   - Permite certificados de usuario en modo debug
   - Facilita el desarrollo con proxies como Charles o Fiddler

4. **Pin-Set Configuration**
   - Preparado para certificate pinning en dominios críticos
   - Fecha de expiración configurable

## Archivos Generados

- `/plugins/with-network-security-config.js` - Plugin de Expo que genera la configuración
- `android/app/src/main/res/xml/network_security_config.xml` - Configuración XML generada

## Comandos de Build

### Limpieza Profunda
```bash
pnpm clean:deep
```

### Prebuild Limpio
```bash
pnpm prebuild:clean
```

### Builds Optimizados

#### APK Release Estándar
```bash
pnpm build:android:release
# o manualmente:
eas build --profile production-apk --platform android
```

#### APK Split-per-ABI (Optimizado por arquitectura)
```bash
pnpm build:android:split
# o manualmente:
eas build --profile release-split-per-abi --platform android
```

Esto genera APKs separadas para cada arquitectura:
- `arm64-v8a` (dispositivos modernos de 64-bit)
- `armeabi-v7a` (dispositivos de 32-bit)
- `x86_64` (emuladores y dispositivos Intel)

#### Android App Bundle (Para Google Play)
```bash
pnpm build:android:bundle
# o manualmente:
eas build --profile production-bundle --platform android
```

## Optimizaciones Aplicadas

### En app.config.ts

1. **Build Properties**
   - `enableMinifyInReleaseBuilds: true` - Minificación de código
   - `enableShrinkResourcesInReleaseBuilds: true` - Eliminación de recursos no usados
   - `packagingOptions.exclude` - Exclusión de archivos .dko innecesarios
   - `buildArchs: ["arm64-v8a"]` - Solo arquitectura de 64-bit (reduce tamaño)

2. **iOS Optimizations**
   - `useFrameworks: "static"` - Mejor rendimiento en iOS

### En eas.json

1. **Perfiles de Build Múltiples**
   - `preview` - Builds internas rápidas
   - `production-apk` - APK optimizada para distribución interna
   - `production-bundle` - App Bundle para Google Play
   - `release-split-per-abi` - APKs divididas por arquitectura

2. **Gradle Commands Personalizados**
   - `:app:assembleRelease` - Para builds APK
   - `:app:bundleRelease` - Para builds AAB

## Mejoras de Audio

El plugin `with-radio-media-controls` incluye:

1. **Servicio en Primer Plano**
   - `RadioKeepAliveService` con `foregroundServiceType="mediaPlayback"`
   - Mantiene el audio activo incluso con la pantalla apagada

2. **Controles de Medios**
   - Integración con androidx.media:media
   - Soporte para controles en pantalla de bloqueo
   - Notificación persistente con controles de reproducción

3. **Receptor de Acciones**
   - `RadioMediaActionReceiver` para manejar eventos de medios

## Estructura del Proyecto

```
/workspace
├── plugins/
│   ├── with-network-security-config.js  # Nueva configuración de red
│   ├── with-radio-media-controls.js     # Controles de audio
│   └── native/                          # Código Kotlin nativo
├── app.config.ts                        # Configuración principal actualizada
├── eas.json                             # Perfiles de build actualizados
├── package.json                         # Scripts agregados
└── android/                             # Generado por expo prebuild
    └── app/src/main/res/xml/
        └── network_security_config.xml  # Generado automáticamente
```

## Pasos para Construir

1. **Limpieza (opcional pero recomendado)**
   ```bash
   pnpm clean:deep
   ```

2. **Prebuild con configuración actualizada**
   ```bash
   npx expo prebuild --clean
   ```

3. **Build según necesidad**
   ```bash
   # Para testing interno
   eas build --profile preview --platform android
   
   # Para distribución interna optimizada
   eas build --profile production-apk --platform android
   
   # Para máxima optimización (split por ABI)
   eas build --profile release-split-per-abi --platform android
   
   # Para Google Play Store
   eas build --profile production-bundle --platform android
   ```

## Notas Importantes

- La configuración de red solo afecta a Android 7.0 (API 24) y superior
- Los dominios de streaming deben agregarse explícitamente en el network_security_config.xml
- El split-per-abi reduce el tamaño de cada APK pero requiere múltiples uploads
- Para Google Play, se recomienda usar App Bundle en lugar de APK split

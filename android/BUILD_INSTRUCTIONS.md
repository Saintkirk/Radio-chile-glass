# Instrucciones para Generar APK - Radio Chile Glass

## Configuración Aplicada

Se han realizado las siguientes mejoras en la configuración de Gradle:

### 1. `gradle.properties`
- Aumentada memoria JVM a 6GB para mejor rendimiento
- Habilitado cache de Gradle y build paralelo
- Soporte para múltiples arquitecturas (arm64-v8a, armeabi-v7a, x86, x86_64)
- Habilitado Jetifier para compatibilidad con librerías antiguas
- Optimizaciones de empaquetado

### 2. `build.gradle` (root)
- Versiones específicas de Android Gradle Plugin (8.2.2) y Kotlin (1.9.24)
- Resolución forzada de dependencias para evitar conflictos
- Repositorios configurados correctamente

### 3. `app/build.gradle`
- Java 17 como target
- Core library desugaring habilitado
- MultiDex activado
- Configuración de shrinking y minificación optimizada
- Dependencias actualizadas y consistentes
- Configuración para splits por ABI (opcional)
- Exclude de archivos innecesarios para reducir tamaño del APK

### 4. `proguard-rules.pro`
- Reglas completas para React Native, Hermes, Reanimated
- Reglas para OkHttp, Gson, AndroidX, Kotlin
- Reglas para Expo modules y Fresco
- Reglas para mantener clases de la aplicación

## Comandos para Generar APK

### Opción 1: Usando EAS Build (Recomendado para producción)

```bash
# Instalar EAS CLI si no lo tienes
npm install -g eas-cli

# Login en Expo
eas login

# Generar APK de producción
eas build --profile production-apk --platform android

# Generar bundle de producción (para Google Play)
eas build --profile production-bundle --platform android

# Generar APKs separados por arquitectura (más livianos)
eas build --profile release-split-per-abi --platform android
```

### Opción 2: Build Local con Gradle

```bash
cd android

# Limpiar proyecto
./gradlew clean

# Generar APK de debug
./gradlew assembleDebug

# Generar APK de release
./gradlew assembleRelease

# Los APKs se generan en:
# - debug: app/build/outputs/apk/debug/app-debug.apk
# - release: app/build/outputs/apk/release/app-release.apk
```

### Opción 3: Usando Expo CLI

```bash
# Build de desarrollo
npx expo run:android

# Prebuild limpio antes de construir
npx expo prebuild --clean
cd android && ./gradlew clean && cd ..
npx expo run:android
```

## Ubicación de los APKs Generados

Después del build, los APKs se encuentran en:

```
android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk
└── release/
    └── app-release.apk
```

Si habilitaste los splits por ABI:
```
android/app/build/outputs/apk/
├── arm64-v8a/
│   └── app-arm64-v8a-release.apk
├── armeabi-v7a/
│   └── app-armeabi-v7a-release.apk
├── x86/
│   └── app-x86-release.apk
└── x86_64/
    └── app-x86_64-release.apk
```

## Configuración para Producción

### 1. Generar Keystore de Release

```bash
cd android/app
keytool -genkeypair -v -keystore radio-chile-glass.keystore -alias radio-chile-glass -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar signingConfigs en build.gradle

Editar `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file('radio-chile-glass.keystore')
        storePassword System.getenv('RELEASE_STORE_PASSWORD') ?: ''
        keyAlias 'radio-chile-glass'
        keyPassword System.getenv('RELEASE_KEY_PASSWORD') ?: ''
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... resto de configuración
    }
}
```

### 3. Variables de Entorno

Para builds automatizados, configurar:
- `RELEASE_STORE_PASSWORD`: Contraseña del keystore
- `RELEASE_KEY_ALIAS`: Alias de la key
- `RELEASE_KEY_PASSWORD`: Contraseña de la key

## Troubleshooting

### Error: OutOfMemoryError
Aumentar memoria en `gradle.properties`:
```
org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=2048m
```

### Error: Duplicate classes
Verificar dependencias conflictivas en `build.gradle` y usar `exclude` si es necesario.

### Error: Build muy lento
Ejecutar con cache:
```bash
./gradlew assembleRelease --build-cache --parallel
```

### Verificar tamaño del APK
```bash
# Analizar APK
./gradlew :app:analyzeReleaseBundle

# O usar APK Analyzer de Android Studio
```

## Optimizaciones Adicionales

1. **Habilitar splits por ABI** para APKs más pequeños:
   Editar `android/app/build.gradle`:
   ```gradle
   splits {
       abi {
           enable true
           // ...
       }
   }
   ```

2. **Habilitar R8 full mode** para mejor optimización:
   En `gradle.properties`:
   ```
   android.enableR8.fullMode=true
   ```

3. **Usar WebP** para imágenes:
   Ya está habilitado en `gradle.properties`:
   ```
   expo.webp.enabled=true
   ```

## Notas Importantes

- El APK de debug NO debe usarse en producción
- Siempre firmar con keystore propio para releases
- Mantener backup seguro del keystore
- Probar el APK release en dispositivos reales antes de distribuir

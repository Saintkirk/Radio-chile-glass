#!/bin/bash
set -e

echo "=== Configuración del Android SDK ==="

# Directorio de instalación
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-/opt/android-sdk}"
export ANDROID_SDK_ROOT

# Crear directorio si no existe
mkdir -p "$ANDROID_SDK_ROOT"
mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"

# Descargar Android Command Line Tools si no existen
if [ ! -d "$ANDROID_SDK_ROOT/cmdline-tools/latest" ]; then
    echo "Descargando Android Command Line Tools..."
    TMP_DIR=$(mktemp -d)
    cd "$TMP_DIR"
    
    # URL oficial de Google para command-line-tools
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
    
    if [ $? -eq 0 ]; then
        unzip -q cmdline-tools.zip
        mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools/latest"
        mv cmdline-tools/* "$ANDROID_SDK_ROOT/cmdline-tools/latest/" 2>/dev/null || true
        rm -rf cmdline-tools cmdline-tools.zip
        echo "Command Line Tools instaladas exitosamente"
    else
        echo "Error descargando command-line-tools"
        exit 1
    fi
    
    cd -
fi

# Aceptar licencias automáticamente
echo "Aceptando licencias de Android SDK..."
yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses 2>/dev/null || true

# Instalar componentes requeridos
echo "Instalando componentes del SDK..."
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "ndk;27.0.12077973" \
    "extras;google;gms" || {
    echo "Error instalando componentes del SDK"
    exit 1
}

echo "=== Android SDK configurado exitosamente ==="
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

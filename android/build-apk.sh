#!/bin/bash
set -e

echo "=========================================="
echo "   SCRIPT DE BUILD APK A PRUEBA DE FALLOS"
echo "=========================================="

# Configurar variables de entorno
export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=/opt/android-sdk
export NODE_ENV=production
export GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=256m"

# Directorio del proyecto
PROJECT_DIR="/workspace/android"
cd "$PROJECT_DIR"

# Limpiar procesos anteriores
pkill -9 -f gradle 2>/dev/null || true
pkill -9 -f java 2>/dev/null || true
sleep 2

# Limpiar caché de Gradle
rm -rf .gradle build app/build 2>/dev/null || true

# Función para verificar memoria disponible
check_memory() {
    local available=$(free -m | awk 'NR==2{print $7}')
    echo "Memoria disponible: ${available}MB"
    if [ "$available" -lt 500 ]; then
        echo "ADVERTENCIA: Poca memoria disponible. Esperando..."
        sleep 10
    fi
}

# Función para ejecutar gradle con reintentos
run_gradle_with_retry() {
    local task="$1"
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo ""
        echo "=========================================="
        echo "   INTENTO $attempt de $max_attempts"
        echo "   Tarea: $task"
        echo "=========================================="
        
        check_memory
        
        # Ejecutar Gradle con timeout de 20 minutos
        timeout 1200 ./gradlew \
            --no-daemon \
            --no-parallel \
            --no-configuration-cache \
            -Dorg.gradle.jvmargs="-Xmx512m -XX:MaxMetaspaceSize=256m" \
            -Dorg.gradle.daemon=false \
            -Dorg.gradle.parallel=false \
            -Dorg.gradle.workers.max=1 \
            -Dkotlin.compiler.execution.strategy=in-process \
            "$task" 2>&1 | tee /tmp/gradle_attempt_$attempt.log
            
        local exit_code=${PIPESTATUS[0]}
        
        if [ $exit_code -eq 0 ]; then
            echo ""
            echo "=========================================="
            echo "   BUILD EXITOSO!"
            echo "=========================================="
            return 0
        elif [ $exit_code -eq 124 ]; then
            echo ""
            echo "ERROR: Timeout excedido (20 minutos)"
        else
            echo ""
            echo "ERROR: El build falló con código $exit_code"
        fi
        
        # Limpiar antes del próximo intento
        pkill -9 -f gradle 2>/dev/null || true
        rm -rf .gradle 2>/dev/null || true
        sleep 5
        
        attempt=$((attempt + 1))
    done
    
    echo ""
    echo "=========================================="
    echo "   ERROR: Todos los intentos fallaron"
    echo "=========================================="
    return 1
}

# Ejecutar el build
run_gradle_with_retry "assembleRelease"

# Verificar si se generó el APK
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo ""
    echo "=========================================="
    echo "   APK GENERADO EXITOSAMENTE!"
    echo "=========================================="
    ls -lh app/build/outputs/apk/release/*.apk
    cp app/build/outputs/apk/release/app-release.apk /workspace/RadioChileGlass.apk 2>/dev/null || true
    echo ""
    echo "APK disponible en: /workspace/RadioChileGlass.apk"
else
    echo ""
    echo "=========================================="
    echo "   ERROR: No se encontró el APK generado"
    echo "=========================================="
    find . -name "*.apk" -type f 2>/dev/null || echo "No se encontraron archivos APK"
    exit 1
fi

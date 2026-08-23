# GitHub Actions para Android

Se añadieron dos workflows:

| Workflow | Cuándo se ejecuta | Resultado |
|---|---|---|
| `CI` | Push a `main`/`master` y pull requests | Ejecuta typecheck, pruebas y lint. |
| `Android APK` | Ejecución manual o al crear un tag `v*` | Genera un APK con EAS y lo publica como artefacto descargable. |

## Configuración única

El repositorio debe estar vinculado a un proyecto de Expo/EAS. Desde una máquina con Node y la CLI de Expo instalada, ejecuta `eas login` y luego `eas init` dentro del proyecto. Conserva el `extra.eas.projectId` que EAS añada a la configuración si lo solicita.

En GitHub, abre **Settings → Secrets and variables → Actions → New repository secret** y crea `EXPO_TOKEN`. El valor debe ser un token de acceso de Expo/EAS con permisos suficientes para iniciar builds. No lo escribas en el código, en `.env` versionado ni en los logs.

## Ejecución manual

En GitHub abre **Actions → Android APK → Run workflow**, selecciona `preview` para un APK de pruebas o `production-apk` para un APK instalable de producción y ejecuta el workflow. Al terminar, descarga el archivo desde **Artifacts**.

## Ejecución por versión

Después de fusionar un cambio aprobado, crea y publica un tag, por ejemplo `v1.0.1`. El workflow usará `production-apk` y dejará el APK como artefacto de la ejecución.

## Importante

GitHub Actions no compila por sí solo: el workflow usa EAS Build como servicio de compilación Android. La primera ejecución puede requerir completar credenciales de firma Android en EAS. La prueba definitiva de audio en segundo plano y pantalla de bloqueo debe realizarse instalando el APK en un teléfono Android físico.

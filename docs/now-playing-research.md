# Metadatos de reproducción de radio

## Hallazgos

Los streams Icecast y Shoutcast pueden entregar metadatos ICY dentro del flujo de audio. La negociación se solicita con el encabezado `Icy-MetaData: 1`; la respuesta puede incluir `icy-metaint`, que indica cada cuántos bytes de audio aparece un bloque de metadatos. El bloque suele contener `StreamTitle='Artista - Título'`, aunque no todas las emisoras lo publican.

La documentación de `expo-audio` describe reproducción de URLs remotas y seguimiento del estado del reproductor, pero no expone una API directa para leer bloques ICY del stream. Por eso la lectura se implementa del lado servidor, evitando depender de CORS o de APIs privadas de cada emisora.

## Fuentes

1. [Borewit/music-metadata-icy](https://github.com/Borewit/music-metadata-icy) — decodificación de metadatos ICY usados por Icecast y Shoutcast.
2. [Liquidsoap: ICY metadata](https://www.liquidsoap.info/doc-dev/icy_metadata) — formato y uso de metadatos ICY en radio online.
3. [Expo Audio SDK 54](https://docs.expo.dev/versions/latest/sdk/audio/) — reproducción de streams remotos y estado del reproductor.

## Decisiones de implementación

La aplicación consulta un endpoint público del servidor cada 20 segundos para la emisora activa. La consulta tiene timeout de 7 segundos, acepta únicamente URLs HTTPS y devuelve `available: false` cuando el stream no ofrece `icy-metaint`, no contiene `StreamTitle` o la lectura falla. La interfaz muestra artista y pista cuando están disponibles y un mensaje de fallback cuando la emisora no publica esa información.

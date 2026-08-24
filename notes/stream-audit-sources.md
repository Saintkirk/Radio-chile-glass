# Fuentes externas de auditoría

- **Radio 13C oficial:** https://radio13c.cl/ — presenta Radio13c como señal online chilena de ideas y actualidad.
- **Ficha pública 13C:** https://www.radios-chilenas.com/13c-radio — identifica Radio13c en Santiago, 102.1 FM, género Noticias; la página muestra un control de reproducción y el logo naranja de Radio13c.
- La auditoría HTTP local del catálogo devolvió respuesta 200 para todos los streams editoriales y regionales revisados. 13C y Oasis responden como `application/vnd.apple.mpegurl` (HLS), mientras las otras señales devuelven audio MPEG/AAC o AACP. El estado HTTP 200 no garantiza que Android reproduzca todos los segmentos HLS sin distorsión.

## Búsqueda adicional

- Radio13c oficial: https://radio13c.cl/
- Ficha pública 13C: https://www.radios-chilenas.com/13c-radio
- Radio La Clave oficial: https://www.radiolaclave.cl/
- Resultado público de Oasis FM: https://radio.menu/stations/oasisfm-cl-oasis-fm-chile/

Los resultados públicos no entregaron una URL MP3 directa verificada para reemplazar inmediatamente las señales HLS. Por eso la corrección debe priorizar tolerancia del reproductor y diagnóstico por formato, sin inventar enlaces alternativos.

## Fuentes oficiales consultadas

La extracción de https://radio13c.cl/ confirmó la presencia del sitio oficial de Radio13c y su contenido editorial. La extracción de https://www.radiolaclave.cl/ confirmó el sitio oficial de Radio La Clave, pero no expuso en texto una URL de audio directa verificable. El análisis ffprobe local detectó que la URL actual de La Clave devuelve un stream HLS con video H.264, por lo que no debe tratarse como señal de radio de audio sin una ruta audio-only confirmada.

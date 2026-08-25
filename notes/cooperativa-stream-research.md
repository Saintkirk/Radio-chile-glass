# Investigación de streaming: Radio Cooperativa

Fecha: 2026-08-25

La página oficial `https://cooperativa.cl/radioenvivo/` confirma que Radio Cooperativa mantiene una sección de radio en vivo, pero la extracción pública no expone una URL directa de audio.

La ficha de Radio.net `https://www.radio.net/s/cooperativa933fm` identifica la emisora oficial y confirma que ofrece transmisión en línea, pero tampoco expone el endpoint directo en el contenido extraído.

La ficha de Emisora.cl `https://emisora.cl/cooperativa-santiago/` confirma la estación de Santiago, 93.3 FM, pero no publica una URL directa de audio.

La URL editorial actual del proyecto, `https://redirector.dps.live/cooperativafm/aac/icecast.audio`, fue comprobada previamente y devuelve HTTP 404 `text/html`; no debe mantenerse como fuente válida.

Conclusión: no se encontró todavía un endpoint directo verificable desde contenido estático. Se requiere inspección del reproductor oficial en navegador o una fuente pública directa adicional antes de actualizar el catálogo.


## Seguimiento

La inspección del reproductor oficial en `https://cooperativa.cl/radioenvivo/` expuso estas rutas en su configuración: `now` antiguo en `http://redirector.dps.live/cooperativa/aac/icecast.audio`, `go` HLS por `hls-audio-cl-1-isp.dps.live`, y `timeline_new` vía `https://redirector.rudo.video/hls-audio/716888c72e2079612211a7130f67a27d/cooperativa/`.

El endpoint JSON `https://redirector.dps.live/infinystream/cooperativa/?custom=json` devuelve `streamServerValue: https://unlimited5-us.dps.live`. La ruta HLS nueva `https://unlimited5-us.dps.live/cooperativa/playlist/manifest/gotardisz/audio/now/livestream1.m3u8` responde HTTP 200, pero el manifiesto contiene `dps://error/manifest/playlist/index1-edge.m3u8`, por lo que no es una fuente reproducible en este momento. Las variantes `unlimited3-cl.dps.live` y `hls-audio-cl-1-isp.dps.live` también devuelven un manifiesto que referencia el mismo error.

Una búsqueda independiente encontró como alternativa histórica `https://redirector.dps.live/cooperativafm/mp3/icecast.audio` y `http://unlimited3-cl.dps.live/cooperativafm/aac/icecast.audio`, pero requieren validación actual antes de incorporarlas.

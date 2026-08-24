# Auditoría Radio Carolina — 2026-08-24

Fuente oficial consultada: https://www.carolina.cl/senal-en-vivo/

La página oficial identifica la señal como **EN VIVO — Señal de Audio** y usa el logo oficial `https://www.carolina.cl/_templatesB/desktop/includes/img/carolina.svg`. El botón de audio enlaza a `/senal-en-vivo/` y el reproductor Lightning se carga desde `https://player.cdn.mdstrm.com/lightning_player/api.js`.

El catálogo de Radio Browser mantiene como candidato verificable `https://stream.zeno.fm/sri2de2qdlivv`, con homepage oficial `https://www.carolina.cl/`, codec AAC y `lastcheckok=1`. Una conexión GET del 2026-08-24 siguió una redirección 302 a `stream-285.surfernetwork.com`, respondió `200 OK`, `content-type: audio/aac`, `icy-name: Radio Carolina`, `icy-metaint: 16000` y entregó bytes identificados localmente como MPEG ADTS AAC v4 LC, 44.1 kHz, estéreo.

El endpoint alternativo `https://playerservices.streamtheworld.com/api/livestream-redirect/CAROLINA_SC.mp3` respondió `404 Not Found`, por lo que no debe usarse.

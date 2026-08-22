# Auditoría editorial de radios

Fecha de comprobación: 22 de agosto de 2026.

| Emisora | Logo | Stream | Resultado |
|---|---|---|---|
| FM Latina | PNG oficial, HTTP 200 | `jm8n.com/proxy/radiofmlatina/stream`, audio/mpeg | Confirmada |
| Radio Cooperativa | favicon, imagen válida | DPS Live, audio/aacp | Confirmada |
| Radio Bío Bío | favicon, imagen válida | DPS Live, audio/mpeg | Confirmada |
| Radio Pudahuel | favicon, imagen válida | StreamTheWorld, audio/mpeg | Confirmada |
| Radio Corazón | favicon, imagen válida | StreamTheWorld, audio/mpeg | Confirmada |
| Radio Carolina | favicon, imagen válida | Zeno → Surfer Network, audio/aac | Confirmada; requiere seguir redirección |
| Radio Futuro | favicon, imagen válida | StreamTheWorld, audio/mpeg | Confirmada |
| Radio Concierto | favicon, imagen válida | StreamTheWorld, audio/aacp | Confirmada |
| Radio Sonar | CDN oficial, imagen JPEG | MediaStream, audio/aac | Confirmada |
| Radio Activa | favicon, imagen válida | Zeno, audio/mpeg | Confirmada |
| ADN Radio | favicon del dominio, imagen válida | StreamTheWorld, audio/aacp | Confirmada |
| Radio Agricultura | sin logo remoto estable; fallback AG | HLS DPS Live, playlist válida | Confirmada con fallback visual |
| Los 40 | sin logo remoto estable; fallback 40 | StreamTheWorld, audio/mpeg | Confirmada con fallback visual |
| FM Dos | sin logo remoto estable; fallback F2 | StreamTheWorld, audio/aacp | Confirmada con fallback visual |
| Radio Imagina | favicon, imagen válida | StreamTheWorld, audio/mpeg | Confirmada |
| Radio Duna | sin logo remoto estable; fallback DU | MediaStream, audio/aac | Confirmada con fallback visual |
| Oasis FM | favicon responde HTML; fallback OA | HLS MediaStream, playlist válida | Stream confirmado; logo usa fallback |
| Radio Beethoven | logo PNG oficial, respuesta intermitente | DPS Live, audio/aacp | Stream confirmado; logo con fallback si falla |

Los streams fueron comprobados leyendo una muestra inicial de datos. Para señales HLS se validó la playlist; para señales directas se validaron respuestas `audio/*` y bytes de audio. Los favicons no válidos no bloquean la experiencia porque `StationLogo` usa iniciales y acento de marca como fallback.

# Auditoría de correspondencia de identidad y streaming

Fecha: 22 de agosto de 2026.

La comprobación individual siguió redirecciones HTTP y leyó bytes iniciales. En streams directos se revisaron tipo MIME, proveedor y encabezado `icy-name`; en HLS se validó la playlist y el proveedor CDN.

| Radio | Stream / identidad observada | Logo | Estado |
|---|---|---|---|
| FM Latina | `jm8n.com/proxy/radiofmlatina/stream`; audio/mpeg; endpoint extraído del reproductor oficial | PNG oficial de radiofmlatina.com | Confirmada |
| Radio Cooperativa | DPS Live; audio/aacp | favicon cooperativa.cl | Confirmada |
| Radio Bío Bío | DPS Live; audio/mpeg | favicon biobiochile.cl | Confirmada |
| Radio Pudahuel | StreamTheWorld; audio/mpeg | favicon pudahuel.cl | Confirmada |
| Radio Corazón | StreamTheWorld; audio/mpeg | favicon corazon.cl | Confirmada |
| Radio Carolina | Zeno → Surfer Network; audio/aac; `icy-name: Radio Carolina` | favicon carolina.cl | Confirmada |
| Radio Futuro | StreamTheWorld; audio/mpeg | favicon futuro.cl | Confirmada |
| Radio Concierto | StreamTheWorld; audio/aacp | favicon concierto.cl | Confirmada |
| Radio Sonar | MediaStream; audio/aac | asset CDN de Sonar | Confirmada |
| Radio Activa | Zeno → Surfer Network; audio/mpeg; `icy-name: Radio Activa` | favicon radioactiva.cl | Confirmada |
| ADN Radio | StreamTheWorld; audio/aacp; `icy-name: ADN` | favicon adnradio.cl | Confirmada |
| Radio Agricultura | DPS Live; HLS válido | sin imagen estable; fallback AG | Stream confirmado |
| Los 40 | StreamTheWorld; audio/mpeg; `icy-name: LOS40_CHILE` | sin imagen estable; fallback 40 | Stream confirmado |
| FM Dos | StreamTheWorld; audio/aacp; `icy-name: FMDOS` | sin imagen estable; fallback F2 | Stream confirmado |
| Radio Imagina | StreamTheWorld; audio/mpeg; `icy-name: IMAGINA` | favicon radioimagina.cl | Confirmada |
| Radio Duna | MediaStream; audio/aac | sin imagen estable; fallback DU | Stream confirmado |
| Oasis FM | MediaStream; HLS válido | favicon devuelve HTML; fallback OA | Stream confirmado |
| Radio Beethoven | DPS Live; audio/aacp; `icy-name: BeethovenFM RADIO` | logo oficial responde de forma intermitente; fallback BE | Stream confirmado |

El stream de Radio Universidad de Chile se excluyó de la portada priorizada porque no respondió dentro del timeout de comprobación. Un logo ausente o no válido no deja la tarjeta vacía: `StationLogo` muestra iniciales y acento de marca.

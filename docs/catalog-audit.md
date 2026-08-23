# Auditoría individual de radios

Fecha: 2026-08-22T20:40:08.113Z

## Resumen

Se auditaron 112 entradas: 21 editoriales y 93 remotas. Los streams editoriales respondieron correctamente con audio o playlist válida.

## Emisoras editoriales

| Emisora | Stream | HTTP | Tipo | Logo | HTTP logo | Fuente |
|---|---:|---:|---|---|---:|---|
| FM Latina | OK | 200 | audio | OK | 200 | asset local |
| Radio Cooperativa | OK | 200 | audio | OK | 200 | asset local |
| Radio Bío Bío | OK | 200 | audio | OK | 200 | asset local |
| Radio Pudahuel | OK | 206 | audio | OK | 200 | asset local |
| Radio Corazón | OK | 206 | audio | OK | 200 | asset local |
| Radio Carolina | OK | 200 | audio | OK | 200 | asset local |
| Radio Futuro | OK | 206 | audio | OK | 200 | asset local |
| Radio Concierto | OK | 206 | audio | OK | 200 | asset local |
| Radio Sonar | OK | 200 | audio | OK | 200 | asset local |
| Radio Activa | OK | 200 | audio | OK | 200 | asset local |
| ADN Radio | OK | 206 | audio | OK | 200 | asset local |
| Radio Agricultura | OK | 200 | playlist | OK | 200 | asset local |
| Los 40 | OK | 206 | audio | OK | 200 | asset local |
| FM Dos | OK | 206 | audio | OK | 200 | asset local |
| Radio Imagina | OK | 206 | audio | OK | 200 | asset local |
| Radio Duna | OK | 200 | audio | OK | 200 | asset local |
| Oasis FM | OK | 206 | playlist | OK | — | asset local |
| Radio Beethoven | OK | 200 | audio | OK | 200 | asset local |
| Radio Festival | OK | 200 | audio | OK | 200 | asset local |
| Radio Punto 7 Temuco | OK | 200 | audio | OK | 200 | asset local |
| Radio Edelweiss | OK | 206 | audio | OK | 200 | asset local |

## Streams remotos problemáticos

No se detectaron streams remotos problemáticos.

## Interpretación de logos

Las 21 radios editoriales usan assets locales definidos en components/station-logo.tsx, incluido Oasis FM. La auditoría confirmó que los 112 streams que permanecen en producción responden como audio o playlist válida; los siete endpoints Digital FM que fallaban fueron excluidos del catálogo remoto. De las emisoras remotas restantes, 44 no publican un logo o favicon verificable; esas entradas conservan un fallback de iniciales para no asociarles una imagen incorrecta.

## Nuevas fuentes consultadas en esta auditoría

La guía pública de estaciones de radio de Chile organiza el país por la Región Metropolitana y las 15 regiones restantes. En la sección de Santiago aparecen, entre otras, Radio María Chile, El Conquistador FM, Radio La Clave, Radio Universo, Rock & Pop, Radio Usach, Radio Disney Chile, La Metro FM, Nuevo Tiempo, Radio Infinita, Pauta FM y Play FM, además de varias emisoras ya presentes en el catálogo editorial.

Radios-chilenas.com muestra una navegación separada para radios principales, género, regiones, noticias y recomendadas. Entre las emisoras visibles que faltan o requieren verificación frente al catálogo editorial actual aparecen FM de Los Recuerdos, Rock&Pop, La Retro Radio, Play FM, Tele 13 Radio, Radio Infinita, Radio La Mexicana, Radio Universo, Radio Disney Chile, Radio Universidad de Chile, Radio Pauta, Radio Armonía, Nostálgica FM, Radio Carnaval Antofagasta, Sur FM Puerto Varas, Radio Punto 7 Valparaíso, Radio Bío Bío Puerto Montt y Radio Bío Bío Valparaíso.

Estas fuentes sirven para detectar candidatos, pero no bastan por sí solas para incorporar streams: cada emisora debe pasar por comprobación de homepage, logo, URL de streaming, tipo de respuesta y disponibilidad sostenida. La fuente editorial no debe reemplazar la validación técnica existente.

## Auditoría adicional de radios-chilenas.com

La fuente consultada mantiene una sección de Noticias con emisoras y localidades explícitas. Además de señales ya incorporadas, aparecen como candidatas Radio Universidad de Chile 102.5 FM (Santiago), Radio 13c (Santiago), Radio Bío Bío Puerto Montt (Los Lagos), Radio Portales (Antofagasta), Radio Tentación (Biobío), Radio Nuevo Mundo (Antofagasta), Radio Caricia (Santiago), Radio Dinámica (Coronel), Radio Ignacio Serrano (Santiago), Radio Sinfónica (Maule), Radio Sabrosona (Santiago) y CNN Chile Radio AM. Se conservarán como candidatas hasta validar homepage, stream y correspondencia del logo; no se incorporan automáticamente por aparecer listadas en un agregador.

### Resultado de verificación e incorporación

Se incorporaron como radios editoriales nuevas **13C Radio** (Santiago, 102.1 FM), **Radio La Mexicana** (San Vicente, O’Higgins, 95.3 FM) y **Radio Carnaval La Serena** (La Serena, Coquimbo, 104.5 FM). Cada una conserva homepage oficial, favicon o logo remoto y una URL de stream que respondió correctamente durante la verificación: 13C entregó playlist HLS, La Mexicana respondió audio/mpeg y Carnaval La Serena respondió audio/aac con encabezados ICY.

Se descartaron en esta pasada Radio Portales porque el endpoint candidato devolvió 404, Radio Recuerdos por respuesta 400, y varios endpoints Carnaval de Antofagasta, Viña del Mar y Punta Arenas por respuesta 400. Radio Sinfónica quedó fuera porque el enlace observado contiene un token temporal. Estas emisoras pueden reintentarse con sus URLs oficiales actualizadas en una auditoría posterior.

## Reintento: Radio Portales y Radio Recuerdos

La página oficial de Radio Portales corresponde a la señal de Valparaíso, con dirección en Condell 1190, frecuencias 840 AM y 89.5 FM, y dominio `portalesfm.cl`. Esto corrige la candidatura anterior de Portales Santiago 1180 AM: no se debe mezclar la identidad de ambas señales sin una verificación independiente del stream.

La página oficial de Radio Recuerdos expone un reproductor Lunaradio activo y publica el texto dinámico `ANTONIO ZABALETA - Que daría yo - ANTONIO ZABALETA`, lo que confirma que la emisora entrega metadata de pista en su reproductor web. Falta localizar el endpoint directo de audio para incorporarla de forma nativa; no se agregará mientras el stream no esté confirmado.

La fuente oficial alternativa `fmdelosrecuerdos.cl` confirma logo en `logohead.png` y una página propia `/senal-en-vivo/` para escuchar online. La señal se presenta como emisora solo por internet, por lo que su ciudad se mantendrá como Santiago/Región Metropolitana solo si el endpoint directo se confirma; la homepage y el logo sí son verificables.

## Radio Rock & Pop

Rock & Pop Chile se confirmó en `rockandpop.cl` como una emisora de Santiago en 94.1 FM, con programación de rock, pop, actualidad y tendencias. La API pública de Radio Browser devolvió el endpoint AAC `https://playerservices.streamtheworld.com/api/livestream-redirect/ROCK_AND_POPAAC_SC`; la respuesta entregó audio AAC+ y cabeceras ICY con el nombre `ROCK_AND_POP`, por lo que se incorporó al catálogo. Se añadió un logo local cuadrado para evitar pixelación en las carátulas.

La animación del Flow Cover ahora usa easing cúbico suave, 460 ms de duración, perspectiva 3D y desplazamiento vertical ligero durante la entrada. La transición sigue respetando reduced motion y mantiene la navegación y el audio sincronizados.

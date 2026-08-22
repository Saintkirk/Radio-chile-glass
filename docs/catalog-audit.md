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

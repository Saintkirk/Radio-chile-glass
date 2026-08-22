# Análisis de Radio Garden para Radio Chile Glass

## Resumen ejecutivo

Radio Garden destaca por convertir el descubrimiento de emisoras en una experiencia espacial: el usuario explora un globo interactivo, selecciona una localidad y escucha una estación desde un reproductor persistente. En la pantalla de Taltal se observaron un marcador geográfico, un cajón inferior con la emisora activa, favoritos, play/pausa, volumen, opciones y bloqueo de estación. La sección Browse complementa el mapa con playlists editoriales, ilustraciones, descripciones y una acción de descubrimiento aleatorio.

La recomendación principal es **adoptar la lógica de exploración geográfica y curatorial, no copiar literalmente la interfaz**. Radio Chile Glass ya tiene una identidad diferencial con Cover Flow, logos HD, favoritos, metadatos “Ahora suena” y reproductor premium. El mapa debería funcionar como una nueva capa de descubrimiento regional, mientras Cover Flow continúa siendo el centro de la experiencia de reproducción.

## Comparación de capacidades

| Patrón observado | Radio Garden | Radio Chile Glass actual | Aplicación recomendada |
|---|---|---|---|
| Descubrimiento geográfico | Globo interactivo con ciudades y emisoras | Explorar filtra por ciudad mediante chips | Añadir un mapa estilizado de Chile con nodos por ciudad y región |
| Reproductor persistente | Cajón inferior con estación, controles, volumen y opciones | Mini reproductor persistente con logo, ecualizador y reproducción | Ampliar el mini reproductor con volumen, menú y bloqueo opcional |
| Exploración editorial | Playlists temáticas con portada, descripción y cantidad | Filtros por género y catálogo regional | Crear colecciones como “Norte Grande”, “Rock chileno” y “Noticias al día” |
| Descubrimiento casual | “Take a Balloon Ride” selecciona destinos sorpresa | Navegación manual por Cover Flow | Añadir “Sorpréndeme” para elegir una emisora verificada al azar |
| Búsqueda | Sección independiente de búsqueda | Campo de búsqueda en Inicio y Explorar | Mantener búsqueda rápida y añadir resultados por ciudad, región y género |
| Protección contra cambios | Botón “Lock station” | Flechas, gestos y cambio de estación | Añadir bloqueo temporal para evitar cambios accidentales durante la escucha |
| Información musical | En la pantalla observada no apareció artista/pista | Integración ICY con fallback “Ahora suena” | Conservar ICY y sumar fuentes específicas cuando una emisora las publique |

## Mejoras priorizadas

| Prioridad | Mejora | Beneficio | Complejidad | Recomendación |
|---|---|---|---|---|
| Alta | Mapa de Chile interactivo por ciudades | Hace tangible la cobertura regional y diferencia la app | Media-alta | Implementar primero como vista opcional dentro de Explorar; no reemplazar Inicio |
| Alta | Cajón de reproducción enriquecido | Mejora control con una mano y reduce la necesidad de abrir el detalle | Media | Añadir volumen, bloqueo de estación y menú de acciones al mini reproductor |
| Alta | “Sorpréndeme” | Aumenta descubrimiento sin exigir decisiones al usuario | Baja | Seleccionar solo streams verificados y mostrar ciudad antes de reproducir |
| Media | Playlists curatoriales chilenas | Convierte el catálogo en experiencias, no solo en una lista | Media | Crear colecciones con ilustraciones abstractas, número de radios y descripción |
| Media | Historial de estaciones escuchadas | Permite volver rápidamente a emisoras descubiertas | Baja | Guardar localmente las últimas 10 estaciones, sin autenticación |
| Media | Bloqueo temporal del carrusel | Evita cambios accidentales con gestos horizontales | Baja | Añadir acción en el menú del reproductor, con estado visible y reversible |
| Baja | Globo 3D completo | Es visualmente impactante, pero más pesado y complejo | Alta | Dejarlo como evolución posterior; comenzar con mapa 2D/estilizado de Chile |

## Diseño propuesto para la próxima iteración

La pantalla Explorar podría incorporar un selector segmentado entre **Lista**, **Mapa** y **Colecciones**. En Mapa, Chile aparecería como una superficie oscura con nodos luminosos por ciudad; el tamaño o intensidad del nodo representaría la cantidad de emisoras disponibles. Al tocar un nodo, se abriría una bandeja inferior con las radios de esa ciudad y el Cover Flow se mantendría como control de selección y reproducción.

El mini reproductor debería conservar el logo HD y el ecualizador actuales, pero añadir un control de volumen, un botón de bloqueo y un menú de opciones. La acción de bloqueo sería especialmente útil porque la navegación horizontal y los gestos son parte importante de la experiencia actual. El contenido “Ahora suena” debe permanecer debajo del nombre de la emisora y continuar mostrando un fallback cuando el stream no entregue metadatos.

Para el descubrimiento editorial, las colecciones iniciales podrían ser **Norte Grande**, **Centro y Valparaíso**, **Sur y Patagonia**, **Noticias al día**, **Rock chileno** y **Música romántica**. Cada colección debería incluir una ilustración abstracta propia, una descripción de una línea y el número de emisoras verificadas. La acción “Sorpréndeme” puede elegir una estación del catálogo validado y mostrar una breve tarjeta de confirmación antes de iniciar la reproducción.

## Riesgos y límites

El mapa introduce dependencia de cartografía, rendimiento y accesibilidad táctil. Un globo 3D completo puede consumir más batería y memoria que el Cover Flow existente, por lo que conviene comenzar con un mapa 2D de Chile y cargarlo bajo demanda. Las emisoras regionales también pueden tener logos, streams o metadatos inconsistentes; cualquier nueva capa debe reutilizar el catálogo normalizado, los fallbacks y la auditoría de conectividad ya existentes.

## Conclusión

La mejora con mayor relación impacto-esfuerzo es combinar **Mapa regional + Cajón de reproducción enriquecido + Sorpréndeme**. Esta combinación captura lo mejor de Radio Garden —exploración espacial, escucha persistente y descubrimiento casual— mientras conserva la identidad premium de Radio Chile Glass basada en Cover Flow, glasmorfismo, logos HD y control de reproducción.

## Referencias

[1]: https://radio.garden/visit/taltal/AOl8e0XJ?hl=es "Radio Garden: Taltal, Chile"
[2]: https://radio.garden/ "Radio Garden: portada oficial"
[3]: https://radio.garden/browse "Radio Garden: Browse y playlists curatoriales"
[4]: https://play.google.com/store/apps/details?id=com.jonathanpuckey.radiogarden&hl=en_US "Radio Garden en Google Play"

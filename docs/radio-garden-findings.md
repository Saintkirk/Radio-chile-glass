# Hallazgos de Radio Garden

## Observación de la pantalla de Taltal

Radio Garden presenta un globo/mapa interactivo como superficie principal. La emisora seleccionada aparece asociada a una ubicación geográfica, con un cajón inferior que concentra nombre, ciudad, favorito, reproducción, volumen y opciones. La navegación global separa Explorar, Favoritos, Navegar, Buscar y Ajustes.

El flujo de entrada es deliberadamente simple: una acción central de play inicia la experiencia. Después de iniciar, el usuario ve el nombre de la localidad y país, la emisora seleccionada, un marcador geográfico y un reproductor compacto persistente. El control de volumen es directo y existe una acción para abrir más opciones de la emisora.

## Patrones aplicables a Radio Chile Glass

La idea más transferible es una capa de descubrimiento geográfico sobre el catálogo existente, no sustituir el Cover Flow. Para Chile, podría usarse un mapa estilizado con regiones o ciudades como nodos; tocar un nodo abriría una bandeja de emisoras locales y el Cover Flow seguiría siendo la experiencia premium de reproducción.

También es aplicable el “cajón” persistente de reproducción con nombre, ciudad, favorito, play/pausa, volumen y menú secundario, junto con una acción de bloqueo de emisora para evitar cambios accidentales. La búsqueda contextual por ciudad y el botón de ubicación pueden mejorar Explorar regional sin pedir autenticación.

Radio Garden no mostró artista y pista en la pantalla observada; la app debe conservar su integración ICY y fallback actual para “Ahora suena”.

## Patrones adicionales observados

La sección Browse no se limita a una lista plana: ofrece playlists editoriales con nombre, concepto, descripción breve, ilustración y cantidad de emisoras. También incluye una acción de sorpresa (“Take a Balloon Ride”), que convierte el descubrimiento casual en una función explícita. El reproductor inferior permanece visible mientras se explora y conserva favorito, play/pausa, volumen, opciones y bloqueo de estación.

Para Radio Chile Glass, esto sugiere añadir colecciones curatoriales chilenas como “Noticias al día”, “Norte grande”, “Rock chileno”, “Música romántica” y “Voces regionales”, cada una con una portada abstracta y número de emisoras. Una acción “Sorpréndeme” podría seleccionar una radio verificada del catálogo, sin cambiar la estructura principal del Cover Flow.

# Diseño de Radio Chile Glass

## Dirección de producto

Radio Chile Glass será una experiencia de escucha enfocada en descubrir y reproducir radios chilenas con una interacción directa y de una sola mano. La aplicación usará una estética nocturna, minimalista y editorial: fondos profundos con gradientes atmosféricos, superficies translúcidas, bordes finos y acentos cálidos inspirados en las luces de Santiago al anochecer.

La interfaz asumirá orientación vertical 9:16, targets táctiles amplios y navegación inferior para que las acciones principales queden al alcance del pulgar. Se seguirá el lenguaje de interacción de iOS/Android moderno: jerarquía tipográfica clara, estados pressed discretos, haptics únicamente en acciones relevantes y controles multimedia persistentes.

## Pantallas

| Pantalla | Contenido y funcionalidad principal |
|---|---|
| Inicio | Encabezado de bienvenida, estado de reproducción actual, hero de la radio activa, chips de categorías, búsqueda y lista de radios destacadas. |
| Explorar | Catálogo completo filtrable por categoría, ciudad o género; cada fila permite reproducir, marcar favorito y abrir detalle. |
| Favoritos | Radios guardadas localmente con estado vacío útil y acceso inmediato al reproductor. |
| Reproductor expandido | Portada/identidad de la radio, nombre, frecuencia, visualizador decorativo, play/pause, anterior/siguiente entre favoritas, compartir y cerrar. |
| Detalle de radio | Logo, frecuencia, ciudad, género, descripción breve, botón principal de reproducción y acción de favorito. |
| Hoja de ajustes | Preferencias de tema, comportamiento del reproductor, información de la app y nota sobre fuentes de streaming. |

## Modelo visual

La base será `#090B12` con una segunda capa `#121827`. Las superficies de vidrio usarán blanco con opacidad baja, aproximadamente `rgba(255,255,255,0.10)`, bordes `rgba(255,255,255,0.16)` y sombras suaves. El color primario será coral `#FF6B5F`, complementado por violeta `#8B7CFF`, cian `#64D8FF` y texto marfil `#F5F3EE`. Los estados secundarios usarán `#A8B0C2` y verde menta `#76E0B5` para indicar emisión activa.

El hero principal debe sentirse como una tarjeta de vidrio flotante con un halo radial coral/violeta. Los logos de las radios se representarán en mosaicos de alto contraste con iniciales o iconografía editorial para que la interfaz sea consistente incluso cuando una emisora no entregue una imagen remota estable.

## Flujos clave

### Reproducir una radio

1. El usuario abre Inicio y ve la radio activa o una selección destacada.
2. Toca una tarjeta de radio o el botón de reproducción.
3. La aplicación actualiza el reproductor persistente, muestra estado de conexión y comienza el stream cuando existe una URL válida.
4. El usuario puede expandir el reproductor para obtener controles completos.

### Buscar y guardar una radio

1. El usuario entra en Explorar y toca el campo de búsqueda.
2. Escribe el nombre de una radio, ciudad o género.
3. La lista se filtra sin abandonar la pantalla.
4. Toca el corazón para guardar o quitar la radio de Favoritos; la selección se persiste localmente.

### Continuar escuchando con la pantalla bloqueada

1. El usuario inicia una reproducción desde cualquier pantalla.
2. El reproductor mantiene una sesión de audio persistente y expone metadatos de la radio.
3. Al apagar la pantalla o salir de la aplicación, Android conserva la sesión y muestra controles del sistema cuando la configuración nativa esté disponible.
4. Play/pause desde la notificación o pantalla de bloqueo actualiza el estado visible al volver a la app.

## Decisiones técnicas

El catálogo inicial será local y tipado para evitar dependencias de backend. Los favoritos se guardarán con AsyncStorage. La reproducción usará `expo-audio` y su configuración de modo de audio; la continuidad en segundo plano y la pantalla de bloqueo dependerán de la configuración nativa final del build Android y de las capacidades del stream de cada emisora. FM Latina será una entrada destacada del catálogo.

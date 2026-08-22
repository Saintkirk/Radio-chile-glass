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


## Evolución visual premium y Android 16

La dirección recomendada es tratar la aplicación como un **dial editorial vivo**, combinando descubrimiento, identidad sonora y una carátula protagonista. La referencia funcional toma la jerarquía de descubrimiento de Spotify, la lectura directa de Deezer y la atmósfera premium de Tidal, sin copiar sus identidades. Radio Chile Glass conservará una personalidad propia basada en negro tinta, coral FM Latina, azul eléctrico y superficies de vidrio.

| Elemento | Decisión visual |
|---|---|
| Fondo | Negro tinta `#090B12` con halos radiales muy sutiles derivados del acento de la emisora activa |
| Superficies | Vidrio oscuro translúcido, borde blanco al 10–14 %, radios de 20–28 px y sombras suaves |
| Tipografía | Titulares grandes y compactos; metadatos pequeños, contrastados y espaciados |
| Acción primaria | Coral `#FF6B5F` para reproducir, pausar y estados activos |
| Acentos | Cian `#64D8FF`, menta `#76E0B5`, violeta `#8B7CFF` y amarillo `#FFD36A` |
| Carátulas | Logo oficial primero; iniciales con degradado de marca como fallback intencional |
| Movimiento | Transiciones de 180–320 ms, desaceleración suave y ausencia de rebotes excesivos |

En Android 16 conviene mantener la experiencia edge-to-edge, respetar las inserciones del sistema y basar la composición en el ancho disponible, no en una orientación fija. Esto permite adaptarse a tabletas, ventanas divididas y rotación. La transición compartida de la carátula debe convivir con predictive back: el detalle se reduce y se desplaza con el gesto, mientras el contenido evita las zonas reservadas para gestos del sistema. El desenfoque se utilizará en fondos y capas decorativas, nunca sobre texto o controles.

La experiencia debe usar animaciones expresivas pero controladas: halo de la emisora activa con baja frecuencia, ecualizador detenido cuando el audio está pausado, entrada escalonada de título y controles, y transición de carátula entre mini reproductor y detalle. `reduced motion` debe desactivar halos y desplazamientos no esenciales. El resultado buscado es una aplicación más cinematográfica que un directorio, pero con la claridad y velocidad necesarias para iniciar una radio en un solo toque.

### Logos pendientes

La cobertura de logos se reforzará con una política de tres niveles: logo oficial del dominio de la emisora, recurso público del directorio radios-chilenas.com cuando la marca coincida y fallback de iniciales cuando ninguno sea estable. Cada logo debe verificarse como imagen antes de incorporarse; una respuesta HTTP exitosa con HTML no se considerará válida. La caché persistente ya permite reutilizar imágenes confirmadas entre sesiones.

### Referencias técnicas

[1]: https://developer.android.com/about/versions/16/behavior-changes-16 "Android 16 behavior changes"
[2]: https://developer.android.com/about/versions/16/summary "Android 16 summary"
[3]: https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back "Predictive back design"

# Project TODO

- [x] Aplicación Android de radios chilenas con orientación vertical
- [x] Interfaz minimalista con glasmorfismo y fondo atmosférico
- [x] Catálogo local tipado de radios chilenas
- [x] Incluir FM Latina como radio destacada
- [x] Pantalla Inicio con radio activa y reproductor persistente
- [x] Pantalla Explorar con búsqueda y filtros
- [x] Pantalla Favoritos con persistencia local
- [x] Pantalla Detalle de radio
- [x] Reproductor expandido con controles multimedia
- [x] Reproducción con expo-audio
- [x] Configuración de audio para continuidad en segundo plano
- [ ] Metadatos y controles de pantalla de bloqueo en build Android (requiere validar APK nativo)
- [x] Feedback táctil y estados de carga/error
- [x] Generar logo personalizado y actualizar assets de branding
- [x] Actualizar app.config.ts con nombre y logo
- [x] Añadir iconos necesarios al mapa de IconSymbol
- [x] Ejecutar typecheck, lint y tests deterministas
- [x] Revisar todo el flujo de interacción y preparar checkpoint final

## Sincronización remota

- [x] Integrar fuente remota pública de radios chilenas
- [x] Normalizar y validar estaciones remotas antes de mostrarlas
- [x] Mantener FM Latina aunque la fuente remota no la devuelva
- [x] Guardar caché local del catálogo y usar fallback sin conexión
- [x] Añadir indicador de última actualización y estado de sincronización
- [x] Preservar favoritos cuando cambie el catálogo remoto
- [x] Añadir pruebas de normalización, fallback y actualización remota

## Logos remotos

- [x] Crear componente reutilizable de identidad visual de emisora
- [x] Mostrar favicon/logo remoto cuando exista
- [x] Usar iniciales y acento de marca como fallback si falta o falla la imagen
- [x] Integrar el fallback en Inicio, Explorar y Favoritos
- [x] Añadir pruebas para normalización de logos y estados de imagen

## Detalle de emisora

- [x] Crear ruta dinámica de detalle por emisora
- [x] Mostrar logo ampliado con fallback de iniciales
- [x] Mostrar frecuencia, ciudad, género y descripción
- [x] Añadir reproducción y favoritos desde el detalle
- [x] Añadir enlace a la página web oficial
- [x] Conectar las tarjetas de Inicio, Explorar y Favoritos al detalle
- [x] Validar navegación, enlace externo y estados sin homepage

## Fondo dinámico del detalle

- [x] Añadir imagen de logo como fondo ampliado y desenfocado
- [x] Aplicar overlay oscuro y gradiente para asegurar legibilidad
- [x] Mantener fallback visual cuando no exista favicon remoto
- [x] Validar el detalle en mobile y actualizar checkpoint

## Ecualizador visual

- [x] Crear componente de barras ecualizadoras animadas
- [x] Reaccionar al estado reproduciendo/pausado de la radio
- [x] Integrar el ecualizador en la pantalla de detalle
- [x] Validar animación y typecheck en mobile

## Ecualizador en mini reproductor

- [x] Añadir variante compacta del ecualizador al mini reproductor
- [x] Sincronizarlo con la radio activa y el estado de pausa
- [x] Validar que no desborde el mini reproductor en mobile

## Navegación desde mini reproductor

- [x] Abrir el detalle al tocar el contenido del mini reproductor
- [x] Mantener el botón de reproducción/pausa como acción independiente
- [x] Validar la ruta de la emisora activa y el layout móvil

## Logo en carátula del mini reproductor

- [x] Reemplazar iniciales fijas por StationLogo en la carátula compacta
- [x] Mantener fallback de iniciales y acento cuando falle el logo
- [x] Validar carga remota, navegación y layout móvil

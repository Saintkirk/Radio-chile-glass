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

## Logo en carátula principal

- [x] Mostrar StationLogo ampliado en la carátula hero de Inicio
- [x] Mantener fallback de iniciales y acento en la carátula hero
- [x] Validar contraste, composición y layout móvil

## Habilidad: pruebas y CI/CD

- [x] Documentar pirámide de pruebas para catálogo, audio, caché y navegación
- [x] Documentar mocks deterministas de red, audio, imágenes y AsyncStorage
- [x] Añadir estrategia de pruebas de integración y build Android
- [x] Añadir pipeline CI/CD con gates de typecheck, tests, lint y Expo
- [x] Documentar manejo de secretos, artefactos y fallos del pipeline
- [x] Validar la habilidad actualizada

## Estrategia push y pantalla de bloqueo

- [x] Diseñar arquitectura de controles multimedia para reproducción en segundo plano
- [x] Definir notificación persistente y acciones play/pause/stop
- [x] Definir estrategia de push para avisos editoriales opt-in
- [x] Documentar permisos Android, backend, tokens y privacidad
- [x] Definir pruebas nativas y criterios de aceptación

## Configuración de preferencias

- [x] Crear pantalla de configuración dedicada
- [x] Persistir preferencia de reproducción en segundo plano
- [x] Persistir avisos de programación y radios favoritas
- [x] Mostrar y solicitar estado de permisos de notificaciones
- [x] Añadir acceso a configuración del sistema cuando el permiso esté bloqueado
- [x] Validar estados, persistencia y layout móvil

## Selector de tema visual

- [x] Añadir opciones claro, oscuro y sistema en Ajustes
- [x] Persistir la preferencia de tema localmente
- [x] Conectar la selección con ThemeProvider
- [x] Validar legibilidad, persistencia y layout móvil

## Contraste visual en modo claro

- [x] Crear paleta adaptativa para carátula hero en modo claro
- [x] Ajustar textos, frecuencia, orb y botón sobre fondo claro
- [x] Ajustar color del ecualizador activo y reposo en modo claro
- [x] Validar contraste y composición en claro y oscuro

## Tarjetas de listado en modo claro

- [x] Crear estilos adaptativos para superficies y bordes de las tarjetas
- [x] Ajustar texto, metadatos y controles de favorito/reproducción
- [x] Mantener estados pressed y acentos de emisora legibles
- [x] Validar Inicio y Explorar en claro y oscuro

## Prueba automatizada de contraste

- [x] Crear utilidad de cálculo de contraste WCAG
- [x] Definir pares de colores de tarjetas para claro y oscuro
- [x] Probar texto principal, metadatos, controles y estados activos
- [x] Ejecutar la prueba junto con Vitest y documentar los umbrales

## Feedback visual de controles

- [x] Añadir estados pressed y foco visual a reproducción y favoritos
- [x] Mostrar estado de carga al iniciar una emisora
- [x] Añadir confirmación visual al guardar o quitar favoritos
- [x] Mantener feedback accesible en Inicio y Explorar
- [x] Validar interacción, typecheck y tests

## Toast y hápticos de favoritos

- [x] Crear toast reutilizable para confirmaciones de favoritos
- [x] Añadir impacto háptico al guardar o eliminar emisoras
- [x] Integrar feedback en Inicio y Explorar
- [x] Desactivar hápticos en web y validar accesibilidad

## Hápticos diferenciados de favoritos

- [x] Crear patrón suave para guardar emisora
- [x] Crear patrón distintivo para eliminar emisora
- [x] Conectar cada patrón con el toast correspondiente
- [x] Validar Android, iOS y web mediante mocks y typecheck

## Animación del corazón favorito

- [x] Crear componente de corazón animado reutilizable
- [x] Animar guardado y eliminación con escala suave
- [x] Integrarlo en Inicio y Explorar junto con hápticos y toast
- [x] Respetar reduced motion y validar typecheck

## Transición del mini reproductor

- [x] Crear entrada y salida animadas del mini reproductor
- [x] Coordinar opacidad y desplazamiento vertical
- [x] Respetar reduced motion y áreas seguras
- [x] Validar aparición, ocultamiento y navegación en mobile

## Expansión del mini reproductor

- [x] Definir o reutilizar la vista de reproducción a pantalla completa
- [x] Añadir transición fluida al tocar el mini reproductor
- [x] Mantener estado, logo y ecualizador sincronizados durante la expansión
- [x] Validar apertura, cierre y layout móvil

## Gesto de cierre de reproducción

- [x] Añadir gesto vertical de deslizamiento hacia abajo en el detalle
- [x] Definir umbral, resistencia y animación de cancelación
- [x] Cerrar la ruta y volver al mini reproductor al completar el gesto
- [x] Validar scroll, botón atrás y layout móvil

## Transición compartida de carátula

- [x] Añadir estado de cierre compartido entre detalle y mini reproductor
- [x] Reducir y desplazar la carátula hacia la posición inferior
- [x] Coordinar la aparición del mini reproductor con la carátula
- [x] Validar gesto, fallback y continuidad de audio

## Transición inversa de carátula

- [x] Definir el origen visual de la carátula en el mini reproductor
- [x] Expandir y desplazar la carátula al abrir el detalle
- [x] Coordinar la animación con la entrada del contenido y el mini reproductor
- [x] Validar apertura, cierre, reduced motion y continuidad de audio

## Coordenadas reales de transición

- [x] Medir posición y tamaño reales del mini reproductor
- [x] Transferir las métricas al detalle mediante parámetros de navegación
- [x] Calcular escala y desplazamiento inicial desde el origen medido
- [x] Validar distintos tamaños de pantalla y rutas de apertura

## Desvanecimiento del contenedor del mini reproductor

- [x] Medir posición y tamaño del contenedor completo
- [x] Transferir las métricas del contenedor al detalle
- [x] Coordinar el desvanecimiento con la expansión de la carátula
- [x] Validar apertura, fallback y continuidad de reproducción

## Adaptación para tabletas y orientación

- [x] Recalcular métricas al cambiar las dimensiones de la ventana
- [x] Adaptar offsets a áreas seguras y layouts amplios
- [x] Mantener la transición estable al rotar la pantalla
- [x] Validar teléfono, tableta y orientación dinámica

## Haptic de apertura del detalle

- [x] Revisar helper háptico y soporte de plataforma
- [x] Activar impacto suave al completar la transición de apertura
- [x] Respetar reduced motion y evitar duplicados
- [x] Validar typecheck, tests y lint

## Preferencia de respuesta háptica

- [x] Añadir estado persistente de hápticos
- [x] Aplicar la preferencia a los helpers de feedback
- [x] Crear interruptor accesible en Ajustes
- [x] Validar persistencia, typecheck, tests y lint

## Hápticos separados por contexto

- [x] Separar preferencias persistentes de navegación y acciones
- [x] Migrar la preferencia háptica existente sin perder la configuración del usuario
- [x] Aplicar navegación y acciones a sus respectivos helpers
- [x] Mostrar dos interruptores independientes y validar persistencia

## Toast de preferencias hápticas

- [x] Mostrar confirmación visual al guardar hápticos
- [x] Mantener el toast accesible y no dependiente de hápticos
- [x] Limpiar automáticamente la notificación breve
- [x] Validar guardado, typecheck, tests y lint

## Animación del toast

- [x] Añadir entrada animada al toast
- [x] Añadir salida animada al toast
- [x] Mantener accesibilidad y desmontaje correcto
- [x] Validar typecheck, tests y lint

## Cancelación del temporizador del toast

- [x] Guardar la referencia del temporizador activo
- [x] Cancelar el temporizador anterior antes de mostrar un nuevo mensaje
- [x] Reiniciar la duración del toast en cada guardado
- [x] Limpiar el temporizador al desmontar y validar typecheck, tests y lint

## Conectividad de emisoras

- [x] Extraer todas las URLs de streaming del catálogo
- [x] Comprobar disponibilidad y tipo de respuesta de cada stream
- [x] Verificar específicamente la conexión de FM Latina
- [x] Corregir o documentar enlaces no reproducibles y validar resultados

## Lista inicial de emisoras principales

- [x] Definir emisoras prioritarias de alcance nacional y mantener FM Latina
- [x] Verificar conexión de los streams priorizados
- [x] Reordenar la portada según la selección principal
- [x] Mantener catálogo ampliado disponible en Explorar y validar cambios

## Logos oficiales y streams definitivos

- [x] Recopilar favicon o logo oficial verificable para cada emisora editorial
- [x] Confirmar URL HTTPS de streaming y tipo de audio
- [x] Actualizar el catálogo con logos remotos y streams definitivos
- [x] Validar carga de logos, fallbacks, conectividad, typecheck, tests y lint

## Caché persistente de logos

- [x] Definir clave y formato de caché de logos
- [x] Cargar logos cacheados antes de la red
- [x] Guardar y actualizar logos remotos correctamente
- [x] Manejar expiración, errores y fallback visual
- [x] Validar carga inicial, typecheck, tests y lint

## Logo oficial de FM Latina

- [x] Sustituir el logo de FM Latina por el recurso oficial del sitio proporcionado
- [x] Verificar carga remota y conservar el fallback visual

## Ampliación de radios principales

- [x] Identificar emisoras adicionales de noticias, música, deportes y regiones
- [x] Verificar logos y streams de las nuevas emisoras
- [x] Incorporar las señales verificadas al orden inicial
- [x] Validar catálogo ampliado, filtros, typecheck, tests y lint

## Corrección de reproducción FM Latina

- [x] Extraer la URL real usada por el reproductor oficial
- [x] Comparar el stream actual con la señal web
- [x] Sustituir FM Latina por una señal compatible y verificable
- [x] Validar audio real, typecheck, tests y lint

## Radios regionales por ciudad

- [x] Añadir sección regional en Explorar
- [x] Crear búsqueda y selector de ciudades chilenas
- [x] Filtrar emisoras remotas por ciudad y disponibilidad
- [x] Conectar reproducción, favoritos y detalle
- [x] Validar estados vacíos, typecheck, tests y lint

## Auditoría individual de logos y streaming

- [x] Enumerar cada radio editorial con logo y stream configurados
- [x] Verificar cada logo como imagen válida
- [x] Verificar cada stream con audio real y formato compatible
- [x] Comparar señales con fuentes oficiales cuando sea posible
- [x] Corregir o retirar radios no verificables
- [x] Ejecutar validación final y documentar resultados por emisora

## Favoritos locales en navegador

- [x] Confirmar botón de favoritos visible y accesible
- [x] Persistir favoritos en localStorage o almacenamiento web equivalente
- [x] Mantener sincronizado el estado entre portada, detalle y Favoritos
- [x] Validar persistencia tras recarga, typecheck, tests y lint

## Correspondencia logo y streaming

- [x] Enumerar dominio oficial, logo y stream de cada emisora
- [x] Contrastar cada logo con la marca correspondiente
- [x] Contrastar cada stream con el nombre y proveedor oficial
- [x] Corregir o retirar coincidencias dudosas
- [x] Documentar y validar el catálogo final

## Fuente radios-chilenas.com

- [x] Revisar la estructura pública y categorías regionales del sitio
- [x] Extraer radios, ciudades, logos y enlaces candidatos
- [x] Verificar señales reproducibles y correspondencia de identidad
- [x] Incorporar radios regionales sin duplicar las editoriales
- [x] Adaptar búsqueda, filtros y reproducción
- [x] Validar favoritos, logos, typecheck, tests y lint

## Dirección visual premium y Android 16

- [x] Definir lenguaje visual premium inspirado en plataformas de streaming
- [x] Auditar y completar logos faltantes del catálogo
- [x] Añadir animaciones de alto impacto con reduced motion
- [x] Optimizar superficies, navegación y layouts para Android 16
- [x] Validar accesibilidad, rendimiento, typecheck, tests y lint

## Rediseño visual premium aplicado

- [x] Aplicar jerarquía visual premium visible en Inicio
- [x] Rediseñar carátula y tarjetas con lenguaje editorial de streaming
- [x] Actualizar Explorar con composición más compacta y destacada
- [x] Añadir animaciones perceptibles y respetar reduced motion
- [x] Validar visual, accesibilidad, funcionalidad, typecheck, tests y lint

## Mini reproductor persistente estilo streaming

- [x] Crear mini reproductor compartido en el layout de pestañas
- [x] Mostrar logo, nombre, estado y ecualizador de la radio activa
- [x] Añadir play/pausa y apertura del detalle
- [x] Respetar safe areas, accesibilidad y navegación entre pestañas
- [x] Validar typecheck, tests, lint y preview

## Play funcional

- [x] Auditar controles Play de Inicio, tarjetas y mini reproductor
- [x] Conectar correctamente iniciar y pausar con el reproductor global
- [x] Mostrar estados de carga, error y reproducción activa
- [x] Validar sincronización entre vistas, typecheck, tests, lint y preview

## Navegación anterior y siguiente en tarjeta hero

- [x] Añadir botones anterior y siguiente a la tarjeta principal
- [x] Recorrer la lista filtrada con navegación circular
- [x] Mantener Play independiente y sincronizar la radio destacada
- [x] Añadir etiquetas accesibles y validar typecheck, tests, lint y preview

## Tema visual inspirado en Spotify

- [x] Aplicar paleta oscura profunda con acento verde eléctrico
- [x] Ajustar tarjetas, chips, hero, navegación y mini-player al lenguaje streaming
- [x] Mantener glasmorfismo, legibilidad y controles accesibles
- [x] Validar contraste, typecheck, tests, lint, preview y checkpoint

## Navegación desde pantalla de reproducción

- [x] Añadir botones anterior y siguiente junto al control Pausar
- [x] Cambiar emisora circularmente usando el catálogo disponible
- [x] Sincronizar logo, nombre, metadatos, favoritos y audio activo
- [x] Añadir etiquetas accesibles y validar typecheck, tests, lint, preview y checkpoint

## Nitidez de logos en reproducción

- [x] Auditar recursos de baja resolución y URLs de logos
- [x] Optimizar el renderizado y escalado de StationLogo
- [x] Añadir fallback nítido cuando el recurso remoto no tenga resolución suficiente
- [x] Validar nitidez en móvil, typecheck, tests, lint, preview y checkpoint

## Iconos para navegación de emisoras

- [x] Reemplazar textos Anterior y Siguiente por iconos compactos
- [x] Mantener etiquetas accesibles y contador central
- [x] Validar visual móvil, typecheck, tests, lint, preview y checkpoint

## Gestos horizontales en carátula

- [x] Detectar deslizamiento horizontal sobre la carátula
- [x] Cambiar a emisora anterior o siguiente según la dirección
- [x] Evitar conflictos con el gesto vertical de cierre y el ScrollView
- [x] Añadir feedback accesible y validar typecheck, tests, lint, preview y checkpoint

## Transición lateral al cambiar de emisora

- [x] Añadir animación lateral suave al cambiar de emisora
- [x] Aplicarla a botones y gestos sin duplicar cambios de audio
- [x] Respetar reduced motion y sincronizar logo, texto y ecualizador
- [x] Validar typecheck, tests, lint, preview y checkpoint

## Logos HD en reproducción

- [x] Auditar logos principales ausentes o de baja resolución
- [x] Sustituir recursos por versiones oficiales HD verificables
- [x] Mantener fallback nítido cuando no exista un logo oficial adecuado
- [x] Validar carga en reproducción, typecheck, tests, lint, preview y checkpoint

## Completar logos faltantes en tarjetas

- [x] Identificar emisoras sin logo visible en la tarjeta de reproducción
- [x] Recopilar recursos oficiales HD para las emisoras faltantes
- [x] Integrar logos locales y fallback de marca sin tarjetas vacías
- [x] Validar todas las tarjetas, typecheck, tests, lint, preview y checkpoint

## Precarga de logos destacados en Inicio

- [x] Identificar las emisoras destacadas y sus recursos de logo válidos
- [x] Precargar logos al montar Inicio usando expo-image y caché memory-disk
- [x] Ejecutar la precarga sin bloquear el renderizado ni repetir solicitudes innecesarias
- [x] Validar typecheck, tests, lint, preview y checkpoint

## Auditoría adicional de logos faltantes

- [x] Enumerar las emisoras que aún muestran fallback en tarjetas
- [x] Verificar cada URL de logo y su resolución real
- [x] Añadir recursos HD locales o remotos confiables para las faltantes
- [x] Mejorar el fallback de marca y validar toda la cuadrícula
- [x] Ejecutar typecheck, tests, lint, preview y guardar checkpoint

## Auditoría completa de logos faltantes

- [x] Enumerar todas las emisoras del catálogo y detectar logos ausentes o de baja resolución
- [x] Buscar y verificar un logo oficial o HD para cada emisora pendiente
- [x] Descargar e integrar los recursos locales faltantes sin romper el bundling
- [x] Validar todas las tarjetas, fallbacks, typecheck, tests, lint y preview
- [x] Guardar checkpoint con el catálogo completo de logos

## Iluminación al pasar el cursor sobre tarjetas

- [x] Identificar el componente compartido de tarjeta de emisora
- [x] Añadir halo y elevación sutil solo en hover web
- [x] Mantener intacta la interacción táctil y la legibilidad
- [x] Validar reduced motion, typecheck, tests, lint, preview y checkpoint

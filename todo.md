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
- [x] Metadatos y controles de pantalla de bloqueo en build Android (requiere validar APK nativo)
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

## Sincronización de tarjeta hero y emisora activa

- [x] Trazar por qué anterior y siguiente cambian solo la presentación
- [x] Hacer que el cambio actualice la emisora activa y el audio global
- [x] Mantener Play, mini-player, logo y metadatos sincronizados
- [x] Validar botones, gestos, typecheck, tests, lint, preview y checkpoint

## Carrusel horizontal de portadas

- [x] Revisar la animación lateral actual y sus disparadores
- [x] Convertir el cambio de emisora en un movimiento horizontal tipo carrusel
- [x] Coordinar dirección, portada, metadatos y audio activo
- [x] Respetar reduced motion y validar typecheck, tests, lint, preview y checkpoint

## Flechas laterales y gestos táctiles móviles

- [x] Auditar controles laterales y PanResponder actuales
- [x] Integrar flechas laterales visibles sobre la carátula
- [x] Reforzar deslizamiento táctil horizontal sin conflicto con cierre vertical
- [x] Mantener accesibilidad, carrusel, audio y validar preview, pruebas y checkpoint

## Fondo estático y carrusel focalizado

- [x] Auditar las capas que actualmente heredan stationTransition
- [x] Animar solo carátula, flechas y controles de reproducción
- [x] Mantener fondo, encabezado, metadatos e información estáticos
- [x] Validar gestos, accesibilidad, typecheck, tests, preview y checkpoint

## Controles principales fijos durante el carrusel

- [x] Auditar el bloque actions que hereda stationMotionStyle
- [x] Mantener Pausar/Reproducir y Web oficial estáticos
- [x] Conservar navegación, audio, accesibilidad y validar preview, pruebas y checkpoint

## Carrusel derecha a izquierda refinado

- [x] Auditar la dirección actual del movimiento de portada
- [x] Hacer más claro el desplazamiento de derecha a izquierda al avanzar
- [x] Mantener dirección inversa al retroceder y controles fijos
- [x] Validar gestos, accesibilidad, typecheck, tests, preview y checkpoint

## Auditoría individual de logos y reproducción

- [x] Inventariar 21 emisoras editoriales y 100 entradas remotas
- [x] Verificar uno a uno los streams; mantener 112 válidos y excluir 7 endpoints Digital FM caídos
- [x] Corregir StationLogo para mostrar los 21 assets locales, incluido Oasis FM
- [x] Añadir fallback de favicon desde homepage para radios remotas sin favicon
- [x] Documentar resultados en docs/catalog-audit.md y docs/catalog-audit.json
- [x] Validar typecheck, 15 tests, lint, preview móvil y checkpoint

## Bug: Pausar/Reproducir no responde

- [x] Trazar el flujo entre currentRadio, isPlaying y expo-audio
- [x] Corregir pausa y reanudación del stream activo
- [x] Sincronizar tarjeta hero, detalle y mini-player
- [x] Añadir regresión automatizada y validar preview, lint y checkpoint

## Rediseño premium del reproductor

- [x] Auditar el layout actual y sus capas animadas
- [x] Rediseñar el fondo, portada y jerarquía visual al estilo de la referencia
- [x] Añadir control circular premium adaptado a radio en vivo
- [x] Conservar navegación, gestos, favoritos, pausa y accesibilidad
- [x] Validar móvil, typecheck, tests, lint, preview y checkpoint

## Flujo de tarjetas inspirado en iTunes

- [x] Definir tarjeta enfocada, tarjeta secundaria y comportamiento de selección
- [x] Implementar navegación horizontal con transición de portada y metadatos
- [x] Coordinar apertura del detalle, reproducción, favoritos y mini reproductor
- [x] Respetar gestos, reduced motion, accesibilidad y safe areas
- [x] Validar typecheck, tests, lint y preview móvil

## Carrusel Cover Flow inspirado en iPod touch 7.ª generación

- [x] Diseñar portada central dominante y logos anterior/siguiente en perspectiva lateral
- [x] Integrar navegación por flechas y deslizamiento horizontal con animación Cover Flow
- [x] Mantener sincronizados radio activa, audio, metadatos y mini reproductor
- [x] Validar accesibilidad, reduced motion, responsive y contraste
- [x] Ejecutar typecheck, tests, lint y preview móvil

## Fidelidad Cover Flow a referencia iPod

- [x] Hacer visible la carátula completa anterior y siguiente a ambos costados
- [x] Reemplazar el contenedor claro por escenario negro continuo tipo Cover Flow
- [x] Añadir inclinación 3D, profundidad y reflejo inferior de las carátulas
- [x] Mantener deslizamiento, flechas, audio activo y accesibilidad
- [x] Validar preview móvil, typecheck, tests y lint

## Flow Cover en pantalla de reproducción

- [x] Reutilizar la composición Flow Cover del Inicio en el detalle de emisora
- [x] Mostrar carátulas anterior y siguiente junto a la portada activa
- [x] Sincronizar carrusel, navegación, audio, metadatos y control circular
- [x] Validar gestos, accesibilidad, reduced motion y layout móvil
- [x] Ejecutar typecheck, tests, lint y preview

## Animación Slide direccional del Flow Cover

- [x] Desplazar las carátulas horizontalmente según avance o retroceso
- [x] Animar entrada, escala y opacidad de la nueva estación
- [x] Coordinar movimiento de portada, metadatos y navegación
- [x] Mantener audio, gestos, reduced motion y accesibilidad
- [x] Validar typecheck, tests, lint y preview móvil

## Corrección de carátulas laterales visibles

- [x] Ampliar el escenario del Flow Cover para mostrar ambas carátulas laterales
- [x] Evitar que la portada central oculte demasiado las emisoras vecinas
- [x] Añadir perspectiva 3D visible y reflejos laterales
- [x] Mantener Slide direccional, flechas, gestos y audio sincronizado
- [x] Validar en móvil con preview, typecheck, tests y lint

## Unificación Cover Flow Inicio–Reproductor

- [x] Reutilizar exactamente la composición de tres carátulas del Inicio en el reproductor
- [x] Igualar posiciones, escalas, perspectiva, reflejos y visibilidad lateral
- [x] Compartir la misma transición Slide direccional al cambiar de estación
- [x] Mantener sincronizados audio, metadatos, flechas, gestos y control circular
- [x] Validar preview móvil, typecheck, tests y lint

## Iluminación de carátula central

- [x] Añadir halo de luz dinámico usando el color de la emisora
- [x] Añadir reflejo diagonal y brillo de borde en la portada central
- [x] Sincronizar la respiración de luz con el estado reproduciendo
- [x] Mantener legibilidad, reduced motion y visibilidad de carátulas laterales
- [x] Validar preview móvil, typecheck, tests y lint

## Metadatos “Ahora suena”

- [x] Revisar soporte de metadatos ICY y limitaciones de expo-audio
- [x] Añadir endpoint público con timeout para leer StreamTitle
- [x] Mostrar artista y pista en el detalle de emisora
- [x] Mostrar now playing de forma compacta en el mini reproductor
- [x] Añadir fallback cuando la emisora no publica metadatos
- [x] Validar typecheck, tests, lint y preview móvil

## Catálogo ampliado y regiones

- [x] Auditar candidatos de Santiago con fuentes públicas y Radio Browser
- [x] Añadir Play FM, El Conquistador FM, Radio María Chile y Radio La Clave
- [x] Añadir clasificación automática por región para emisoras editoriales y remotas
- [x] Crear secciones regionales y filtros por las 16 regiones de Chile en Explorar
- [x] Mantener búsqueda, género, favoritos, navegación y reproducción
- [x] Validar streams candidatos, typecheck, 17 pruebas, lint y preview móvil

## Auditoría adicional de radios-chilenas.com

- [x] Revisar categorías, logos y candidatos de la fuente pública
- [x] Verificar candidatos con homepage, identidad y stream
- [x] Añadir 13C Radio, Radio La Mexicana y Radio Carnaval La Serena
- [x] Mantener los candidatos con stream 400/404 o token temporal fuera del catálogo
- [x] Documentar resultados en docs/catalog-audit.md
- [x] Validar 18 pruebas, typecheck, lint y preview móvil

## Reintento Radio Portales y Radio Recuerdos

- [x] Revisar las páginas oficiales de ambas emisoras
- [x] Encontrar y verificar el endpoint AAC de FM de Los Recuerdos
- [x] Añadir FM de Los Recuerdos con logo oficial y sección Nacional/Online
- [x] Mantener Radio Portales fuera del catálogo hasta confirmar su stream oficial
- [x] Validar 18 pruebas, typecheck, lint y preview móvil

## Exclusión de radios religiosas

- [x] Eliminar Radio María Chile del catálogo editorial
- [x] Actualizar pruebas y referencias que esperen Radio María
- [x] Validar que Explorar y el catálogo remoto no la reincorporen
- [x] Ejecutar typecheck, tests y lint

## Radio Rock & Pop y carrusel mejorado

- [x] Verificar homepage, logo y stream de Radio Rock & Pop
- [x] Añadir Radio Rock & Pop al catálogo sin duplicados
- [x] Mejorar la transición Slide con easing, profundidad y continuidad visual
- [x] Mantener gestos, flechas, audio sincronizado y reduced motion
- [x] Validar typecheck, tests, lint y preview móvil

## Igualar carrusel Inicio–Reproductor

- [x] Confirmar que Inicio y Reproductor usan el mismo componente Cover Flow
- [x] Igualar composición, escala, perspectiva, reflejos y carátulas laterales
- [x] Igualar la transición Slide y la dirección del desplazamiento
- [x] Mantener audio, flechas, gestos, metadatos y control de reproducción
- [x] Validar typecheck, tests, lint y preview móvil

## Botón de configuración de Inicio

- [x] Conectar el botón de configuración con la pantalla de Ajustes
- [x] Separar la actualización del catálogo en una acción independiente
- [x] Validar navegación, actualización del catálogo, typecheck, tests, lint y preview

## Botón de configuración de Inicio

- [x] Conectar el botón de configuración con la pantalla de Ajustes
- [x] Separar la actualización del catálogo en una acción independiente
- [x] Validar navegación, actualización del catálogo, typecheck, tests, lint y preview

## Corrección del selector de temas

- [x] Auditar aplicación inmediata de Claro, Oscuro y Sistema
- [x] Corregir persistencia y restauración de la preferencia de tema
- [x] Ajustar estilos dependientes del tema en Ajustes e Inicio
- [x] Validar cambio visual, persistencia, typecheck, tests, lint y preview

## Corrección adicional de superficie de tema

- [x] Sustituir fondos dinámicos no detectables por clases de tema tokenizadas
- [x] Validar que el fondo y el texto cambien juntos en modo Claro

## Más estaciones en el menú principal

- [x] Auditar cuántas estaciones editoriales aparecen actualmente en Inicio
- [x] Seleccionar y verificar estaciones adicionales con logo y streaming funcional
- [x] Ampliar la selección visible del menú principal sin duplicados
- [x] Validar reproducción, favoritos, filtros, typecheck, tests, lint y preview

## Dirección visual B — Chile Sunset Editorial

- [x] Definir la paleta editorial coral, ámbar y violeta
- [x] Aplicar la nueva dirección a Inicio y Cover Flow
- [x] Adaptar reproductor, mini reproductor y navegación sin perder contraste
- [x] Validar interacción, temas, typecheck, tests, lint y preview

## Adaptación a referencia visual nocturna premium

- [x] Preparar fondo atmosférico nocturno inspirado en un paisaje chileno
- [x] Ajustar cabecera, Cover Flow, reflejos y controles luminosos
- [x] Rediseñar tarjetas glassmorphism y navegación inferior activa
- [x] Alinear reproductor con la misma composición visual
- [x] Validar contraste, interacción, typecheck, tests, lint y preview

## Corrección de fidelidad visual respecto a la referencia

- [x] Hacer visibles las carátulas anterior y siguiente como tarjetas completas
- [x] Ajustar escala, solapamiento y perspectiva de las tres carátulas
- [x] Reforzar tema oscuro cinematográfico, reflejos y controles luminosos
- [x] Validar navegación lateral, gestos, contraste, typecheck, tests, lint y preview

## Skills externas de Saintkirk

- [x] Revisar la estructura del repositorio indicado
- [x] Evaluar animate-expo y skills de diseño relevantes
- [x] Documentar recomendaciones aplicables sin ejecutar contenido no confiable

## Rotación 3D del carrusel

- [x] Añadir rotación 3D direccional al cambiar de emisora
- [x] Sincronizar rotación con desplazamiento horizontal y perspectiva
- [x] Mantener gestos, flechas, reduced motion y accesibilidad
- [x] Validar typecheck, tests, lint y preview

## Revisión de taste-skill

- [x] Inspeccionar el repositorio Saintkirk/taste-skill
- [x] Evaluar sus principios de diseño para Radio Chile Glass
- [x] Documentar recomendaciones y decidir integración segura

## Mejoras seleccionadas 1/2/3

- [x] Auditar el Cover Flow con los criterios de taste-skill
- [x] Generar referencias visuales móviles adicionales para Android
- [x] Migrar la animación crítica del carrusel a Reanimated
- [x] Validar rendimiento, reduced motion, typecheck, tests, lint y preview

## Revisión de impeccable

- [x] Inspeccionar el repositorio Saintkirk/impeccable
- [x] Evaluar prácticas aplicables a la interfaz móvil
- [x] Documentar recomendaciones y límites de integración

## Mejoras seleccionadas de impeccable

- [x] Auditar el reproductor expandido con criterios de UX y diseño
- [x] Añadir pruebas para streams caídos, logos ausentes y textos largos
- [x] Crear DESIGN.md con la identidad visual compartida
- [x] Validar robustez, typecheck, tests, lint y preview

## Mejoras seleccionadas 1/2/3 — integración final

- [x] Extender DESIGN.md y tokens visuales a Explorar y Favoritos
- [x] Añadir pruebas de interacción para reproducción y favoritos
- [x] Documentar y preparar validación Android de audio en segundo plano y pantalla de bloqueo
- [x] Validar typecheck, tests, lint y preview

## Mejoras seleccionadas 1/2/3 — reproducción y validación Android

- [x] Añadir estado visual de reconexión y error recuperable para streams caídos
- [x] Añadir pruebas de navegación y reproducción del reproductor
- [x] Preparar checklist ejecutable para audio en segundo plano y pantalla de bloqueo Android
- [x] Validar typecheck, tests, lint y preview

## Mejoras seleccionadas 1/2/3 — reconexión avanzada y validación

- [x] Implementar reintentos progresivos limitados para streams caídos
- [x] Ampliar pruebas de navegación entre Inicio, Explorar, Favoritos y Reproductor
- [x] Preparar validación Android de audio en segundo plano y pantalla de bloqueo
- [x] Validar typecheck, tests, lint y preview

## Validación development build Android

- [x] Verificar configuración nativa, permisos y reproducción en segundo plano
- [x] Preparar protocolo de prueba de pantalla de bloqueo en dispositivo físico
- [x] Validar typecheck, tests y lint antes del build
- [x] Entregar instrucciones para generar el build desde Publish/Build

## GitHub Actions para Android

- [x] Crear workflow de CI para typecheck, tests y lint
- [x] Crear workflow de EAS para generar y publicar el APK como artefacto
- [x] Documentar configuración de EXPO_TOKEN y ejecución manual o por tags
- [x] Validar workflows, script de descarga y proyecto

## Conexión GitHub y build preview

- [x] Revisar archivos sensibles antes de publicar el repositorio
- [x] Crear un repositorio privado y conectar el proyecto local
- [x] Publicar el código y verificar que los workflows estén disponibles
- [x] Dejar instrucciones para añadir EXPO_TOKEN y ejecutar preview

## Conexión con GitHub del usuario

- [x] Inspeccionar repositorios accesibles y permisos de escritura
- [x] Conectar Radio Chile Glass al repositorio destino
- [x] Publicar workflows y verificar su disponibilidad

## Repositorio nuevo confirmado

- [x] Conectar el remoto de GitHub al nuevo repositorio radio-chile-glass
- [x] Publicar la rama principal y los workflows
- [x] Verificar los archivos publicados y entregar el enlace
<<<<<<< HEAD

## Corrección de CI de GitHub Actions

- [x] Identificar el job y mensaje exacto de la ejecución fallida de CI
- [x] Reproducir localmente el fallo de CI
- [x] Aplicar una corrección mínima al workflow o al proyecto
- [x] Validar typecheck, tests y lint localmente
- [x] Publicar la corrección y verificar una ejecución exitosa de CI

## Actualización de GitHub Actions a Node.js 24

- [x] Auditar las versiones de actions/checkout, setup-node y pnpm/action-setup
- [x] Actualizar workflows y documentación para evitar acciones basadas en Node.js 20
- [x] Validar sintaxis y ejecución exitosa de CI tras la actualización

## Controles multimedia en pantalla de bloqueo

- [x] Revisar la API nativa de expo-audio para lock screen y servicio multimedia Android
- [x] Activar metadatos de emisora, artwork remoto y acciones play/pausa en AudioPlayer
- [x] Sincronizar los cambios de reproducción originados desde los controles del sistema
- [x] Respetar la preferencia de reproducción en segundo plano y limpiar la sesión al cambiar de emisora
- [x] Añadir prueba determinista de metadatos y ampliar el checklist Android
- [ ] Validar controles en pantalla de bloqueo con un APK instalado en un dispositivo Android físico

## Metadatos ICY dinámicos en pantalla de bloqueo

- [x] Reutilizar el endpoint ICY existente con consulta periódica y cancelación segura
- [x] Actualizar título, artista y artwork de la sesión multimedia sin reiniciar el audio
- [x] Mantener fallback de emisora cuando no exista StreamTitle
- [x] Añadir pruebas deterministas para metadatos disponibles y ausentes
- [x] Validar typecheck, tests, lint, documentación y CI
- [ ] Validar visualmente los metadatos en un APK Android físico

## Listener nativo de foco de audio Android

- [x] Definir eventos para pérdida permanente, pérdida transitoria, ducking y recuperación
- [x] Crear módulo Android con AudioManager.OnAudioFocusChangeListener
- [x] Exponer eventos y request/abandon focus al puente JavaScript
- [x] Integrar pausa, ducking y recuperación manual con RadioPlayer
- [x] Añadir pruebas deterministas del contrato de eventos y documentar la matriz de interrupciones
- [x] Validar typecheck, tests, lint y CI; APK Android físico pendiente

## Corrección del build EAS

- [x] Configurar un `projectId` estable de Expo/EAS para el proyecto
- [x] Actualizar `app.config.ts` y `eas.json` para build no interactivo
- [x] Ajustar el workflow Android APK y validar la configuración local
- [ ] Ejecutar CI y build EAS de prueba hasta obtener un artefacto APK

## Diagnóstico de cierre Android

- [x] Diagnosticar el cierre inesperado de Radio Chile Glass en Android a partir de logs y configuración nativa
- [x] Aplicar una corrección de arranque/audio y añadir una prueba de regresión
- [x] Generar y verificar un nuevo APK Android después de la corrección

## Segundo cierre Android reportado

- [ ] Obtener o reproducir el stack trace nativo del APK corregido
- [ ] Identificar y corregir la causa restante del cierre al iniciar Android
- [ ] Generar y verificar otro APK con instalación limpia

## Diagnóstico sin computador

- [ ] Revisar y endurecer todos los puntos nativos del arranque sin requerir acciones externas del usuario
- [ ] Generar una versión simplificada del APK para instalación directa desde el teléfono

## APK ligera y CI/CD rápido

- [x] Medir el tamaño actual de la APK y el tiempo de cada fase del pipeline
- [x] Reducir peso de dependencias, assets y arquitecturas sin perder reproducción ni glasmorfismo
- [x] Optimizar EAS y CI/CD con caché, validaciones rápidas y límites de tiempo seguros
- [x] Generar y verificar una APK optimizada desde el commit correcto de GitHub

## Renovación visual inspirada en referencia

- [x] Documentar el sistema visual oscuro premium y la jerarquía de la pantalla Inicio
- [x] Ajustar Cover Flow para mostrar emisoras anterior y siguiente con profundidad visible
- [x] Rediseñar tarjetas, controles, fondos y navegación inferior con glassmorfismo premium
- [x] Verificar responsive móvil, contraste, interacción y regresiones

## Corrección Cover Flow en reproducción

- [x] Auditar la tarjeta expandida y localizar la divergencia con el Cover Flow de Inicio
- [x] Unificar animación horizontal, capas laterales y navegación por gesto
- [x] Validar la transición en móvil, reduced motion y controles de reproducción

## Limpieza de warnings de CI/CD

- [x] Declarar explícitamente el modo ESM de Node para eliminar el warning de ESLint
- [x] Actualizar subdependencias obsoletas de pnpm sin romper Expo SDK 54
- [x] Ajustar la configuración del workflow para eliminar el warning de PNPM_HOME
- [x] Validar seguridad, tests, typecheck, lint y build desde GitHub

## Evaluación de actualización Expo

- [x] Auditar la versión Expo actual y el árbol de subdependencias heredadas
- [x] Comparar versiones objetivo y compatibilidad con módulos Android usados
- [x] Estimar impacto en audio, navegación, EAS, tamaño y tiempo de build
- [x] Documentar una recomendación reversible sin migrar todavía

## Corrección ESM de Metro para APK

- [x] Convertir metro.config.js a una configuración compatible con el modo ESM
- [x] Validar Expo/Metro, typecheck, tests y lint después del cambio
- [x] Regenerar el APK y confirmar que el workflow Android termina correctamente

## Reproducción única y controles multimedia

- [x] Garantizar que al cambiar de emisora se detenga y libere el stream anterior
- [x] Mantener sincronizados emisora activa, mini reproductor y pantalla bloqueada
- [x] Añadir acciones anterior/siguiente a los controles multimedia Android
- [x] Validar reproducción única, navegación y regresiones de audio

## Tarjeta estable y carrusel aislado

- [x] Mantener montado el contenedor completo de la tarjeta durante el cambio
- [x] Evitar claves o estados que reinicien fondo, controles y metadatos
- [x] Animar únicamente el carrusel Cover Flow horizontal
- [x] Validar estabilidad visual, gestos y reproducción

## APK actualizado de tarjeta estable

- [x] Publicar en GitHub la revisión 02b3e1d3 de la tarjeta estable
- [x] Ejecutar el workflow Android APK desde la revisión correcta
- [x] Recuperar y verificar el artefacto APK actualizado

## Reporte integral de pruebas del reproductor

- [x] Redactar matriz manual Android para reproducción, navegación y estabilidad
- [x] Documentar pruebas de segundo plano, pantalla bloqueada, foco y metadatos ICY
- [x] Documentar pruebas automatizadas, evidencias, severidades y criterios de aceptación

## Corrección de navegación y reproducción única

- [x] Garantizar que el stream anterior se detenga y libere antes de iniciar el siguiente
- [x] Sincronizar cambio de emisora entre Inicio, tarjeta principal y mini reproductor
- [x] Añadir navegación anterior/siguiente al mini reproductor
- [x] Conectar anterior/siguiente de emisora con los controles multimedia de Android
- [x] Añadir pruebas deterministas para no superponer streams y navegar estaciones

## Bloqueo en pantalla de arranque del APK

- [x] Identificar por qué el APK queda detenido en la pantalla de splash
- [x] Validar configuración de splash, entrada de Expo Router y carga inicial
- [x] Corregir el bloqueo sin perder reproducción en segundo plano ni controles multimedia
- [x] Generar y verificar un APK que llegue a Inicio correctamente

## Indicador de carga al cambiar de emisora

- [x] Mostrar estado de buffering sobre la carátula central durante la conexión
- [x] Mantener visible el estado de carga en el mini reproductor sin cambiar su tamaño
- [x] Diferenciar carga, reproducción, pausa y error de conexión
- [x] Validar accesibilidad, reduced motion, typecheck, tests y lint

## Generación del APK con buffering

- [x] Ejecutar el workflow Android desde main con el indicador de buffering
- [x] Verificar que el workflow termine correctamente y descargar el APK
- [x] Entregar el APK actualizado para instalación en Android

## Bloqueo persistente del APK y mejora del build

- [ ] Reproducir o aislar por qué el APK instalado permanece en el logo
- [ ] Revisar logs de arranque y eliminar inicializaciones nativas bloqueantes
- [x] Fortalecer CI/CD con validación de configuración, bundle y artefacto APK
- [ ] Generar un APK de prueba y documentar exactamente la validación pendiente en dispositivo

## Workflow Android nativo con Gradle

- [x] Crear workflow GitHub Actions sin EAS usando Expo prebuild y Gradle
- [x] Configurar Java, Android SDK, caché de Gradle y dependencias reproducibles
- [x] Validar integridad, versión, paquete y procedencia del APK generado
- [x] Ejecutar el workflow nativo y documentar el tipo de firma del APK

## Nuevo APK de validación

- [x] Ejecutar el workflow Android APK (Native Gradle) desde main
- [x] Confirmar que todos los gates y Gradle terminen correctamente
- [x] Descargar y verificar el APK con hash, versión y procedencia
- [x] Entregar el APK para prueba real en el dispositivo Android

## Restauración de controles multimedia Android

- [x] Diagnosticar por qué el APK nativo no muestra notificación ni reproductor de pantalla bloqueada
- [x] Restaurar la sesión multimedia y la notificación persistente sin bloquear el arranque
- [x] Sincronizar play, pausa, detener, anterior, siguiente y metadatos
- [x] Validar permisos, servicio foreground y compilación nativa
- [x] Generar APK corregido
- [ ] Instalarlo y documentar la prueba en dispositivo Android

## Bloqueo persistente al restaurar MediaSession

- [x] Obtener evidencia del fallo de arranque del APK actual y comparar con la versión estable
- [x] Aislar la inicialización de `expo-audio` y MediaSession fuera del arranque del layout raíz
- [x] Validar que la app llegue a Inicio antes de activar controles multimedia
- [x] Generar un APK de diagnóstico/reparado
- [ ] Documentar la prueba en dispositivo Android

## Registro local de errores y arranque

- [ ] Crear modelo persistente de eventos de arranque y errores con límite de tamaño
- [ ] Registrar estados de inicialización, catálogo, audio, MediaSession y errores globales
- [ ] Añadir panel de diagnóstico accesible desde Inicio con detalle y copia/limpieza local
- [ ] Evitar datos sensibles y confirmar persistencia, accesibilidad y pruebas

## Fallback explícito del splash

- [x] Ocultar el splash al montar el layout raíz
- [x] Añadir un timeout global de respaldo para evitar bloqueo indefinido en el logo
- [x] Validar Expo config, export Android, typecheck, tests y lint
- [ ] Confirmar el arranque del APK nuevo en un dispositivo Android

## Controles multimedia activos y respuesta táctil

- [x] Exponer anterior/siguiente como acciones de estación en Android
- [x] Asegurar que los botones multimedia aparezcan habilitados en notificación y pantalla bloqueada
- [x] Reducir latencia percibida al tocar play, anterior/siguiente y cambiar emisora
- [x] Suavizar la transición del Cover Flow sin retrasar la selección real
- [ ] Validar reproducción única, foco, background, pantalla bloqueada y build nativo

## Propuestas de logo y pantalla inicial

- [x] Crear propuestas de logo minimalista premium para Radio Chile Glass
- [x] Revisar legibilidad del símbolo como icono Android y splash
- [x] Seleccionar y aplicar la propuesta al icono, splash, favicon y adaptive icon
- [x] Actualizar logoUrl y branding en app.config.ts
- [x] Validar que el logo aparezca al abrir la aplicación y preparar checkpoint

## Generación de APK con Antena Glass

- [x] Confirmar la revisión y el workflow nativo de Android
- [x] Ejecutar la compilación de la APK actualizada
- [x] Verificar integridad, paquete, versión, tamaño y hash del artefacto
- [x] Entregar la APK e instrucciones de instalación desde el teléfono

## Corrección Carolina y controles multimedia Android

- [x] Auditar y corregir el stream real de Radio Carolina
- [x] Evitar mostrar “En reproducción” si el stream no abrió audio
- [x] Habilitar anterior/siguiente como acciones de emisora en bloqueo y notificación
- [x] Mostrar logo y metadatos de la emisora en MediaSession y notificación
- [x] Validar reproducción única, controles y build Android en dispositivo

## Persistencia multimedia fuera de la app

- [x] Auditar la sesión duplicada de expo-audio y RadioMediaControls
- [x] Mantener la notificación mediante servicio foreground multimedia
- [x] Evitar que anterior/siguiente abra la interfaz desde bloqueo
- [x] Añadir guía y acceso a ajustes de notificaciones/ahorro de batería
- [x] Validar reproducción con pantalla apagada y fuera de la app en APK Android

## Nueva APK instalable

- [x] Sincronizar la revisión del servicio foreground con GitHub
- [x] Ejecutar el workflow Android nativo
- [x] Descargar y verificar el APK generado
- [x] Entregar el APK y checkpoint actualizado

## Cambio de emisora desde bloqueo y notificación

- [x] Evitar que anterior/siguiente cierre la actividad o elimine la notificación
- [x] Mantener MediaSession y controles visibles durante el cambio
- [x] Hacer que la nueva emisora reproduzca automáticamente al completar la conexión
- [x] Sincronizar estado loading/playing/error entre servicio, bloqueo y app
- [x] Validar cambio fuera de la app y generar APK actualizada

## Sincronización atómica del reproductor

- [x] Actualizar logo y nombre de bloqueo/notificación sin desfase
- [x] Eliminar controles de desplazamiento que no corresponden a emisoras
- [x] Mantener fija la superficie del reproductor durante el cambio
- [x] Garantizar auto-play al completar la conexión de la nueva emisora
- [x] Validar sesión multimedia, estado y APK Android

## Entrega directa de APK

- [x] Comprobar el artefacto APK final de la última corrección
- [x] Entregar la APK para instalación en Android

## Corrección visual de emisora activa en Android

- [x] Evitar que el logo de la carátula difiera del nombre de la emisora
- [x] Sincronizar carátula central, título, frecuencia, índice y mini reproductor
- [x] Reducir el solapamiento de carátulas laterales en pantallas estrechas
- [x] Añadir espacio seguro inferior para no invadir la navegación del sistema
- [x] Validar la captura visual y generar APK corregida

## Corrección confirmada por capturas Android

- [x] Hacer atómica la identidad de emisora entre carátula, nombre, frecuencia y MediaSession
- [x] Evitar que el mini reproductor cubra el título y los indicadores del Cover Flow
- [x] Alinear los controles Anterior, Play y Siguiente con la emisora activa
- [x] Validar nuevamente la pantalla bloqueada y la notificación tras cambiar de emisora

## Correcciones posteriores de pantalla bloqueada y notificación

- [x] Reducir el retardo del artwork en pantalla bloqueada y notificación
- [x] Garantizar un logo visible para Radio Oasis en todas las superficies
- [x] Derivar Play/Pause desde un estado de reproducción único y actualizado
- [x] Evitar cierres y estados colgados al cambiar a un stream que no responde
- [x] Validar cambios rápidos desde notificación, bloqueo y Inicio en APK nativa

## Auditoría de notificación y catálogo completo

- [x] Evitar que una acción de notificación cierre la app si el stream falla
- [x] Abrir desde la notificación directamente la ruta de la radio activa
- [x] Garantizar fallback de logo en el reproductor y MediaSession
- [x] Auditar todos los streams editoriales y regionales por respuesta y formato
- [x] Identificar y corregir las tres emisoras con audio distorsionado
- [x] Validar cambios rápidos, logos y reproducción en APK nativa

## Deep link de notificación a reproducción

- [x] Auditar la ruta actual que abre la notificación
- [x] Dirigir el PendingIntent a la pantalla /radio/{id} de la emisora activa
- [x] Manejar el deep link con la app fría o ya abierta
- [x] Validar que la radio activa, sus metadatos y el mini reproductor permanezcan sincronizados
- [x] Ejecutar typecheck, tests, lint y build Android nativo

## Reproducción automática al abrir

- [x] Persistir el ID de la última emisora reproducida localmente
- [x] Recuperar la última emisora válida al montar el proveedor
- [x] Reproducir automáticamente la última emisora o la emisora inicial como fallback
- [x] Evitar bloqueo o cierre si el stream inicial falla
- [x] Validar autoplay, persistencia, typecheck, tests, lint y build Android

## Verificación de arranque sin conexión

- [x] Confirmar que loadCatalog usa caché o catálogo local sin red
- [x] Confirmar selección de última emisora y fallback a la inicial sin red
- [x] Confirmar que un stream inaccesible muestra error recuperable sin bloqueo
- [x] Añadir o ejecutar prueba determinista del flujo offline
- [x] Documentar resultado y guardar checkpoint si se requieren cambios

## Arranque con emisora guardada

- [x] Verificar recuperación del ID guardado localmente
- [x] Confirmar que el ID guardado se resuelve contra el catálogo actual
- [x] Confirmar que la emisora guardada se selecciona antes del fallback inicial
- [x] Validar que el autoplay inicia la emisora guardada sin duplicar reproductores
- [x] Ejecutar pruebas y documentar el resultado

## Prueba de autoplay con emisora alternativa

- [x] Preparar escenario con una emisora guardada distinta a FM Latina
- [x] Confirmar recuperación y selección de la emisora alternativa
- [x] Confirmar que el autoplay usa la emisora alternativa sin duplicar reproductores
- [x] Verificar coherencia entre radio activa, logo, nombre y controles
- [x] Documentar resultado de la prueba

## Logo de Carolina durante autoplay

- [x] Auditar si Carolina tiene un recurso local o solo remoto
- [x] Evitar que el logo dependa de la primera respuesta de red al arrancar
- [x] Mostrar fallback estable mientras carga el artwork
- [x] Validar que logo, nombre y emisora activa aparezcan sincronizados
- [x] Ejecutar pruebas y documentar el resultado

## Play/Pause inicial de Radio Carolina

- [x] Auditar el estado visual inicial antes de crear el reproductor
- [x] Confirmar que autoplay publica Play/Pause de forma determinista
- [x] Evitar que buffering inicial revierta un estado de reproducción válido
- [x] Verificar coherencia entre proveedor, mini reproductor y MediaSession
- [x] Ejecutar pruebas y documentar el resultado

## Sincronización Play/Pause nativa

- [x] Auditar el mapeo de acciones de notificación y pantalla de bloqueo
- [x] Confirmar que Play actualiza el proveedor y la MediaSession
- [x] Confirmar que Pause actualiza el proveedor y la MediaSession
- [x] Confirmar reanudación y detención sin estados visuales divergentes
- [x] Ejecutar pruebas y documentar el resultado

## APK para validación física

- [x] Validar el proyecto antes del build Android
- [x] Generar APK nativa con la sincronización Play/Pause actualizada
- [x] Descargar y verificar integridad del APK
- [x] Entregar el archivo instalable y documentar la prueba física sugerida

## Artwork atómico en notificación y pantalla de bloqueo

- [x] Invalidar inmediatamente el bitmap anterior al cambiar de emisora
- [x] Evitar que una descarga tardía de Carolina reemplace el logo de Futuro
- [x] Mostrar fallback de la nueva emisora mientras carga su artwork
- [x] Mantener logo, título, frecuencia y estado sincronizados en MediaSession
- [x] Validar cambios rápidos y generar APK corregida

## Caché instantánea de logos frecuentes

- [x] Definir el conjunto de emisoras frecuentes y sus claves de caché
- [x] Precargar logos locales o remotos al iniciar la aplicación
- [x] Persistir los logos descargados por radioId sin mezclar emisoras
- [x] Integrar la caché en carátulas, mini reproductor y MediaSession
- [x] Validar transiciones instantáneas, expiración y fallbacks

## Entrega de APK con caché de logos

- [ ] Publicar el commit que incluye la caché local de logos
- [ ] Compilar la APK Android actualizada
- [ ] Descargar y verificar el APK
- [ ] Entregar la APK y documentar la prueba física

## Botón de navegación y sección Romántica

- [x] Hacer visible el icono del botón circular superior izquierdo
- [x] Confirmar que el botón navegue correctamente hacia atrás
- [x] Revisar el filtro y etiqueta de género Romántica
- [x] Confirmar logos correctos para Imagina y emisoras románticas laterales
- [x] Validar la pantalla de reproducción en Android

## Chip Romántica recortado en Android

- [x] Permitir desplazamiento horizontal completo del carril de géneros
- [x] Mantener el chip Romántica completamente visible al seleccionarlo
- [x] Añadir margen final seguro para el último chip
- [x] Validar que el mini reproductor no interfiera con el carril

## Alineación visual con mockup de referencia

- [x] Reestructurar Inicio para usar fondo fotográfico a pantalla completa y encabezado compacto tipo Android
- [x] Ajustar Cover Flow para una carátula central grande con emisoras laterales visibles
- [x] Rediseñar tarjetas de emisoras con estética premium, acentos por marca y controles claros
- [x] Elevar la navegación inferior y conservar el mini reproductor sin solapamientos
- [x] Validar composición en viewport móvil 9:16 y ejecución de pruebas


## Ajuste final del Cover Flow sobre fondo

- [x] Eliminar el panel negro envolvente y dejar el carrusel flotando sobre el fondo
- [x] Validar el cambio visual en viewport móvil y repetir typecheck, lint y 37 pruebas Vitest


## Transición suave del Cover Flow

- [x] Animar el desplazamiento horizontal de las carátulas al deslizar
- [x] Mantener fondo, controles y estado de reproducción estables durante la transición
- [x] Validar reducción de movimiento, gesto táctil y pruebas automatizadas


## Crossfade entre emisoras

- [x] Añadir una transición de volumen cancelable entre la emisora anterior y la nueva
- [x] Evitar solapamientos, fugas de reproductores y estados inconsistentes durante cambios rápidos
- [x] Validar autoplay, errores de stream, segundo plano y controles de pantalla bloqueada
- [x] Añadir pruebas deterministas para la secuencia de crossfade


## Indicador de buffering en carátula

- [x] Mostrar un ecualizador animado mientras la emisora nueva está almacenando en búfer
- [x] Diferenciar buffering, reproducción confirmada y error sin mover el logo ni los controles
- [x] Validar accesibilidad, reducción de movimiento y pruebas del estado de carga


## Optimización de rendimiento visual

- [x] Reducir renders y recreación de estilos durante gestos del Cover Flow
- [x] Mantener transformaciones y opacidades en el hilo nativo de Reanimated
- [x] Evitar recargas o transiciones innecesarias de logos al cambiar rápidamente
- [x] Validar la fluidez en viewport móvil y repetir typecheck, lint y pruebas


## Regresiones reportadas: audio y Cover Flow

- [x] Diagnosticar por qué las emisoras no reproducen en la vista actual
- [x] Restaurar el efecto visual del Cover Flow y el cambio de carátulas
- [x] Validar reproducción real, cambio rápido, buffering y controles nativos


## Alineación estética con referencia vertical

- [x] Hacer visible el fondo de Santiago a pantalla completa y ajustar el contraste
- [x] Convertir el Cover Flow en una composición de pósteres verticales con laterales inclinados
- [x] Añadir bordes luminosos, reflejos y proporciones más cercanas al mockup
- [x] Ajustar cabecera, espaciado y controles para una composición móvil 9:16
- [x] Validar que la estética no rompa gestos, reproducción ni controles funcionales


## Corrección de Radio Cooperativa

- [x] Encontrar y validar una URL pública de streaming que responda como audio
- [x] Actualizar el catálogo manteniendo el ID, logo y metadatos de Cooperativa
- [x] Probar reproducción, buffering, crossfade y controles nativos de la emisora

## Regresión de navegación del Cover Flow

- [x] Restablecer el cambio real de emisora desde gesto y botones anterior/siguiente
- [x] Sincronizar el índice visual, la carátula central y `playRadio` en cada navegación
- [x] Implementar arrastre con inercia, encaje y transición continua tipo Cover Flow
- [x] Validar cambios rápidos, crossfade, buffering y controles nativos

## Refinamiento cinemático del Cover Flow

- [x] Hacer que la carátula central y las laterales sigan el dedo de forma proporcional
- [x] Ajustar perspectiva, escala, opacidad e inercia para una profundidad tipo Cover Flow
- [x] Afinar el umbral de velocidad y el encaje al centro sin perder la selección de emisora
- [x] Validar reducción de movimiento, botones y cambios rápidos en móvil

## Inercia y encaje de alta precisión

- [x] Calcular el destino de la salida según velocidad y distancia del gesto
- [x] Aplicar desaceleración gradual antes del encaje de la carátula siguiente
- [x] Limitar cada gesto a un cambio de emisora y cancelar rebotes obsoletos
- [x] Validar flicks rápidos, arrastres cortos y reducción de movimiento

## Biblioteca lateral de Cover Flow

- [x] Mostrar varias carátulas reales a ambos lados de la estación activa
- [x] Aplicar escala, perspectiva, opacidad y orden visual por profundidad
- [x] Conservar selección, gestos, botones e inercia al navegar la biblioteca
- [x] Validar composición 9:16 y rendimiento de logos precargados

## Reflejos y sombras 3D del Cover Flow

- [x] Añadir sombra de contacto bajo cada carátula para anclarla al escenario
- [x] Añadir reflejo inferior recortado con opacidad y degradado visual
- [x] Mantener reflejo y sombra sincronizados con perspectiva y navegación
- [x] Validar legibilidad, reducción de movimiento y rendimiento móvil

## Reflejos y sombras 3D del Cover Flow

- [x] Añadir sombra de contacto bajo cada carátula para anclarla al escenario
- [x] Añadir reflejo inferior recortado con opacidad y degradado visual
- [x] Mantener reflejo y sombra sincronizados con perspectiva y navegación
- [x] Validar legibilidad, reducción de movimiento y rendimiento móvil

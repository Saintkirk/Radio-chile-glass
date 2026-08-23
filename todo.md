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

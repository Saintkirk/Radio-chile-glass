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

# Revisión visual — tema premium Radio Chile Glass

## Referencia aplicada

La dirección visual se define como **dark Chilean radio glassmorphism**: base casi negra, aurora coral/violeta, superficies translúcidas, acentos rojos de señal y Cover Flow con profundidad.

## Cambios verificados

La pantalla Inicio ahora inicia en modo oscuro para coincidir con la referencia. Se integró un fondo vertical de Santiago al atardecer con una capa oscura para proteger la legibilidad. La cabecera conserva menú, wordmark y acción de ajustes; la búsqueda y los filtros se mantienen como superficies de vidrio. El Cover Flow muestra la emisora activa en el centro y las anteriores/siguientes a los costados, con reflejo, brillo y controles laterales.

Se corrigió una inconsistencia detectada en la revisión: la barra inferior usaba la paleta clara aunque el contenido estaba en oscuro. `useColors` ahora consume `ThemeProvider`, por lo que Inicio, Explorar, Favoritos y Ajustes reciben el mismo esquema visual.

## Validación

TypeScript, Vitest y lint pasan. El preview móvil muestra una composición consistente con la referencia: fondo negro, acentos coral/violeta, navegación inferior oscura y tarjetas de emisoras con controles accesibles.

## Pendiente de validación física

La reproducción, el segundo plano y la pantalla de bloqueo deben comprobarse en el APK Android instalado en un teléfono real. El preview web no valida APIs nativas.

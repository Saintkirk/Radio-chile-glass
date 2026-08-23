# Radio Chile Glass — Design System

## Design read

Radio Chile Glass es una experiencia móvil Android para escuchar emisoras chilenas con una dirección nocturna, musical y premium. El público principal busca descubrir una señal rápidamente, reconocer su identidad visual y controlar la reproducción con una sola mano.

## Dials

| Variable | Valor | Decisión |
|---|---:|---|
| Variación visual | 8/10 | Cover Flow asimétrico, carátulas editoriales y fondos atmosféricos. |
| Intensidad de movimiento | 6/10 | Desplazamiento y rotación 3D perceptibles, sin movimiento permanente innecesario. |
| Densidad visual | 4/10 | Una emisora dominante y listas secundarias aireadas. |

## Paleta

| Token | Valor | Uso |
|---|---|---|
| Fondo nocturno | `#090A10` | Escenario del Cover Flow y reproductor expandido. |
| Superficie glass | `rgba(255,255,255,0.08)` | Tarjetas elevadas y controles secundarios. |
| Texto principal | `#F5F3EE` | Títulos y acciones primarias sobre fondo oscuro. |
| Texto secundario | `#B7C0D0` | Frecuencias, géneros y metadatos. |
| Coral activo | `#FF6B5A` | Estado activo, Live, favoritos y navegación. |
| Violeta ambiental | `#7B4DAB` | Halo atmosférico secundario, nunca como CTA principal. |
| Verde conexión | `#1ED760` | Estado de reproducción/conexión cuando corresponda. |

## Pantallas

**Inicio** prioriza el Cover Flow, la búsqueda, filtros por género, emisoras destacadas y el estado del catálogo. **Explorar** organiza el catálogo nacional y regional por ciudad, región y género. **Favoritos** muestra las emisoras guardadas localmente. **Ajustes** concentra tema, audio, notificaciones y hápticos. **Reproductor expandido** muestra la portada, metadatos, controles, enlace oficial y descripción de la emisora.

## Componentes y reglas

El Cover Flow usa tres ranuras estables: una carátula central dominante y dos carátulas laterales completas. La navegación debe mover `transform` y `opacity`, no layout. El cambio de emisora se confirma una sola vez al terminar el gesto. Las flechas y el gesto deben producir el mismo resultado.

Las tarjetas deben comunicar elevación sin anidar superficies innecesariamente. El borde interior claro y la sombra tintada sugieren vidrio; el fondo atmosférico debe permanecer bajo contraste para no competir con el logo. Los botones táctiles deben mantener al menos 48 dp en Android y mostrar feedback de presión visible.

## Tipografía y contenido

Los títulos usan sans display con peso semibold o bold y tracking ligeramente cerrado. Las etiquetas de estado usan mayúsculas solo cuando funcionan como señal breve, con tracking positivo. Las descripciones largas se limitan visualmente para evitar que desplacen los controles principales. Todo logo significativo debe tener una etiqueta accesible y un fallback de iniciales.

## Movimiento y accesibilidad

La finalidad del Cover Flow es **consistencia espacial**: el usuario entiende que está navegando entre emisoras vecinas. La animación usa Reanimated, perspectiva fija, rotación Y direccional, easing suave y duración cercana a 460 ms para la transición editorial. Reduced motion elimina rotación, parallax y escala exagerada, conservando cambios de estado y opacidad.

## Estados obligatorios

Cada emisora debe soportar carga, reproducción, pausa, stream no disponible, logo ausente, homepage ausente, catálogo sin conexión, búsqueda sin resultados y textos largos. Ningún estado debe terminar en una acción muerta o en una pantalla vacía sin explicación.

## Criterios de revisión antes de checkpoint

Se revisan Inicio y Reproductor en teléfono y tableta, modo oscuro y claro, textos ampliados, gestos y flechas. Se ejecutan typecheck, pruebas deterministas y lint. La validación nativa de audio en segundo plano y controles de pantalla de bloqueo requiere un build Android real.

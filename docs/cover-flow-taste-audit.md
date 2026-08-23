# Auditoría Cover Flow — taste-skill

## Design Read

Reading this as: una experiencia móvil de radio premium para una audiencia de escucha frecuente, con lenguaje nocturno cinematográfico, identidad musical editorial y navegación táctil tipo Cover Flow.

## Diales propuestos

| Variable | Valor | Motivo |
|---|---:|---|
| Variación visual | 8/10 | La composición asimétrica y las carátulas laterales son parte del carácter de la app. |
| Intensidad de movimiento | 6/10 | El cambio de emisora debe sentirse físico, pero no distraer ni consumir batería. |
| Densidad visual | 4/10 | La portada debe priorizar una emisora y dejar aire alrededor del carrusel. |

## Hallazgos priorizados

| Prioridad | Hallazgo | Acción |
|---|---|---|
| Alta | La animación usa `Animated` y `PanResponder`, aunque el gesto y la rotación 3D son valores continuos. | Migrar el movimiento del carrusel a Reanimated y mantener la actualización de la emisora solamente al finalizar el gesto. |
| Alta | Las carátulas laterales necesitan conservar presencia visual durante toda la transición. | Mantener tres ranuras estables y animar transform/opacity, no layout. |
| Alta | La referencia exige una sola dirección de luz y un acento dominante. | Usar fondo off-black, brillo coral controlado y sombras tintadas. |
| Media | La rotación 3D necesita una relación consistente con el desplazamiento. | Usar perspectiva fija y `rotateY` direccional con escala moderada. |
| Media | La accesibilidad debe reducir parallax, escala y rotación. | Respetar reduced motion y conservar solo cambios de opacidad/estado. |

## Criterios de aceptación

La carátula central debe permanecer dominante; las laterales deben ser identificables y visibles; un gesto horizontal debe mover y girar la composición en la dirección del dedo; el cambio de radio debe confirmarse una sola vez al terminar el gesto; flechas y gestos deben producir el mismo resultado; y reduced motion debe eliminar rotación, perspectiva exagerada y parallax.

La migración conservará Expo Router, React Native y las dependencias existentes. No se copiarán recetas web de GSAP ni se cambiará el stack.

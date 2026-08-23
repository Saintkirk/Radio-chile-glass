# Revisión de taste-skill

Fuente revisada: [Saintkirk/taste-skill](https://github.com/Saintkirk/taste-skill), redirigido por GitHub al repositorio `Leonxlnx/taste-skill`.

## Skills relevantes

| Skill | Aplicación propuesta |
|---|---|
| `redesign-existing-projects` | Auditar la interfaz actual antes de cada rediseño y aplicar cambios focalizados sin reescribir la app. |
| `design-taste-frontend` | Usar una lectura explícita del brief, una paleta coherente y jerarquía visual no genérica. |
| `image-to-code` | Comparar referencias visuales con la implementación antes de ajustar la interfaz. |
| `imagegen-frontend-mobile` | Crear conjuntos de mockups móviles coherentes antes de implementar una dirección visual. |
| `output-skill` | Comprobar que no queden estados o acciones a medio implementar antes de entregar. |

## Recomendaciones aplicables

Para Radio Chile Glass son especialmente útiles la auditoría antes del rediseño, la consistencia de una sola dirección de color por pantalla, el control de la densidad visual, la revisión de alineación óptica y la comprobación de estados activos, vacíos, carga y error. También encajan el uso de fondos atmosféricos con intención, superficies de vidrio con borde interior y sombra teñida, y la revisión de animaciones para que cada movimiento tenga un propósito claro.

## Límites de integración

La app es Expo/React Native, no una página web Tailwind. Por eso no se copiarán recetas específicas de GSAP, CSS o React web. Se conservarán Expo Router, Reanimated/Animated, NativeWind y los componentes nativos existentes. Las recomendaciones se aplicarán como criterios de diseño y auditoría, no como una migración de stack.

## Decisión

Las skills pueden usarse como guía de diseño para las próximas iteraciones. La integración recomendada es `redesign-existing-projects` para auditorías visuales y `imagegen-frontend-mobile` para producir referencias antes de cambios importantes. Toda instrucción ejecutable externa debe revisarse antes de adoptarse.

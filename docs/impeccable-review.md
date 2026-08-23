# Revisión de impeccable

Fuente revisada: [Saintkirk/impeccable](https://github.com/Saintkirk/impeccable), redirigido por GitHub al repositorio `pbakaus/impeccable`.

## Qué aporta

Impeccable ofrece una skill de diseño para agentes, 23 comandos de trabajo visual y reglas detectoras deterministas para problemas frecuentes de diseño generado por IA. Sus comandos cubren inicialización de contexto, auditoría, crítica UX, pulido, tipografía, color, layout, animación, adaptación y optimización.

## Aplicación a Radio Chile Glass

| Práctica | Aplicación en la app |
|---|---|
| `init` y `document` | Mantener un documento de contexto de producto y una especificación visual compartida. |
| `critique` y `audit` | Revisar Cover Flow, navegación, contraste, estados y comportamiento responsive antes de cada checkpoint. |
| `polish`, `typeset`, `colorize` y `layout` | Mejorar jerarquía, tipografía, paleta nocturna, espaciado y ritmo visual sin reescribir el stack. |
| `animate` y `optimize` | Revisar que la rotación y los gestos usen transform/opacity, reduced motion y UI runtime. |
| `harden` | Comprobar estados de error, streams caídos, textos largos, ausencia de logos y fallos de red. |

## Límites técnicos

El repositorio está orientado principalmente a interfaces frontend web y sus comandos pueden asumir CSS, Tailwind, GSAP o un navegador. Radio Chile Glass usa Expo, React Native, NativeWind y Reanimated. Por ello, se adoptan los criterios de auditoría, jerarquía, anti-patrones y calidad, pero no se incorporan comandos web ni se ejecutan scripts externos automáticamente.

## Decisión

`impeccable` es útil como marco de revisión y checklist para la app, especialmente en `audit`, `critique`, `polish`, `animate`, `harden` y `optimize`. La integración segura consiste en mantener los hallazgos como documentación del proyecto y trasladar las reglas compatibles a pruebas, revisión de código y criterios de aceptación.

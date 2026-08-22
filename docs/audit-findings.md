# Hallazgos iniciales de auditoría

La auditoría del 22 de agosto de 2026 revisó 21 emisoras editoriales y 100 emisoras remotas del catálogo Radio Browser, para un total de 119 entradas únicas.

Los 21 streams editoriales respondieron correctamente con audio o playlist válida. Oasis FM fue el único registro editorial sin URL de logo en el catálogo; su stream respondió como playlist HLS válida. En el conjunto remoto, 112 streams respondieron como audio o playlist y 7 presentaron estado desconocido o error. La API remota entregó 100 emisoras, de las cuales 70 no aportaron favicon utilizable; esas entradas dependen actualmente del fallback de iniciales.

El resultado bruto está en `docs/catalog-audit.json`. La auditoría debe continuar con la revisión de los 7 streams remotos problemáticos, la validación de los assets locales de las 21 emisoras editoriales y la incorporación de un logo verificable para Oasis FM o un fallback de marca explícito si la emisora ya no publica un recurso vigente.

## Verificación visual

La vista móvil de Inicio muestra los logos locales de FM Latina y Radio Cooperativa sin caer en iniciales. La pantalla de Oasis FM muestra correctamente el asset local de Oasis en la carátula, confirmando que el cambio de StationLogo permite renderizar logos locales incluso cuando la radio no publica favicon remoto. La auditoría final mantiene 112 streams válidos y excluye siete endpoints Digital FM que respondían vacío.

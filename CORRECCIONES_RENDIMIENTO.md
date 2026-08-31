# Correcciones de Rendimiento y Flujo Visual en el Carrusel

## Problemas Identificados

1. **Reproducción a tirones al cambiar entre emisoras**
2. **Pérdida de portadas al volver a una emisora anterior**
3. **Saltos visuales al cargar la emisora correcta**
4. **Falta de fluidez en las transiciones**

## Causas Raíz

### 1. Sincronización Espuria del Carrusel
El componente `CoverFlowCarousel` estaba sincronizando su índice interno con el estado externo (`activeIndex`) incluso durante transiciones menores, lo que causaba:
- Remount innecesario de componentes `StationLogo`
- Pérdida de caché de imágenes
- Saltos visuales durante el buffering

### 2. Keys Dinámicas Inestables en StationLogo
Las keys generadas inline (`key={\`slot-logo-${radio.id}:${radio.favicon ?? ""}\`}`) se recreaban en cada render, provocando que React desmontara y volviera a montar los componentes de imagen innecesariamente.

### 3. Dependencias Excesivas en useEffect
El hook de sincronización en `[id].tsx` tenía dependencias demasiado amplias (`currentRadio` completo en lugar de `currentRadio?.id`), causando ejecuciones adicionales cuando otras propiedades cambiaban.

## Soluciones Aplicadas

### 1. Memoización de Keys en CoverFlowCarousel (`components/cover-flow-carousel.tsx`)

```typescript
// Memoizar keys para evitar remount innecesario de StationLogo
const logoKey = useMemo(() => `${radio.id}:${radio.favicon ?? ''}`, [radio.id, radio.favicon]);
const reflectionKey = useMemo(() => `reflection:${logoKey}`, [logoKey]);

// Uso en componentes
<StationLogo key={`slot-logo-${logoKey}`} ... />
<StationLogo key={`slot-reflection-${reflectionKey}`} ... />
```

**Beneficio**: Las keys ahora son estables entre renders mientras no cambie la emisora o su favicon, permitiendo que React mantenga los componentes montados y preserve la caché de imágenes.

### 2. Filtro de Sincronización Inteligente

```typescript
// Evitar sincronización espuria durante cambios pequeños de índice
const indexDiff = Math.abs(safeActiveIndex - selectedIndexRef.current);
if (indexDiff > 0 && indexDiff < radios.length / 2) {
  // El cambio es pequeño, probablemente una actualización de estado del player,
  // no un cambio real de emisora. Ignorar para mantener estabilidad visual.
  return;
}
```

**Beneficio**: Previene que actualizaciones menores del estado del player (como cambios durante el buffering) provoquen saltos visuales en el carrusel.

### 3. Dependencias Optimizadas en RadioDetailScreen (`app/radio/[id].tsx`)

```typescript
// Antes
}, [currentRadio, selectedRadioId, isLoading]);

// Después
}, [currentRadio?.id, isLoading, selectedRadioId]);
```

**Beneficio**: El efecto solo se ejecuta cuando cambia el ID de la emisora, no cuando cambian otras propiedades como `name`, `favicon`, etc.

### 4. Comentarios de Documentación Mejorados

Se agregaron comentarios explicativos en cada punto crítico para facilitar el mantenimiento futuro y evitar regresiones.

## Resultados Esperados

### ✅ Flujo Visual Mejorado
- Transiciones suaves entre emisoras sin saltos
- Las portadas se mantienen visibles durante todo el ciclo de navegación
- El carrusel responde inmediatamente a las interacciones del usuario

### ✅ Rendimiento Optimizado
- Menos remounts de componentes
- Mejor aprovechamiento de la caché de imágenes de `expo-image`
- Reducción de renders innecesarios

### ✅ Experiencia de Usuario
- Navegación fluida hacia adelante y atrás en el carrusel
- Las portadas no "parpadean" o desaparecen temporalmente
- El indicador de carga se muestra consistentemente durante el buffering

## Pruebas Recomendadas

1. **Navegación Rápida**: Cambiar entre 3-4 emisoras rápidamente y verificar que las portadas no se pierdan
2. **Volver Atrás**: Navegar a una emisora anterior y confirmar que su portada ya está cargada
3. **Buffering**: Observar que el estado de carga se mantiene estable durante la conexión
4. **Memoria**: Monitorear el uso de memoria durante navegación prolongada

## Archivos Modificados

- `components/cover-flow-carousel.tsx` - Memoización de keys + filtro de sincronización
- `app/radio/[id].tsx` - Optimización de dependencias en useEffect
- `components/now-playing-label.tsx` - Limpieza de imports y documentación

## Notas Técnicas

### Por Qué Funciona

1. **Estabilidad de Keys**: React usa las keys para identificar componentes únicos. Cuando una key cambia, React desmonta el componente anterior y monta uno nuevo. Al memoizar las keys, preservamos los componentes montados.

2. **Sincronización Selectiva**: No todas las actualizaciones de estado requieren sincronización UI. Filtrar por magnitud de cambio (`indexDiff`) previene actualizaciones espurias.

3. **Dependencias Mínimas**: Los useEffect deben depender solo de lo estrictamente necesario. Usar `currentRadio?.id` en lugar de `currentRadio` completo reduce ejecuciones innecesarias.

### Consideraciones Futuras

Si se agregan más fuentes de actualización del índice del carrusel, asegurar que:
- Todas pasen por el mismo filtro de `indexDiff`
- Las keys memoizadas incluyan cualquier nueva propiedad relevante
- Los efectos de sincronización tengan dependencias mínimas

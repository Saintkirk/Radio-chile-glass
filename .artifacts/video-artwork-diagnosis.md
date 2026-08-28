# Diagnóstico de transición de carátulas

Fecha de análisis: 2026-08-27, GMT-4.

El video muestra una emisora activa con carátula y botón EN VIVO. Durante el swipe, la tarjeta se desplaza correctamente hacia la izquierda y la siguiente entra desde la derecha; la nueva tarjeta incluso puede mostrar su logo al entrar. Al centrarse, durante aproximadamente 2–3 segundos desaparecen elementos visuales de la tarjeta, incluido EN VIVO, aparece CONECTANDO y algunos fondos pasan temporalmente a gris u oscuro. Después un callback vuelve a mostrar EN VIVO y el diseño final.

El problema principal observado no es un retorno literal del logo anterior, sino un desmontaje o reemplazo brusco de la capa visual durante el handoff, seguido de un callback tardío que reconstruye el estado. Esto produce un efecto de pop-in y da la sensación de que la portada anterior vuelve o que la tarjeta se cierra y se abre. Las emisoras legibles en la secuencia son Oasis FM, Play FM, El Conquistador FM y Rock & Pop.

Corrección recomendada: mantener la portada y el fondo visual actuales mientras la nueva emisora está en estado connecting; precargar la siguiente fuente sin desmontar el slot; promover la nueva imagen solo después de onLoad; y representar CONECTANDO como una capa semitransparente sobre el artwork, no como un reemplazo del contenido. Los callbacks deben validar la clave de identidad de la emisora antes de cambiar la imagen visible.

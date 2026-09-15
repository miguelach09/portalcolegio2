# Por qué el asistente no muestra botones

## Qué encontré

Revisé la búsqueda que alimenta los botones. El buscador descarta cualquier palabra de menos de 5 letras y también trata "documento", "acceso", "muéstrame" como palabras vacías. Resultado: en la pregunta de tu captura ("muéstrame el botón para ir al PEI") no queda ninguna palabra útil — "PEI" tiene 3 letras — así que la búsqueda devuelve cero resultados y no aparece ningún botón.

Lo mismo pasa con siglas y palabras cortas muy usadas: CRE, PEI, FAQ, Q10, "guía", "once", "10", "11", "arte".

Encima, el modelo igual anuncia "abajo encontrarás el botón", porque la instrucción que le dice que no lo mencione es demasiado suave. Por eso se ve una promesa sin botón.

No es un problema del celular: en computador pasa lo mismo con esas preguntas. La ventana del asistente sí dibuja los botones cuando llegan resultados.

## Qué voy a cambiar

1. Aceptar palabras cortas relevantes: siglas y términos del colegio (PEI, CRE, FAQ, Q10, guía, arte, once, grados numéricos) entran a la búsqueda en lugar de ser descartados.
2. Bajar el mínimo general de 5 a 4 letras y quitar de la lista de palabras ignoradas las que sí sirven para buscar ("documento", "documentos", "acceso").
3. Cuando la pregunta pide explícitamente un botón/enlace, buscar también con las palabras de la respuesta anterior del asistente (ya existe ese mecanismo, pero se anula al quedarse sin palabras: ahora se usará el título que el asistente acaba de mencionar).
4. Endurecer la regla del asistente: si no hay resultados, prohibido mencionar botones, enlaces o "abajo encontrarás"; en su lugar ofrece la sección donde buscar.
5. Añadir un atajo de sección de respaldo cuando la pregunta nombra claramente un tema (PEI, manual de convivencia, guías, circulares, CRE), para que casi nunca quede una petición de botón sin ninguna opción.

## Verificación

Probaré en la vista de celular y en escritorio con estas preguntas: "muéstrame el botón para ir al PEI", "libros del plan lector", "guías de once", "circulares de tercero", y una conversación de dos turnos donde primero se mencione un documento y después se pida "dame el botón". En cada caso debe aparecer al menos un botón coherente, y ningún botón fuera de tema.

## Detalle técnico

- `src/lib/assistant.functions.ts`: `keywords()` con lista blanca `SHORT_TERMS` y umbral de longitud 4; quitar `documento/documentos/acceso` de `STOPWORDS`; en `findResources`, si `isFollowUp` y `terms` queda vacío, derivar términos del `conversationContext`; endurecer `staffBlock`; ampliar `shortcuts` con PEI/manual de convivencia.
- Sin cambios de paleta ni de tipografía. `bunx tsgo --noEmit` debe quedar limpio.

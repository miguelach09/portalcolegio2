# Que el asistente lea de verdad los documentos

## El problema hoy

El asistente solo conoce el **título** de los archivos (circulares, guías, PEI, manuales, adjuntos del entrenador). Del contenido interno de un PDF no sabe nada: si una familia pregunta "¿qué dice la circular de salida pedagógica?", el asistente puede ofrecer el botón, pero no puede responder qué dice adentro. Solo lee texto cuando alguien lo escribió a mano en el entrenador.

## Qué voy a construir

### 1. Lectura real de los documentos

- Al subir un PDF o un Excel (en documentos, circulares, guías o en el entrenador), el sistema extrae su texto automáticamente y lo guarda en la base de datos, partido en fragmentos con su página/sección.
- Un botón en el panel: **"Indexar documentos existentes"**, que procesa los archivos ya subidos (circulares, guías, PEI, manuales) y muestra el avance: cuántos se leyeron, cuántos quedaron pendientes.
- Los PDFs escaneados sin texto se marcan como "no legible" en la lista del entrenador, para que el colegio sepa cuáles conviene volver a subir o resumir a mano.

### 2. Respuestas con base en el contenido

- Antes de responder, el asistente busca los fragmentos más parecidos a la pregunta y responde con ellos, citando el documento del que salió la información ("Según la Circular 12 de marzo…").
- Debajo sigue apareciendo el botón para abrir el documento en la página exacta cuando sea posible.
- Si el contenido no responde, lo dice con honestidad en vez de inventar.

### 3. Capacidades nuevas del asistente

- **Preguntas sugeridas** al abrir la ventana (admisiones, circular más reciente, guías de mi grado, próximos eventos) y sugerencias de seguimiento tras cada respuesta.
- **Consciencia de fechas**: responde "el próximo evento", "esta semana", "circulares de este mes" usando la fecha real del día.
- **Resumen de un documento** a pedido: "resúmeme el manual de convivencia".
- **Guías por grado y periodo** en un paso: el asistente pregunta el grado si falta y entrega los botones correctos.
- **Copiar respuesta** y **borrar conversación** en la ventana del chat; la conversación se conserva al recargar la página (solo en ese navegador).
- **Derivación clara**: cuando no hay respuesta, ofrece el canal correcto (contacto, admisiones, bienestar) en vez de un teléfono genérico.

### 4. Seguridad (se mantiene y se refuerza)

- El asistente sigue sin acceso al historial, al panel, a credenciales ni a datos personales.
- El texto extraído hereda la misma regla: si un documento contiene listados de personas o datos personales, el asistente no los transcribe; resume solo la parte institucional.
- Ningún fragmento indexado de documentos inactivos o del panel entra a las respuestas.

## Verificación

Probaré en la ventana del asistente (computador y celular): una pregunta cuya respuesta esté dentro de un PDF y no en su título; "¿qué dice el manual de convivencia sobre el uniforme?"; "resúmeme el PEI"; "¿cuál es el próximo evento?"; "guías de séptimo periodo 2"; y tres intentos sensibles (contraseña del historial, cédulas, quién subió un archivo) que deben seguir siendo rechazados.

## Detalle técnico

- Migración: tabla `public.document_chunks` (`source` documents|assistant_knowledge, `source_id`, `title`, `chunk_index`, `page`, `content`, `is_active`) con GRANT + RLS (lectura anon solo de fuentes activas, gestión staff) e índice GIN `to_tsvector('spanish', content)`.
- Extracción con librerías puras JS compatibles con el runtime del Worker (`unpdf` para PDF, `xlsx` para hojas de cálculo); nada de binarios nativos ni `child_process`.
- Nuevo `src/lib/indexing.functions.ts`: `extractAndIndex({ source, id })` (staff) y `reindexPending()` por lotes; se llama al guardar en `admin/documentos/nuevo.tsx` y `admin/asistente/index.tsx`, más un botón en `/admin/asistente`.
- `assistant.functions.ts`: `searchChunks(terms)` con búsqueda full-text en español, ranking por `ts_rank`, tope de fragmentos por documento, y bloque `PASAJES DE DOCUMENTOS` en el system prompt con instrucción de citar el título. `isSensitiveQuery` y `isPublicLink` se aplican también a los fragmentos.
- `AIAssistant.tsx`: chips de sugerencias, botón copiar, botón limpiar, persistencia en `localStorage` (una sola conversación). Sin cambios de paleta ni tipografía.
- `bunx tsgo --noEmit` limpio antes de cerrar.

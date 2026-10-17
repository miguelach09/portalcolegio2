# Próximas mejoras para el portal Colegio Cafam

Propuestas agrupadas por impacto. Puedes aprobar todo o decirme cuáles priorizar.

## 1. Limpieza y confiabilidad (rápido)
- Eliminar la circular de prueba "Jornada de integración familiar" (fecha y lugar inventados).
- Página 404 y página de error con la identidad del colegio.
- Revisar que todas las páginas carguen rápido en celular (imágenes con tamaños adecuados).

## 2. Asistente más útil
- Mostrar menos botones "parecidos": solo el más relevante y, como máximo, uno relacionado.
- Respuestas por voz (dictar la pregunta desde el celular).
- Preguntas sugeridas según la página donde está el visitante (en Admisiones, preguntas de admisiones; en Guías, de guías).
- Registro anónimo de preguntas sin respuesta para que el admin sepa qué información falta subir.

## 3. Admisiones
- Consulta del estado de la preinscripción con código y correo.
- Correo automático de confirmación con lista de documentos requeridos.
- Agenda de citas de entrevista con cupos por día y hora.

## 4. Comunicación con familias
- Aviso por correo a suscriptores cuando se publica una circular, noticia o evento.
- Boletín semanal automático con lo nuevo de la semana.
- Botón "Agregar a mi calendario" (Google/Outlook) en cada evento.

## 5. Panel administrativo
- Programar publicaciones para que salgan solas en una fecha.
- Papelera: lo eliminado se puede restaurar durante 30 días.
- Subida masiva de guías (varios PDF a la vez por grado y periodo).
- Tablero con métricas: preinscripciones por semana, documentos más vistos, preguntas más frecuentes al asistente.

## 6. Accesibilidad
- Control de tamaño de letra y alto contraste.
- Navegación completa con teclado y lectores de pantalla.

## Orden sugerido
1 → 2 → 5 → 3 → 4 → 6. Las secciones 3 y 4 requieren configurar el envío de correos del colegio.

## Detalles técnicos
- Correos con la integración de email de Lovable Cloud y un dominio remitente.
- Programación y boletín vía ruta `api/public/cron` protegida con token.
- Papelera con columna `deleted_at` y filtros en consultas públicas; métricas y preguntas sin respuesta en tablas nuevas con RLS solo para staff.

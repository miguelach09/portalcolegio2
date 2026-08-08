# Portal Colegio Cafam — Siguiente nivel

Objetivo: pasar de "sitio informativo completo" a portal escolar de referencia: comunicación real con familias, autoservicio y contenido vivo.

## Fase 1 — Portal de Familias (mayor impacto)

Área privada para acudientes, separada del panel admin.

- Registro/ingreso de acudiente con correo (rol nuevo `familia`).
- Vinculación de estudiantes: el admin crea el estudiante (nombre, grado, grupo) y genera un código de vinculación que la familia canjea.
- Panel de familia: circulares y guías filtradas por el grado de su hijo, calendario de su grado, avisos dirigidos, historial de comunicados leídos.
- Confirmación de lectura de circulares (el colegio ve quién ya leyó).

## Fase 2 — Comunicación y notificaciones

- Notificaciones por correo al publicar circular, noticia o evento (a suscriptores y familias del grado correspondiente).
- Boletín automático semanal con lo nuevo de la semana.
- Centro de notificaciones dentro del sitio con campanita y no leídos.

## Fase 3 — Contenido y experiencia

- Blog/noticias con página de detalle propia (`/noticias/$slug`), autor, imagen destacada y compartir en redes.
- Página por área académica (`/academico/$area`): docentes del área, guías, proyectos y galería.
- Testimonios y logros institucionales (solo contenido verificable que el colegio suministre).
- Multilingüe básico ES/EN para la sección de admisiones.
- Modo lectura accesible: tamaño de fuente ajustable, alto contraste, foco visible.

## Fase 4 — Admisiones profesional

- Estado de la solicitud consultable por el acudiente con código y correo.
- Carga de documentos requeridos por el aspirante (registro civil, boletines) al almacenamiento privado.
- Agenda de citas de entrevista con cupos por día y hora.
- Correo automático de confirmación con checklist de documentos.

## Fase 5 — Panel admin más potente

- Dashboard con métricas: solicitudes por semana, documentos más descargados, visitas por sección, votos de encuestas.
- Programación de publicaciones (ya existe `scheduled_at`): activar un cron que publique automáticamente.
- Papelera y restauración en lugar de borrado directo.
- Registro de auditoría: quién cambió qué y cuándo.
- Carga masiva de guías por grado (varios PDF a la vez).

## Fase 6 — Calidad técnica

- Datos estructurados JSON-LD (`School`, `NewsArticle`, `FAQPage`, `Event`) y sitemap dinámico generado desde la base.
- Optimización de imágenes (tamaños responsivos, `width`/`height` en todas), presupuesto de rendimiento.
- Página de error y 404 con la identidad del colegio.
- Pruebas de los flujos críticos: preinscripción, ingreso de familia, subida de documentos.

## Notas técnicas

- Nuevas tablas: `students`, `student_guardians`, `guardian_links`, `notifications`, `circular_reads`, `admission_documents`, `interview_slots`, `audit_log`. Todas con GRANT + RLS; las familias solo ven filas de sus estudiantes vía función `security definer`.
- Rol `familia` añadido al enum `app_role`; el gate `_authenticated` se divide en `_admin` y `_familia`.
- Correos con la integración de email del proyecto, disparados desde server functions y un endpoint `api/public/cron` protegido por token para el boletín y publicaciones programadas.
- Todo nuevo dato público sigue el patrón actual: `createServerFn` + TanStack Query con `ensureQueryData`.

## Orden sugerido

Empezar por la Fase 1 (portal de familias) porque habilita las fases 2 y 4. Si prefieres impacto rápido y visible, arranco por la Fase 3 más el dashboard de la Fase 5.

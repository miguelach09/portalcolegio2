# Plan: Expandir la funcionalidad del sitio Colegio Cafam

## Corrección previa (bug activo)

**Hydration mismatch en fechas de noticias.** El componente `News.tsx` (y `guias.tsx`) formatean `published_at` con `toLocaleDateString("es-CO")` directamente en el render. Como `published_at` es tipo `date` (sin zona horaria), el servidor y el navegador lo interpretan en husos distintos y React reporta "server rendered 20 de julio, client rendered 21 de julio".

- Crear un helper `formatDateES(iso)` que normalice la fecha a medianoche UTC (`new Date(iso + "T00:00:00")`) y use opciones de formato sin depender del huso local.
- Reemplazar las llamadas `new Date(...).toLocaleDateString("es-CO", {...})` en `News.tsx`, `guias.tsx` y cualquier otra vista por el helper.
- Esto es lo único que rompe la página ahora; se resuelve primero.

---

## Tres ejes de mejora (todos: público + admin)

### Eje 1 — Comunicación

**1.1 Calendario escolar de eventos (esfuerzo medio)**
- Nueva tabla `events` (id, title, description, start_date, end_date, location, category, is_active, sort_order, created_at, updated_at) con RLS (lectura pública de activos, escritura admin) + GRANTs + trigger `updated_at`.
- Tipos y schemas en `content.types.ts` / `content.schemas.ts`.
- Server functions públicas `getEvents` / `getEventById` y protegidas `createEvent` / `updateEvent` / `deleteEvent` en `content.functions.ts`.
- Nueva ruta `/calendario` con vista mensual/lista de próximos eventos, filtros por categoría y mes.
- Gestión desde el panel admin (`/admin/eventos` index + nuevo).
- Componente "Próximos eventos" en el home (3 más cercanos).

**1.2 Banner de aviso urgente (esfuerzo bajo)**
- Tabla `site_settings` (key, value, updated_at) o reutilizar `news` con categoría especial. Decisión: tabla `site_settings` simple tipo clave-valor.
- Server function `getAnnouncement` (pública) y `setAnnouncement` (admin).
- Componente `AnnouncementBar` que se muestra debajo del header cuando hay un aviso activo (con fecha de expiración). Editable desde el panel admin.
- Dismissible por sesión (localStorage).

**1.3 Newsletter / suscripción por correo (esfuerzo medio)**
- Tabla `subscribers` (id, email, created_at, is_active) con RLS (inserción pública anónima de su propio correo, lectura/eliminación admin).
- Componente de suscripción en el footer + sección dedicada.
- Server function pública `subscribe` (valida email con Zod, evita duplicados) y admin `listSubscribers` / `removeSubscriber`.
- Vista en el panel admin para ver/exportar suscriptores (CSV).

### Eje 2 — Interacción

**2.1 Formulario de contacto funcional (esfuerzo medio)**
- Tabla `contact_messages` (id, name, email, subject, message, status, created_at) con RLS (inserción pública anónima, lectura/admin admin).
- El formulario actual en `/contacto` hoy es decorativo (no envía nada). Conectar a server function `submitContactMessage` (valida con Zod, guarda en DB).
- Server function admin `getContactMessages` / `updateMessageStatus` / `deleteMessage`.
- Vista en panel admin `/admin/mensajes` con lista, filtros por estado (nuevo/leído/atendido) y cambio de estado.
- Confirmación visual al enviar (toast/mensaje de éxito) en la página pública.

**2.2 Preguntas frecuentes (FAQ) (esfuerzo bajo)**
- Tabla `faqs` (id, question, answer, category, sort_order, is_active) con RLS (lectura pública, escritura admin).
- Nueva ruta `/faq` con acordeón de preguntas agrupadas por categoría y buscador de texto.
- Gestión desde el panel admin (`/admin/faq`).
- Enlace en el footer y header móvil.

**2.3 Encuestas breves (esfuerzo alto)**
- Tablas `surveys` (id, title, question, is_active, expires_at) y `survey_options` (id, survey_id, label) y `survey_votes` (id, survey_id, option_id, voter_hash, created_at).
- RLS: lectura pública de encuestas activas + opciones; voto anónimo (un voto por huella hash de IP+UA, verificada en server); gestión admin.
- Server functions `getActiveSurvey`, `castVote`, y admin `createSurvey` / `closeSurvey` / `getResults`.
- Componente widget en el home o sidebar con la encuesta activa y resultados en barra de progreso tras votar.

### Eje 3 — Panel admin

**3.1 Editor de texto enriquecido para noticias (esfuerzo medio)**
- Integrar un editor ligero (p. ej. `@tiptap/react` + `@tiptap/starter-kit`) en el formulario de noticias (`/admin/noticias/nueva`) para reemplazar el campo `content` plano.
- Renderizado seguro del HTML en la vista pública (sanitizar con `DOMPurify` o similar en el server antes de guardar).
- Mostrar el contenido enriquecido en una página de detalle de noticia (nueva ruta `/noticias/$id`).

**3.2 Estadísticas del panel (esfuerzo bajo)**
- Tarjetas de resumen en `/admin` con conteos ya existentes (documentos, noticias, galería) + nuevos (mensajes de contacto, suscriptores, eventos, visitas recientes si hay analytics).
- "Mensajes sin leer" destacado con badge.
- Actividad reciente (últimos 5 elementos creados por tipo).

**3.3 Roles de usuario adicionales (esfuerzo alto)**
- Añadir rol `editor` al enum `app_role` (además de `admin`).
- Editor: puede crear/editar noticias, eventos, FAQs; no puede gestionar usuarios ni configuración del sitio.
- Vista de gestión de usuarios en `/admin/usuarios` (solo admin) para asignar/revocar roles.
- Ajustar `checkAdmin` en `content.functions.ts` a `checkRole(["admin", "editor"])` según la operación.

**3.4 Borradores y programación (esfuerzo medio)**
- Añadir columna `status` (draft/published) y `scheduled_at` a `news` y `events`.
- Filtro de "solo publicados" en las consultas públicas; en admin mostrar todos.
- Botón "Guardar borrador" + "Programar publicación" en los formularios.

### Eje 4 — Mejoras transversales (complementarias)

**4.1 Buscador global (esfuerzo medio)**
- Componente de búsqueda en el header que busca en documentos, noticias y FAQs (vía server function con ILIKE).
- Resultados agrupados por tipo con enlaces.

**4.2 Lightbox de galería (esfuerzo bajo)**
- Al hacer clic en una imagen de la galería, abrir un visor a pantalla completa con navegación entre imágenes.
- Componente `GalleryLightbox` reutilizable.

**4.3 Breadcrumbs y mapa del sitio (esfuerzo bajo)**
- Migas de pan en páginas internas (PageHero) y un `/sitemap.xml` generado dinámicamente vía server route.

---

## Migración de base de datos (una sola)

Todas las tablas nuevas se crean en **una migración** que ejecutar al inicio, en este orden por tabla:
1. `CREATE TABLE` (incluyendo `created_at`/`updated_at` + trigger `update_updated_at_column`).
2. `GRANT` a los roles correspondientes (anon para inserciones públicas como contactos/suscripciones/votos; authenticated para escrituras admin; service_role para admin).
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
4. `CREATE POLICY` por audiencia.

Tablas nuevas: `events`, `site_settings`, `subscribers`, `contact_messages`, `faqs`, `surveys`, `survey_options`, `survey_votes`. Modificaciones: añadir `status`/`scheduled_at` a `news` y `events`; añadir rol `editor` al enum `app_role`.

Después de la migración se regeneran los tipos y se actualizan `content.types.ts` / `content.schemas.ts`.

---

## Orden de implementación sugerido

1. **Corrección del bug de hydration** (rápido, desbloquea la preview limpia).
2. **Formulario de contacto funcional** (Eje 2.1) — hoy es decorativo.
3. **FAQ** (Eje 2.2) + **banner de aviso** (Eje 1.2) + **estadísticas admin** (Eje 3.2) — rápidos y de alto valor visible.
4. **Calendario de eventos** (Eje 1.1) + componente en home.
5. **Newsletter** (Eje 1.3) + **lightbox galería** (Eje 4.2).
6. **Editor enriquecido** (Eje 3.1) + **borradores** (Eje 3.4).
7. **Buscador global** (Eje 4.1) + **breadcrumbs/sitemap** (Eje 4.3).
8. **Encuestas** (Eje 2.3) + **roles editor** (Eje 3.3) — los más elaborados.

Cada bloque se puede aprobar e implementar por separado. Si prefieres un subconjunto, indícame cuáles y los priorizo.

## Notas técnicas
- Todas las escrituras públicas (contacto, suscripción, voto) validan con Zod en el server y usan el cliente anónimo con políticas `TO anon` estrechas; nunca exponen `supabaseAdmin`.
- Las funciones admin usan `requireSupabaseAuth` + `checkRole` y `context.supabase` (RLS como el usuario).
- Los formularios públicos muestran mensajes genéricos en caso de error (nunca errores crudos del backend), siguiendo la corrección de seguridad ya aplicada.

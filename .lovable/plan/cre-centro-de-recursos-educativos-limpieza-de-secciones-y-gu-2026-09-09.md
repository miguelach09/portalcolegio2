# CRE (Centro de Recursos Educativos), limpieza de secciones y guías por área

## 1. Catálogo de libros del CRE

Nueva página pública **CRE — Biblioteca** con dos pestañas:

- **Consulta en sala**: libros que solo se usan dentro del CRE. Portada, título, autor, editorial, grado sugerido, descripción y disponibilidad (disponible / agotado).
- **Plan Lector**: libros que las familias pueden comprar. Lo mismo más el precio en pesos.

Cada libro se muestra como tarjeta con su portada; se puede buscar por título o autor y filtrar por grado. Al abrir un libro se ve su ficha completa.

En el panel de administrador se añade **Libros del CRE**: crear, editar, activar/desactivar y eliminar libros, subir la imagen de portada, marcar si es de consulta o de Plan Lector, y fijar precio y disponibilidad. Los libros sin precio no aparecen en Plan Lector.

La página actual de Biblioteca se mantiene como presentación e incluirá un acceso destacado al catálogo.

## 2. Eliminar Encuestas y Portal de Familias

- Se quitan del sitio la página de Encuestas y su gestor en el panel.
- Se quitan el Portal de Familias (ingreso, vinculación con código, centro de avisos) y los gestores de Estudiantes y Avisos a familias.
- Se eliminan también los datos guardados de encuestas, votos, estudiantes, vinculaciones y avisos, según lo confirmado.
- Se limpian los enlaces del menú, del pie de página y del panel para que no queden botones muertos.

## 3. Guías por área

Al subir una guía, además de grado y periodo, se elige el **área**: Ciencias, Matemáticas, Inglés, Castellano, Humanidades, Tecnología, Artes, Ciencias Sociales y Profundización (esta última solo se ofrece cuando el grado es Décimo u Once).

En la página pública de Guías, tras elegir el grado se podrá filtrar por área y cada guía mostrará su etiqueta de área junto al periodo. Las guías ya subidas quedan sin área hasta que se editen.

## Detalles técnicos

- Migración: nueva tabla `public.library_books` (`kind` 'consulta' | 'plan_lector', `title`, `author`, `publisher`, `grade`, `description`, `cover_path`/`cover_url`, `price_cop` numeric nullable, `availability`, `is_active`, `sort_order`, timestamps + trigger `updated_at`). GRANT `SELECT` a `anon` y `authenticated`, GRANT completo a `authenticated`/`service_role`; RLS: lectura pública solo de filas activas, escritura solo para `admin`/`editor` vía `has_role`. Portadas en el bucket `site-assets` con URL firmada, igual que galería.
- Migración de limpieza: `DROP TABLE` de `survey_votes`, `survey_options`, `surveys`, `notification_reads`, `notifications`, `student_guardians`, `guardian_links`, `students` y de las funciones privadas asociadas (`is_guardian_of`, `can_view_notification`). Requiere confirmación por borrado de datos.
- Migración de guías: nuevo enum `document_area` y columna `documents.area` nullable.
- Código: nuevos `src/lib/library.types.ts`, `library.schemas.ts`, `library.functions.ts` (server fns públicas de lectura + protegidas con `requireSupabaseAuth` para escritura); rutas `src/routes/cre.tsx` y `src/routes/_authenticated/admin/libros/index.tsx` + `nuevo.tsx`.
- Borrados: `src/routes/encuestas.tsx`, `_authenticated/admin/encuestas/`, `_authenticated/familia/`, `_authenticated/admin/estudiantes/`, `_authenticated/admin/notificaciones/`, `src/lib/family.*`, `src/lib/notifications.*`, y las partes de encuestas en `features.functions.ts`/`features.schemas.ts`/`features.types.ts`; ajustes en `Header.tsx`, `Footer.tsx`, `admin/index.tsx`, `search.server.ts` y `sitemap.xml`.
- `head()` propio para `/cre` con título, descripción y etiquetas sociales.

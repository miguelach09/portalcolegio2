# Plan: Base de datos y gestor de archivos para portalcolegio.com

## Objetivo
Darle al sitio un backend real con Lovable Cloud para que el administrador pueda subir, organizar y publicar PDFs (circulares, revisas, documentos de admisiones) e imágenes (galería, noticias) desde un panel privado, y que el sitio público las muestre dinámicamente en todas las secciones, incluyendo los accesos rápidos del home.

## Alcance
- Habilitar Lovable Cloud en el proyecto (base de datos PostgreSQL + Storage + auth).
- Autenticación: un solo usuario administrador con email/password (sin perfiles adicionales, solo `auth.users`).
- Tablas de contenido: `documents` (PDFs/circulares/revisas), `news` (noticias), `gallery_images` (galería/vida escolar).
- Bucket de Storage privado para archivos, con acceso público controlado mediante signed URLs o políticas seguras.
- Panel administrativo protegido bajo `/_authenticated/admin` para crear, editar, eliminar y ordenar contenido.
- Actualizar las rutas públicas (`/`, `/circulares`, `/galeria`, `/mi-colegio`, `/admisiones`, `/herramientas`) para leer contenido desde la base de datos en lugar de placeholders.

## Estructura propuesta

### 1. Backend / Lovable Cloud
- Habilitar Lovable Cloud en el proyecto.
- Crear bucket `site-assets` en Storage para PDFs e imágenes.
- Crear migraciones SQL:
  - `documents`: `id`, `title`, `category` (circulares | revisas | admisiones | herramientas | general), `file_path` (Storage path), `file_url`, `published_at`, `is_active`, `created_at`, `updated_at`.
  - `news`: `id`, `title`, `summary`, `content`, `image_url`, `published_at`, `is_active`, `created_at`.
  - `gallery_images`: `id`, `title`, `category`, `image_url`, `sort_order`, `is_active`, `created_at`.
- Políticas RLS:
  - Lectura pública (`anon`) para filas activas.
  - Escritura solo para usuarios autenticados (`authenticated`) con rol admin.
  - Tabla `user_roles` con rol `admin` y función `has_role()` para evitar escalada de privilegios.

### 2. Autenticación
- Ruta pública `/auth` con formulario de login.
- Layout protegido `src/routes/_authenticated/route.tsx` (gestionado por la integración) para el panel admin.
- Middleware `attachSupabaseAuth` en `src/start.ts` para que las server functions autenticadas reciban el bearer token.
- Server functions protegidas con `requireSupabaseAuth` para escritura/eliminación.

### 3. Panel administrativo (`/_authenticated/admin`)
- Dashboard con resumen de documentos, noticias e imágenes.
- Sección "Documentos": formulario para subir PDFs (drag & drop o input file), elegir categoría, título, fecha de publicación y activar/desactivar. Listado con opciones de editar/eliminar.
- Sección "Noticias": formulario con título, resumen, contenido, imagen destacada, fecha y activar/desactivar.
- Sección "Galería": formulario para subir imágenes, título, categoría y orden.
- Validación de formularios con Zod + React Hook Form.
- Subida de archivos directamente al Storage de Lovable Cloud desde el cliente, luego guardar metadatos en la BD mediante server function.

### 4. Vistas públicas actualizadas
- **Home (`/`)**: accesos rápidos dinámicos desde `documents` filtrados por categoría; últimas noticias desde `news`; preview de galería desde `gallery_images`.
- **Circulares (`/circulares`)**: listado de documentos filtrados por `category = 'circulares'`.
- **Herramientas (`/herramientas`)**: listado de documentos filtrados por `category = 'herramientas'`.
- **Admisiones (`/admisiones`)**: documentos de admisiones + CTA de inscripción.
- **Galería (`/galeria`)**: masonry grid con imágenes de `gallery_images`.
- **Mi Colegio (`/mi-colegio`)**: noticias destacadas + galería de vida escolar.

### 5. UX y diseño
- Mantener la identidad Cafam (azul institucional, tipografía Outfit/Figtree).
- Panel admin con UI clara, tablas o cards, estados de carga y mensajes de éxito/error con `sonner`.
- Los documentos se abren en nueva pestaña usando URL pública del Storage.

## Notas técnicas
- Se usará `createServerFn` para toda la lógica de backend; no edge functions.
- Los archivos se almacenan en Storage, no en la base de datos (la BD solo guarda metadatos y referencias).
- El bucket será privado por defecto; las URLs públicas se generarán con signed URLs o políticas `TO anon` según lo que permita la configuración del workspace.
- Se respetarán las reglas de importación de Supabase en TanStack Start: `*.functions.ts` en rutas client-safe, `*.server.ts` para helpers de servidor.

## Entregables
- Lovable Cloud habilitado y configurado.
- Auth funcional (login/logout) para el administrador.
- Tablas y Storage creados.
- Panel administrativo funcional para subir y gestionar documentos, noticias e imágenes.
- Sitio público mostrando contenido dinámico en todas las secciones priorizadas.

## Próximo paso
Aprobar este plan para comenzar la implementación. La primera acción será habilitar Lovable Cloud en el proyecto.
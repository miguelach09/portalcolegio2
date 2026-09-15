# Traer el contenido del portal actual a la nueva página

Objetivo: que la nueva página deje de depender de portalcolegio.com. Todo lo que hoy se ve allí (circulares, fotos y los documentos incrustados de Mi Colegio) queda guardado en la base de datos y el almacenamiento propios, visible en su sección pública y administrable desde el panel.

## 1. Circulares

- Se importan todas las circulares publicadas hoy en el portal (entre 28 y 39 por grado, muchas compartidas entre varios grados; en total alrededor de 70 archivos distintos).
- Cada circular se guarda **una sola vez** y se etiqueta con **todos los grados** a los que aplica (de Transición a Undécimo). En la página de Circulares el visitante filtra por grado y ve las que le corresponden.
- El panel de administración pasa a permitir marcar varios grados al crear o editar una circular o una guía, en lugar de uno solo.
- Se conserva el título tal como aparece hoy, limpiando los caracteres dañados de acentos del portal viejo.

## 2. Galería

- Se importan los **4 álbumes más recientes** del portal (los que hoy están al frente de la galería), con sus fotos.
- Las fotos se reducen a tamaño web antes de subirlas, para que la galería cargue rápido sin perder calidad visible.
- Cada foto queda con el nombre de su álbum como título y su categoría, y aparece en la Galería y en el visor ampliado ya existente.
- La sección de videos del portal actual está vacía, así que no hay nada que traer allí.

## 3. Mi Colegio: dejar de depender del portal viejo

- Los 11 documentos que hoy se muestran incrustados desde portalcolegio.com (PEI, Manual de Convivencia 2026 y los 9 documentos administrativos) se suben al almacenamiento propio.
- La página Mi Colegio los lee desde la base de datos: si mañana se sube una versión nueva desde el panel, la página la muestra sin tocar código.
- Quedan administrables como cualquier otro documento, en una categoría propia "Institucionales".

## 4. Eliminar el directorio de docentes

- Se elimina la página pública de Docentes, su enlace en el menú y el pie de página, y el gestor del panel.
- Se elimina la tabla de docentes y sus datos.
- El asistente deja de usar el directorio de funcionarios que tiene incrustado en el código; a partir de ahora esa información se le carga desde "Entrenar asistente" con el PDF de docentes y contactos.
- Se actualizan el mapa del sitio y los enlaces internos para que no queden páginas rotas.

## Detalles técnicos

- Migración: nueva columna `grades text[]` en `public.documents` (se mantiene `grade` por compatibilidad y se rellena con el primer grado); nuevo valor `institucionales` en el enum `document_category`; `DROP TABLE public.teachers`.
- Importación con un script de sandbox: descarga desde portalcolegio.com, normaliza los nombres (mojibake ISO-8859-1 → UTF-8), redimensiona imágenes con PIL, sube al bucket privado `site-assets` (rutas `documentos/`, `galeria/`, `institucionales/`) y hace los `INSERT` en `documents` y `gallery_images`. Los PDFs y las imágenes se sirven con URLs firmadas, igual que el resto del contenido.
- Código: `src/lib/content.schemas.ts` y `content.functions.ts` aceptan varios grados; filtro por grado en `circulares.tsx` y `guias.tsx` con `overlaps`; formulario de documentos con selección múltiple de grados; `mi-colegio.tsx` deja las rutas absolutas al portal viejo y consume el loader; se borran `docentes.tsx`, `admin/docentes/`, `directory.*`, `staff-directory.ts` y sus referencias en `Header.tsx`, `Footer.tsx`, `admin/index.tsx`, `assistant.functions.ts`, `sitemap.xml` y `llms.txt`.

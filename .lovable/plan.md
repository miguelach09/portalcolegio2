# Ajustes de pulido para el sitio Colegio Cafam

## 1. Correcciones menores de navegación
- Pie de página: el enlace "Biblioteca" pasa a llamarse **CRE — Biblioteca** y apunta a `/cre` (hoy apunta a `/biblioteca`, que redirige; mejor directo).
- Revisar que no queden enlaces muertos en menú, pie y panel tras la eliminación de Encuestas y Familias.

## 2. CRE: experiencia mejorada
- Estado vacío más útil: mensaje distinto cuando la búsqueda no arroja resultados vs. cuando la sección está vacía.
- Botón "Limpiar filtros" (búsqueda + grado) en una sola acción.
- Contador de resultados ("12 libros encontrados").

## 3. Guías de Aprendizaje
- Mostrar un resumen de cuántas guías hay por área al elegir un grado.
- Aviso amable cuando un grado aún no tiene guías subidas.

## 4. Panel administrativo
- Resumen: añadir tarjeta con el **total de libros del CRE** y enlace a `/admin/libros`.
- Acciones rápidas: añadir "Agregar libro al CRE".
- Badge de rol visible (Administrador / Editor) en el encabezado del panel.

## 5. Inicio (home)
- Sección destacada del CRE: una franja con 4 portadas recientes y botón "Ver catálogo completo", visible solo si hay libros publicados.

## 6. Rendimiento y SEO
- Imágenes de portada y galería: `loading="lazy"` ya aplicado; verificar `alt` descriptivos en todas las imágenes dinámicas.
- Añadir `/guias` y `/cre` verificados en `sitemap.xml` con fecha de actualización.
- JSON-LD de la página de contacto con datos de la sede.

## 7. Detalles de diseño
- Animación suave de aparición (fade-in) en tarjetas de noticias, galería y libros.
- Estado activo del enlace actual en el menú principal (subrayado o color).

## Detalles técnicos
- Cambios solo en componentes existentes: `Footer.tsx`, `cre.tsx`, `guias.tsx`, `admin/index.tsx`, `index.tsx` (nueva franja CRE), `Header.tsx` (estado activo), `sitemap.xml`.
- Sin nuevas tablas ni migraciones; todo usa datos ya disponibles (`getLibraryBooks`).
- La franja CRE del inicio reutiliza `booksQueryOptions` filtrando `is_active` y tomando los 4 primeros.

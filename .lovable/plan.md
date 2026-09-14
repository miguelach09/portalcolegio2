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

## 5b. Rediseño visual del inicio (misma información, más impacto)
Sin cambiar textos, secciones ni contenido, solo presentación:
- **Hero más cinematográfico**: imagen a pantalla casi completa con degradado institucional, titular grande con animación de entrada (aparece palabra por palabra o con fade escalonado) y botones con efecto hover elegante.
- **Indicador de scroll** animado (flecha flotante) invitando a bajar.
- **Animaciones al hacer scroll**: cada sección (accesos rápidos, noticias, galería, banner de admisiones) entra con fade-in/desplazamiento suave al aparecer en pantalla (IntersectionObserver), respetando `prefers-reduced-motion`.
- **Accesos rápidos**: tarjetas con hover que eleva y realza el ícono/imagen, con transición suave.
- **Noticias**: tarjeta principal destacada más grande con la imagen como fondo y degradado; las secundarias a un lado.
- **Galería**: presentación tipo mosaico con zoom suave al pasar el cursor.
- **Banner de admisiones**: más protagonismo visual con fondo en gradiente Cafam y llamado a la acción destacado.
- Se propone generar 2-3 direcciones visuales (prototipos) del hero para que elijas antes de implementar.

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

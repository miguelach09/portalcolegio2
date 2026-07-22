
# Plan de pulido del sitio

## 1. Fix de tema claro (títulos blancos)

Auditar y corregir cualquier título/encabezado que hereda color blanco al cambiar a tema claro. Los sospechosos principales:

- `src/components/site/PageHero.tsx`: la sección usa `text-white` global sobre gradiente azul — ese está OK (gradiente es oscuro en ambos temas). Verificar que los `h1` internos no tengan clase forzada.
- `src/components/site/News.tsx`, `GalleryPreview.tsx`, `AdmissionsBanner.tsx`, `Footer.tsx`, `QuickAccess.tsx`: revisar cualquier `text-white`, `text-black` o color hex hardcoded en encabezados dentro de tarjetas o secciones sobre fondo claro.
- Reemplazar por tokens semánticos: `text-foreground`, `text-primary-foreground`, `text-muted-foreground` según contexto.
- Confirmar que la regla base en `src/styles.css` (`h1..h6 { color: inherit }` implícito) no está sobreescrita.

Verificación: capturar screenshot con Playwright en cada ruta (`/`, `/mi-colegio`, `/admisiones`, `/galeria`, `/circulares`, `/herramientas`, `/contacto`, `/bienestar`, `/biblioteca`) en ambos temas y confirmar contraste.

## 2. Reemplazar "PAC" por "Guías de Aprendizaje"

### Base de datos (migración)
- Agregar valor `guias` al enum `document_category`.
- Agregar columna `grade` (text nullable) a `public.documents` con CHECK constraint para: `transicion`, `primero`, `segundo`, `tercero`, `cuarto`, `quinto`, `sexto`, `septimo`, `octavo`, `noveno`, `decimo`, `once`.
- Índice en `(category, grade, is_active)` para consultas rápidas.

### Backend
- `src/lib/content.schemas.ts`: agregar `guias` al `documentCategorySchema`, agregar `gradeSchema` y campo opcional `grade` en `documentFormSchema`.
- `src/lib/content.functions.ts`: `getDocuments` acepta filtro opcional `grade`; nuevo `getGuiasByGrade({ grade })`.
- Regenerar `types.ts` tras la migración.

### Rutas y UI
- Nueva ruta `src/routes/guias.tsx` con selector visual de grado (12 tarjetas: Transición → Once) y listado filtrado de PDFs por grado seleccionado (usa search param `?grado=`).
- `src/components/site/QuickAccess.tsx`: cambiar el ítem PAC por "Guías de Aprendizaje" → `/guias` con icono/imagen adecuado (reusar `btn-pac.png` o generar uno nuevo con texto "Guías").
- `src/components/site/Header.tsx`: opcional, incluir "Guías" en nav principal o mantenerlo bajo Herramientas.
- Admin: `src/routes/_authenticated/admin/documentos/nuevo.tsx` — mostrar selector de grado cuando `category === "guias"`, y en el listado permitir filtrar por grado.

## 3. Ajustes adicionales de pulido

Cambios enfocados en UX, accesibilidad y SEO — sin tocar lógica de negocio existente:

- **Página 404 personalizada** con branding Cafam y links a secciones principales (`__root.tsx` `notFoundComponent`).
- **Skeletons de carga** en Home, Galería, Circulares y Guías (reemplazar el flash de contenido vacío).
- **Botón "volver arriba"** flotante en páginas largas (opuesto al asistente IA para no chocar).
- **Buscador simple** en `/circulares` y `/guias` (input que filtra por título en cliente).
- **Meta tags og:image** en rutas hoja usando una imagen real del portal.
- **Favicon y apple-touch-icon** con el logo Cafam.
- **Accesibilidad**: `aria-label` en todos los botones icónicos (tema, menú, cerrar asistente), foco visible con `focus-visible:ring`, contraste AA validado.
- **Persistencia de tema**: verificar que `ThemeToggle` respeta `prefers-color-scheme` en primera visita y no parpadea (script inline en `<head>` de `__root.tsx` que aplica la clase `dark` antes de la hidratación).
- **Footer**: agregar enlaces a redes sociales reales del colegio y línea de contacto.
- **Breadcrumbs** simples en páginas internas para orientación.

## Diagrama de flujo Guías

```text
QuickAccess [Guías] ──► /guias (grid de 12 grados)
                             │
                             ▼
                        /guias?grado=quinto
                             │
                             ▼
                     Lista de PDFs filtrados
                     (getGuiasByGrade)
```

## Detalles técnicos

- La migración de `document_category` requiere `ALTER TYPE ... ADD VALUE 'guias'` en su propia transacción antes de usarse.
- Grade se guarda como texto con CHECK constraint (no enum) para permitir agregar grados sin migración futura.
- El selector de grado usa `validateSearch` con zod + `fallback` (siguiendo `tanstack-search-params`).
- No se cambia el backend de admisiones, galería, noticias ni el asistente IA.

## Fuera de alcance

- No se rediseña la identidad visual ni la estructura de rutas existente.
- No se toca la lógica del asistente de IA.
- No se implementa multi-idioma ni PWA (se puede proponer aparte).

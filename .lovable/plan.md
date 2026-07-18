## Objetivo

Rediseñar el sitio del Colegio Cafam manteniendo su identidad visual (azul Cafam + acentos amarillo/naranja/verde) pero con una ejecución moderna: tipografía Outfit/Figtree, layouts más aireados, tarjetas suaves, mejor jerarquía y experiencia mobile-first. Se replican todas las secciones actuales.

## Sistema de diseño

- **Paleta** (tokens en `src/styles.css`): azul Cafam `#0057a8` (primary), celeste `#009fe3` (accent), amarillo `#ffd200`, verde `#5bbf5b`, naranja `#ff8a2b`, blanco/gris neutros. Definidos en `oklch` con variantes claras y `--gradient-hero`, `--shadow-card`.
- **Tipografía**: Outfit (headings) + Figtree (body), cargadas vía `<link>` en `__root.tsx`.
- **Componentes base**: header sticky con logo Cafam + nav, hero con carrusel, cards con iconos redondeados (accesos), grid de noticias, footer con redes sociales y datos de contacto.

## Estructura de rutas (TanStack Router)

```
src/routes/
  __root.tsx            (header + footer sitewide, tipografías, tokens)
  index.tsx             Home
  mi-colegio.tsx        Historia, misión, visión, PEI
  admisiones.tsx        Proceso Admisiones 2027
  galeria.tsx           Fotos instalaciones y eventos
  circulares.tsx        Listado de comunicados
  herramientas.tsx      Herramientas digitales
  bienestar.tsx
  biblioteca.tsx
  contacto.tsx
```

Cada ruta con su propio `head()` (title, description, og:title/description, canonical relativo).

## Home (`/`)

1. **Header**: logo Cafam Colegio + nav (Inicio, Mi Colegio, Admisiones, Galería, Circulares, Herramientas, Contáctenos) + botón CTA "Admisiones 2027".
2. **Hero carrusel**: 4 slides (Admisiones 2027, Piscinas, Canchas, Instagram) con badges de índice, título grande, subtítulo, CTA principal.
3. **Accesos rápidos**: grid de 6 tarjetas con icono coloreado — Admisiones, PAC, Bienestar, Q10 (recibo matrícula), Correo institucional, Biblioteca. Cada una con hover suave.
4. **Noticias**: 3 tarjetas destacadas (Boletín escolar, Convocatoria docentes, etc.) con fecha, título, resumen y "leer más".
5. **De interés**: lista con Horario rotativo, Minuta escolar, Directorio funcionarios, Líneas telefónicas, Fechas institucionales.
6. **Galería preview**: mosaico de 6-8 imágenes de vida escolar con CTA "Ver galería completa".
7. **Franja Admisiones 2027**: banda a ancho completo con fechas de preinscripción y CTA.
8. **Footer**: datos del colegio, redes (YouTube, SoundCloud, Instagram), enlaces rápidos, créditos.

## Páginas internas

- **Mi Colegio**: hero con foto + tabs/secciones (Historia, PEI, Misión/Visión, Valores).
- **Admisiones**: timeline del proceso, requisitos, fechas, FAQ, CTA preinscripción.
- **Galería**: grid tipo masonry con filtros por categoría.
- **Circulares**: lista con búsqueda/filtro por fecha, cards con PDF/enlace.
- **Herramientas digitales**: grid de accesos externos (Office 365, Q10, PAC, etc.).
- **Bienestar / Biblioteca**: página informativa con hero + secciones.
- **Contáctenos**: mapa embebido, formulario, teléfonos, direcciones, horarios.

## Contenido

- Se mantiene el contenido/enlaces externos actuales (Q10, Office 365, YouTube, SoundCloud, PAC, Bienestar).
- Imágenes iniciales: placeholders (`data-lov-image-placeholder`) para renders de instalaciones/estudiantes y fotos genéricas; los enlaces a assets externos actuales (`portalcolegio.com/images/...`) no se referenciarán directamente para evitar dependencia; se usan renders/uploads.
- Textos: se conserva la voz institucional y datos visibles hoy; noticias como ejemplos placeholder que el colegio podrá reemplazar.

## Detalles técnicos

- Tokens de color y sombras en `src/styles.css` (`@theme` + `:root`).
- `<link>` a Google Fonts (Outfit + Figtree) en `head()` del root.
- Componentes reutilizables en `src/components/site/` (Header, Footer, HeroCarousel, QuickAccessCard, NewsCard, SectionHeading).
- Carrusel del hero con `embla-carousel-react` (auto-play).
- Animaciones sutiles con `framer-motion` (fade-in on scroll).
- SEO: cada ruta con `head()` propio; `<link rel="canonical">` en leafs; JSON-LD `EducationalOrganization` en `__root.tsx`.
- Mobile-first, breakpoints Tailwind, menú hamburguesa en <768px.

## Fuera de alcance

- Backend / login real / integración con Q10 (solo enlaces externos).
- Migración de contenido real (se usa contenido placeholder representativo).
- Multi-idioma.

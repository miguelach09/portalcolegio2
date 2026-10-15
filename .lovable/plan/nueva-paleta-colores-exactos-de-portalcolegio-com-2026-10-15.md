# Nueva paleta: colores exactos de portalcolegio.com

## Objetivo
Reemplazar la paleta actual (azul Cafam #0057a8 y acentos propios) por los colores exactos que usa hoy portalcolegio.com, extraídos de sus hojas de estilo oficiales.

## Colores detectados en portalcolegio.com (css/style.css y css/layout.css)

| Uso en el portal actual | Color exacto |
|---|---|
| Fondo principal del sitio | Azul `#0369BB` |
| Botones y enlaces destacados (hover) | Verde `#60b001` |
| Enlaces de listas / acentos | Naranja `#FF9900` |
| Menú activo y hover del menú | Dorado `#FEAC00` |
| Texto general | Gris `#555555` |
| Fondos de tarjetas / secciones | Blancos y grises `#fff`, `#f2f2f2`, `#e6e6e6` |

## Cambios

### 1. `src/styles.css` — único archivo a modificar
Todos los colores del sitio salen de los tokens de este archivo, así que el cambio es centralizado:

- **Tema claro (`:root`)**
  - `--primary`: azul `#0369BB` (equivalente oklch) — botones, enlaces, encabezados de sección.
  - `--accent` / `--green-brand`: verde `#60b001` — botones de acción y estados hover, como en el portal.
  - `--orange-brand`: `#FF9900` y `--yellow-brand`: `#FEAC00` — insignias, íconos de accesos rápidos, estados activos del menú.
  - `--foreground`: gris `#555555` para el texto general; fondos en blanco/grises suaves (`#f2f2f2`, `#e6e6e6`).
  - `--gradient-hero` y `--gradient-sky`: degradados entre `#0369BB` y el verde/naranja del portal.
  - `--ring`, `--shadow-card`, `--shadow-lift`: derivados del nuevo azul.
- **Tema oscuro (`.dark`)**
  - Mismos colores de marca (`#0369BB`, `#60b001`, `#FF9900`, `#FEAC00`) ajustados en luminosidad para buen contraste sobre fondos oscuros; los fondos oscuros actuales se mantienen.

### 2. Verificación
- Recorrer las páginas principales (inicio, circulares, galería, guías, mi colegio, admin) en tema claro y oscuro para confirmar contraste legible de títulos y botones.
- Confirmar que el logo real de Cafam siga viéndose bien sobre la placa del encabezado con el nuevo azul.

## Fuera de alcance
- No se cambian fuentes (Outfit/Figtree se mantienen), ni layout, ni contenido.
- No se toca ningún otro archivo: el cambio es solo de tokens de color.

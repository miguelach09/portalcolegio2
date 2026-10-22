# Contraste legible con la paleta de portalcolegio.com

## Objetivo
Mantener los colores exactos del portal (azul #0369BB, verde #60b001, naranja #FF9900, dorado #FEAC00, gris #555555) pero garantizar que todo texto cumpla contraste WCAG AA (4.5:1 texto normal, 3:1 títulos grandes) en modo claro y oscuro, en todas las secciones.

## Problemas detectados
- Texto blanco sobre verde, naranja o dorado queda por debajo de 3:1 (ilegible en botones e insignias).
- Texto secundario gris (#808080) sobre fondo #f2f2f2 queda cerca de 3.5:1, insuficiente para párrafos.
- Varias secciones usan colores fijos (blanco, slate, gray) que no cambian con el tema: pie de página, carrusel, noticias, admisiones, contacto, calendario, herramientas, galería, buscador, asistente, entre otras (unas 20 piezas).
- En el degradado azul→verde del encabezado de páginas, el texto blanco pierde contraste en el extremo verde.

## Cambios
1. **Tokens de color (`src/styles.css`)**
   - Conservar los tonos de marca como fondos/decoración, y añadir variantes de texto oscurecidas para usarlas sobre fondos claros (verde, naranja y dorado "texto").
   - Texto sobre verde, naranja y dorado: gris muy oscuro en vez de blanco.
   - Texto secundario: oscurecer a ~#666 en claro; aclarar en oscuro.
   - Modo oscuro: aclarar azul y acentos para que los enlaces y títulos se lean sobre fondos oscuros.
   - Degradados del encabezado: usar un azul más profundo en el extremo con texto, para que el blanco cumpla 4.5:1.
2. **Componentes y páginas**: reemplazar colores fijos de texto/fondo por los tokens del tema en las ~20 piezas listadas, manteniendo blanco solo donde el fondo sea siempre azul oscuro o una foto con capa oscura.
3. **Verificación**: medir con una herramienta automática de contraste (axe) en inicio, admisiones, circulares, galería, guías, mi colegio, CRE, contacto, calendario, FAQ, noticia, y admin, en ambos temas; corregir lo que falle y revisar capturas.

## Fuera de alcance
- No cambian fuentes, diseño ni contenido.

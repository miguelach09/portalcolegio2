import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";


type ChatMessage = { role: "user" | "assistant"; content: string };

export type AssistantLink = {
  label: string;
  sublabel: string | null;
  href: string;
  kind: "documento" | "libro" | "noticia" | "evento" | "faq" | "galeria" | "docente" | "pagina";
  external: boolean;
};

const BUCKET_NAME = "site-assets";

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
  );
}

async function getSignedUrl(filePath: string, download = false) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const filename = filePath.split("/").pop();
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60 * 24, {
        download: download ? filename || true : false,
      });
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

// Strip PostgREST filter control characters so a term can never alter the
// structure of an `.or()` / `.ilike()` filter string.
function sanitizeTerm(input: string): string {
  return input
    .replace(/[,.()"'\\%*:{}\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

const STOPWORDS = new Set([
  "hola","que","qué","cual","cuál","cuales","cuáles","como","cómo","donde","dónde","para","por","los","las","del","con","una","uno","unos","unas","the","and","sobre","tiene","tienen","hay","dame","dime","puedo","puedes","quiero","necesito","favor","gracias","buscar","busca","muestrame","muéstrame","enviame","envíame","link","enlace","informacion","información","colegio","cafam","este","esta","esto","son","ser","mas","más","año","ano","todo","todos","toda","todas","pdf","archivo","archivos",
  // Palabras conversacionales que antes provocaban botones sin relación.
  "cualquier","lugar","creas","cosa","cosas","algo","alguien","interesado","sorprender","sorprenderá","sorprendera","mandame","mándame","llevame","llévame","recomienda","recomiendas","recomiendame","ayuda","ayudame","ayúdame","gustaria","gustaría","tema","temas","detalle","detalles","detallado","hacer","saber","conocer","tengo","estoy","sirve","sirves","eres","haces","hablar","cuenta","cuentame","cuéntame","mucho","muchas","poco","bien","gracias","porfavor","entonces","tambien","también","aqui","aquí","ahora","luego","persona","personas","nombre","manera","forma","amplio","amplia","eficiente","amigable","objetivo","contenido","pagina","página","web","sitio","seccion","sección","secciones","platform","plataforma","plataformas",
  // Palabras de 4 letras que no aportan a la búsqueda.
  "quien","desde","hasta","pero","sino","porque","otro","otra","otros","otras","ello","ella","esos","esas","aqui","alli","solo","sola","cada","muy","tan","sera","seria","estan","estar","puede","tipo","tipos","dias","dia","vez","veces","favor","hoja","ver","verlo","abrir","abre",
]);

// Términos cortos que sí importan (siglas y palabras del colegio) y que el
// filtro de longitud descartaba antes.
const SHORT_TERMS = new Set([
  "pei","cre","faq","q10","guia","guias","arte","artes","once","diez","nueve","ocho","siete","seis","cinco","icfes","pta","tics","ingles","math","10","11","1","2","3","4","5","6","7","8","9","0","yoga",
]);

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function keywords(text: string): string[] {
  const words = normalize(sanitizeTerm(text))
    .split(" ")
    .filter((w) => !STOPWORDS.has(w) && (w.length >= 4 || SHORT_TERMS.has(w)));
  return Array.from(new Set(words)).slice(0, 5);
}

const routeForDocument = (category: string | null) => {
  switch (category) {
    case "circulares":
      return "/circulares";
    case "guias":
      return "/guias";
    case "admisiones":
      return "/admisiones";
    case "herramientas":
      return "/herramientas";
    default:
      return "/circulares";
  }
};

const MAX_LINKS = 4;

async function findResources(query: string, conversationContext = ""): Promise<AssistantLink[]> {
  const rawCurrent = normalize(query);
  const isFollowUp = [
    "boton",
    "botón",
    "enlace",
    "link",
    "ir alla",
    "ir allá",
    "llevarme",
    "muestralo",
    "muéstralo",
  ].some((phrase) => rawCurrent.includes(normalize(phrase)));
  const effectiveQuery = isFollowUp ? `${conversationContext} ${query}` : query;
  const terms = keywords(effectiveQuery);
  // Sin palabras con contenido (saludos, charla general, preguntas sobre el
  // propio asistente) no se muestra ningún botón.
  if (!terms.length) return [];

  const normalizedQuery = normalize(effectiveQuery);
  const specificGalleryTerms = terms.filter(
    (term) => !["galeria", "galerias", "fotos", "imagen", "imagenes"].includes(term)
  );
  if (
    ["galeria", "galería", "fotos", "imagenes", "imágenes"].some((word) => normalizedQuery.includes(normalize(word))) &&
    specificGalleryTerms.length === 0
  ) {
    return [{
      label: "Galería",
      sublabel: "Fotos y momentos de la vida escolar",
      href: "/galeria",
      kind: "galeria",
      external: false,
    }];
  }

  const supabase = createPublicClient();
  type Candidate = { link: AssistantLink; haystack: string; boost: number };
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  const add = (link: AssistantLink, haystack: string, boost = 0) => {
    const key = `${link.kind}:${link.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ link, haystack: normalize(haystack), boost });
  };

  for (const term of terms) {
    const like = `%${term}%`;
    const [docs, books, news, events, faqs, gallery, knowledge] = await Promise.all([
      supabase
        .from("documents")
        .select("id,title,category,grade,period,area,file_path")
        .eq("is_active", true)
        .ilike("title", like)
        .limit(4),
      supabase
        .from("library_books")
        .select("id,title,author,publisher,kind,grade")
        .eq("is_active", true)
        .or(`title.ilike.${like},author.ilike.${like},publisher.ilike.${like}`)
        .limit(4),
      supabase
        .from("news")
        .select("id,title,summary")
        .eq("is_active", true)
        .or(`title.ilike.${like},summary.ilike.${like}`)
        .limit(3),
      supabase
        .from("events")
        .select("id,title,description,start_date")
        .eq("is_active", true)
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(3),
      supabase
        .from("faqs")
        .select("id,question")
        .eq("is_active", true)
        .ilike("question", like)
        .limit(3),
      supabase
        .from("gallery_images")
        .select("id,title,category")
        .eq("is_active", true)
        .ilike("title", like)
        .limit(3),
      supabase
        .from("assistant_knowledge")
        .select("id,title,tags,file_path")
        .eq("is_active", true)
        .or(`title.ilike.${like},tags.ilike.${like}`)
        .limit(3),
    ]);

    for (const d of docs.data ?? []) {
      const signed = d.file_path ? await getSignedUrl(d.file_path) : null;
      const bits = [d.category as string, d.grade, d.period ? `Periodo ${d.period}` : null, d.area]
        .filter(Boolean)
        .join(" · ");
      add(
        {
          label: d.title,
          sublabel: bits || null,
          href: signed ?? routeForDocument(d.category as string),
          kind: "documento",
          external: Boolean(signed),
        },
        d.title
      );
    }
    for (const b of books.data ?? []) {
      add(
        {
          label: b.title,
          sublabel: [b.author, b.publisher, b.kind === "plan_lector" ? "Plan Lector" : "Consulta en sala", b.grade]
            .filter(Boolean)
            .join(" · "),
          href: "/cre",
          kind: "libro",
          external: false,
        },
        [b.title, b.author, b.publisher].filter(Boolean).join(" ")
      );
    }
    for (const n of news.data ?? []) {
      add(
        { label: n.title, sublabel: n.summary, href: `/noticias/${n.id}`, kind: "noticia", external: false },
        [n.title, n.summary].filter(Boolean).join(" ")
      );
    }
    for (const e of events.data ?? []) {
      add(
        { label: e.title, sublabel: e.description, href: "/calendario", kind: "evento", external: false },
        [e.title, e.description].filter(Boolean).join(" ")
      );
    }
    for (const f of faqs.data ?? []) {
      add({ label: f.question, sublabel: null, href: "/faq", kind: "faq", external: false }, f.question);
    }
    for (const g of gallery.data ?? []) {
      add(
        { label: g.title, sublabel: g.category as string, href: "/galeria", kind: "galeria", external: false },
        [g.title, g.category].filter(Boolean).join(" ")
      );
    }
    for (const k of knowledge.data ?? []) {
      if (!k.file_path) continue;
      const signed = await getSignedUrl(k.file_path);
      if (!signed) continue;
      add(
        {
          label: k.title,
          sublabel: k.tags || "Documento del colegio",
          href: signed,
          kind: "documento",
          external: true,
        },
        [k.title, k.tags].filter(Boolean).join(" "),
        1
      );
    }
  }

  // Puntaje: cuántas palabras de la pregunta aparecen realmente en el
  // resultado. Se descarta todo lo que no coincida de verdad.
  const scored = candidates
    .map((c) => ({
      link: c.link,
      score: terms.filter((t) => c.haystack.includes(t)).length + c.boost,
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.score ?? 0;
  // Si hay coincidencias fuertes (varias palabras), se ocultan las débiles.
  const links = scored
    .filter((c) => c.score >= Math.min(best, 2))
    .slice(0, MAX_LINKS)
    .map((c) => c.link);

  // Atajos de sección: solo cuando la pregunta los nombra explícitamente y
  // como complemento, nunca reemplazando resultados concretos.
  const raw = normalize(effectiveQuery);
  const wants = (...needles: string[]) => needles.some((n) => raw.includes(n));
  const shortcuts: AssistantLink[] = [];
  const shortcut = (l: AssistantLink) => {
    if (!links.some((x) => x.label === l.label)) shortcuts.push(l);
  };

  if (wants("plan lector", "consulta en sala", "biblioteca", "libros del cre"))
    shortcut({ label: "CRE — Biblioteca", sublabel: "Consulta en sala y Plan Lector", href: "/cre", kind: "pagina", external: false });
  if (wants("guia", "guias"))
    shortcut({ label: "Guías de Aprendizaje", sublabel: "Escoge tu grado y descarga", href: "/guias", kind: "pagina", external: false });
  if (wants("circular"))
    shortcut({ label: "Circulares", sublabel: "Comunicados institucionales", href: "/circulares", kind: "pagina", external: false });
  if (wants("noticia"))
    shortcut({ label: "Noticias", sublabel: "Vida escolar y comunidad", href: "/#noticias", kind: "pagina", external: false });
  if (wants("evento", "calendario"))
    shortcut({ label: "Calendario escolar", sublabel: "Eventos y fechas clave", href: "/calendario", kind: "pagina", external: false });
  if (wants("galeria", "galería", "foto", "fotos", "imagen", "imagenes", "imágenes"))
    shortcut({ label: "Galería", sublabel: "Fotos y momentos de la vida escolar", href: "/galeria", kind: "galeria", external: false });
  if (wants("mi colegio", "pei", "manual de convivencia", "recorrido virtual"))
    shortcut({ label: "Mi Colegio", sublabel: "PEI, manuales y recorrido virtual", href: "/mi-colegio", kind: "pagina", external: false });
  if (wants("bienestar", "enfermeria", "enfermería", "orientacion", "orientación"))
    shortcut({ label: "Bienestar", sublabel: "Servicios de apoyo para estudiantes", href: "/bienestar", kind: "pagina", external: false });
  if (wants("herramienta", "q10", "office 365", "correo institucional", "plataforma"))
    shortcut({ label: "Herramientas", sublabel: "Accesos y plataformas institucionales", href: "/herramientas", kind: "pagina", external: false });
  if (wants("docente", "profesor", "profesora", "coordinador", "coordinacion", "rector", "directivo"))
    shortcut({ label: "Contáctenos", sublabel: "Líneas de atención y correos", href: "/contacto", kind: "pagina", external: false });
  if (wants("admision", "inscrib", "matricul"))
    shortcut({ label: "Admisiones 2027", sublabel: "Proceso y preinscripción", href: "/admisiones", kind: "pagina", external: false });

  return [...links, ...shortcuts].slice(0, MAX_LINKS);
}


async function buildContext() {
  const supabase = createPublicClient();
  const [{ data: docs }, { data: news }, { data: gallery }, { data: books }, { data: knowledge }] = await Promise.all([
    supabase.from("documents").select("title, category, grade, period, area, published_at").eq("is_active", true).order("published_at", { ascending: false }).limit(80),
    supabase.from("news").select("title, summary, content, category, published_at").eq("is_active", true).order("published_at", { ascending: false }).limit(20),
    supabase.from("gallery_images").select("title, category").eq("is_active", true).limit(30),
    supabase.from("library_books").select("title, author, publisher, kind, grade, price_cop").eq("is_active", true).limit(60),
    supabase.from("assistant_knowledge").select("title, content, tags").eq("is_active", true).order("sort_order", { ascending: true }).limit(80),
  ]);

  const docLines = (docs || [])
    .map((d) => `- [${d.category}] ${d.title}${d.grade ? ` · ${d.grade}` : ""}${d.period ? ` · Periodo ${d.period}` : ""}${d.area ? ` · ${d.area}` : ""}`)
    .join("\n");
  const newsLines = (news || []).map((n) => `- [${n.category}] ${n.title}${n.summary ? ` — ${n.summary}` : ""}${n.content ? `\n  ${String(n.content).slice(0, 400)}` : ""}`).join("\n");
  const galleryLines = (gallery || []).map((g) => `- [${g.category}] ${g.title}`).join("\n");
  const bookLines = (books || [])
    .map((b) => `- [${b.kind === "plan_lector" ? "Plan Lector" : "Consulta en sala"}] ${b.title}${b.author ? ` — ${b.author}` : ""}${b.publisher ? ` (${b.publisher})` : ""}${b.grade ? ` · ${b.grade}` : ""}${b.price_cop ? ` · $${b.price_cop}` : ""}`)
    .join("\n");
  const knowledgeLines = (knowledge || [])
    .map((k) => `### ${k.title}${k.tags ? ` (${k.tags})` : ""}\n${String(k.content).slice(0, 2500)}`)
    .join("\n\n");


  return `INFORMACIÓN DEL COLEGIO CAFAM (contenido publicado en la web):

CONOCIMIENTO ADICIONAL CARGADO POR EL COLEGIO (información oficial y prioritaria; si responde la pregunta, úsala antes que cualquier otra fuente):
${knowledgeLines || "(sin entradas)"}

DOCUMENTOS, CIRCULARES Y GUÍAS DISPONIBLES:
${docLines || "(sin documentos)"}


LIBROS DEL CRE (Centro de Recursos Educativos):
${bookLines || "(sin libros)"}

NOTICIAS RECIENTES:
${newsLines || "(sin noticias)"}

GALERÍA:
${galleryLines || "(sin imágenes)"}

DATOS INSTITUCIONALES:
- Nombre: Colegio Cafam
- Fundación: 1971
- Dirección: Av. Cra. 68 No. 90-88, Bogotá
- Teléfono: (601) 307 8060
- Admisiones 2027: preinscripciones del 15 de julio al 17 de agosto de 2026
- Plataformas: PAC (portalcolegio.com/ingresoPac.php), Q10 (site.q10.com), Correo Office 365
- Secciones del sitio: Mi Colegio, Admisiones, Galería, Circulares, Guías de Aprendizaje, Herramientas, Bienestar, CRE (Biblioteca), Calendario, Contacto`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const lastUserIndex = data.messages.map((m) => m.role).lastIndexOf("user");
    const lastUser = lastUserIndex >= 0 ? data.messages[lastUserIndex]?.content ?? "" : "";
    const conversationContext = data.messages
      .slice(Math.max(0, lastUserIndex - 2), lastUserIndex)
      .map((m) => m.content)
      .join(" ");
    const [context, links] = await Promise.all([buildContext(), findResources(lastUser, conversationContext)]);

    const matchesBlock = links.length
      ? `\n\nRESULTADOS ENCONTRADOS PARA LA ÚLTIMA PREGUNTA (el usuario verá botones de acceso debajo de tu respuesta, no escribas enlaces):\n${links
          .map((l) => `- [${l.kind}] ${l.label}${l.sublabel ? ` — ${l.sublabel}` : ""}`)
          .join("\n")}`
      : "";

    const staffBlock = links.length
      ? ""
      : "\n\nNO HAY RESULTADOS PARA ESTA PREGUNTA: no menciones botones ni digas que abajo aparecen enlaces; responde solo con texto.";

    const systemPrompt = `Eres el asistente virtual del Colegio Cafam. Ayudas a acudientes y estudiantes con información sobre el colegio: admisiones, circulares, guías de aprendizaje, libros del CRE, docentes, eventos, plataformas, bienestar y vida escolar.

Reglas:
- Responde SIEMPRE en español, de forma cálida, breve y clara.
- Usa la información institucional proporcionada abajo como fuente principal.
- Si encuentras documentos, guías, libros, noticias o eventos relacionados, menciónalos por su título y di que abajo aparecen los botones de acceso.
- No escribas URLs ni enlaces en markdown: los botones se muestran automáticamente.
- Si no tienes la información, dilo con honestidad y sugiere contactar al colegio (601) 307 8060 o escribir a info@portalcolegio.com.
- No inventes fechas, cifras ni datos que no estén en el contexto.
- Preguntas sobre docentes, coordinaciones, directivos, bienestar, enfermería, secretarías o teléfonos: usa el CONOCIMIENTO ADICIONAL cargado por el colegio. Si no está allí, dilo amablemente y ofrece derivar la consulta: PBX (601) 437 8999, correo colegio@cafam.com.co o la página de Contáctenos.

${context}${matchesBlock}${staffBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...data.messages,
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[assistant] gateway error:", response.status, text);
      if (response.status === 429) throw new Error("Demasiadas solicitudes. Intenta de nuevo en un momento.");
      if (response.status === 402) throw new Error("Servicio de IA no disponible temporalmente.");
      throw new Error("No se pudo obtener respuesta del asistente.");
    }

    const json = await response.json();
    const reply = json?.choices?.[0]?.message?.content ?? "Lo siento, no pude generar una respuesta.";
    return { reply, links };
  });

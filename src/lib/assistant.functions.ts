import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { STAFF_DIRECTORY_TEXT, STAFF_DIRECTORY_SOURCE, PHONE_LINES_SOURCE } from "@/lib/staff-directory";

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
  "hola","que","qué","cual","cuál","cuales","cuáles","como","cómo","donde","dónde","para","por","los","las","del","con","una","uno","unos","unas","the","and","sobre","tiene","tienen","hay","dame","dime","puedo","puedes","quiero","necesito","favor","gracias","buscar","busca","muestrame","muéstrame","enviame","envíame","acceso","link","enlace","informacion","información","colegio","cafam","este","esta","esto","son","ser","mas","más","año","ano","todo","todos","toda","todas","pdf","archivo","archivos","documento","documentos",
]);

function keywords(text: string): string[] {
  return sanitizeTerm(text)
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
    .slice(0, 5);
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

async function findResources(query: string): Promise<AssistantLink[]> {
  const words = keywords(query);
  const q = sanitizeTerm(query);
  const terms = words.length ? words : q.length >= 3 ? [q] : [];
  if (!terms.length) return [];

  const supabase = createPublicClient();
  const links: AssistantLink[] = [];
  const seen = new Set<string>();

  const push = (l: AssistantLink) => {
    const key = `${l.kind}:${l.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push(l);
  };

  for (const term of terms) {
    const like = `%${term}%`;
    const [docs, books, news, events, faqs, gallery, teachers] = await Promise.all([
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
        .or(`title.ilike.${like},summary.ilike.${like},content.ilike.${like}`)
        .limit(4),
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
        .or(`question.ilike.${like},answer.ilike.${like}`)
        .limit(3),
      supabase
        .from("gallery_images")
        .select("id,title,category")
        .eq("is_active", true)
        .ilike("title", like)
        .limit(3),
      supabase
        .from("teachers")
        .select("id,full_name,role_title,area")
        .eq("is_active", true)
        .or(`full_name.ilike.${like},role_title.ilike.${like},area.ilike.${like}`)
        .limit(3),
    ]);

    for (const d of docs.data ?? []) {
      const signed = d.file_path ? await getSignedUrl(d.file_path) : null;
      const bits = [d.category as string, d.grade, d.period ? `Periodo ${d.period}` : null, d.area]
        .filter(Boolean)
        .join(" · ");
      push({
        label: d.title,
        sublabel: bits || null,
        href: signed ?? routeForDocument(d.category as string),
        kind: "documento",
        external: Boolean(signed),
      });
    }
    for (const b of books.data ?? []) {
      push({
        label: b.title,
        sublabel: [b.author, b.publisher, b.kind === "plan_lector" ? "Plan Lector" : "Consulta en sala", b.grade]
          .filter(Boolean)
          .join(" · "),
        href: "/cre",
        kind: "libro",
        external: false,
      });
    }
    for (const n of news.data ?? []) {
      push({ label: n.title, sublabel: n.summary, href: `/noticias/${n.id}`, kind: "noticia", external: false });
    }
    for (const e of events.data ?? []) {
      push({ label: e.title, sublabel: e.description, href: "/calendario", kind: "evento", external: false });
    }
    for (const f of faqs.data ?? []) {
      push({ label: f.question, sublabel: null, href: "/faq", kind: "faq", external: false });
    }
    for (const g of gallery.data ?? []) {
      push({ label: g.title, sublabel: g.category as string, href: "/galeria", kind: "galeria", external: false });
    }
    for (const t of teachers.data ?? []) {
      push({
        label: t.full_name,
        sublabel: [t.role_title, t.area].filter(Boolean).join(" · ") || null,
        href: "/docentes",
        kind: "docente",
        external: false,
      });
    }
  }

  // Intención por tema: si la pregunta habla de una sección completa
  // ("libros del plan lector", "guías", "circulares"...), añade sus elementos.
  const raw = query.toLowerCase();
  const wants = (...needles: string[]) => needles.some((n) => raw.includes(n));

  if (wants("plan lector", "consulta en sala", "biblioteca", "cre", "libro")) {
    const kind = wants("plan lector") ? "plan_lector" : wants("consulta") ? "consulta" : null;
    let bq = supabase
      .from("library_books")
      .select("id,title,author,publisher,kind,grade")
      .eq("is_active", true)
      .order("sort_order")
      .limit(6);
    if (kind) bq = bq.eq("kind", kind);
    const { data } = await bq;
    for (const b of data ?? []) {
      push({
        label: b.title,
        sublabel: [b.author, b.publisher, b.kind === "plan_lector" ? "Plan Lector" : "Consulta en sala", b.grade]
          .filter(Boolean)
          .join(" · "),
        href: "/cre",
        kind: "libro",
        external: false,
      });
    }
  }

  if (wants("guia", "guía", "guias", "guías")) {
    push({ label: "Guías de Aprendizaje", sublabel: "Escoge tu grado y descarga", href: "/guias", kind: "pagina", external: false });
  }
  if (wants("circular")) {
    push({ label: "Circulares", sublabel: "Comunicados institucionales", href: "/circulares", kind: "pagina", external: false });
  }
  if (wants("noticia")) {
    push({ label: "Noticias", sublabel: "Vida escolar y comunidad", href: "/#noticias", kind: "pagina", external: false });
  }
  if (wants("evento", "calendario", "fecha")) {
    push({ label: "Calendario escolar", sublabel: "Eventos y fechas clave", href: "/calendario", kind: "pagina", external: false });
  }
  if (wants("docente", "profesor", "profesora", "maestro", "coordinador", "coordinacion", "coordinación", "rector", "directivo", "director", "titular", "staff")) {
    push({ label: "Directorio docente", sublabel: "Docentes y coordinaciones", href: "/docentes", kind: "pagina", external: false });
    push({ label: "Contáctenos", sublabel: "Líneas de atención y correos", href: "/contacto", kind: "pagina", external: false });
  }
  if (wants("admision", "admisión", "inscrib", "matricul")) {
    push({ label: "Admisiones 2027", sublabel: "Proceso y preinscripción", href: "/admisiones", kind: "pagina", external: false });
  }

  return links.slice(0, 8);
}

const STAFF_INTENT =
  /(docent|profesor|profesora|maestr|coordinad|coordinaci|rector|direct|titular|staff|bienestar|enfermer|secretar|psicolog|extension|extensión|telefon|teléfon|contact|correo de|quien es|quién es|area de|área de)/i;

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
- Secciones del sitio: Mi Colegio, Admisiones, Galería, Circulares, Guías de Aprendizaje, Herramientas, Bienestar, CRE (Biblioteca), Docentes, Calendario, Contacto`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const [context, links] = await Promise.all([buildContext(), findResources(lastUser)]);

    const matchesBlock = links.length
      ? `\n\nRESULTADOS ENCONTRADOS PARA LA ÚLTIMA PREGUNTA (el usuario verá botones de acceso debajo de tu respuesta, no escribas enlaces):\n${links
          .map((l) => `- [${l.kind}] ${l.label}${l.sublabel ? ` — ${l.sublabel}` : ""}`)
          .join("\n")}`
      : "";

    // Directorio oficial de funcionarios: se inyecta solo cuando la pregunta
    // trata de docentes, coordinaciones, directivos o líneas de atención.
    const staffBlock = STAFF_INTENT.test(lastUser)
      ? `\n\nDIRECTORIO OFICIAL DE FUNCIONARIOS Y LÍNEAS DE ATENCIÓN
Fuentes: "${STAFF_DIRECTORY_SOURCE}" y "${PHONE_LINES_SOURCE}".
Formato de filas de docentes: CURSO | DOCENTE | CORREO | ÁREA | DÍA DE ATENCIÓN (1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes) | UNIDAD | SALÓN.
${STAFF_DIRECTORY_TEXT}`
      : "";

    const systemPrompt = `Eres el asistente virtual del Colegio Cafam. Ayudas a acudientes y estudiantes con información sobre el colegio: admisiones, circulares, guías de aprendizaje, libros del CRE, docentes, eventos, plataformas, bienestar y vida escolar.

Reglas:
- Responde SIEMPRE en español, de forma cálida, breve y clara.
- Usa la información institucional proporcionada abajo como fuente principal.
- Si encuentras documentos, guías, libros, noticias o eventos relacionados, menciónalos por su título y di que abajo aparecen los botones de acceso.
- No escribas URLs ni enlaces en markdown: los botones se muestran automáticamente.
- Si no tienes la información, dilo con honestidad y sugiere contactar al colegio (601) 307 8060 o escribir a info@portalcolegio.com.
- No inventes fechas, cifras ni datos que no estén en el contexto.
- Preguntas sobre docentes, coordinaciones, directivos, bienestar, enfermería, secretarías o teléfonos: responde ÚNICAMENTE con el DIRECTORIO OFICIAL de abajo. Presenta los datos ordenados (nombre, cargo o curso, área, correo, día de atención o extensión) usando listas o tablas simples, e indica la fuente ("Directorio funcionarios" o "Líneas telefónicas atención a padres").
- El "día de atención" es un número: 1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes. Traduce el número al nombre del día.
- Si un docente o cargo no aparece en el directorio, dilo amablemente y ofrece derivar la consulta: PBX (601) 437 8999, correo colegio@cafam.com.co o la página de Contáctenos.

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

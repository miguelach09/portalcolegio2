import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
  );
}

async function buildContext() {
  const supabase = createPublicClient();
  const [{ data: docs }, { data: news }, { data: gallery }] = await Promise.all([
    supabase.from("documents").select("title, category, published_at").eq("is_active", true).order("published_at", { ascending: false }).limit(60),
    supabase.from("news").select("title, summary, content, category, published_at").eq("is_active", true).order("published_at", { ascending: false }).limit(20),
    supabase.from("gallery_images").select("title, category").eq("is_active", true).limit(30),
  ]);

  const docLines = (docs || []).map((d) => `- [${d.category}] ${d.title} (${new Date(d.published_at).toLocaleDateString("es-CO")})`).join("\n");
  const newsLines = (news || []).map((n) => `- [${n.category}] ${n.title}${n.summary ? ` — ${n.summary}` : ""}${n.content ? `\n  ${String(n.content).slice(0, 400)}` : ""}`).join("\n");
  const galleryLines = (gallery || []).map((g) => `- [${g.category}] ${g.title}`).join("\n");

  return `INFORMACIÓN DEL COLEGIO CAFAM (contenido publicado en la web):

DOCUMENTOS Y CIRCULARES DISPONIBLES:
${docLines || "(sin documentos)"}

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
- Secciones del sitio: Mi Colegio, Admisiones, Galería, Circulares, Herramientas, Bienestar, Biblioteca, Contacto`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const context = await buildContext();
    const systemPrompt = `Eres el asistente virtual del Colegio Cafam. Ayudas a acudientes y estudiantes con información sobre el colegio: admisiones, circulares, horarios, plataformas, bienestar, biblioteca y vida escolar.

Reglas:
- Responde SIEMPRE en español, de forma cálida, breve y clara.
- Usa la información institucional proporcionada abajo como fuente principal.
- Si el usuario pregunta por un documento o circular, menciona su título y dile que lo puede descargar en la sección "Circulares" del sitio.
- Si no tienes la información, dilo con honestidad y sugiere contactar al colegio (601) 307 8060 o escribir a info@portalcolegio.com.
- No inventes fechas, cifras ni datos que no estén en el contexto.

${context}`;

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
    return { reply };
  });

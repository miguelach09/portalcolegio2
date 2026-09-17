// Extracción de texto de los archivos subidos (PDF y hojas de cálculo) y
// guardado en `document_chunks` para que el asistente pueda responder con el
// contenido de los documentos, no solo con sus títulos.
//
// Solo se ejecuta en el servidor: se apoya en `supabaseAdmin` y en librerías
// puras de JavaScript compatibles con el runtime del Worker.

const BUCKET = "site-assets";
const MAX_CHUNK = 1200;
const MAX_CHUNKS_PER_FILE = 60;

export type IndexOutcome = {
  ok: boolean;
  chunks: number;
  reason?: string;
};

function splitIntoChunks(text: string): string[] {
  const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];
  const paragraphs = clean.split(/\n{2,}|(?<=\.)\s(?=[A-ZÁÉÍÓÚÑ])/);
  const chunks: string[] = [];
  let current = "";
  for (const part of paragraphs) {
    const piece = part.trim();
    if (!piece) continue;
    if ((current + " " + piece).trim().length > MAX_CHUNK) {
      if (current.trim()) chunks.push(current.trim());
      if (piece.length > MAX_CHUNK) {
        for (let i = 0; i < piece.length; i += MAX_CHUNK) {
          chunks.push(piece.slice(i, i + MAX_CHUNK));
        }
        current = "";
      } else {
        current = piece;
      }
    } else {
      current = `${current} ${piece}`.trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.replace(/\W/g, "").length > 30);
}

async function extractPdf(buffer: ArrayBuffer): Promise<{ page: number | null; text: string }[]> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [String(text)];
  return pages.map((t, i) => ({ page: i + 1, text: String(t || "") }));
}

async function extractSpreadsheet(buffer: ArrayBuffer): Promise<{ page: number | null; text: string }[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
  return wb.SheetNames.map((name, i) => {
    const sheet = wb.Sheets[name];
    const csv = sheet ? XLSX.utils.sheet_to_csv(sheet) : "";
    return { page: i + 1, text: `Hoja: ${name}\n${csv}` };
  });
}

/**
 * Descarga el archivo, extrae su texto y reemplaza los fragmentos guardados.
 * Devuelve cuántos fragmentos quedaron y, si no fue posible, la razón.
 */
export async function indexFile(params: {
  source: "documents" | "assistant_knowledge";
  sourceId: string;
  title: string;
  filePath: string;
  isActive: boolean;
  extraText?: string | null;
}): Promise<IndexOutcome> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ext = (params.filePath.split(".").pop() || "").toLowerCase();

  let sections: { page: number | null; text: string }[] = [];

  if (params.extraText && params.extraText.trim().length > 40) {
    sections.push({ page: null, text: params.extraText });
  }

  if (["pdf", "xls", "xlsx"].includes(ext)) {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(params.filePath);
    if (error || !data) return { ok: false, chunks: 0, reason: "No se pudo abrir el archivo." };
    const buffer = await data.arrayBuffer();
    try {
      const fileSections = ext === "pdf" ? await extractPdf(buffer) : await extractSpreadsheet(buffer);
      sections = [...sections, ...fileSections];
    } catch (err) {
      console.error("[indexing] extract failed", params.filePath, err);
      return { ok: false, chunks: 0, reason: "El archivo no se pudo leer (puede estar escaneado o protegido)." };
    }
  }

  const rows: {
    source: string;
    source_id: string;
    title: string;
    chunk_index: number;
    page: number | null;
    content: string;
    is_active: boolean;
  }[] = [];

  for (const section of sections) {
    for (const chunk of splitIntoChunks(section.text)) {
      if (rows.length >= MAX_CHUNKS_PER_FILE) break;
      rows.push({
        source: params.source,
        source_id: params.sourceId,
        title: params.title,
        chunk_index: rows.length,
        page: section.page,
        content: chunk,
        is_active: params.isActive,
      });
    }
    if (rows.length >= MAX_CHUNKS_PER_FILE) break;
  }

  await supabaseAdmin
    .from("document_chunks")
    .delete()
    .eq("source", params.source)
    .eq("source_id", params.sourceId);

  if (!rows.length) {
    return {
      ok: false,
      chunks: 0,
      reason: "Sin texto legible: el archivo parece escaneado como imagen.",
    };
  }

  const { error: insErr } = await supabaseAdmin.from("document_chunks").insert(rows);
  if (insErr) {
    console.error("[indexing] insert failed", insErr);
    return { ok: false, chunks: 0, reason: "No se pudieron guardar los fragmentos." };
  }
  return { ok: true, chunks: rows.length };
}

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

async function checkStaff(context: {
  supabase: ReturnType<typeof createClient<Database>>;
  userId: string;
}) {
  const { data: roles } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  const ok = (roles || []).some((r) => r.role === "admin" || r.role === "editor");
  if (!ok) throw new Error("Forbidden: staff role required");
}

export type IndexReport = {
  total: number;
  indexed: number;
  failed: number;
  remaining: number;
  problems: { title: string; reason: string }[];
  /** Claves "fuente:id" que no se pudieron leer; el panel las omite en las siguientes rondas. */
  failedKeys: string[];
};

/** Indexa un archivo puntual (se llama al subir o editar). */
export const indexSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { source: "documents" | "assistant_knowledge"; id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { indexFile } = await import("./indexing.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.source === "documents") {
      const { data: row } = await supabaseAdmin
        .from("documents")
        .select("id,title,file_path,is_active")
        .eq("id", data.id)
        .maybeSingle();
      if (!row?.file_path) return { ok: false, chunks: 0, reason: "El documento no tiene archivo." };
      return indexFile({
        source: "documents",
        sourceId: row.id,
        title: row.title,
        filePath: row.file_path,
        isActive: row.is_active,
      });
    }

    const { data: row } = await supabaseAdmin
      .from("assistant_knowledge")
      .select("id,title,content,file_path,is_active")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) return { ok: false, chunks: 0, reason: "No se encontró la entrada." };
    return indexFile({
      source: "assistant_knowledge",
      sourceId: row.id,
      title: row.title,
      filePath: row.file_path ?? "",
      isActive: row.is_active,
      extraText: row.content,
    });
  });

/** Indexa por lotes los archivos que aún no tienen texto guardado. */
export const reindexPending = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number; skip?: string[] } = {}) => ({
    limit: Math.min(Math.max(input.limit ?? 8, 1), 15),
    skip: Array.isArray(input.skip) ? input.skip.slice(0, 2000) : [],
  }))
  .handler(async ({ data, context }): Promise<IndexReport> => {
    await checkStaff(context);
    const { indexFile } = await import("./indexing.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: docs }, { data: knowledge }, { data: chunks }] = await Promise.all([
      supabaseAdmin
        .from("documents")
        .select("id,title,file_path,is_active")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(400),
      supabaseAdmin
        .from("assistant_knowledge")
        .select("id,title,content,file_path,is_active")
        .eq("is_active", true)
        .limit(200),
      supabaseAdmin.from("document_chunks").select("source,source_id"),
    ]);

    const done = new Set((chunks || []).map((c) => `${c.source}:${c.source_id}`));

    type Job = {
      source: "documents" | "assistant_knowledge";
      id: string;
      title: string;
      filePath: string;
      isActive: boolean;
      extraText?: string | null;
    };

    const jobs: Job[] = [];
    for (const d of docs || []) {
      if (!d.file_path) continue;
      if (done.has(`documents:${d.id}`)) continue;
      jobs.push({ source: "documents", id: d.id, title: d.title, filePath: d.file_path, isActive: d.is_active });
    }
    for (const k of knowledge || []) {
      if (done.has(`assistant_knowledge:${k.id}`)) continue;
      if (!k.file_path && !(k.content || "").trim()) continue;
      jobs.push({
        source: "assistant_knowledge",
        id: k.id,
        title: k.title,
        filePath: k.file_path ?? "",
        isActive: k.is_active,
        extraText: k.content,
      });
    }

    const batch = jobs.slice(0, data.limit);
    let indexed = 0;
    let failed = 0;
    const problems: { title: string; reason: string }[] = [];

    for (const job of batch) {
      const result = await indexFile({
        source: job.source,
        sourceId: job.id,
        title: job.title,
        filePath: job.filePath,
        isActive: job.isActive,
        extraText: job.extraText ?? null,
      });
      if (result.ok) indexed += 1;
      else {
        failed += 1;
        problems.push({ title: job.title, reason: result.reason ?? "No se pudo leer." });
      }
    }

    return {
      total: jobs.length,
      indexed,
      failed,
      remaining: Math.max(jobs.length - batch.length, 0),
      problems,
    };
  });

/** Resumen del estado de indexación para el panel. */
export const getIndexStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: docs }, { data: knowledge }, { data: chunks }] = await Promise.all([
      supabaseAdmin.from("documents").select("id,file_path,is_active").eq("is_active", true).limit(500),
      supabaseAdmin.from("assistant_knowledge").select("id,file_path,content,is_active").eq("is_active", true).limit(300),
      supabaseAdmin.from("document_chunks").select("source,source_id,content"),
    ]);
    const done = new Set((chunks || []).map((c) => `${c.source}:${c.source_id}`));
    const files = (docs || []).filter((d) => d.file_path);
    const entries = (knowledge || []).filter((k) => k.file_path || (k.content || "").trim());
    const readable =
      files.filter((d) => done.has(`documents:${d.id}`)).length +
      entries.filter((k) => done.has(`assistant_knowledge:${k.id}`)).length;
    return {
      totalFiles: files.length + entries.length,
      readable,
      pending: files.length + entries.length - readable,
      totalChunks: (chunks || []).length,
    };
  });

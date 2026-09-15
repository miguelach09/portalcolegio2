import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  tags: string | null;
  file_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function createPublicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
  );
}

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

// ===================== PUBLIC =====================

export const getKnowledge = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("assistant_knowledge")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw error;
  return (data || []) as unknown as KnowledgeEntry[];
});

// ===================== PROTECTED =====================

export const getAllKnowledge = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("assistant_knowledge")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as KnowledgeEntry[];
  });

export const saveKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      values: {
        id?: string;
        title: string;
        content: string;
        tags?: string | null;
        is_active: boolean;
        sort_order: number;
      };
      filePath?: string | null;
    }) => input
  )
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const v = data.values;
    const title = v.title.trim();
    const content = v.content.trim();
    if (!title) throw new Error("El título es obligatorio.");
    if (!content && !data.filePath) {
      throw new Error("Agrega el texto que el asistente debe aprender o adjunta un documento.");
    }
    const payload = {
      title,
      content,
      tags: v.tags?.trim() ? v.tags.trim() : null,
      is_active: v.is_active,
      sort_order: v.sort_order,
      ...(data.filePath ? { file_path: data.filePath } : {}),
    };

    if (v.id) {
      const { data: row, error } = await context.supabase
        .from("assistant_knowledge")
        .update(payload)
        .eq("id", v.id)
        .select()
        .single();
      if (error) throw error;
      return row as unknown as KnowledgeEntry;
    }
    const { data: row, error } = await context.supabase
      .from("assistant_knowledge")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row as unknown as KnowledgeEntry;
  });

export const deleteKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("assistant_knowledge")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

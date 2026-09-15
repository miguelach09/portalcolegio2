import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { LibraryBook } from "./library.types";
import { libraryBookFormSchema } from "./library.schemas";

const BUCKET_NAME = "site-assets";

function createPublicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    }
  );
}

const SIGN_TTL_SECONDS = 60 * 60 * 24 * 7;
const coverCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_MS = 1000 * 60 * 60 * 6;

// Firma todas las portadas en una sola llamada (antes: una petición por libro).
async function signCovers(paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const now = Date.now();
  const missing: string[] = [];
  for (const p of new Set(paths.filter(Boolean))) {
    const hit = coverCache.get(p);
    if (hit && hit.expiresAt > now) out.set(p, hit.url);
    else missing.push(p);
  }
  if (missing.length === 0) return out;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrls(missing, SIGN_TTL_SECONDS);
  if (error) return out;
  for (const item of data || []) {
    if (item.signedUrl && item.path) {
      coverCache.set(item.path, { url: item.signedUrl, expiresAt: now + CACHE_MS });
      out.set(item.path, item.signedUrl);
    }
  }
  return out;
}

async function withCovers(rows: unknown[]): Promise<LibraryBook[]> {
  const list = rows as LibraryBook[];
  const signed = await signCovers(
    list.map((r) => r.cover_path).filter((p): p is string => !!p)
  );
  return list.map((row) => ({
    ...row,
    cover_url: (row.cover_path ? signed.get(row.cover_path) : null) ?? row.cover_url,
  }));
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

export const getLibraryBooks = createServerFn({ method: "GET" })
  .inputValidator((input: { kind?: "consulta" | "plan_lector" } = {}) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("library_books")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
    if (data.kind) query = query.eq("kind", data.kind);
    const { data: rows, error } = await query;
    if (error) throw error;
    return withCovers(rows || []);
  });

// ===================== PROTECTED =====================

export const getAllLibraryBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("library_books")
      .select("*")
      .order("kind", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return withCovers(data || []);
  });

export const saveLibraryBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { values: Record<string, unknown>; coverPath?: string | null }) => input
  )
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = libraryBookFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    const payload = {
      kind: rest.kind,
      title: rest.title,
      author: rest.author,
      publisher: rest.publisher,
      grade: rest.grade || null,
      description: rest.description || null,
      price_cop: rest.kind === "plan_lector" ? rest.price_cop ?? null : null,
      availability: rest.availability,
      is_active: rest.is_active,
      sort_order: rest.sort_order,
      ...(data.coverPath ? { cover_path: data.coverPath } : {}),
    };

    if (id) {
      const { data: row, error } = await context.supabase
        .from("library_books")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as unknown as LibraryBook;
    }
    const { data: row, error } = await context.supabase
      .from("library_books")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row as unknown as LibraryBook;
  });

export const deleteLibraryBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("library_books")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

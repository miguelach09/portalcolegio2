import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "site-assets";
const TRASH_DAYS = 30;

type Ctx = { supabase: any; userId: string };

async function checkAdmin(context: Ctx) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export type TrashKind = "documents" | "news" | "gallery_images";
export type TrashItem = {
  id: string;
  kind: TrashKind;
  title: string;
  deleted_at: string;
  days_left: number;
};

const PATH_COL: Record<TrashKind, string> = {
  documents: "file_path",
  news: "image_path",
  gallery_images: "image_path",
};

async function purge(supabase: any, kind: TrashKind, ids: string[]) {
  if (!ids.length) return;
  const { data: rows } = await supabase.from(kind).select(`id, ${PATH_COL[kind]}`).in("id", ids);
  const paths = (rows ?? []).map((r: any) => r[PATH_COL[kind]]).filter(Boolean);
  if (paths.length) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from(BUCKET).remove(paths);
    if (kind === "documents") {
      await supabaseAdmin.from("document_chunks").delete().eq("source", "documents").in("source_id", ids);
    }
  }
  const { error } = await supabase.from(kind).delete().in("id", ids);
  if (error) throw error;
}

export const listTrash = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkAdmin(context);
    const cutoff = new Date(Date.now() - TRASH_DAYS * 86400000).toISOString();
    const kinds: TrashKind[] = ["documents", "news", "gallery_images"];
    const out: TrashItem[] = [];
    for (const kind of kinds) {
      // Vaciado automático: lo que lleva más de 30 días se borra definitivamente.
      const { data: old } = await context.supabase.from(kind).select("id").lt("deleted_at", cutoff);
      await purge(context.supabase, kind, (old ?? []).map((r: any) => r.id));
      const { data } = await context.supabase
        .from(kind)
        .select("id, title, deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(200);
      for (const r of data ?? []) {
        const age = (Date.now() - new Date(r.deleted_at).getTime()) / 86400000;
        out.push({ id: r.id, kind, title: r.title, deleted_at: r.deleted_at, days_left: Math.max(0, Math.ceil(TRASH_DAYS - age)) });
      }
    }
    return out.sort((a, b) => b.deleted_at.localeCompare(a.deleted_at));
  });

function validateTrashInput(input: { kind: TrashKind; id: string }) {
  if (!["documents", "news", "gallery_images"].includes(input.kind)) throw new Error("Tipo inválido");
  return { kind: input.kind, id: String(input.id) };
}

export const restoreTrashItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateTrashInput)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const { error } = await context.supabase
      .from(data.kind)
      .update({ is_active: true, deleted_at: null })
      .eq("id", data.id);
    if (error) throw error;
    if (data.kind === "documents") {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("document_chunks").update({ is_active: true }).eq("source", "documents").eq("source_id", data.id);
    }
    return { ok: true };
  });

export const deleteTrashItemForever = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateTrashInput)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    await purge(context.supabase, data.kind, [data.id]);
    return { ok: true };
  });

export const getScheduledNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkAdmin(context);
    const { data, error } = await context.supabase
      .from("news")
      .select("id, title, scheduled_at")
      .is("deleted_at", null)
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as { id: string; title: string; scheduled_at: string }[];
  });

export type AdminMetrics = {
  admissionsByWeek: { week: string; count: number }[];
  admissionsTotal: number;
  documentsByCategory: { category: string; count: number }[];
  unansweredTotal: number;
  topUnanswered: string[];
};

export const getAdminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminMetrics> => {
    await checkAdmin(context);
    const since = new Date(Date.now() - 8 * 7 * 86400000);
    const [adm, admTotal, docs, unans] = await Promise.all([
      context.supabase.from("admission_applications").select("created_at").gte("created_at", since.toISOString()),
      context.supabase.from("admission_applications").select("id", { count: "exact", head: true }),
      context.supabase.from("documents").select("category").eq("is_active", true).is("deleted_at", null).limit(2000),
      context.supabase.from("assistant_unanswered").select("question").eq("resolved", false).order("created_at", { ascending: false }).limit(500),
    ]);

    // Ocho semanas, de la más antigua a la más reciente (lunes de cada semana).
    const weeks: { week: string; count: number }[] = [];
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    for (let i = 7; i >= 0; i--) {
      const d = new Date(monday.getTime() - i * 7 * 86400000);
      weeks.push({ week: d.toISOString().slice(0, 10), count: 0 });
    }
    for (const r of adm.data ?? []) {
      const t = new Date(r.created_at).getTime();
      for (let i = weeks.length - 1; i >= 0; i--) {
        if (t >= new Date(weeks[i]!.week).getTime()) {
          weeks[i]!.count++;
          break;
        }
      }
    }

    const cats = new Map<string, number>();
    for (const d of docs.data ?? []) cats.set(d.category, (cats.get(d.category) ?? 0) + 1);

    const qs = new Map<string, number>();
    for (const q of unans.data ?? []) {
      const k = String(q.question).trim().toLowerCase();
      qs.set(k, (qs.get(k) ?? 0) + 1);
    }
    const topUnanswered = [...qs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);

    return {
      admissionsByWeek: weeks,
      admissionsTotal: admTotal.count ?? 0,
      documentsByCategory: [...cats.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
      unansweredTotal: unans.data?.length ?? 0,
      topUnanswered,
    };
  });

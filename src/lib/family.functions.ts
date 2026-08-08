import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { Student, GuardianLinkCode } from "./family.types";
import { studentFormSchema, redeemCodeSchema } from "./family.schemas";

const BUCKET_NAME = "site-assets";

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    }
  );
}

async function checkStaff(context: {
  supabase: ReturnType<typeof createClient<Database>>;
  userId: string;
}) {
  const { data: roles, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error || !roles || !roles.some((r) => r.role === "admin" || r.role === "editor")) {
    throw new Error("Forbidden: staff role required");
  }
}

async function signedUrl(filePath: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const filename = filePath.split("/").pop();
  const { data } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60 * 24, { download: filename || true });
  return data?.signedUrl ?? null;
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// ===================== FAMILIA =====================

export const getMyStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("student_guardians")
      .select("relationship, students(*)")
      .eq("user_id", context.userId);
    if (error) throw error;
    return (data || [])
      .map((row) => (row as unknown as { students: Student | null }).students)
      .filter((s): s is Student => Boolean(s));
  });

export const redeemGuardianCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data, context }) => {
    const parsed = redeemCodeSchema.parse(data);
    const code = parsed.code.toUpperCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: link, error } = await supabaseAdmin
      .from("guardian_links")
      .select("id, student_id, used_by, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (error) throw new Error("No pudimos validar el código. Intenta de nuevo.");
    if (!link) throw new Error("El código no existe.");
    if (link.used_by) throw new Error("Este código ya fue utilizado.");
    if (new Date(link.expires_at).getTime() < Date.now()) {
      throw new Error("Este código está vencido. Solicita uno nuevo al colegio.");
    }

    const { error: linkError } = await supabaseAdmin
      .from("student_guardians")
      .upsert(
        { student_id: link.student_id, user_id: context.userId },
        { onConflict: "student_id,user_id" }
      );
    if (linkError) throw new Error("No pudimos completar la vinculación.");

    await supabaseAdmin
      .from("guardian_links")
      .update({ used_by: context.userId, used_at: new Date().toISOString() })
      .eq("id", link.id);

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "familia" }, { onConflict: "user_id,role" });

    return { ok: true };
  });

export const getFamilyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: links, error: linkError } = await context.supabase
      .from("student_guardians")
      .select("students(grade)")
      .eq("user_id", context.userId);
    if (linkError) throw linkError;

    const grades = Array.from(
      new Set(
        (links || [])
          .map((r) => (r as unknown as { students: { grade: string } | null }).students?.grade)
          .filter((g): g is string => Boolean(g))
      )
    );

    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("documents")
      .select("id, title, category, grade, file_path, published_at")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(300);
    if (error) throw error;

    const relevant = (rows || []).filter(
      (r) => !r.grade || grades.includes(r.grade as string)
    );

    const { data: reads } = await context.supabase
      .from("circular_reads")
      .select("document_id")
      .eq("user_id", context.userId);
    const readIds = new Set((reads || []).map((r) => r.document_id));

    return Promise.all(
      relevant.map(async (r) => ({
        id: r.id as string,
        title: r.title as string,
        category: r.category as string,
        grade: (r.grade as string | null) ?? null,
        published_at: r.published_at as string,
        file_url: r.file_path ? await signedUrl(r.file_path as string) : null,
        is_read: readIds.has(r.id as string),
      }))
    );
  });

export const markCircularRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { document_id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("circular_reads")
      .insert({ document_id: data.document_id, user_id: context.userId });
    if (error && !error.message.includes("duplicate")) throw error;
    return { ok: true };
  });

// ===================== STAFF =====================

export const getStudentsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("students")
      .select("*")
      .order("grade", { ascending: true })
      .order("full_name", { ascending: true });
    if (error) throw error;
    return (data || []) as unknown as Student[];
  });

export const saveStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = studentFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    const payload = { ...rest, group_name: rest.group_name || null };
    if (id) {
      const { data: row, error } = await context.supabase
        .from("students")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as unknown as Student;
    }
    const { data: row, error } = await context.supabase
      .from("students")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row as unknown as Student;
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("students").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createGuardianCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { student_id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { data: row, error } = await context.supabase
      .from("guardian_links")
      .insert({ student_id: data.student_id, code: randomCode() })
      .select()
      .single();
    if (error) throw error;
    return row as unknown as GuardianLinkCode;
  });

export const getGuardianCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("guardian_links")
      .select("*, students(full_name, grade)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => {
      const r = row as unknown as GuardianLinkCode & {
        students: { full_name: string; grade: string } | null;
      };
      return { ...r, student: r.students };
    }) as GuardianLinkCode[];
  });

export const deleteGuardianCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("guardian_links").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getCircularReadStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("circular_reads")
      .select("document_id, read_at")
      .order("read_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const row of data || []) {
      counts.set(row.document_id, (counts.get(row.document_id) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([document_id, reads]) => ({
      document_id,
      reads,
    }));
  });

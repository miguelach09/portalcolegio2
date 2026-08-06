import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { Teacher, AdmissionApplication } from "./directory.types";
import { teacherFormSchema, admissionFormSchema } from "./directory.schemas";

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
  if (error || !roles || roles.length === 0) {
    throw new Error("Forbidden: staff role required");
  }
  if (!roles.some((r) => r.role === "admin" || r.role === "editor")) {
    throw new Error("Forbidden: staff role required");
  }
}

// ===================== PUBLIC =====================

export const getTeachers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, full_name, role_title, area, email, photo_url, bio, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as Teacher[];
});

export const submitAdmissionApplication = createServerFn({ method: "POST" })
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const parsed = admissionFormSchema.parse(data.values);
    const supabase = createPublicClient();
    const { error } = await supabase.from("admission_applications").insert({
      student_name: parsed.student_name,
      birth_date: parsed.birth_date ? parsed.birth_date : null,
      grade: parsed.grade,
      guardian_name: parsed.guardian_name,
      guardian_email: parsed.guardian_email,
      guardian_phone: parsed.guardian_phone,
      previous_school: parsed.previous_school || null,
      comments: parsed.comments || null,
    });
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: TEACHERS =====================

export const getAllTeachers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("teachers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("full_name", { ascending: true });
    if (error) throw error;
    return (data || []) as unknown as Teacher[];
  });

export const saveTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = teacherFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    const payload = {
      ...rest,
      email: rest.email || null,
      photo_url: rest.photo_url || null,
      bio: rest.bio || null,
    };
    if (id) {
      const { data: row, error } = await context.supabase
        .from("teachers")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as unknown as Teacher;
    }
    const { data: row, error } = await context.supabase
      .from("teachers")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row as unknown as Teacher;
  });

export const deleteTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("teachers").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: APPLICATIONS =====================

export const getAdmissionApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("admission_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as AdmissionApplication[];
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("admission_applications")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("admission_applications")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

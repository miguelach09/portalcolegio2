import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { admissionFormSchema, applicationStatusSchema } from "./directory.schemas";
import type { AdmissionApplication } from "./directory.types";

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
  );
}

async function checkStaff(context: {
  supabase: ReturnType<typeof createClient<Database>>;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .in("role", ["admin", "editor"]);

  if (error || !data || data.length === 0) {
    throw new Error("Forbidden: staff role required");
  }
}

// Public: enviar preinscripción desde la página de admisiones
export const submitAdmissionApplication = createServerFn({ method: "POST" })
  .inputValidator((input: { values: unknown }) => ({
    values: admissionFormSchema.parse(input.values),
  }))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const v = data.values;
    const { error } = await supabase.from("admission_applications").insert({
      student_name: v.student_name,
      birth_date: v.birth_date ? v.birth_date : null,
      grade: v.grade,
      guardian_name: v.guardian_name,
      guardian_email: v.guardian_email,
      guardian_phone: v.guardian_phone,
      previous_school: v.previous_school || null,
      comments: v.comments || null,
      status: "nuevo",
    });

    if (error) {
      console.error("Error saving admission application:", error);
      throw new Error("No pudimos guardar la preinscripción");
    }
    return { ok: true };
  });

// Staff: gestionar preinscripciones
export const getAdmissionApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("admission_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading admission applications:", error);
      throw new Error("No pudimos cargar las preinscripciones");
    }
    return (data ?? []) as AdmissionApplication[];
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => ({
    id: input.id,
    status: applicationStatusSchema.parse(input.status),
  }))
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("admission_applications")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) {
      console.error("Error updating application status:", error);
      throw new Error("No pudimos actualizar el estado");
    }
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

    if (error) {
      console.error("Error deleting application:", error);
      throw new Error("No pudimos eliminar la preinscripción");
    }
    return { ok: true };
  });

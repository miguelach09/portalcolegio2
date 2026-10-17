import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ===================== PÚBLICO: consulta con código + correo =====================

const lookupSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{8}$/, "Código inválido"),
  email: z.string().trim().toLowerCase().email().max(255),
});

export type ApplicationLookup = {
  found: true;
  studentFirstName: string;
  grade: string;
  status: string;
  createdAt: string;
  interview: { id: string; starts_at: string; duration_minutes: number; location: string | null } | null;
  availableSlots: { id: string; starts_at: string; duration_minutes: number; location: string | null }[];
};

async function findApplication(code: string, email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("admission_applications")
    .select("id, student_name, grade, status, created_at, guardian_email")
    .eq("tracking_code", code)
    .maybeSingle();
  // Ambos datos deben coincidir; si no, se responde igual que "no existe".
  if (!data || data.guardian_email.trim().toLowerCase() !== email) return null;
  return { app: data, supabaseAdmin };
}

const CAN_BOOK = new Set(["nuevo", "contactado", "en_proceso"]);

export const lookupApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }): Promise<ApplicationLookup | { found: false }> => {
    const res = await findApplication(data.code, data.email);
    if (!res) return { found: false };
    const { app, supabaseAdmin } = res;
    const { data: mine } = await supabaseAdmin
      .from("interview_slots")
      .select("id, starts_at, duration_minutes, location")
      .eq("application_id", app.id)
      .maybeSingle();
    let availableSlots: ApplicationLookup["availableSlots"] = [];
    if (!mine && CAN_BOOK.has(app.status)) {
      const { data: free } = await supabaseAdmin
        .from("interview_slots")
        .select("id, starts_at, duration_minutes, location")
        .is("application_id", null)
        .gt("starts_at", new Date(Date.now() + 12 * 3600000).toISOString())
        .order("starts_at", { ascending: true })
        .limit(60);
      availableSlots = free ?? [];
    }
    return {
      found: true,
      studentFirstName: app.student_name.trim().split(/\s+/)[0] ?? "",
      grade: app.grade,
      status: app.status,
      createdAt: app.created_at,
      interview: mine ?? null,
      availableSlots,
    };
  });

export const bookInterview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.extend({ slotId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const res = await findApplication(data.code, data.email);
    if (!res) return { ok: false as const, reason: "No encontramos la preinscripción." };
    const { app, supabaseAdmin } = res;
    if (!CAN_BOOK.has(app.status)) return { ok: false as const, reason: "Esta solicitud no admite agendar entrevista." };
    const { data: existing } = await supabaseAdmin
      .from("interview_slots").select("id").eq("application_id", app.id).maybeSingle();
    if (existing) return { ok: false as const, reason: "Ya tienes una entrevista agendada." };
    // Reserva atómica: solo si el horario sigue libre.
    const { data: booked } = await supabaseAdmin
      .from("interview_slots")
      .update({ application_id: app.id, booked_at: new Date().toISOString() })
      .eq("id", data.slotId)
      .is("application_id", null)
      .select("id")
      .maybeSingle();
    if (!booked) return { ok: false as const, reason: "Ese horario acaba de ser tomado. Elige otro." };
    return { ok: true as const };
  });

export const cancelInterview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await findApplication(data.code, data.email);
    if (!res) return { ok: false };
    await res.supabaseAdmin
      .from("interview_slots")
      .update({ application_id: null, booked_at: null })
      .eq("application_id", res.app.id);
    return { ok: true };
  });

// ===================== STAFF: gestión de horarios =====================

async function checkStaff(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("user_roles").select("role").eq("user_id", context.userId).in("role", ["admin", "editor"]);
  if (!data?.length) throw new Error("Forbidden: staff role required");
}

export type AdminSlot = {
  id: string;
  starts_at: string;
  duration_minutes: number;
  location: string | null;
  applicant: { student_name: string; grade: string; guardian_name: string; guardian_phone: string; tracking_code: string } | null;
};

export const getInterviewSlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSlot[]> => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("interview_slots")
      .select("id, starts_at, duration_minutes, location, admission_applications(student_name, grade, guardian_name, guardian_phone, tracking_code)")
      .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      starts_at: r.starts_at,
      duration_minutes: r.duration_minutes,
      location: r.location,
      applicant: r.admission_applications ?? null,
    }));
  });

export const createInterviewSlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      duration: z.number().int().min(10).max(180),
      location: z.string().trim().max(200).optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    // Hora de Bogotá (UTC-5, sin horario de verano).
    const toDate = (t: string) => new Date(`${data.date}T${t}:00-05:00`);
    const start = toDate(data.startTime);
    const end = toDate(data.endTime);
    const rows: { starts_at: string; duration_minutes: number; location: string | null }[] = [];
    for (let t = start.getTime(); t + data.duration * 60000 <= end.getTime(); t += data.duration * 60000) {
      rows.push({ starts_at: new Date(t).toISOString(), duration_minutes: data.duration, location: data.location || null });
      if (rows.length >= 60) break;
    }
    if (!rows.length) throw new Error("El rango no alcanza para ningún horario");
    const { error } = await context.supabase.from("interview_slots").insert(rows);
    if (error) throw error;
    return { created: rows.length };
  });

export const deleteInterviewSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: z.string().uuid().parse(input.id) }))
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("interview_slots").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

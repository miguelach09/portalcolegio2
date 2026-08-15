import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { AdminNotification, FamilyNotification } from "./notifications.types";
import { notificationFormSchema } from "./notifications.schemas";

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

// ===================== FAMILIA =====================

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*, students(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const { data: reads } = await context.supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", context.userId);
    const readIds = new Set((reads || []).map((r) => r.notification_id));

    return (data || []).map((row) => {
      const r = row as unknown as FamilyNotification & {
        students: { full_name: string } | null;
      };
      return {
        ...r,
        student_name: r.students?.full_name ?? null,
        is_read: readIds.has(r.id),
      };
    }) as FamilyNotification[];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { notification_id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notification_reads")
      .insert({ notification_id: data.notification_id, user_id: context.userId });
    if (error && !error.message.toLowerCase().includes("duplicate")) throw error;
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: visible, error } = await context.supabase
      .from("notifications")
      .select("id")
      .limit(200);
    if (error) throw error;
    const { data: reads } = await context.supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", context.userId);
    const readIds = new Set((reads || []).map((r) => r.notification_id));
    const pending = (visible || [])
      .map((n) => n.id)
      .filter((id) => !readIds.has(id))
      .map((id) => ({ notification_id: id, user_id: context.userId }));
    if (pending.length > 0) {
      const { error: insertError } = await context.supabase
        .from("notification_reads")
        .insert(pending);
      if (insertError) throw insertError;
    }
    return { ok: true, marked: pending.length };
  });

// ===================== STAFF =====================

export const getNotificationsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*, students(full_name)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { data: reads } = await context.supabase
      .from("notification_reads")
      .select("notification_id");
    const counts = new Map<string, number>();
    for (const row of reads || []) {
      counts.set(row.notification_id, (counts.get(row.notification_id) || 0) + 1);
    }

    return (data || []).map((row) => {
      const r = row as unknown as AdminNotification & {
        students: { full_name: string } | null;
      };
      return {
        ...r,
        student_name: r.students?.full_name ?? null,
        reads: counts.get(r.id) || 0,
      };
    }) as AdminNotification[];
  });

export const saveNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = notificationFormSchema.parse(data.values);
    const payload = {
      title: parsed.title,
      body: parsed.body,
      link: parsed.link || null,
      audience: parsed.audience,
      grade: parsed.audience === "grade" ? parsed.grade || null : null,
      student_id: parsed.audience === "student" ? parsed.student_id || null : null,
    };
    if (parsed.id) {
      const { error } = await context.supabase
        .from("notifications")
        .update(payload)
        .eq("id", parsed.id);
      if (error) throw error;
      return { ok: true, id: parsed.id };
    }
    const { data: row, error } = await context.supabase
      .from("notifications")
      .insert({ ...payload, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: (row as { id: string }).id };
  });

export const deleteNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("notifications")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

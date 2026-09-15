import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type FileAuditEntry = {
  id: string;
  entity: string;
  entity_id: string | null;
  action: string;
  title: string | null;
  file_path: string | null;
  file_name: string | null;
  file_extension: string | null;
  file_size: number | null;
  file_type: string | null;
  actor_id: string | null;
  actor_email: string | null;
  created_at: string;
};

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

export const getFileAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("file_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return (data || []) as unknown as FileAuditEntry[];
  });

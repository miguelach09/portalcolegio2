import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { HeroSlide } from "./hero.types";
import { heroSlideFormSchema } from "./hero.schemas";

const BUCKET_NAME = "site-assets";

function createPublicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
  );
}

async function getSignedUrl(filePath: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

async function withImages(rows: unknown[]): Promise<HeroSlide[]> {
  return Promise.all(
    (rows as HeroSlide[]).map(async (row) => ({
      ...row,
      image_url: row.image_path ? await getSignedUrl(row.image_path) : row.image_url,
    }))
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

export const getHeroSlides = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return withImages(data || []);
});

export const getAllHeroSlides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return withImages(data || []);
  });

export const saveHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown>; imagePath?: string | null }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = heroSlideFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    const payload = {
      ...rest,
      ...(data.imagePath ? { image_path: data.imagePath } : {}),
    };

    if (id) {
      const { data: row, error } = await context.supabase
        .from("hero_slides")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as unknown as HeroSlide;
    }
    const { data: row, error } = await context.supabase
      .from("hero_slides")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row as unknown as HeroSlide;
  });

export const deleteHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("hero_slides").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const reorderHeroSlides = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { order: { id: string; sort_order: number }[] }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    for (const item of data.order) {
      const { error } = await context.supabase
        .from("hero_slides")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);
      if (error) throw error;
    }
    return { ok: true };
  });

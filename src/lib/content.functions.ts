import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type {
  Document,
  DocumentCategory,
  GalleryImage,
  NewsItem,
} from "./content.types";
import {
  documentUpdateSchema,
  galleryImageUpdateSchema,
  newsUpdateSchema,
} from "./content.schemas";

const BUCKET_NAME = "site-assets";

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function checkAdmin(context: {
  supabase: ReturnType<typeof createClient<Database>>;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Forbidden: admin role required");
  }
}

async function getSignedUrl(filePath: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

  if (error || !data?.signedUrl) {
    console.error("Error creating signed URL:", error);
    return null;
  }
  return data.signedUrl;
}

// Public reads
export const getDocuments = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { category?: DocumentCategory; limit?: number } = {}) => input
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("documents")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (data.category) {
      query = query.eq("category", data.category);
    }
    if (data.limit) {
      query = query.limit(data.limit);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const docs: Document[] = (rows || []).map((row) => ({
      ...(row as unknown as Document),
      file_url: row.file_path ? await getSignedUrl(row.file_path) : null,
    }));

    return docs;
  });

export const getNews = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } = {}) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("news")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (data.limit) {
      query = query.limit(data.limit);
    }

    const { data: rows, error } = await query;
    if (error) throw error;
    return (rows || []) as NewsItem[];
  });

export const getGalleryImages = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } = {}) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("gallery_images")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data.limit) {
      query = query.limit(data.limit);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const images: GalleryImage[] = (rows || []).map((row) => ({
      ...(row as unknown as GalleryImage),
      image_url: row.image_path ? await getSignedUrl(row.image_path) : row.image_url,
    }));

    return images;
  });

export const getDocumentById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", data.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;

    return {
      ...(row as unknown as Document),
      file_url: row.file_path ? await getSignedUrl(row.file_path) : null,
    };
  });

export const getNewsById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", data.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return row as NewsItem | null;
  });

export const getGalleryImageById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("id", data.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;

    return {
      ...(row as unknown as GalleryImage),
      image_url: row.image_path ? await getSignedUrl(row.image_path) : row.image_url,
    };
  });

// Protected writes
export const createDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown>; filePath: string }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const parsed = documentUpdateSchema.omit({ id: true }).parse(data.values);

    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        title: parsed.title,
        category: parsed.category,
        file_path: data.filePath,
        published_at: parsed.published_at,
        is_active: parsed.is_active,
        sort_order: parsed.sort_order,
      })
      .select()
      .single();

    if (error) throw error;
    return row as Document;
  });

export const updateDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const parsed = documentUpdateSchema.parse(data.values);
    const { id, ...rest } = parsed;

    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("documents")
      .update({
        title: rest.title,
        category: rest.category,
        published_at: rest.published_at,
        is_active: rest.is_active,
        sort_order: rest.sort_order,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return row as Document;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; filePath: string }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Delete storage object first, then row
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([data.filePath]);

    if (storageError) {
      console.error("Error deleting storage object:", storageError);
    }

    const supabase = createPublicClient();
    const { error } = await supabase.from("documents").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown>; imagePath?: string; imageUrl?: string }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const parsed = newsFormSchema.parse(data.values);

    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("news")
      .insert({
        title: parsed.title,
        summary: parsed.summary || null,
        content: parsed.content || null,
        category: parsed.category,
        published_at: parsed.published_at,
        is_active: parsed.is_active,
        sort_order: parsed.sort_order,
        image_url: data.imageUrl || null,
        image_path: data.imagePath || null,
      })
      .select()
      .single();

    if (error) throw error;
    return row as NewsItem;
  });

export const updateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const parsed = newsUpdateSchema.parse(data.values);
    const { id, ...rest } = parsed;

    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("news")
      .update({
        title: rest.title,
        summary: rest.summary || null,
        content: rest.content || null,
        category: rest.category,
        published_at: rest.published_at,
        is_active: rest.is_active,
        sort_order: rest.sort_order,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return row as NewsItem;
  });

export const deleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; imagePath?: string }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);

    if (data.imagePath) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: storageError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([data.imagePath]);
      if (storageError) console.error("Error deleting news image:", storageError);
    }

    const supabase = createPublicClient();
    const { error } = await supabase.from("news").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { values: Record<string, unknown>; imagePath: string; imageUrl: string }) => input
  )
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const parsed = galleryImageFormSchema.parse(data.values);

    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("gallery_images")
      .insert({
        title: parsed.title,
        category: parsed.category,
        is_active: parsed.is_active,
        sort_order: parsed.sort_order,
        image_url: data.imageUrl,
        image_path: data.imagePath,
      })
      .select()
      .single();

    if (error) throw error;
    return row as GalleryImage;
  });

export const updateGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);
    const parsed = galleryImageUpdateSchema.parse(data.values);
    const { id, ...rest } = parsed;

    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("gallery_images")
      .update({
        title: rest.title,
        category: rest.category,
        is_active: rest.is_active,
        sort_order: rest.sort_order,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return row as GalleryImage;
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; imagePath: string }) => input)
  .handler(async ({ data, context }) => {
    await checkAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([data.imagePath]);
    if (storageError) console.error("Error deleting gallery image:", storageError);

    const supabase = createPublicClient();
    const { error } = await supabase.from("gallery_images").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Auth helpers
export const signInWithEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    // This is a server-side helper; actual sign-in happens client-side with supabase.auth.signInWithPassword.
    // We keep this stub to avoid importing auth flows into public loaders.
    return { ok: true };
  });

import {
  documentFormSchema,
  galleryImageFormSchema,
  newsFormSchema,
} from "./content.schemas";

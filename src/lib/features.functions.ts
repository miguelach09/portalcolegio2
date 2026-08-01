import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type {
  EventItem,
  FaqItem,
  Survey,
  SurveyOption,
  ContactMessage,
  Subscriber,
  SiteSetting,
} from "./features.types";
import {
  eventFormSchema,
  faqFormSchema,
  surveyFormSchema,
  surveyOptionFormSchema,
  contactFormSchema,
  subscriberSchema,
  siteSettingSchema,
} from "./features.schemas";

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
  const ok = roles.some(
    (r) => r.role === "admin" || r.role === "editor"
  );
  if (!ok) throw new Error("Forbidden: staff role required");
}

// ===================== PUBLIC READS =====================

export const getEvents = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } = {}) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .eq("status", "published")
      .order("start_date", { ascending: true });
    if (data.limit) query = query.limit(data.limit);
    const { data: rows, error } = await query;
    if (error) throw error;
    return (rows || []) as unknown as EventItem[];
  });

export const getFaqs = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (rows || []) as unknown as FaqItem[];
  });

export const getActiveSurveys = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = createPublicClient();
    const { data: surveys, error } = await supabase
      .from("surveys")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const result: (Survey & { options: SurveyOption[] })[] = [];
    for (const s of surveys || []) {
      const { data: options } = await supabase
        .from("survey_options")
        .select("*")
        .eq("survey_id", s.id)
        .order("sort_order", { ascending: true });
      result.push({ ...(s as unknown as Survey), options: (options || []) as unknown as SurveyOption[] });
    }
    return result;
  });

export const getSurveyResults = createServerFn({ method: "GET" })
  .inputValidator((input: { survey_id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: options, error } = await supabase
      .from("survey_options")
      .select("id, label, sort_order")
      .eq("survey_id", data.survey_id)
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const results: SurveyOption[] = [];
    for (const opt of options || []) {
      const { count } = await supabase
        .from("survey_votes")
        .select("id", { count: "exact", head: true })
        .eq("option_id", opt.id);
      results.push({ ...(opt as unknown as SurveyOption), vote_count: count || 0 });
    }
    return results;
  });

export const getSiteSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("site_settings")
      .select("*");
    if (error) throw error;
    const map: Record<string, string> = {};
    for (const r of rows || []) {
      map[r.key] = r.value;
    }
    return map;
  });

// ===================== PUBLIC WRITES =====================

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const parsed = contactFormSchema.parse(data.values);
    const supabase = createPublicClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.name,
      email: parsed.email,
      subject: parsed.subject || null,
      message: parsed.message,
    });
    if (error) throw error;
    return { ok: true };
  });

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const parsed = subscriberSchema.parse(data.values);
    const supabase = createPublicClient();
    const { error } = await supabase.from("subscribers").upsert(
      { email: parsed.email, is_active: true },
      { onConflict: "email" }
    );
    if (error) throw error;
    return { ok: true };
  });

export const castVote = createServerFn({ method: "POST" })
  .inputValidator((input: { survey_id: string; option_id: string; voter_hash: string }) => input)
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { error } = await supabase.from("survey_votes").insert({
      survey_id: data.survey_id,
      option_id: data.option_id,
      voter_hash: data.voter_hash,
    });
    if (error) {
      if (error.code === "23505") {
        throw new Error("Ya votaste en esta encuesta.");
      }
      throw error;
    }
    return { ok: true };
  });

// ===================== PROTECTED: EVENTS =====================

export const getAllEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as EventItem[];
  });

export const saveEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = eventFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    if (id) {
      const { data: row, error } = await context.supabase
        .from("events")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as EventItem;
    }
    const { data: row, error } = await context.supabase
      .from("events")
      .insert(rest)
      .select()
      .single();
    if (error) throw error;
    return row as EventItem;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: FAQS =====================

export const getAllFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as unknown as FaqItem[];
  });

export const saveFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = faqFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    if (id) {
      const { data: row, error } = await context.supabase
        .from("faqs")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as FaqItem;
    }
    const { data: row, error } = await context.supabase
      .from("faqs")
      .insert(rest)
      .select()
      .single();
    if (error) throw error;
    return row as FaqItem;
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: SURVEYS =====================

export const getAllSurveysAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Survey[];
  });

export const saveSurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = surveyFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    if (id) {
      const { data: row, error } = await context.supabase
        .from("surveys")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as Survey;
    }
    const { data: row, error } = await context.supabase
      .from("surveys")
      .insert(rest)
      .select()
      .single();
    if (error) throw error;
    return row as Survey;
  });

export const deleteSurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase.from("surveys").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const saveSurveyOption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const parsed = surveyOptionFormSchema.parse(data.values);
    const { id, ...rest } = parsed;
    if (id) {
      const { data: row, error } = await context.supabase
        .from("survey_options")
        .update({ label: rest.label, sort_order: rest.sort_order })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as SurveyOption;
    }
    const { data: row, error } = await context.supabase
      .from("survey_options")
      .insert(rest)
      .select()
      .single();
    if (error) throw error;
    return row as SurveyOption;
  });

export const deleteSurveyOption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("survey_options")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: CONTACT MESSAGES =====================

export const getContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as ContactMessage[];
  });

export const updateContactMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("contact_messages")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: SUBSCRIBERS =====================

export const getSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const { data, error } = await context.supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Subscriber[];
  });

export const deleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await checkStaff(context);
    const { error } = await context.supabase
      .from("subscribers")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ===================== PROTECTED: SITE SETTINGS =====================

export const saveSiteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, unknown> }) => input)
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!roles || !roles.some((r) => r.role === "admin")) {
      throw new Error("Forbidden: admin role required");
    }
    const parsed = siteSettingSchema.parse(data.values);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: parsed.key, value: parsed.value }, { onConflict: "key" });
    if (error) throw error;
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await checkStaff(context);
    const supabase = context.supabase;
    const [news, docs, gallery, events, msgs, subs, faqs] = await Promise.all([
      supabase.from("news").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase.from("gallery_images").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id, status", { count: "exact" }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
      supabase.from("faqs").select("id", { count: "exact", head: true }),
    ]);
    return {
      news: news.count || 0,
      documents: docs.count || 0,
      gallery: gallery.count || 0,
      events: events.count || 0,
      contactMessages: msgs.count || 0,
      newMessages: (msgs.data || []).filter((m: any) => m.status === "nuevo").length,
      subscribers: subs.count || 0,
      faqs: faqs.count || 0,
    };
  });

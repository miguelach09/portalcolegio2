import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface SearchResult {
  id: string;
  type: "documento" | "noticia" | "evento" | "faq" | "galeria";
  title: string;
  snippet: string | null;
  to: string;
}

function client() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    }
  );
}

const routeForDocument = (category: string | null) => {
  switch (category) {
    case "circulares":
      return "/circulares";
    case "guias":
      return "/guias";
    case "admisiones":
      return "/admisiones";
    case "herramientas":
      return "/herramientas";
    default:
      return "/biblioteca";
  }
};

export async function runSiteSearch(rawQuery: string): Promise<SearchResult[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];
  const like = `%${q}%`;
  const supabase = client();

  const [docs, news, events, faqs, gallery] = await Promise.all([
    supabase
      .from("documents")
      .select("id,title,category,grade")
      .eq("is_active", true)
      .ilike("title", like)
      .limit(6),
    supabase
      .from("news")
      .select("id,title,summary")
      .eq("is_active", true)
      .or(`title.ilike.${like},summary.ilike.${like}`)
      .limit(6),
    supabase
      .from("events")
      .select("id,title,description")
      .eq("is_active", true)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(6),
    supabase
      .from("faqs")
      .select("id,question,answer")
      .eq("is_active", true)
      .or(`question.ilike.${like},answer.ilike.${like}`)
      .limit(6),
    supabase
      .from("gallery_images")
      .select("id,title,category")
      .eq("is_active", true)
      .ilike("title", like)
      .limit(4),
  ]);

  const results: SearchResult[] = [];

  for (const d of docs.data ?? []) {
    results.push({
      id: d.id,
      type: "documento",
      title: d.title,
      snippet: d.grade ? `Grado: ${d.grade}` : (d.category as string),
      to: routeForDocument(d.category as string),
    });
  }
  for (const n of news.data ?? []) {
    results.push({
      id: n.id,
      type: "noticia",
      title: n.title,
      snippet: n.summary,
      to: "/",
    });
  }
  for (const e of events.data ?? []) {
    results.push({
      id: e.id,
      type: "evento",
      title: e.title,
      snippet: e.description,
      to: "/calendario",
    });
  }
  for (const f of faqs.data ?? []) {
    results.push({
      id: f.id,
      type: "faq",
      title: f.question,
      snippet: f.answer?.slice(0, 140) ?? null,
      to: "/faq",
    });
  }
  for (const g of gallery.data ?? []) {
    results.push({
      id: g.id,
      type: "galeria",
      title: g.title,
      snippet: g.category as string,
      to: "/galeria",
    });
  }

  return results.slice(0, 20);
}

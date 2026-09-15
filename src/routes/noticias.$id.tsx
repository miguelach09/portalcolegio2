import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { getNewsById } from "@/lib/content.functions";
import { formatDateES } from "@/lib/utils";
import { ArrowLeft, Calendar } from "lucide-react";

const newsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["news", id],
    queryFn: async () => {
      const item = await getNewsById({ data: { id } });
      if (!item) throw notFound();
      return item;
    },
  });

const categoryLabels: Record<string, string> = {
  institucional: "Institucional",
  academico: "Académico",
  deporte: "Deporte",
  arte: "Arte",
  bienestar: "Bienestar",
};

export const Route = createFileRoute("/noticias/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(newsQueryOptions(params.id)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Noticia no encontrada — Colegio Cafam" }, { name: "robots", content: "noindex" }] };
    }
    const description = (loaderData.summary || loaderData.content || "").slice(0, 155);
    return {
      meta: [
        { title: `${loaderData.title} — Colegio Cafam` },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: `${loaderData.title} — Colegio Cafam` },
        { property: "og:description", content: description },
        { property: "og:url", content: `https://connecteducafam.lovable.app/noticias/${loaderData.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://connecteducafam.lovable.app/noticias/${loaderData.id}` }],
    };
  },
  component: NoticiaDetalle,
  notFoundComponent: () => (
    <PageShell>
      <section className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Noticia no encontrada</h1>
        <p className="mt-3 text-muted-foreground">Es posible que la noticia haya sido retirada.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </section>
    </PageShell>
  ),
});

function NoticiaDetalle() {
  const { data: item } = useSuspenseQuery(newsQueryOptions(Route.useParams().id));

  return (
    <PageShell>
      <article className="container-page max-w-3xl py-16 md:py-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver a noticias
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateES(item.published_at)}
          </span>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {categoryLabels[item.category] || item.category}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 md:text-5xl dark:text-white">
          {item.title}
        </h1>

        {item.summary && (
          <p className="mt-4 text-lg text-muted-foreground">{item.summary}</p>
        )}

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="mt-8 w-full rounded-2xl border border-border object-cover shadow-[var(--shadow-card)]"
          />
        )}

        {item.content && (
          <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {item.content}
          </div>
        )}
      </article>
    </PageShell>
  );
}

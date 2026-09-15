import { Calendar, ArrowUpRight, FileText } from "lucide-react";
import type { NewsItem, Document } from "@/lib/content.types";
import { formatDateES } from "@/lib/utils";

interface NewsProps {
  news: NewsItem[];
  interestDocs: Document[];
}

const categoryLabels: Record<string, string> = {
  institucional: "Institucional",
  academico: "Académico",
  deporte: "Deporte",
  arte: "Arte",
  bienestar: "Bienestar",
};

export function News({ news, interestDocs }: NewsProps) {
  const [featured, ...rest] = news.slice(0, 3);

  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Noticias</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">Vida escolar y comunidad</h2>
          {!featured ? (
            <p className="mt-8 text-muted-foreground">No hay noticias publicadas aún.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {/* Noticia destacada: imagen de fondo con degradado */}
              <article className="group relative overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                {featured.image_url && (
                  <div className="absolute inset-0">
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div
                  className={`relative flex min-h-[280px] flex-col justify-end p-6 sm:p-8 ${
                    featured.image_url
                      ? "bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white"
                      : "bg-card"
                  }`}
                >
                  <div className={`flex flex-wrap items-center gap-3 text-xs ${featured.image_url ? "text-white/80" : "text-muted-foreground"}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateES(featured.published_at)}
                    </span>
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold uppercase tracking-wider text-primary">
                      {categoryLabels[featured.category] || featured.category}
                    </span>
                  </div>
                  <h3 className={`mt-3 font-display text-2xl font-bold md:text-3xl ${featured.image_url ? "text-white" : "text-foreground group-hover:text-primary"}`}>
                    {featured.title}
                  </h3>
                  <p className={`mt-2 max-w-2xl text-sm ${featured.image_url ? "text-white/85" : "text-muted-foreground"}`}>
                    {featured.summary || featured.content || ""}
                  </p>
                  <a href="#" className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${featured.image_url ? "text-white hover:text-white/80" : "text-primary"}`}>
                    Leer más <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </article>

              {/* Noticias secundarias */}
              <div className="grid gap-4 sm:grid-cols-2">
                {rest.map((n) => (
                  <article key={n.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                    {n.image_url && (
                      <div className="aspect-[2/1] w-full overflow-hidden">
                        <img
                          src={n.image_url}
                          alt={n.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateES(n.published_at)}
                        </span>
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold uppercase tracking-wider text-primary">
                          {categoryLabels[n.category] || n.category}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
                        {n.title}
                      </h3>
                      <a href="#" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        Leer más <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-brand">De interés</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Documentos y enlaces</h2>
          <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
            {interestDocs.length === 0 ? (
              <li className="px-5 py-4 text-sm text-muted-foreground">No hay documentos destacados.</li>
            ) : (
              interestDocs.map((doc) => (
                <li key={doc.id}>
                  <a
                    href={doc.file_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-primary-soft hover:text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      {doc.title}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </a>
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { BookOpen, Search, ShoppingCart, Library } from "lucide-react";
import { getLibraryBooks } from "@/lib/library.functions";
import {
  AVAILABILITY_LABELS,
  formatCOP,
  type BookAvailability,
  type BookKind,
} from "@/lib/library.types";

const booksQueryOptions = queryOptions({
  queryKey: ["library-books"],
  queryFn: () => getLibraryBooks({ data: {} }),
});

export const Route = createFileRoute("/cre")({
  loader: ({ context }) => context.queryClient.ensureQueryData(booksQueryOptions),
  head: () => ({
    meta: [
      { title: "CRE — Centro de Recursos Educativos | Colegio Cafam" },
      {
        name: "description",
        content:
          "Catálogo del Centro de Recursos Educativos (CRE) del Colegio Cafam: libros de consulta en sala y libros de Plan Lector con precios.",
      },
      { property: "og:title", content: "CRE — Centro de Recursos Educativos" },
      {
        property: "og:description",
        content:
          "Consulta los libros disponibles en sala y los libros de Plan Lector del Colegio Cafam.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://connecteducafam.lovable.app/cre" },
    ],
    links: [{ rel: "canonical", href: "https://connecteducafam.lovable.app/cre" }],
  }),
  errorComponent: () => (
    <PageShell>
      <PageHero
        eyebrow="CRE"
        title="Centro de Recursos Educativos"
        subtitle="No pudimos cargar el catálogo en este momento."
      />
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <PageHero eyebrow="CRE" title="Página no encontrada" subtitle="" />
    </PageShell>
  ),
  component: CrePage,
});

function CrePage() {
  const { data: books = [] } = useSuspenseQuery(booksQueryOptions);
  const [kind, setKind] = useState<BookKind>("consulta");
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("");

  const grades = useMemo(
    () =>
      Array.from(
        new Set(books.filter((b) => b.kind === kind && b.grade).map((b) => b.grade!))
      ).sort(),
    [books, kind]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return books.filter(
      (b) =>
        b.kind === kind &&
        (!grade || b.grade === grade) &&
        (!s ||
          b.title.toLowerCase().includes(s) ||
          b.author.toLowerCase().includes(s) ||
          b.publisher.toLowerCase().includes(s))
    );
  }, [books, kind, grade, q]);

  return (
    <PageShell>
      <PageHero
        eyebrow="CRE"
        title="Centro de Recursos Educativos"
        subtitle="Consulta los libros disponibles en sala y los libros de la materia Plan Lector."
      />

      <section className="container-page py-12 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {(
              [
                { value: "consulta", label: "Consulta en Sala", icon: Library },
                { value: "plan_lector", label: "Plan Lector", icon: ShoppingCart },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setKind(value);
                  setGrade("");
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  kind === value
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/75 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar título, autor o editorial..."
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        {grades.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGrade("")}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                grade === ""
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Todos los grados
            </button>
            {grades.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  grade === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Aún no hay libros publicados en esta sección.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((book) => (
              <article
                key={book.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={`Portada de ${book.title}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h2 className="font-display font-bold leading-tight text-foreground">
                    {book.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="text-xs text-muted-foreground">{book.publisher}</p>
                  {book.grade && (
                    <span className="mt-1 w-fit rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {book.grade}
                    </span>
                  )}
                  {book.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {book.description}
                    </p>
                  )}
                  <div className="mt-auto pt-3">
                    {book.kind === "plan_lector" && book.price_cop !== null && (
                      <p className="font-display text-lg font-bold text-primary">
                        {formatCOP(Number(book.price_cop))}
                      </p>
                    )}
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        book.availability === "disponible"
                          ? "bg-primary-soft text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {AVAILABILITY_LABELS[book.availability as BookAvailability]}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

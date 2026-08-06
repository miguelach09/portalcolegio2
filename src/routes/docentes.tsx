import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { getTeachers } from "@/lib/directory.functions";
import { TEACHER_AREAS } from "@/lib/directory.types";

const teachersQueryOptions = queryOptions({
  queryKey: ["teachers"],
  queryFn: () => getTeachers(),
});

export const Route = createFileRoute("/docentes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teachersQueryOptions),
  head: () => ({
    meta: [
      { title: "Directorio docente — Colegio Cafam" },
      {
        name: "description",
        content:
          "Conoce al equipo docente y directivo del Colegio Cafam por área académica, con cargos y contacto institucional.",
      },
      { property: "og:title", content: "Directorio docente — Colegio Cafam" },
      {
        property: "og:description",
        content: "Equipo docente y directivo del Colegio Cafam organizado por área académica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://proto-portalcolegio2.lovable.app/docentes" },
    ],
    links: [{ rel: "canonical", href: "https://proto-portalcolegio2.lovable.app/docentes" }],
  }),
  errorComponent: () => (
    <PageShell>
      <div className="container-page py-24 text-center text-muted-foreground">
        No pudimos cargar el directorio docente. Intenta de nuevo más tarde.
      </div>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <div className="container-page py-24 text-center">Sin docentes publicados.</div>
    </PageShell>
  ),
  component: Docentes,
});

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function Docentes() {
  const { data: teachers = [] } = useSuspenseQuery(teachersQueryOptions);
  const [area, setArea] = useState<string>("todas");
  const [term, setTerm] = useState("");

  const usedAreas = TEACHER_AREAS.filter((a) => teachers.some((t) => t.area === a.value));
  const filtered = teachers.filter((t) => {
    const okArea = area === "todas" || t.area === area;
    const q = term.trim().toLowerCase();
    const okTerm =
      !q ||
      t.full_name.toLowerCase().includes(q) ||
      t.role_title.toLowerCase().includes(q);
    return okArea && okTerm;
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Nuestro equipo"
        title="Directorio docente"
        subtitle="Docentes y directivos que acompañan el proyecto educativo Cafam, organizados por área académica."
      />

      <section className="container-page py-16 md:py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex-1 md:max-w-sm">
            <span className="sr-only">Buscar docente</span>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por nombre o cargo…"
              className="w-full rounded-full border border-border bg-card px-5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={area === "todas"} onClick={() => setArea("todas")}>
              Todas
            </FilterChip>
            {usedAreas.map((a) => (
              <FilterChip key={a.value} active={area === a.value} onClick={() => setArea(a.value)}>
                {a.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-14 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aún no hay docentes publicados en esta área.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-4">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={`Fotografía de ${t.full_name}`}
                      loading="lazy"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-lg font-bold text-primary">
                      {initials(t.full_name)}
                    </span>
                  )}
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {t.full_name}
                    </h2>
                    <p className="text-sm text-primary">{t.role_title}</p>
                  </div>
                </div>
                {t.bio && <p className="mt-4 text-sm text-muted-foreground">{t.bio}</p>}
                {t.email && (
                  <a
                    href={`mailto:${t.email}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" /> {t.email}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/75 hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

import { Calendar, ArrowUpRight } from "lucide-react";

const news = [
  {
    date: "08 Jul 2026",
    tag: "Boletín",
    title: "Boletín escolar julio 2026",
    excerpt: "Apreciadas familias, los invitamos a conocer nuestro boletín escolar del mes de julio con las novedades más recientes de la comunidad.",
  },
  {
    date: "22 Jun 2026",
    tag: "Convocatoria",
    title: "Convocatoria docentes de tecnología",
    excerpt: "El Colegio Cafam abre convocatoria para docentes del área de tecnología. Consulta requisitos y proceso de aplicación.",
  },
  {
    date: "10 Jun 2026",
    tag: "Comunidad",
    title: "Encuentro de padres 2026",
    excerpt: "Espacios de diálogo, participación y construcción conjunta con las familias del colegio.",
  },
];

const interest = [
  "Horario rotativo julio 2026",
  "Minuta escolar julio 2026",
  "Directorio de funcionarios 2026",
  "Líneas telefónicas de atención a padres",
  "Fechas institucionales 2026",
];

export function News() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Noticias</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Vida escolar y comunidad</h2>
          <div className="mt-8 space-y-4">
            {news.map((n) => (
              <article key={n.title} className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{n.date}</span>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold uppercase tracking-wider text-primary">{n.tag}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-foreground group-hover:text-primary">
                  {n.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{n.excerpt}</p>
                <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Leer más <ArrowUpRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>

        <aside>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-brand">De interés</span>
          <h2 className="mt-2 font-display text-3xl font-bold">Documentos y enlaces</h2>
          <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
            {interest.map((i) => (
              <li key={i}>
                <a href="#" className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-primary-soft hover:text-primary">
                  <span>{i}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

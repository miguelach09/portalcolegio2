import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { Award, Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/mi-colegio")({
  head: () => ({
    meta: [
      { title: "Mi Colegio — Colegio Cafam" },
      { name: "description", content: "Conoce la historia, misión, visión y valores del Colegio Cafam, más de 50 años formando ciudadanos íntegros." },
      { property: "og:title", content: "Mi Colegio — Colegio Cafam" },
      { property: "og:description", content: "Historia, misión, visión y valores del Colegio Cafam." },
      { property: "og:url", content: "/mi-colegio" },
    ],
    links: [{ rel: "canonical", href: "/mi-colegio" }],
  }),
  component: MiColegio,
});

const pillars = [
  { icon: Target, title: "Misión", text: "Formar personas íntegras, autónomas y competentes, comprometidas con la construcción de una mejor sociedad a través de una educación de calidad." },
  { icon: Eye, title: "Visión", text: "Ser reconocidos como una institución educativa líder en formación humana, académica y ciudadana en Colombia." },
  { icon: Heart, title: "Valores", text: "Respeto, responsabilidad, honestidad, solidaridad y excelencia guían nuestro proyecto educativo." },
  { icon: Award, title: "PEI", text: "Nuestro Proyecto Educativo Institucional articula lo académico, lo humano y lo trascendente." },
];

function MiColegio() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Mi Colegio"
        title="Más de 50 años formando comunidad."
        subtitle="Desde 1971 el Colegio Cafam ha sido un referente de educación de calidad, con un proyecto que integra excelencia académica, formación humana y desarrollo integral."
      />
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-3 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-primary-soft p-8 md:p-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Nuestra historia</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Un legado de excelencia</h2>
          <div className="mt-6 grid gap-6 text-muted-foreground md:grid-cols-2">
            <p>
              El Colegio Cafam nace en 1971 como respuesta a la necesidad de brindar educación de calidad a las familias de la Caja de Compensación Familiar. A lo largo de estas décadas hemos formado a miles de estudiantes que hoy son profesionales comprometidos con el país.
            </p>
            <p>
              Contamos con instalaciones modernas: piscina semiolímpica, canchas deportivas, laboratorios, biblioteca y aulas equipadas con tecnología, todas al servicio de un aprendizaje significativo.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

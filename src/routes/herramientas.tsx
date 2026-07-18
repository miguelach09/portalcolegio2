import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { Mail, CreditCard, HeartHandshake, Library, ClipboardCheck, BookOpen, Video, Cloud } from "lucide-react";

const tools = [
  { name: "Office 365", desc: "Correo institucional y suite de productividad", href: "https://login.microsoftonline.com/", icon: Mail, color: "bg-sky text-white" },
  { name: "Q10 Académico", desc: "Notas, recibos y gestión académica", href: "https://site.q10.com/login?aplentId=242506df-1822-4f95-b1ac-2842f6896513", icon: CreditCard, color: "bg-primary text-primary-foreground" },
  { name: "PAC", desc: "Portal de atención al cliente", href: "https://portalcolegio.com/ingresoPac.php", icon: HeartHandshake, color: "bg-orange-brand text-white" },
  { name: "Biblioteca digital", desc: "Recursos y bases de datos", href: "/biblioteca", icon: Library, color: "bg-green-brand text-white" },
  { name: "Admisiones en línea", desc: "Formulario de preinscripción", href: "/admisiones", icon: ClipboardCheck, color: "bg-yellow-brand text-black" },
  { name: "Plataforma LMS", desc: "Aulas virtuales y tareas", href: "#", icon: BookOpen, color: "bg-pink-brand text-white" },
  { name: "Videoconferencia", desc: "Teams para clases en línea", href: "#", icon: Video, color: "bg-accent text-accent-foreground" },
  { name: "OneDrive", desc: "Almacenamiento institucional", href: "#", icon: Cloud, color: "bg-primary text-primary-foreground" },
];

export const Route = createFileRoute("/herramientas")({
  head: () => ({
    meta: [
      { title: "Herramientas digitales — Colegio Cafam" },
      { name: "description", content: "Accesos a plataformas y herramientas digitales del Colegio Cafam: Office 365, Q10, PAC, biblioteca digital y más." },
      { property: "og:title", content: "Herramientas digitales — Colegio Cafam" },
      { property: "og:description", content: "Todas las plataformas del colegio en un solo lugar." },
      { property: "og:url", content: "/herramientas" },
    ],
    links: [{ rel: "canonical", href: "/herramientas" }],
  }),
  component: Herramientas,
});

function Herramientas() {
  return (
    <PageShell>
      <PageHero eyebrow="Herramientas digitales" title="Todas las plataformas, un solo acceso." />
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ name, desc, href, icon: Icon, color }) => (
            <a key={name} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] transition-all">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold group-hover:text-primary">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

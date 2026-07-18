import { BookOpen, ClipboardCheck, CreditCard, HeartHandshake, Mail, Library } from "lucide-react";

type Item = {
  label: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  external?: boolean;
};

const items: Item[] = [
  { label: "Admisiones 2027", desc: "Preinscribe a tu hijo", href: "/admisiones", icon: ClipboardCheck, color: "bg-primary text-primary-foreground" },
  { label: "PAC", desc: "Portal de Atención al Cliente", href: "https://portalcolegio.com/ingresoPac.php", icon: HeartHandshake, color: "bg-orange-brand text-white", external: true },
  { label: "Bienestar", desc: "Programas de bienestar", href: "/bienestar", icon: HeartHandshake, color: "bg-green-brand text-white" },
  { label: "Q10 – Recibo matrícula", desc: "Descarga tu recibo", href: "https://site.q10.com/login?aplentId=242506df-1822-4f95-b1ac-2842f6896513", icon: CreditCard, color: "bg-sky text-white", external: true },
  { label: "Correo institucional", desc: "Office 365 estudiantes", href: "https://login.microsoftonline.com/", icon: Mail, color: "bg-yellow-brand text-black", external: true },
  { label: "Biblioteca", desc: "Recursos digitales", href: "/biblioteca", icon: Library, color: "bg-pink-brand text-white" },
];

export function QuickAccess() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Accesos rápidos</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Todo lo que necesitas, a un clic.
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Herramientas para estudiantes, padres y comunidad Cafam.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon;
          const inner = (
            <div className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${it.color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
                  {it.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </div>
          );
          return it.external ? (
            <a key={it.label} href={it.href} target="_blank" rel="noreferrer">
              {inner}
            </a>
          ) : (
            <a key={it.label} href={it.href}>{inner}</a>
          );
        })}
      </div>
    </section>
  );
}

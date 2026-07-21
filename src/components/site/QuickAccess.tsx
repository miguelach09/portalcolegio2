import btnPac from "@/assets/real/btn-pac.png";
import btnQ10 from "@/assets/real/btn-q10.png";
import btnCorreo from "@/assets/real/btn-correo.png";
import btnBiblioteca from "@/assets/real/btn-biblioteca.png";
import btnBienestar from "@/assets/real/btn-bienestar.png";
import btnAdmision from "@/assets/real/btn-admision.png";
import btnManual from "@/assets/real/btn-manual.png";
import btnDocumentos from "@/assets/real/btn-documentos.png";

type Item = {
  label: string;
  desc: string;
  href: string;
  image: string;
  external?: boolean;
};

const items: Item[] = [
  { label: "Admisiones 2027", desc: "Preinscribe a tu hijo", href: "/admisiones", image: btnAdmision },
  { label: "PAC", desc: "Portal de Atención al Cliente", href: "https://portalcolegio.com/ingresoPac.php", image: btnPac, external: true },
  { label: "Bienestar", desc: "Programas de bienestar", href: "/bienestar", image: btnBienestar },
  { label: "Q10 – Recibo matrícula", desc: "Descarga tu recibo", href: "https://site.q10.com/login?aplentId=242506df-1822-4f95-b1ac-2842f6896513", image: btnQ10, external: true },
  { label: "Correo institucional", desc: "Office 365 estudiantes", href: "https://login.microsoftonline.com/", image: btnCorreo, external: true },
  { label: "Biblioteca", desc: "Recursos digitales", href: "/biblioteca", image: btnBiblioteca },
  { label: "Manual de Convivencia", desc: "Documento institucional", href: "https://portalcolegio.com/MANUAL_CONVIVENCIA_COLEGIO_CAFAM.pdf", image: btnManual, external: true },
  { label: "Documentos", desc: "Circulares y comunicados", href: "/circulares", image: btnDocumentos },
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => {
          const inner = (
            <div className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <img
                src={it.image}
                alt={it.label}
                loading="lazy"
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary">
                  {it.label}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p>
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

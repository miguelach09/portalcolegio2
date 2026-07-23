import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  gated?: boolean;
};

const items: Item[] = [
  { label: "Admisiones 2027", desc: "Preinscribe a tu hijo", href: "/admisiones", image: btnAdmision },
  { label: "Guías de Aprendizaje", desc: "Escoge tu grado y descarga", href: "/guias", image: btnPac, gated: true },
  { label: "Bienestar", desc: "Programas de bienestar", href: "/bienestar", image: btnBienestar },
  { label: "Q10 – Recibo matrícula", desc: "Descarga tu recibo", href: "https://site.q10.com/login?aplentId=242506df-1822-4f95-b1ac-2842f6896513", image: btnQ10, external: true },
  { label: "Correo institucional", desc: "Office 365 estudiantes", href: "https://login.microsoftonline.com/", image: btnCorreo, external: true },
  { label: "Biblioteca", desc: "Recursos digitales", href: "/biblioteca", image: btnBiblioteca },
  { label: "Manual de Convivencia", desc: "Documento institucional", href: "https://portalcolegio.com/MANUAL_CONVIVENCIA_COLEGIO_CAFAM.pdf", image: btnManual, external: true },
  { label: "Documentos", desc: "Circulares y comunicados", href: "/circulares", image: btnDocumentos },
];

const GUIAS_PASSWORD = "CafamGuias1";

export function QuickAccess() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleGuiasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === GUIAS_PASSWORD) {
      setOpen(false);
      setPwd("");
      setError("");
      navigate({ to: "/guias" });
    } else {
      setError("contraseña invalida");
    }
  };

  return (
    <section className="container-page py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Accesos rápidos</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
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
          if (it.gated) {
            return (
              <button
                key={it.label}
                type="button"
                onClick={() => {
                  setError("");
                  setPwd("");
                  setOpen(true);
                }}
                className="text-left"
              >
                {inner}
              </button>
            );
          }
          return it.external ? (
            <a key={it.label} href={it.href} target="_blank" rel="noreferrer">
              {inner}
            </a>
          ) : (
            <a key={it.label} href={it.href}>{inner}</a>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setError(""); setPwd(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guías de Aprendizaje</DialogTitle>
            <DialogDescription>
              Ingresa la contraseña para acceder a las guías.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuiasSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Contraseña"
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); if (error) setError(""); }}
              autoFocus
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <DialogFooter className="gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cerrar</Button>
              </DialogClose>
              <Button type="submit">Ingresar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

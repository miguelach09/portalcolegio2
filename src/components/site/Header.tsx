import { Link } from "@tanstack/react-router";
import { Menu, X, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "./ThemeToggle";
import { SiteSearch } from "./SiteSearch";
import logoCafam from "@/assets/real/logo-cafam.png";

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/mi-colegio", label: "Mi Colegio" },
  { to: "/admisiones", label: "Admisiones" },
  { to: "/galeria", label: "Galería" },
  { to: "/circulares", label: "Circulares" },
  { to: "/guias", label: "Guías" },
  { to: "/calendario", label: "Calendario" },
  { to: "/encuestas", label: "Encuestas" },
  { to: "/faq", label: "FAQ" },
  { to: "/contacto", label: "Contáctenos" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src={logoCafam}
            alt="Colegio Cafam"
            className="h-10 w-auto shrink-0 object-contain"
            width={228}
            height={64}
          />
          <span className="hidden text-sm font-semibold leading-tight text-slate-900 dark:text-white sm:block">
            Colegio Cafam
          </span>

        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-primary-soft hover:text-primary"
              activeProps={{ className: "bg-primary-soft text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <SiteSearch />
          <ThemeToggle />
          <AuthHeader />
          <Link
            to="/admisiones"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
          >
            Admisiones 2027
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <SiteSearch />
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-primary-soft hover:text-primary"
                activeProps={{ className: "bg-primary-soft text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <AuthHeader mobile onClick={() => setOpen(false)} />
            <Link
              to="/admisiones"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Admisiones 2027
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function AuthHeader({ mobile, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <Link
        to="/auth"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary-soft hover:text-primary ${
          mobile ? "justify-center border border-input" : ""
        }`}
      >
        <LogIn className="h-4 w-4" />
        Admin
      </Link>
    );
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    await supabase.auth.signOut();
    onClick?.();
  }

  return (
    <div className={`flex items-center gap-2 ${mobile ? "flex-col" : ""}`}>
      <Link
        to="/admin"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary-soft hover:text-primary ${
          mobile ? "justify-center border border-input" : ""
        }`}
      >
        <LayoutDashboard className="h-4 w-4" />
        Panel
      </Link>
      <button
        onClick={handleSignOut}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive ${
          mobile ? "justify-center border border-input" : ""
        }`}
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}

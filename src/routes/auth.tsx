import { createFileRoute, useSearch, useRouter, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { adminVisit } from '@/lib/admin-visit';
import { closeAdminSession } from '@/lib/admin-session';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async ({ search, context }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    if (!adminVisit.permits(data.user.id)) {
      await closeAdminSession(context.queryClient);
      return;
    }
    const target = (search as { redirect?: string })?.redirect;
    const safe = safeAdminTarget(target);
    if (safe) throw redirect({ href: safe });
    throw redirect({ to: "/admin" });
  },
  head: () => ({ meta: [
    { title: 'Acceso administrativo — Colegio Cafam' },
    { name: 'description', content: 'Acceso del personal autorizado al panel del Colegio Cafam.' },
    { property: 'og:title', content: 'Acceso administrativo — Colegio Cafam' },
    { property: 'og:description', content: 'Acceso del personal autorizado al Colegio Cafam.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const search = useSearch({ from: "/auth" }) as { redirect?: string };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError || !data.user) {
      setError(signInError?.message || "No se pudo iniciar sesión");
      return;
    }

    adminVisit.authorize(data.user.id);
    const target = safeAdminTarget(search.redirect) ?? "/admin";

    router.navigate({ to: target as any, replace: true });
  }

  return (
    <PageShell>
      <PageHero
        title="Acceso administrativo"
        subtitle="Inicia sesión para gestionar el contenido del sitio."
      />
      <section className="container-app py-16">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@colegio.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

// Solo se vuelve a direcciones internas del panel (evita redirecciones a otros sitios).
function safeAdminTarget(raw?: string): string | null {
  if (!raw) return null;
  let path = raw;
  if (typeof window !== "undefined" && path.startsWith(window.location.origin)) {
    path = path.slice(window.location.origin.length);
  }
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin?") ? path : null;
}

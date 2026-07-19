import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Image, Newspaper, Plus, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";
import { getDocuments, getGalleryImages, getNews } from "@/lib/content.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const router = useRouter();

  const { data: documents = [] } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: () => getDocuments({ data: {} }),
  });

  const { data: news = [] } = useQuery({
    queryKey: ["admin-news"],
    queryFn: () => getNews({ data: { limit: 100 } }),
  });

  const { data: images = [] } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => getGalleryImages({ data: { limit: 100 } }),
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Panel administrativo</h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="container-app py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <AdminCard
            title="Documentos"
            count={documents.length}
            icon={<FileText className="h-5 w-5" />}
            href="/admin/documentos"
            color="bg-blue-100 text-blue-700"
          />
          <AdminCard
            title="Noticias"
            count={news.length}
            icon={<Newspaper className="h-5 w-5" />}
            href="/admin/noticias"
            color="bg-amber-100 text-amber-700"
          />
          <AdminCard
            title="Galería"
            count={images.length}
            icon={<Image className="h-5 w-5" />}
            href="/admin/galeria"
            color="bg-emerald-100 text-emerald-700"
          />
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Acciones rápidas</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Subir circular o revisa"
              desc="PDF para Circulares, Revisas, Admisiones o Herramientas"
              href="/admin/documentos/nuevo"
            />
            <QuickActionCard
              title="Publicar noticia"
              desc="Crear entrada para la sección de noticias"
              href="/admin/noticias/nueva"
            />
            <QuickActionCard
              title="Agregar imagen a galería"
              desc="Subir foto a la galería de vida escolar"
              href="/admin/galeria/nueva"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminCard({
  title,
  count,
  icon,
  href,
  color,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
    >
      <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{count}</p>
      </div>
    </Link>
  );
}

function QuickActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-2 rounded-xl border border-dashed bg-card p-5 transition hover:border-primary hover:bg-accent"
    >
      <div className="flex items-center gap-2 text-primary">
        <Plus className="h-4 w-4" />
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}

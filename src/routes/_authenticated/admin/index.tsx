import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  Image,
  Newspaper,
  Plus,
  LogOut,
  CalendarDays,
  HelpCircle,
  Vote,
  Mail,
  Users,
  MessageSquare,
  Megaphone,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";
import { getDashboardStats } from "@/lib/features.functions";
import { getContactMessages, updateContactMessageStatus, deleteContactMessage } from "@/lib/features.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const router = useRouter();
  const stats = useServerFn(getDashboardStats);
  const { data: dashboard } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => stats(),
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
        <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Noticias" count={dashboard?.news ?? "—"} icon={<Newspaper className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
          <StatCard label="Documentos" count={dashboard?.documents ?? "—"} icon={<FileText className="h-5 w-5" />} color="bg-blue-100 text-blue-700" />
          <StatCard label="Galería" count={dashboard?.gallery ?? "—"} icon={<Image className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
          <StatCard label="Eventos" count={dashboard?.events ?? "—"} icon={<CalendarDays className="h-5 w-5" />} color="bg-purple-100 text-purple-700" />
          <StatCard label="Mensajes nuevos" count={dashboard?.newMessages ?? "—"} icon={<Mail className="h-5 w-5" />} color="bg-red-100 text-red-700" href="/admin/mensajes" />
          <StatCard label="Suscriptores" count={dashboard?.subscribers ?? "—"} icon={<Users className="h-5 w-5" />} color="bg-cyan-100 text-cyan-700" href="/admin/suscriptores" />
          <StatCard label="Preguntas FAQ" count={dashboard?.faqs ?? "—"} icon={<HelpCircle className="h-5 w-5" />} color="bg-indigo-100 text-indigo-700" href="/admin/faqs" />
          <StatCard label="Encuestas" count={dashboard ? "—": "—"} icon={<Vote className="h-5 w-5" />} color="bg-pink-100 text-pink-700" href="/admin/encuestas" />
        </div>

        <h2 className="mt-10 text-lg font-semibold text-foreground">Gestión de contenido</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ManageCard title="Documentos" desc="Circulares, revisas, guías y herramientas" href="/admin/documentos" icon={<FileText className="h-5 w-5" />} />
          <ManageCard title="Noticias" desc="Publicar y editar noticias" href="/admin/noticias" icon={<Newspaper className="h-5 w-5" />} />
          <ManageCard title="Galería" desc="Imágenes de vida escolar" href="/admin/galeria" icon={<Image className="h-5 w-5" />} />
          <ManageCard title="Eventos" desc="Calendario escolar" href="/admin/eventos" icon={<CalendarDays className="h-5 w-5" />} />
          <ManageCard title="Preguntas FAQ" desc="Preguntas frecuentes" href="/admin/faqs" icon={<HelpCircle className="h-5 w-5" />} />
          <ManageCard title="Encuestas" desc="Crear y gestionar encuestas" href="/admin/encuestas" icon={<Vote className="h-5 w-5" />} />
          <ManageCard title="Mensajes" desc="Buzón de contacto" href="/admin/mensajes" icon={<MessageSquare className="h-5 w-5" />} />
          <ManageCard title="Suscriptores" desc="Lista de correos" href="/admin/suscriptores" icon={<Users className="h-5 w-5" />} />
          <ManageCard title="Avisos" desc="Banner de aviso urgente" href="/admin/avisos" icon={<Megaphone className="h-5 w-5" />} />
          <ManageCard title="Docentes" desc="Directorio docente y directivo" href="/admin/docentes" icon={<GraduationCap className="h-5 w-5" />} />
          <ManageCard title="Preinscripciones" desc="Solicitudes de admisión 2027" href="/admin/preinscripciones" icon={<ClipboardList className="h-5 w-5" />} />
        </div>

        <h2 className="mt-10 text-lg font-semibold text-foreground">Acciones rápidas</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard title="Subir circular o revisa" desc="PDF para Circulares, Revisas, Admisiones o Herramientas" href="/admin/documentos/nuevo" />
          <QuickActionCard title="Publicar noticia" desc="Crear entrada para la sección de noticias" href="/admin/noticias/nueva" />
          <QuickActionCard title="Agregar imagen a galería" desc="Subir foto a la galería de vida escolar" href="/admin/galeria/nueva" />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  count,
  icon,
  color,
  href,
}: {
  label: string;
  count: number | string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{count}</p>
      </div>
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
}

function ManageCard({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary hover:bg-accent"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
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

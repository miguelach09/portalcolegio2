import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, History, Lock, RefreshCw, Search } from "lucide-react";
import { getFileAuditLog, type FileAuditEntry } from "@/lib/audit.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/historial/")({
  component: HistorialPage,
});

const HISTORIAL_PASSWORD = "CafamHistorial1";

const ENTITY_LABELS: Record<string, string> = {
  documents: "Documentos",
  gallery_images: "Galería",
  library_books: "Libros CRE",
  hero_slides: "Carrusel",
  assistant_knowledge: "Asistente",
  news: "Noticias",
};

const ACTION_STYLES: Record<string, string> = {
  agregado: "bg-emerald-100 text-emerald-700",
  modificado: "bg-amber-100 text-amber-700",
  "archivo reemplazado": "bg-blue-100 text-blue-700",
  eliminado: "bg-red-100 text-red-700",
};

function formatSize(bytes: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistorialPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-app py-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
        </div>
        <Dialog open>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl p-6 sm:p-8" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="pr-8 text-left">
              <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary-soft p-3 text-primary">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle>Historial de archivos</DialogTitle>
                <DialogDescription>Ingresa la contraseña para continuar.</DialogDescription>
              </div>
              </div>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (pwd === HISTORIAL_PASSWORD) {
                  setUnlocked(true);
                  setError("");
                  setPwd("");
                } else {
                  setError("Contraseña inválida");
                }
              }}
            >
              <input
                type="password"
                autoFocus
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Contraseña"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Entrar
              </button>
              <Link
                to="/admin"
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Volver al panel
              </Link>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <HistorialTable />;
}

function HistorialTable() {
  const fetchLog = useServerFn(getFileAuditLog);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["file-audit-log"],
    queryFn: () => fetchLog(),
  });
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");

  const rows = useMemo(() => {
    const list: FileAuditEntry[] = data || [];
    const term = q.trim().toLowerCase();
    return list.filter((r) => {
      if (entity && r.entity !== entity) return false;
      if (action && r.action !== action) return false;
      if (!term) return true;
      return [r.title, r.file_name, r.actor_email, r.file_extension]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [data, q, entity, action]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Panel
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <History className="h-5 w-5 text-primary" />
              Historial de archivos
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, título o usuario"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas las secciones</option>
            {Object.entries(ENTITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas las acciones</option>
            <option value="agregado">Agregado</option>
            <option value="modificado">Modificado</option>
            <option value="archivo reemplazado">Archivo reemplazado</option>
            <option value="eliminado">Eliminado</option>
          </select>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {isLoading ? "Cargando movimientos…" : `${rows.length} movimiento(s)`}
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Fecha y hora</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Sección</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Ext.</th>
                <th className="px-4 py-3">Peso</th>
                <th className="px-4 py-3">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatWhen(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        ACTION_STYLES[r.action] ?? "bg-muted text-foreground"
                      }`}
                    >
                      {r.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {ENTITY_LABELS[r.entity] ?? r.entity}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{r.title ?? "—"}</td>
                  <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground">
                    {r.file_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">
                    {r.file_extension ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatSize(r.file_size)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.actor_email ?? "—"}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Aún no hay movimientos registrados con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

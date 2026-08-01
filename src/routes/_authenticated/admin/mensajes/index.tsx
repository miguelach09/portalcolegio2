import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Trash2, ArrowLeft, Inbox } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from "@/lib/features.functions";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/mensajes/")({
  component: MensajesAdmin,
});

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nuevo: { label: "Nuevo", color: "bg-red-100 text-red-700" },
  leido: { label: "Leído", color: "bg-blue-100 text-blue-700" },
  atendido: { label: "Atendido", color: "bg-green-100 text-green-700" },
};

function MensajesAdmin() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const fetchMsgs = useServerFn(getContactMessages);
  const { data: messages = [] } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: () => fetchMsgs(),
  });

  const updateStatus = useServerFn(updateContactMessageStatus);
  const deleteMsg = useServerFn(deleteContactMessage);

  const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);

  async function handleStatus(id: string, status: string) {
    try {
      await updateStatus({ data: { id, status } });
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      alert("No se pudo actualizar el estado.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    try {
      await deleteMsg({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      alert("No se pudo eliminar el mensaje.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Link>
        </div>
      </header>

      <main className="container-app py-10">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Mensajes de contacto</h1>
        </div>

        <div className="mt-4 flex gap-2">
          {["all", "nuevo", "leido", "atendido"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_LABELS[s]?.label || s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay mensajes {filter !== "all" ? "con este estado" : ""}.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((m) => {
              const st = STATUS_LABELS[m.status] || { label: m.status, color: "bg-muted text-muted-foreground" };
              return (
                <div key={m.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{m.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.email}</p>
                      {m.subject && <p className="mt-1 text-sm font-medium text-foreground">{m.subject}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDateES(m.created_at.slice(0, 10))}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{m.message}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <select
                      value={m.status}
                      onChange={(e) => handleStatus(m.id, e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="nuevo">Marcar como Nuevo</option>
                      <option value="leido">Marcar como Leído</option>
                      <option value="atendido">Marcar como Atendido</option>
                    </select>
                    <a
                      href={`mailto:${m.email}`}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                    >
                      Responder
                    </a>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

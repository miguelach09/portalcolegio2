import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Users, Trash2, ArrowLeft, Download } from "lucide-react";
import { getSubscribers, deleteSubscriber } from "@/lib/features.functions";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/suscriptores/")({
  component: SuscriptoresAdmin,
});

function SuscriptoresAdmin() {
  const queryClient = useQueryClient();
  const fetchSubs = useServerFn(getSubscribers);
  const remove = useServerFn(deleteSubscriber);
  const { data: subs = [] } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: () => fetchSubs(),
  });

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este suscriptor?")) return;
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch { alert("No se pudo eliminar."); }
  }

  function exportCSV() {
    const csv = "email,fecha\n" + subs.map((s: any) => `${s.email},${s.created_at.slice(0, 10)}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suscriptores.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
          {subs.length > 0 && (
            <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
              <Download className="h-4 w-4" /> Exportar CSV
            </button>
          )}
        </div>
      </header>

      <main className="container-app py-10">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Suscriptores ({subs.length})</h1>
        </div>

        {subs.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay suscriptores aún.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Correo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acción</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s: any) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateES(s.created_at.slice(0, 10))}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(s.id)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

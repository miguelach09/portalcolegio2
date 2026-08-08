import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { redeemGuardianCode } from "@/lib/family.functions";

export const Route = createFileRoute("/_authenticated/familia/vincular")({
  component: LinkStudentPage,
});

function LinkStudentPage() {
  const router = useRouter();
  const redeem = useServerFn(redeemGuardianCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await redeem({ data: { code } });
      router.navigate({ to: "/familia", replace: true });
    } catch (err) {
      setError(
        err instanceof Error && err.message && !err.message.includes("[object")
          ? err.message
          : "No pudimos validar el código. Verifícalo e intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Vincular estudiante
          </h1>
          <Link
            to="/familia"
            className="inline-flex items-center gap-2 rounded-full border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </div>
      </header>

      <main className="container-page py-14">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <KeyRound className="h-8 w-8 text-primary" />
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
            Ingresa tu código de vinculación
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            El colegio entrega un código único por estudiante. Al ingresarlo verás sus circulares
            y guías correspondientes.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Código</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD2345"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono tracking-widest outline-none focus:border-primary"
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Validando…" : "Vincular"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeEmail } from "@/lib/features.functions";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const subscribe = useServerFn(subscribeEmail);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await subscribe({ data: { values: { email } } });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        ¡Suscripción confirmada! Gracias.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          required
          className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 disabled:opacity-60"
      >
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suscribirme"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-300 sm:absolute sm:-bottom-5">No se pudo suscribir. Intenta de nuevo.</p>
      )}
    </form>
  );
}

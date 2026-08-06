import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Send } from "lucide-react";
import { submitAdmissionApplication } from "@/lib/directory.functions";
import { admissionFormSchema } from "@/lib/directory.schemas";
import { ADMISSION_GRADES } from "@/lib/directory.types";

const empty = {
  student_name: "",
  birth_date: "",
  grade: "",
  guardian_name: "",
  guardian_email: "",
  guardian_phone: "",
  previous_school: "",
  comments: "",
};

export function AdmissionForm() {
  const submit = useServerFn(submitAdmissionApplication);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  function set(key: keyof typeof empty, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = admissionFormSchema.safeParse(values);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[String(issue.path[0])] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await submit({ data: { values: parsed.data } });
      setStatus("done");
      setValues(empty);
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-brand" />
        <h3 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">
          ¡Preinscripción enviada!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Recibimos los datos del aspirante. El equipo de admisiones se pondrá en contacto con el
          correo registrado para agendar la evaluación diagnóstica.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-accent"
        >
          Enviar otra preinscripción
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
    >
      <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        Formulario de preinscripción
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Completa los datos del aspirante y del acudiente. Los campos con * son obligatorios.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo del aspirante *" error={errors["student_name"]}>
          <input
            value={values.student_name}
            onChange={(e) => set("student_name", e.target.value)}
            className={inputCls}
            autoComplete="off"
          />
        </Field>
        <Field label="Fecha de nacimiento" error={errors["birth_date"]}>
          <input
            type="date"
            value={values.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Grado al que aspira *" error={errors["grade"]}>
          <select
            value={values.grade}
            onChange={(e) => set("grade", e.target.value)}
            className={inputCls}
          >
            <option value="">Selecciona un grado</option>
            {ADMISSION_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Colegio anterior" error={errors["previous_school"]}>
          <input
            value={values.previous_school}
            onChange={(e) => set("previous_school", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Nombre del acudiente *" error={errors["guardian_name"]}>
          <input
            value={values.guardian_name}
            onChange={(e) => set("guardian_name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Correo del acudiente *" error={errors["guardian_email"]}>
          <input
            type="email"
            value={values.guardian_email}
            onChange={(e) => set("guardian_email", e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </Field>
        <Field label="Teléfono de contacto *" error={errors["guardian_phone"]}>
          <input
            value={values.guardian_phone}
            onChange={(e) => set("guardian_phone", e.target.value)}
            className={inputCls}
            autoComplete="tel"
          />
        </Field>
        <Field label="Comentarios" error={errors["comments"]} className="sm:col-span-2">
          <textarea
            rows={4}
            value={values.comments}
            onChange={(e) => set("comments", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          No pudimos enviar la preinscripción. Verifica los datos e intenta de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {status === "sending" ? "Enviando…" : "Enviar preinscripción"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-foreground/85">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

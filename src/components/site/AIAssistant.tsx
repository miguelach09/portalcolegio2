import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, ArrowRight, FileText, BookOpen, Newspaper, CalendarDays, HelpCircle, Image as ImageIcon, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { askAssistant, type AssistantLink } from "@/lib/assistant.functions";

type Msg = { role: "user" | "assistant"; content: string; links?: AssistantLink[] };

const KIND_ICON: Record<AssistantLink["kind"], typeof FileText> = {
  documento: FileText,
  libro: BookOpen,
  noticia: Newspaper,
  evento: CalendarDays,
  faq: HelpCircle,
  galeria: ImageIcon,
  docente: User,
  pagina: ArrowRight,
};

function LinkButtons({ links }: { links: AssistantLink[] }) {
  return (
    <div className="mt-2 flex max-w-[92%] flex-col gap-1.5">
      {links.map((l, i) => {
        const Icon = KIND_ICON[l.kind] ?? ArrowRight;
        const inner = (
          <>
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{l.label}</span>
              {l.sublabel && (
                <span className="block truncate text-[11px] text-muted-foreground">{l.sublabel}</span>
              )}
            </span>
            <ArrowRight className="ml-auto mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        );
        const cls =
          "flex items-start gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/50 hover:bg-muted";
        return l.external ? (
          <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {inner}
          </a>
        ) : (
          <Link key={i} to={l.href} className={cls}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

const WELCOME: Msg = {
  role: "assistant",
  content:
    "¡Hola! Soy el asistente virtual del Colegio Cafam. Puedo ayudarte con admisiones, circulares, plataformas, horarios y más. ¿En qué te ayudo?",
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const payload = next.map(({ role, content }) => ({ role, content }));
      const { reply, links } = await askAssistant({ data: { messages: payload } });
      setMessages([...next, { role: "assistant", content: reply, links }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Lo siento, tuve un problema para responderte. Intenta de nuevo o contáctanos al (601) 307 8060.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] max-h-[calc(100vh-8rem)] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-lift)]">
          <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold">Asistente Cafam</div>
              <div className="text-[11px] text-primary-foreground/80">En línea · IA</div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background px-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "assistant" && m.links && m.links.length > 0 && (
                  <LinkButtons links={m.links} />
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 border-t border-border bg-card p-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Escribe tu pregunta…"
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

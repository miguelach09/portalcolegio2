import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ArrowRight,
  FileText,
  BookOpen,
  Newspaper,
  CalendarDays,
  HelpCircle,
  Image as ImageIcon,
  User,
  Maximize2,
  Minimize2,
  GripVertical,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { askAssistant, type AssistantLink } from "@/lib/assistant.functions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

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
    <div className="mt-2 flex w-full max-w-full flex-col gap-2 sm:max-w-[92%]">
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
          "flex min-h-12 w-full items-start gap-2 rounded-xl border border-primary/30 bg-card px-3 py-2.5 text-left shadow-sm transition-colors hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
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

const MIN_W = 300;
const MIN_H = 360;
const DEFAULT_W = 384;
const DEFAULT_H = 560;

type Box = { x: number; y: number; w: number; h: number };

function clampBox(b: Box): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.max(MIN_W, Math.min(b.w, vw - 16));
  const h = Math.max(MIN_H, Math.min(b.h, vh - 16));
  return {
    w,
    h,
    x: Math.max(8, Math.min(b.x, vw - w - 8)),
    y: Math.max(8, Math.min(b.y, vh - h - 8)),
  };
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [expanded, setExpanded] = useState(false);
  const prevBox = useRef<Box | null>(null);

  // Posición/tamaño inicial: esquina inferior derecha, sobre el botón flotante.
  useEffect(() => {
    if (!open || box) return;
    const w = Math.min(DEFAULT_W, window.innerWidth - 32);
    const h = Math.min(DEFAULT_H, window.innerHeight - 120);
    setBox(clampBox({ w, h, x: window.innerWidth - w - 24, y: window.innerHeight - h - 96 }));
  }, [open, box]);

  useEffect(() => {
    const onResize = () => setBox((b) => (b ? clampBox(b) : b));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!box || expanded) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = box;
      const move = (ev: PointerEvent) =>
        setBox(
          clampBox({ ...origin, x: origin.x + (ev.clientX - startX), y: origin.y + (ev.clientY - startY) })
        );
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [box, expanded]
  );

  const startResize = useCallback(
    (corner: "br" | "tl" | "bl" | "tr") => (e: React.PointerEvent) => {
      if (!box) return;
      e.preventDefault();
      e.stopPropagation();
      setExpanded(false);
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = box;
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let next: Box = { ...origin };
        if (corner === "br") next = { ...origin, w: origin.w + dx, h: origin.h + dy };
        if (corner === "bl")
          next = { ...origin, x: origin.x + dx, w: origin.w - dx, h: origin.h + dy };
        if (corner === "tr")
          next = { ...origin, y: origin.y + dy, w: origin.w + dx, h: origin.h - dy };
        if (corner === "tl")
          next = {
            x: origin.x + dx,
            y: origin.y + dy,
            w: origin.w - dx,
            h: origin.h - dy,
          };
        if (next.w < MIN_W) {
          next.w = MIN_W;
          if (corner === "bl" || corner === "tl") next.x = origin.x + origin.w - MIN_W;
        }
        if (next.h < MIN_H) {
          next.h = MIN_H;
          if (corner === "tl" || corner === "tr") next.y = origin.y + origin.h - MIN_H;
        }
        setBox(clampBox(next));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [box]
  );

  function toggleExpand() {
    if (!box) return;
    if (expanded) {
      setBox(clampBox(prevBox.current ?? box));
      setExpanded(false);
      return;
    }
    prevBox.current = box;
    const w = Math.min(920, window.innerWidth - 32);
    const h = window.innerHeight - 32;
    setBox(clampBox({ w, h, x: (window.innerWidth - w) / 2, y: 16 }));
    setExpanded(true);
  }

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
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

  const handleCls =
    "absolute h-5 w-5 z-10 touch-none";

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && box && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-lift)]"
          style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
        >
          {/* Manijas para redimensionar en las cuatro esquinas */}
          <span onPointerDown={startResize("tl")} className={`${handleCls} left-0 top-0 cursor-nwse-resize`} />
          <span onPointerDown={startResize("tr")} className={`${handleCls} right-0 top-0 cursor-nesw-resize`} />
          <span onPointerDown={startResize("bl")} className={`${handleCls} bottom-0 left-0 cursor-nesw-resize`} />
          <span onPointerDown={startResize("br")} className={`${handleCls} bottom-0 right-0 cursor-nwse-resize`} />

          <div
            onPointerDown={startDrag}
            className={`flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground ${
              expanded ? "" : "cursor-move"
            } touch-none select-none`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold">Asistente Cafam</div>
              <div className="text-[11px] text-primary-foreground/80">En línea · IA</div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <GripVertical className="h-4 w-4 opacity-60" aria-hidden="true" />
              <button
                type="button"
                onClick={toggleExpand}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                aria-label={expanded ? "Reducir ventana" : "Expandir ventana"}
                title={expanded ? "Reducir" : "Expandir"}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                aria-label="Cerrar asistente"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Conversation className="bg-background">
            <ConversationContent className="gap-3 px-3 py-4">
            {messages.map((m, i) => (
              <Message key={i} from={m.role} className="max-w-full">
                <MessageContent
                  className={m.role === "user"
                    ? "max-w-[88%] rounded-2xl bg-primary px-3.5 py-2 text-primary-foreground"
                    : "max-w-full px-0 py-0"
                  }
                >
                  <MessageResponse>{m.content}</MessageResponse>
                </MessageContent>
                {m.role === "assistant" && m.links && m.links.length > 0 && (
                  <LinkButtons links={m.links} />
                )}
              </Message>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…
                </div>
              </div>
            )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border bg-card p-3">
          <PromptInput
            onSubmit={(message) => handleSend(message.text)}
            className="rounded-xl bg-background"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              className="min-h-11 max-h-32"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={loading ? "submitted" : "ready"}
                disabled={loading || !input.trim()}
                aria-label="Enviar"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Loader2, Send, X } from "lucide-react";
import { whatsappLink } from "@/config/site";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING = "Hey! Welcome to Fitness World. What are you looking for today?";
const QUICK = [
  { label: "Explore memberships", prompt: "Can you explain the membership plans?" },
  { label: "Personal training", prompt: "Tell me about personal training." },
  { label: "Nutrition plans", prompt: "Where can I find nutrition and meal plans?" },
  { label: "Talk to our team", prompt: "I'd like someone from the team to call me." },
];

/** Renders plain text with [label](/relative-link) markdown links only. */
function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={m.index} href={m[2]} className="font-semibold text-ember underline underline-offset-2">
        {m[1]}
      </Link>
    );
    last = re.lastIndex;
  }
  parts.push(text.slice(last));
  return <p className="whitespace-pre-line">{parts}</p>;
}

export function FitBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuel = pathname.startsWith("/fuel-studio");

  useEffect(() => {
    if (!open) return;
    fetch("/api/fitbot")
      .then((r) => r.json())
      .then((j) => setOffline(!j.enabled))
      .catch(() => {});
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, pending]);

  async function send(text: string) {
    const content = text.trim().slice(0, 1000);
    if (!content || pending) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next);
    setInput("");
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/fitbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-20) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (j.offline) setOffline(true);
        setError(j.error ?? "Something went wrong.");
        setMsgs(msgs); // roll back so the visitor can retry
        setInput(content);
        return;
      }
      setMsgs([...next, { role: "assistant", content: j.text }]);
    } catch {
      setError("You seem to be offline.");
      setMsgs(msgs);
      setInput(content);
    } finally {
      setPending(false);
    }
  }

  const wa = whatsappLink();

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="FITBOT chat"
          className="fixed inset-x-3 bottom-24 z-[65] flex max-h-[min(640px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-xl border border-line bg-coal shadow-2xl sm:inset-x-auto sm:bottom-28 sm:right-8 sm:w-[390px]"
        >
          <header className="flex items-center justify-between border-b border-line bg-iron px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-furnace text-pitch">
                <Bot size={18} aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase leading-none text-bone">FITBOT</p>
                <p className="text-xs text-ash">{offline ? "Assistant offline" : "AI assistant · may make mistakes"}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded text-ash hover:text-bone">
              <X size={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-[0.95rem]" aria-live="polite">
            <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-iron px-3.5 py-2.5 text-bone">{GREETING}</div>
            {offline && (
              <div className="rounded-lg border border-line p-3.5 text-sm text-ash">
                The chat assistant isn&apos;t available right now. You can still{" "}
                <Link href="/consultation?intent=CALLBACK" className="text-ember underline">
                  request a callback
                </Link>
                {wa && (
                  <>
                    {" "}or{" "}
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="text-ember underline">
                      message us on WhatsApp
                    </a>
                  </>
                )}
                .
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3.5 py-2.5 ${
                  m.role === "user" ? "ml-auto rounded-tr-sm bg-furnace text-pitch" : "rounded-tl-sm bg-iron text-bone"
                }`}
              >
                {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
              </div>
            ))}
            {pending && (
              <div className="flex w-fit items-center gap-2 rounded-lg bg-iron px-3.5 py-2.5 text-ash">
                <Loader2 size={14} className="animate-spin" aria-hidden /> FITBOT is typing…
              </div>
            )}
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK.map((q) =>
                  offline ? (
                    <Link
                      key={q.label}
                      href={
                        q.label.startsWith("Explore")
                          ? "/memberships"
                          : q.label.startsWith("Personal")
                            ? "/consultation?intent=PERSONAL_TRAINING&program=personal-training"
                            : q.label.startsWith("Nutrition")
                              ? "/fuel-studio"
                              : "/consultation?intent=CALLBACK"
                      }
                      className="rounded-full border border-line px-3 py-1.5 text-sm text-bone hover:border-furnace"
                    >
                      {q.label}
                    </Link>
                  ) : (
                    <button
                      key={q.label}
                      onClick={() => send(q.prompt)}
                      className="rounded-full border border-line px-3 py-1.5 text-sm text-bone hover:border-furnace"
                    >
                      {q.label}
                    </button>
                  )
                )}
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>

          {!offline && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2 border-t border-line p-3"
            >
              <label htmlFor="fitbot-input" className="sr-only">
                Message FITBOT
              </label>
              <input
                ref={inputRef}
                id="fitbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1000}
                placeholder="Ask about plans, timings, training…"
                className="field !py-2.5"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-furnace text-pitch disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </form>
          )}
          <p className="px-4 pb-3 text-[0.7rem] text-ash">Please don&apos;t share health, card or password details in chat.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close FITBOT" : "Chat with FITBOT"}
        className={`grid h-14 w-14 place-items-center rounded-full shadow-xl transition-transform hover:scale-105 ${
          fuel ? "bg-earth text-cream" : "bg-bone text-pitch"
        }`}
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>
    </>
  );
}

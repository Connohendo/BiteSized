"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

type QAOverDocProps = {
  documentText: string;
  defaultExpanded?: boolean;
};

export function QAOverDoc({ documentText, defaultExpanded = false }: QAOverDocProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || !documentText.trim() || loading) return;

    const userMessage: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: documentText.trim(),
          messages: [...messages, userMessage],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error ?? "Something went wrong." }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.message ?? "" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!documentText?.trim()) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-[var(--muted)] hover:bg-white/5"
          aria-expanded={expanded}
        >
          {expanded ? "▼" : "▶"}
        </button>
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Q&A over your doc
        </h2>
      </div>
      {expanded && (
        <>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
        Ask follow-up questions; answers are grounded in your uploaded content.
      </p>
      <div
        ref={listRef}
        className="max-h-[280px] overflow-y-auto space-y-3 mb-4 pr-1"
      >
        {messages.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Ask a question to get started.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 text-sm ${
              m.role === "user"
                ? "ml-6 bg-[var(--accent)]/20 text-[var(--foreground)]"
                : "mr-6 bg-[var(--background)] text-[var(--foreground)] border border-[var(--card-border)]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <p className="text-sm text-[var(--muted)]">Thinking…</p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the document…"
          disabled={loading}
          className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
        </>
      )}
    </div>
  );
}

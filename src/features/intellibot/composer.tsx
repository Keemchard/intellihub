"use client";
import { useState } from "react";
import { Icon } from "@/components/shared/icon";

export function Composer({ onAsk, disabled, autoFocus }: { onAsk: (q: string) => void; disabled?: boolean; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!q.trim() || disabled) return; onAsk(q); setQ(""); };
  return (
    <form onSubmit={submit} className="relative">
      <input value={q} onChange={(e) => setQ(e.target.value)} disabled={disabled} autoFocus={autoFocus}
        placeholder="Ask about a dashboard, KPI, or access…"
        className="h-12 w-full rounded-2xl border border-border bg-card pl-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60" />
      <button type="submit" disabled={disabled || !q.trim()} aria-label="Send"
        className="grad-brand absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-xl text-white transition hover:brightness-110 disabled:opacity-40">
        <Icon name="arrow-right" size={17} />
      </button>
    </form>
  );
}

export function Suggestions({ items, onPick }: { items: readonly string[]; onPick: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <button key={s} onClick={() => onPick(s)}
          className="ring-focus rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground">
          {s}
        </button>
      ))}
    </div>
  );
}

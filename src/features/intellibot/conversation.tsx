"use client";
import Link from "next/link";
import { Icon } from "@/components/shared/icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { Turn } from "./use-bot";

function Markdownish({ text }: { text: string }) {
  // Minimal bold support (**x**) — the router is the only author of this text.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <p className="text-sm leading-relaxed">{parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="font-bold text-foreground">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</p>;
}

export function Conversation({ turns, isPending }: { turns: Turn[]; isPending: boolean }) {
  return (
    <div className="space-y-4">
      {turns.map((t, i) =>
        t.role === "user" ? (
          <div key={i} className="flex justify-end">
            <div className="grad-brand max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm font-medium text-white">{t.text}</div>
          </div>
        ) : (
          <div key={i} className="animate-fadein flex gap-3">
            <div className="grad-brand grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white"><Icon name="sparkles" size={15} /></div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-muted-foreground"><Markdownish text={t.response.intro} /></div>
              {t.response.howto && (
                <div className="rounded-2xl border border-border bg-card px-4 py-3"><Markdownish text={t.response.howto} /></div>
              )}
              {t.response.products.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="ring-focus flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary hover:shadow-card">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${p.accent}1a`, color: p.accent }}><Icon name={p.icon} size={17} /></div>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{p.name}</div><div className="truncate text-xs text-muted-foreground">{p.desc}</div></div>
                  <Icon name="arrow-right" size={15} className="shrink-0 text-muted-foreground" />
                </Link>
              ))}
              {t.response.kpis.map((k) => (
                <Link key={k.id} href={`/kpi/${k.id}`} className="ring-focus flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary hover:shadow-card">
                  <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: k.accent }} />
                  <div className="min-w-0 flex-1 truncate text-sm font-bold">{k.name}</div>
                  <span className="shrink-0 text-sm font-extrabold" style={{ color: k.accent }}>{k.value}</span>
                </Link>
              ))}
            </div>
          </div>
        ),
      )}
      {isPending && (
        <div className="flex gap-3">
          <div className="grad-brand grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white"><Icon name="sparkles" size={15} /></div>
          <Skeleton className="h-12 flex-1" />
        </div>
      )}
    </div>
  );
}

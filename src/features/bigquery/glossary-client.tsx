"use client";
import { useState, useMemo } from "react";
import { useGlossaryDetail } from "@/features/bigquery/use-bigquery";
import { Icon } from "@/components/shared/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GlossaryClient() {
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data, isLoading } = useGlossaryDetail({ limit: 500 });
  const terms = data?.data ?? [];

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(terms.map((t) => t.category).filter(Boolean) as string[])).sort()],
    [terms],
  );

  const filtered = useMemo(() => {
    let out = terms;
    if (activeCategory !== "all") out = out.filter((t) => t.category === activeCategory);
    if (q) {
      const lq = q.toLowerCase();
      out = out.filter(
        (t) =>
          (t.term ?? "").toLowerCase().includes(lq) ||
          (t.definition ?? "").toLowerCase().includes(lq) ||
          (t.category ?? "").toLowerCase().includes(lq),
      );
    }
    return out.sort((a, b) => (a.term ?? "").localeCompare(b.term ?? ""));
  }, [terms, q, activeCategory]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon name="book-open" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">Business Glossary</h1>
          <p className="mt-1 text-sm text-slate-500">
            Canonical definitions for business terms, KPIs and metrics used across NAI.
          </p>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold capitalize transition",
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No terms found" sub="Try a different search or category." />
      ) : (
        <div className="space-y-3">
          {filtered.map((term) => (
            <Card key={term.term_id ?? term.term} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-foreground">{term.term}</span>
                    {term.category && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {term.category}
                      </span>
                    )}
                    {term.status && (
                      <span className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        term.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700",
                      )}>
                        {term.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{term.definition}</p>
                  {term.related_terms && term.related_terms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-xs text-muted-foreground">Related:</span>
                      {term.related_terms.map((r) => (
                        <span key={r.term_id ?? r.term} className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                          {r.term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {term.steward?.steward_name && (
                  <div className="shrink-0 text-right">
                    <div className="text-[11px] text-muted-foreground">Steward</div>
                    <div className="text-xs font-semibold">{term.steward.steward_name}</div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

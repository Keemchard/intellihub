"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMarketplace, useKpiDetail } from "@/features/bigquery/use-bigquery";
import { fromMarketplace, fromKpiDetail } from "@/lib/bigquery-mappers";
import { FilterGroup } from "./filter-group";
import { ProductRow } from "@/components/shared/product-card";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

const TYPE_TABS = [
  { id: "all", label: "All" }, { id: "dashboard", label: "Dashboards" },
  { id: "dataproduct", label: "Data Products" }, { id: "kpi", label: "KPIs" }, { id: "report", label: "Reports" },
];

export function MarketplaceClient() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const [type, setType] = useState("all");
  const [domains, setDomains] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
    set((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const showKpis = type === "kpi";

  const { data: marketData, isLoading: productsLoading } = useMarketplace({ limit: 1000 });
  const { data: kpiData, isLoading: kpisLoading } = useKpiDetail({ limit: 1000 });

  const allProducts = useMemo(
    () => (marketData?.data ?? []).map((r) => ({ ...fromMarketplace(r), accessState: "none" as const })),
    [marketData],
  );

  const facets = useMemo(() => ({
    domains: [...new Set(allProducts.map((p) => p.domain).filter(Boolean))].sort(),
    segments: ["Consumer", "B2B", "VIP"],
    certification: ["Certified", "Validated", "Ongoing Review"],
    tags: [...new Set(allProducts.flatMap((p) => p.tags))].sort(),
  }), [allProducts]);

  const filteredProducts = useMemo(() => {
    let out = allProducts;
    if (type !== "all") out = out.filter((p) => p.type === type);
    if (domains.length) out = out.filter((p) => domains.includes(p.domain));
    if (segments.length) out = out.filter((p) => segments.includes(p.segment));
    if (certs.length) out = out.filter((p) =>
      certs.some((c) =>
        c === "Certified" ? p.certified : c === "Validated" ? p.trust === "Trusted" : p.trust === "In Review",
      ),
    );
    if (q) {
      const lq = q.toLowerCase();
      out = out.filter((p) =>
        `${p.name} ${p.desc} ${p.domain} ${p.tags.join(" ")}`.toLowerCase().includes(lq),
      );
    }
    return out;
  }, [allProducts, type, domains, segments, certs, q]);

  const filteredKpis = useMemo(() => {
    const all = (kpiData?.data ?? []).map(fromKpiDetail);
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter((k) =>
      `${k.name} ${k.desc} ${k.domain} ${k.category}`.toLowerCase().includes(lq),
    );
  }, [kpiData, q]);

  const activeFilters = domains.length + segments.length + certs.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-950">
          <Icon name="grid" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">Analytics Marketplace</h1>
          <p className="mt-1 text-sm text-slate-500">
            Centralised discovery for every analytics product, dashboard and KPI across NAI.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            placeholder="Search products, dashboards, KPIs..."
            defaultValue={q}
            onChange={(e) => {
              const nextParams = new URLSearchParams(window.location.search);
              if (e.target.value) nextParams.set("q", e.target.value);
              else nextParams.delete("q");
              window.history.replaceState(null, "", `?${nextParams.toString()}`);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition shadow-sm",
            showFilters
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          <Icon name="sliders" size={16} /> Filters
          {activeFilters > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Filters</span>
            {activeFilters > 0 && (
              <button
                onClick={() => { setDomains([]); setSegments([]); setCerts([]); }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          {showKpis ? (
            <p className="py-2 text-xs text-muted-foreground">Filters apply to products. KPIs are filtered by search.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              <FilterGroup title="Domain" options={facets.domains} value={domains} onToggle={toggle(setDomains)} />
              <FilterGroup title="Segment" options={facets.segments} value={segments} onToggle={toggle(setSegments)} />
              <FilterGroup title="Certification" options={facets.certification} value={certs} onToggle={toggle(setCerts)} />
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-slate-200 no-scrollbar">
        {TYPE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={cn(
              "relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ring-focus",
              type === t.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {t.label}
            {type === t.id && <span className="grad-brand absolute inset-x-3 -bottom-px h-[2.5px] rounded-full" />}
          </button>
        ))}
      </div>

      <div className="w-full">
        {q && (
          <p className="mb-4 text-sm text-slate-500">
            Showing results for &ldquo;<span className="font-semibold text-slate-900">{q}</span>&rdquo;
          </p>
        )}

        {showKpis ? (
          kpisLoading ? <GridSkeleton /> :
          filteredKpis.length ? (
            <div data-stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredKpis.map((k) => <KpiCard key={k.id} k={k} />)}
            </div>
          ) : (
            <EmptyState title="No KPIs found" sub="Try adjusting your search." />
          )
        ) : productsLoading ? <ListSkeleton /> :
          filteredProducts.length ? (
            <div data-stagger className="space-y-3">
              {filteredProducts.map((p) => <ProductRow key={p.id} p={p} />)}
            </div>
          ) : (
            <EmptyState title="No results found" sub="Try adjusting your search or filters." />
          )}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[88px]" />)}</div>;
}
function GridSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[180px]" />)}</div>;
}

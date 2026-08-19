"use client";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useMarketplace,
  useMarketplaceInfinite,
  useKpiDetailInfinite,
  useSearchIndex,
} from "@/features/bigquery/use-bigquery";
import { enrichMarketplace, enrichKpiDetail } from "@/lib/bigquery-mappers";
import { FilterGroup } from "./filter-group";
import { ProductRow } from "@/components/shared/product-card";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { DSSearchIndexRow } from "@/features/bigquery/use-bigquery";
import SeeMoreButton from "./components/SeeMorebutton";
import entityHref from "./utils/entityHref";
import SearchResultRow from "./components/SearchResultRow";

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "dashboard", label: "Dashboards" },
  { id: "dataproduct", label: "Data Products" },
  { id: "kpi", label: "KPIs" },
  { id: "report", label: "Reports" },
];

export const ENTITY_ICONS: Record<string, string> = {
  data_product: "database",
  kpi: "trending-up",
  glossary: "book-open",
};

export function MarketplaceClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const type = sp.get("product_type") ?? "all";
  const domains = useMemo(
    () => sp.get("domain_name")?.split(",").filter(Boolean) ?? [],
    [sp],
  );
  const segments = useMemo(
    () => sp.get("segments")?.split(",").filter(Boolean) ?? [],
    [sp],
  );
  const certs = useMemo(
    () => sp.get("certification_status")?.split(",").filter(Boolean) ?? [],
    [sp],
  );
  const [showFilters, setShowFilters] = useState(false);

  function updateParams(updates: Record<string, string | string[] | null>) {
    const nextParams = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        nextParams.delete(key);
      } else if (Array.isArray(value)) {
        nextParams.set(key, value.join(","));
      } else {
        nextParams.set(key, value);
      }
    }
    router.replace(`?${nextParams.toString()}`);
  }

  const toggle = (key: string, current: string[]) => (v: string) => {
    const next = current.includes(v)
      ? current.filter((x) => x !== v)
      : [...current, v];
    updateParams({ [key]: next });
  };

  const isSearching = q.length > 0;
  const showKpis = type === "kpi";

  // ── Search mode: full-text via search index (all data, no pagination needed)
  const { data: searchData, isLoading: searchLoading } = useSearchIndex(
    { q, limit: 100 },
    { enabled: isSearching },
  );
  const allSearchResults = searchData?.data ?? [];
  const searchResults = useMemo(() => {
    if (showKpis)
      return allSearchResults.filter((r) => r.entity_type === "kpi");
    if (type !== "all")
      return allSearchResults.filter((r) => r.entity_type === "data_product");
    return allSearchResults;
  }, [allSearchResults, type, showKpis]);

  // ── Browse mode: paginated infinite queries (disabled while searching)
  const { data: facetData } = useMarketplace({ limit: 500 });
  const facets = useMemo(() => {
    const rows = facetData?.data ?? [];
    return {
      domains: [
        ...new Set(
          rows.map((r) => r.domain_name).filter((d): d is string => !!d),
        ),
      ].sort(),
      segments: ["Consumer", "B2B", "VIP"],
      certification: ["Certified", "Validated", "Ongoing Review"],
      tags: [...new Set(rows.flatMap((r) => r.tags ?? []))].sort(),
    };
  }, [facetData]);

  const prodKey = useMemo(() => {
    const params: Record<string, string> = {};
    sp.forEach((value, key) => {
      if (key === "q" || key === "segments") return;
      if (key === "product_type" && (value === "all" || value === "kpi"))
        return;
      params[key] = value;
    });
    return params;
  }, [sp]);

  const {
    data: prodPages,
    fetchNextPage: fetchMoreProducts,
    hasNextPage: hasMoreProducts,
    isFetchingNextPage: fetchingMoreProducts,
    isLoading: productsLoading,
  } = useMarketplaceInfinite(prodKey, { enabled: !isSearching });

  const allProductRows = useMemo(
    () => prodPages?.pages.flatMap((p) => p.data) ?? [],
    [prodPages],
  );
  const filteredProducts = useMemo(() => {
    let out = allProductRows.map((r) => enrichMarketplace(r, "none"));
    if (domains.length)
      out = out.filter((p) => domains.includes(p.domain_name ?? ""));
    if (segments.length)
      out = out.filter((p) => segments.some((s) => (p.segments ?? "").includes(s)));
    if (certs.length)
      out = out.filter((p) =>
        certs.some((c) =>
          c === "Certified"
            ? p.certification_status === "Certified"
            : c === "Validated"
              ? p.certification_status === "Validated"
              : p.certification_status !== "Certified" &&
                p.certification_status !== "Validated",
        ),
      );
    return out;
  }, [allProductRows, domains, segments, certs]);

  const kpiKey = {};
  const {
    data: kpiPages,
    fetchNextPage: fetchMoreKpis,
    hasNextPage: hasMoreKpis,
    isFetchingNextPage: fetchingMoreKpis,
    isLoading: kpisLoading,
  } = useKpiDetailInfinite(kpiKey, { enabled: !isSearching });

  const allKpis = useMemo(
    () => (kpiPages?.pages.flatMap((p) => p.data) ?? []).map(enrichKpiDetail),
    [kpiPages],
  );

  const activeFilters = domains.length + segments.length + certs.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-950">
          <Icon name="grid" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">
            Analytics Marketplace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Centralised discovery for every analytics product, dashboard and KPI
            across NAI.
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
              window.history.replaceState(
                null,
                "",
                `?${nextParams.toString()}`,
              );
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
          />
        </div>
        {!isSearching && !showKpis && (
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
        )}
      </div>

      {showFilters && !isSearching && !showKpis && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Filters
            </span>
            {activeFilters > 0 && (
              <button
                onClick={() =>
                  updateParams({
                    domain_name: null,
                    segments: null,
                    certification_status: null,
                  })
                }
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <FilterGroup
              title="Domain"
              options={facets.domains}
              value={domains}
              onToggle={toggle("domain_name", domains)}
            />
            <FilterGroup
              title="Segment"
              options={facets.segments}
              value={segments}
              onToggle={toggle("segments", segments)}
            />
            <FilterGroup
              title="Certification"
              options={facets.certification}
              value={certs}
              onToggle={toggle("certification_status", certs)}
            />
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-slate-200 no-scrollbar">
        {TYPE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              updateParams({
                product_type: t.id === "all" ? null : t.id,
              });
              if (t.id === "kpi") setShowFilters(false);
            }}
            className={cn(
              "relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ring-focus",
              type === t.id
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            {t.label}
            {type === t.id && (
              <span className="grad-brand absolute inset-x-3 -bottom-px h-[2.5px] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        {/* ── Search mode ──────────────────────────────────────────────── */}
        {isSearching ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Showing results for &ldquo;
              <span className="font-semibold text-slate-900">{q}</span>&rdquo;
              {!searchLoading && (
                <span className="ml-1 text-slate-400">
                  · {searchResults.length} found
                </span>
              )}
            </p>
            {searchLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px]" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((r) => (
                  <SearchResultRow key={`${r.entity_type}-${r.id}`} r={r} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No results found"
                sub="Try a different search term."
              />
            )}
          </>
        ) : /* ── Browse mode ─────────────────────────────────────────────── */
        type === "all" ? (
          <>
            {/* Products section */}
            {productsLoading ? (
              <ListSkeleton />
            ) : filteredProducts.length > 0 ? (
              <section className="mb-8">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Products &amp; Dashboards
                  </h2>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-400">
                    {filteredProducts.length}
                  </span>
                </div>
                <div data-stagger className="space-y-3">
                  {filteredProducts.map((p) => (
                    <ProductRow key={p.data_product_id} p={p} />
                  ))}
                </div>
                {hasMoreProducts && (
                  <SeeMoreButton
                    onClick={() => fetchMoreProducts()}
                    isFetching={fetchingMoreProducts}
                  />
                )}
              </section>
            ) : null}

            {/* KPIs section — hidden when product filters are active */}
            {!activeFilters &&
              (kpisLoading ? (
                <GridSkeleton />
              ) : allKpis.length > 0 ? (
                <section>
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      KPIs
                    </h2>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      {allKpis.length}
                    </span>
                  </div>
                  <div
                    data-stagger
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {allKpis.map((k) => (
                      <KpiCard key={k.kpi_id} k={k} />
                    ))}
                  </div>
                  {hasMoreKpis && (
                    <SeeMoreButton
                      onClick={() => fetchMoreKpis()}
                      isFetching={fetchingMoreKpis}
                    />
                  )}
                </section>
              ) : null)}

            {!productsLoading &&
              filteredProducts.length === 0 &&
              (!activeFilters
                ? !kpisLoading && allKpis.length === 0
                : true) && (
                <EmptyState
                  title="No results found"
                  sub="Try adjusting your filters."
                />
              )}
          </>
        ) : showKpis ? (
          kpisLoading ? (
            <GridSkeleton />
          ) : allKpis.length ? (
            <>
              <div
                data-stagger
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {allKpis.map((k) => (
                  <KpiCard key={k.kpi_id} k={k} />
                ))}
              </div>
              {hasMoreKpis && (
                <SeeMoreButton
                  onClick={() => fetchMoreKpis()}
                  isFetching={fetchingMoreKpis}
                />
              )}
            </>
          ) : (
            <EmptyState title="No KPIs found" sub="Try a different search." />
          )
        ) : productsLoading ? (
          <ListSkeleton />
        ) : filteredProducts.length > 0 ? (
          <>
            <div data-stagger className="space-y-3">
              {filteredProducts?.map((p) => (
                <ProductRow key={p.data_product_id} p={p} />
              ))}
            </div>
            {hasMoreProducts && (
              <SeeMoreButton
                onClick={() => fetchMoreProducts()}
                isFetching={fetchingMoreProducts}
              />
            )}
          </>
        ) : (
          <EmptyState
            title="No results found"
            sub="Try adjusting your filters."
          />
        )}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[88px]" />
      ))}
    </div>
  );
}
function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[180px]" />
      ))}
    </div>
  );
}

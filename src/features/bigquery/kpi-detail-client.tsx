"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useKpiDetail } from "@/features/bigquery/use-bigquery";
import { fromKpiDetail, pickColor } from "@/lib/bigquery-mappers";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/shared/icon";
import { Avatar } from "@/components/shared/brand";
import { TrustBadge, DqBadge, TrendChip } from "@/components/shared/badges";
import { DataHubButton } from "@/components/shared/datahub-button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export function KpiDetailClient({ id }: { id: string }) {
  const { data, isLoading } = useKpiDetail({ kpi_id: id, limit: 1 });

  const row = data?.data[0];
  const kpi = useMemo(() => (row ? fromKpiDetail(row) : null), [row]);

  const relatedProducts = useMemo(
    () =>
      (row?.used_in_products ?? [])
        .filter((p) => p.slug ?? p.data_product_id)
        .map((p) => ({
          id: p.slug ?? p.data_product_id ?? "",
          name: p.product_name ?? "",
          accent: pickColor(p.product_name),
        })),
    [row],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <EmptyState
          title="KPI not found"
          sub="This KPI may have been removed or the link is incorrect."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/marketplace"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <Icon name="chevron-left" size={16} /> Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {kpi.category}
            </span>
            <TrustBadge trust={kpi.trust} />
            <DqBadge dq={kpi.dq} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {kpi.short}
          </h1>
          <div className="mt-4 flex items-end gap-4">
            <span
              className="text-5xl font-extrabold tracking-tight"
              style={{ color: kpi.accent }}
            >
              {kpi.value || "—"}
            </span>
            {kpi.trend && (
              <div className="pb-1">
                <TrendChip trend={kpi.trend} dir={kpi.trendDir} />
                <div className="text-xs text-muted-foreground">
                  vs. previous period
                </div>
              </div>
            )}
          </div>

          <Card className="mb-5 mt-6 p-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Definition
            </h2>
            <p className="text-[15px] leading-relaxed">{kpi.definition}</p>
            {kpi.formula && (
              <div className="mt-4 rounded-xl bg-muted/60 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Formula
                </div>
                <code className="mt-1 block font-mono text-sm text-foreground">
                  {kpi.formula}
                </code>
              </div>
            )}
            {kpi.context && (
              <>
                <h3 className="mb-1 mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Business context
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {kpi.context}
                </p>
              </>
            )}
          </Card>

          {kpi.thresholds.length > 0 && (
            <Card className="mb-5 p-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Thresholds
              </h2>
              <div className="overflow-hidden rounded-xl border border-border">
                {kpi.thresholds.map(([band, range, color], i) => (
                  <div
                    key={band}
                    className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: color }}
                      />
                      {band}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {range}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {kpi.upstream.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Data Sources &amp; Provenance
              </h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Upstream sources this KPI is derived from. Full technical
                lineage available in DataHub (future phase).
              </p>
              <div className="flex flex-wrap gap-2">
                {kpi.upstream.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-medium"
                  >
                    <Icon
                      name="database"
                      size={15}
                      className="text-muted-foreground"
                    />
                    {u}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold">Ownership</h3>
            <div className="flex items-center gap-3">
              <Avatar
                name={kpi.ownerUser.name}
                color={kpi.ownerUser.color}
                size={34}
              />
              <div>
                <div className="text-sm font-semibold">
                  {kpi.ownerUser.name}
                </div>
                <div className="text-xs text-muted-foreground">KPI Owner</div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Source
                </dt>
                <dd className="mt-0.5 text-sm font-semibold">
                  {kpi.source || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Frequency
                </dt>
                <dd className="mt-0.5 text-sm font-semibold">
                  {kpi.frequency}
                </dd>
              </div>
              {kpi.aggregation && (
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    Aggregation
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {kpi.aggregation}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-4 border-t border-border pt-4">
              <DataHubButton />
            </div>
          </Card>

          {relatedProducts.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-bold">Used in</h3>
              <div className="space-y-2">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="ring-focus flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted"
                  >
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                      style={{ background: `${p.accent}1a`, color: p.accent }}
                    >
                      <Icon name="database" size={17} />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {p.name}
                    </span>
                    <Icon
                      name="arrow-right"
                      size={15}
                      className="text-muted-foreground"
                    />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

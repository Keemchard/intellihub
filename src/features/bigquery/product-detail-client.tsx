"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useDataProductDetail } from "@/features/bigquery/use-bigquery";
import { useMyRequests } from "@/features/access/use-access";
import { fromDetail, pickColor, TYPE_ICONS } from "@/lib/bigquery-mappers";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/shared/icon";
import { Avatar } from "@/components/shared/brand";
import { TypePill, TrustBadge, Stars } from "@/components/shared/badges";
import { AccessCTA, AccessHint } from "@/components/shared/access-cta";
import { DataHubButton } from "@/components/shared/datahub-button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { AccessRequest, AccessState } from "@/types";

function deriveAccessState(
  requests: AccessRequest[] | undefined,
  productId: string,
): AccessState {
  if (!requests) return "none";
  const req = requests.find((r) => r.productId === productId);
  if (!req) return "none";
  if (req.currentStatus === "Approved") return "granted";
  if (req.currentStatus === "Rejected") return "rejected";
  return "pending";
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function ProductDetailClient({ id }: { id: string }) {
  const { data, isLoading } = useDataProductDetail({ data_product_id: id, limit: 1 });
  const { data: requests } = useMyRequests();

  const row = data?.data[0];

  const product = useMemo(() => {
    if (!row) return null;
    const base = fromDetail(row);
    return { ...base, accessState: deriveAccessState(requests, base.id) };
  }, [row, requests]);

  // Related KPIs are embedded in the detail response
  const relatedKpis = useMemo(
    () =>
      (row?.kpis ?? [])
        .filter((k) => k.kpi_id)
        .map((k) => ({
          id: k.kpi_id!,
          name: k.kpi_name ?? "",
          accent: pickColor(k.kpi_category),
        })),
    [row],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <EmptyState title="Product not found" sub="This product may have been removed or the link is incorrect." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link href="/marketplace" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <Icon name="chevron-left" size={16} /> Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl" style={{ background: `${product.accent}1a`, color: product.accent }}>
              <Icon name={TYPE_ICONS[product.type]} size={30} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <TypePill type={product.type} />
                <TrustBadge trust={product.trust} certified={product.certified} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">{product.name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{product.family}</span>
                <Stars rating={product.rating} reviews={product.reviews} />
              </div>
            </div>
          </div>

          <Card className="mb-5 p-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Purpose</h2>
            <p className="text-[15px] leading-relaxed text-foreground">{product.purpose}</p>
            {product.desc !== product.purpose && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.desc}</p>
            )}
          </Card>

          {product.features.length > 0 && (
            <Card className="mb-5 p-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">What you can do</h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Icon name="check-circle" size={17} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {product.tags.length > 0 && (
            <Card className="mb-5 p-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{t}</span>
                ))}
              </div>
            </Card>
          )}

          {relatedKpis.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Related KPIs</h2>
              <div className="flex flex-wrap gap-2">
                {relatedKpis.map((k) => (
                  <Link key={k.id} href={`/kpi/${k.id}`} className="ring-focus inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary hover:shadow-card">
                    <span className="h-2 w-2 rounded-full" style={{ background: k.accent }} />
                    {k.name}
                    <Icon name="arrow-right" size={14} className="text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-1 text-sm font-bold">Access</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              {product.accessState === "granted"
                ? "You have access. Opens in a new tab."
                : product.accessState === "pending"
                  ? "Your request is being reviewed."
                  : "Request access to view this product."}
            </p>
            <AccessCTA product={product} size="lg" />
            <div className="mt-2"><AccessHint product={product} /></div>
            <div className="mt-4 border-t border-border pt-4"><DataHubButton /></div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold">Details</h3>
            <dl className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={product.ownerUser.name} color={product.ownerUser.color} size={34} />
                <div>
                  <div className="text-sm font-semibold">{product.ownerUser.name}</div>
                  <div className="text-xs text-muted-foreground">Product Owner</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={product.steward.name} color={product.steward.color} size={34} />
                <div>
                  <div className="text-sm font-semibold">{product.steward.name}</div>
                  <div className="text-xs text-muted-foreground">Data Steward</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <Meta label="Domain" value={product.domain} />
                <Meta label="Segment" value={product.segment} />
                <Meta label="Territory" value={product.territory} />
                <Meta label="Refresh" value={product.refresh} />
                {product.updated && <Meta label="Updated" value={product.updated} />}
                <Meta label="Owner team" value={product.owner} />
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

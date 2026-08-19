"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useDataProductDetail } from "@/features/bigquery/use-bigquery";
import { useMyRequests } from "@/features/access/use-access";
import {
  enrichDetail,
  pickColor,
  TYPE_ICONS,
  formatDate,
  type DetailProduct,
} from "@/lib/bigquery-mappers";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/shared/icon";
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

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-foreground">
        {value || "—"}
      </dd>
    </div>
  );
}

interface KpiItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  certificationStatus: string;
  status: string;
  accent: string;
  code: string;
  description: string;
}

function KpiRow({ kpi }: { kpi: KpiItem }) {
  return (
    <Link
      href={`/kpi/${kpi.id}`}
      className="ring-focus flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary hover:shadow-card"
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
        style={{ background: `${kpi.accent}1a`, color: kpi.accent }}
      >
        <Icon name="badge-check" size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{kpi.code}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
          {kpi.description && <span>{kpi.description}</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          {kpi.category && <span>{kpi.category}</span>}
          {kpi.unit && <span>{kpi.unit}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {kpi.certificationStatus && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {kpi.certificationStatus}
          </span>
        )}
        {kpi.status && (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
              kpi.status === "Active"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {kpi.status}
          </span>
        )}
        <Icon name="arrow-right" size={14} className="text-muted-foreground" />
      </div>
    </Link>
  );
}

export function ProductDetailClient({ id }: { id: string }) {
  const { data, isLoading } = useDataProductDetail({
    data_product_id: id,
    limit: 1,
  });
  const { data: requests } = useMyRequests();

  const row = data?.data[0];

  const product = useMemo<DetailProduct | null>(() => {
    if (!row) return null;
    const accessState = deriveAccessState(requests, row.data_product_id ?? "");
    return enrichDetail(row, accessState);
  }, [row, requests]);

  const relatedKpis = useMemo<KpiItem[]>(
    () =>
      (product?.kpis ?? [])
        .filter((k) => k.kpi_id)
        .map((k) => ({
          id: k.kpi_id!,
          name: k.kpi_name ?? "",
          category: k.kpi_category ?? "",
          unit: k.kpi_unit ?? "",
          certificationStatus: k.certification_status ?? "",
          status: k.kpi_status ?? "",
          accent: pickColor(k.kpi_id),
          code: k.kpi_code ?? "",
          description: k.kpi_description ?? "",
        })),
    [product],
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
        <EmptyState
          title="Product not found"
          sub="This product may have been removed or the link is incorrect."
        />
      </div>
    );
  }

  const ownerName = product.owner?.owner_name ?? "Unknown";
  const ownerColor = pickColor(product.owner?.owner_id ?? ownerName);
  const ownerInitials =
    product.owner?.owner_initials ??
    ownerName
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

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
          <div className="mb-5 flex items-start gap-4">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
              style={{
                background: `${product.accent}1a`,
                color: product.accent,
              }}
            >
              <Icon name={TYPE_ICONS[product.productType]} size={30} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {product.productTypes.map((t) => (
                  <TypePill key={t} type={t} />
                ))}
                <TrustBadge trust={product.certification_status ?? ""} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {product.domain?.domain_name ?? product.product_type}
                </span>
                <Stars rating={0} reviews={0} />
              </div>
            </div>
          </div>

          {/* Description card */}
          <Card className="mb-5 p-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="text-[15px] leading-relaxed text-foreground">
              {product.description}
            </p>
          </Card>

          {/* Tags */}
          {(product.tags ?? []).length > 0 && (
            <Card className="mb-5 p-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.tags!.map((t) => (
                  <span
                    key={t.tag_id ?? t.tag_name}
                    className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {t.tag_name}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Overview + KPIs tabs */}
          <Card className="p-6">
            <Tabs defaultValue="overview">
              <TabsList className="mb-5 w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kpis">
                  KPIs
                  {relatedKpis.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      {relatedKpis.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {product.business_purpose ? (
                  <p className="text-[15px] leading-relaxed text-foreground">
                    {product.business_purpose}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No business purpose defined.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="kpis">
                {relatedKpis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No KPIs linked to this product.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {relatedKpis.map((k) => (
                      <KpiRow key={k.id} kpi={k} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
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
            <div className="mt-2">
              <AccessHint product={product} />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <DataHubButton />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold">Details</h3>
            <dl className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                  style={{ background: ownerColor }}
                >
                  {ownerInitials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{ownerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.owner?.owner_team ?? "Data Owner"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <MetaItem
                  label="Domain"
                  value={product.domain?.domain_name ?? ""}
                />
                <MetaItem label="Segment" value={product.segments ?? ""} />
                <MetaItem label="Territory" value="National" />
                <MetaItem
                  label="Refresh"
                  value={product.refresh_frequency ?? ""}
                />
                {product.last_updated_at?.value && (
                  <MetaItem
                    label="Updated"
                    value={formatDate(product.last_updated_at.value)}
                  />
                )}
                <MetaItem
                  label="Owner team"
                  value={
                    product.owner?.owner_team ?? product.owner?.owner_name ?? ""
                  }
                />
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

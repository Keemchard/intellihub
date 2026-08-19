import "server-only";
import { bq } from "@/lib/bigquery-client";
import {
  enrichMarketplace,
  enrichDetail,
  enrichKpiDetail,
  type MarketplaceProduct,
  type DetailProduct,
  type DetailKpi,
} from "@/lib/bigquery-mappers";
import { resolveAccessState, listRequests } from "@/lib/data-access/access-store";
import type { ProductType } from "@/types";

export interface ProductFilters {
  q?: string;
  type?: string;
  domain?: string[];
  segment?: string[];
  certification?: string[];
  tags?: string[];
  sort?: string;
}

export async function listProducts(
  userId: string,
  f: ProductFilters = {},
): Promise<MarketplaceProduct[]> {
  const [marketResp, searchResp] = await Promise.all([
    bq.marketplace({ limit: 1000 }),
    f.q ? bq.searchIndex({ q: f.q, limit: 1000 }) : Promise.resolve(null),
  ]);

  let rows = marketResp.data;
  if (searchResp) {
    const matchIds = new Set(
      searchResp.data.map((r) => r.id).filter((id): id is string => !!id),
    );
    rows = rows.filter((r) => matchIds.has(r.slug ?? r.data_product_id ?? ""));
  }

  let out = rows.map((row) =>
    enrichMarketplace(row, resolveAccessState(userId, row.data_product_id ?? "")),
  );

  if (f.type && f.type !== "all")
    out = out.filter((p) => p.productTypes.includes(f.type as ProductType));
  if (f.domain?.length)
    out = out.filter((p) => f.domain!.includes(p.domain_name ?? ""));
  if (f.segment?.length)
    out = out.filter((p) => f.segment!.some((s) => (p.segments ?? "").includes(s)));
  if (f.tags?.length)
    out = out.filter((p) => f.tags!.some((t) => (p.tags ?? []).includes(t)));
  if (f.certification?.length) {
    out = out.filter((p) =>
      f.certification!.some((c) =>
        c === "Certified"
          ? p.certification_status === "Certified"
          : c === "Validated"
            ? p.certification_status === "Validated"
            : p.certification_status !== "Certified" &&
              p.certification_status !== "Validated",
      ),
    );
  }

  return out;
}

export async function getProduct(
  userId: string,
  id: string,
): Promise<DetailProduct | null> {
  const resp = await bq.productDetail({ data_product_id: id, limit: 1 });
  const row = resp.data[0];
  if (!row) return null;
  return enrichDetail(row, resolveAccessState(userId, row.data_product_id ?? ""));
}

export async function getProductRaw(id: string): Promise<DetailProduct | null> {
  const resp = await bq.productDetail({ data_product_id: id, limit: 1 });
  const row = resp.data[0];
  if (!row) return null;
  return enrichDetail(row, "none");
}

export async function listKpis(f: ProductFilters = {}): Promise<DetailKpi[]> {
  const resp = await bq.kpiDetail({ limit: 1000 });
  let out = resp.data.map(enrichKpiDetail);
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((k) =>
      `${k.kpi_name} ${k.kpi_description} ${k.business_domain} ${k.kpi_category}`
        .toLowerCase()
        .includes(q),
    );
  }
  if (f.domain?.length)
    out = out.filter((k) => f.domain!.includes(k.business_domain ?? k.domain?.domain_name ?? ""));
  return out;
}

export async function getKpi(id: string): Promise<DetailKpi | null> {
  const resp = await bq.kpiDetail({ kpi_id: id, limit: 1 });
  const row = resp.data[0];
  return row ? enrichKpiDetail(row) : null;
}

export async function getMyAccessSummary(userId: string) {
  const resp = await bq.marketplace({ limit: 1000 });
  const projected = resp.data.map((row) =>
    enrichMarketplace(row, resolveAccessState(userId, row.data_product_id ?? "")),
  );
  const granted = projected.filter((p) => p.accessState === "granted");
  const pending = projected.filter((p) => p.accessState === "pending");
  return {
    grantedCount: granted.length,
    pendingCount: pending.length,
    granted,
    pending,
    requests: listRequests(userId),
  };
}

export async function getFacets() {
  const resp = await bq.marketplace({ limit: 1000 });
  const rows = resp.data;
  return {
    domains: [
      ...new Set(rows.map((r) => r.domain_name).filter((d): d is string => !!d)),
    ].sort(),
    segments: ["Consumer", "B2B", "VIP"],
    certification: ["Certified", "Validated", "Ongoing Review"],
    tags: [...new Set(rows.flatMap((r) => r.tags ?? []))].sort(),
  };
}

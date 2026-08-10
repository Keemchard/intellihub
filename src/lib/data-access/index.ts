import "server-only";
import { bq } from "@/lib/bigquery-client";
import { fromMarketplace, fromDetail, fromKpiDetail } from "@/lib/bigquery-mappers";
import { resolveAccessState, listRequests } from "@/lib/data-access/access-store";
import type { Product, Kpi } from "@/types";

export interface ProductFilters {
  q?: string;
  type?: string;
  domain?: string[];
  segment?: string[];
  certification?: string[];
  tags?: string[];
  sort?: string;
}

function forUser(p: Omit<Product, "accessState">, userId: string): Product {
  return { ...p, accessState: resolveAccessState(userId, p.id) };
}

export async function listProducts(userId: string, f: ProductFilters = {}): Promise<Product[]> {
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

  let out = rows.map(fromMarketplace);
  if (f.type && f.type !== "all") out = out.filter((p) => p.type === f.type);
  if (f.domain?.length) out = out.filter((p) => f.domain!.includes(p.domain));
  if (f.segment?.length) out = out.filter((p) => f.segment!.includes(p.segment));
  if (f.tags?.length) out = out.filter((p) => f.tags!.some((t) => p.tags.includes(t)));
  if (f.certification?.length) {
    out = out.filter((p) =>
      f.certification!.some((c) =>
        c === "Certified" ? p.certified : c === "Validated" ? p.trust === "Trusted" : p.trust === "In Review",
      ),
    );
  }
  if (f.sort === "Rating") out = [...out].sort((a, b) => b.rating - a.rating);
  else if (f.sort === "Recent")
    out = [...out].sort((a, b) => +new Date(b.updated) - +new Date(a.updated));

  return out.map((p) => forUser(p, userId));
}

export async function getProduct(userId: string, id: string): Promise<Product | null> {
  const resp = await bq.productDetail({ data_product_id: id, limit: 1 });
  const row = resp.data[0];
  if (!row) return null;
  return forUser(fromDetail(row), userId);
}

export async function getProductRaw(id: string): Promise<Product | null> {
  const resp = await bq.productDetail({ data_product_id: id, limit: 1 });
  const row = resp.data[0];
  if (!row) return null;
  return { ...fromDetail(row), accessState: "none" };
}

export async function listKpis(f: ProductFilters = {}): Promise<Kpi[]> {
  const resp = await bq.kpiDetail({ limit: 1000 });
  let out = resp.data.map(fromKpiDetail);
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((k) =>
      `${k.name} ${k.desc} ${k.domain} ${k.category}`.toLowerCase().includes(q),
    );
  }
  if (f.domain?.length) out = out.filter((k) => f.domain!.includes(k.domain));
  return out;
}

export async function getKpi(id: string): Promise<Kpi | null> {
  const resp = await bq.kpiDetail({ kpi_id: id, limit: 1 });
  const row = resp.data[0];
  return row ? fromKpiDetail(row) : null;
}

export async function getMyAccessSummary(userId: string) {
  const resp = await bq.marketplace({ limit: 1000 });
  const projected = resp.data.map(fromMarketplace).map((p) => forUser(p, userId));
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
    domains: [...new Set(rows.map((r) => r.domain_name).filter((d): d is string => !!d))].sort(),
    segments: ["Consumer", "B2B", "VIP"],
    certification: ["Certified", "Validated", "Ongoing Review"],
    tags: [...new Set(rows.flatMap((r) => r.tags ?? []))].sort(),
  };
}

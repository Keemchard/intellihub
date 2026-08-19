import type {
  DSMarketplaceSvRow,
  DSDataProductDetailRow,
  DSKpiDetailRow,
} from "@/lib/bigquery-client";
import type { ProductType, AccessState } from "@/types";

const PALETTE = [
  "#7C3AED",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
];

export function pickColor(seed: string | null | undefined): string {
  if (!seed) return PALETTE[0];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}


export function normalizeType(raw: string | null | undefined): ProductType {
  const t = (raw ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  if (t.includes("dataproduct")) return "dataproduct";
  if (t.includes("report")) return "report";
  if (t.includes("kpi")) return "kpi";
  return "dashboard";
}

export function normalizeTypes(raw: string | null | undefined): ProductType[] {
  return (raw ?? "")
    .split("|")
    .map((s) => normalizeType(s.trim()))
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

export const TYPE_ICONS: Record<ProductType, string> = {
  dashboard: "layout-grid",
  dataproduct: "database",
  report: "bar-chart-3",
  kpi: "trending-up",
};


export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Enriched product types (raw API row + computed fields) ──────────────────

type ProductEnrichment = {
  accessState: AccessState;
  accent: string;
  productType: ProductType;   // primary type (for icon)
  productTypes: ProductType[]; // all parsed types (for filtering + display)
  icon: string;
};

export type MarketplaceProduct = DSMarketplaceSvRow & ProductEnrichment;
export type DetailProduct = DSDataProductDetailRow & ProductEnrichment;

export function enrichMarketplace(
  row: DSMarketplaceSvRow,
  accessState: AccessState = "none",
): MarketplaceProduct {
  const productTypes = normalizeTypes(row.product_type);
  const productType = productTypes[0] ?? "dashboard";
  return {
    ...row,
    accessState,
    accent: pickColor(row.domain_name),
    productType,
    productTypes,
    icon: TYPE_ICONS[productType],
  };
}

export function enrichDetail(
  row: DSDataProductDetailRow,
  accessState: AccessState = "none",
): DetailProduct {
  const productTypes = normalizeTypes(row.product_type);
  const productType = productTypes[0] ?? "dashboard";
  return {
    ...row,
    accessState,
    accent: pickColor(row.domain?.domain_name),
    productType,
    productTypes,
    icon: TYPE_ICONS[productType],
  };
}

// ── KPI enrichment ──────────────────────────────────────────────────────────

type KpiEnrichment = {
  accent: string;
  upstream: string[];
  thresholds: Array<[string, string, string]>;
};

export type DetailKpi = DSKpiDetailRow & KpiEnrichment;

export function enrichKpiDetail(row: DSKpiDetailRow): DetailKpi {
  const thresholds: Array<[string, string, string]> = [];
  if (row.threshold_good)
    thresholds.push(["Good", row.threshold_good, "#10B981"]);
  if (row.threshold_warning)
    thresholds.push(["Warning", row.threshold_warning, "#F59E0B"]);
  if (row.threshold_critical)
    thresholds.push(["Critical", row.threshold_critical, "#EF4444"]);
  const upstream = (row.lineage ?? [])
    .sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0))
    .map((l) => l.stage_label ?? "")
    .filter(Boolean);
  return {
    ...row,
    accent: pickColor(row.business_domain ?? row.domain?.domain_name),
    upstream,
    thresholds,
  };
}

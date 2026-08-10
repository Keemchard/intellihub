import type {
  DSMarketplaceSvRow,
  DSDataProductDetailRow,
  DSKpiDetailRow,
} from "@/lib/bigquery-client";
import type { Product, Kpi } from "@/types";

const PALETTE = ["#7C3AED", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];

export function pickColor(seed: string | null | undefined): string {
  if (!seed) return PALETTE[0];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function toInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function normalizeType(raw: string | null | undefined): Product["type"] {
  const t = (raw ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  if (t === "dataproduct" || t.includes("dataproduct")) return "dataproduct";
  if (t === "report" || t.includes("report")) return "report";
  if (t === "kpi") return "kpi";
  return "dashboard";
}

export const TYPE_ICONS: Record<Product["type"], string> = {
  dashboard: "layout-grid",
  dataproduct: "database",
  report: "bar-chart-3",
  kpi: "trending-up",
};

function normalizeTrust(cert: string | null | undefined): "Trusted" | "In Review" {
  return cert === "Certified" ? "Trusted" : "In Review";
}

function normalizeRefresh(freq: string | null | undefined): "Daily" | "Weekly" | "Monthly" {
  const f = (freq ?? "").toLowerCase();
  if (f.includes("week")) return "Weekly";
  if (f.includes("month")) return "Monthly";
  return "Daily";
}

function buildOwnerUser(
  id: string | null | undefined,
  name: string | null | undefined,
  role = "Data Owner",
  initials?: string | null,
): Product["ownerUser"] {
  const safeName = name ?? "Unknown";
  return {
    id: id ?? safeName.toLowerCase().replace(/\s+/g, "-"),
    name: safeName,
    role,
    initials: initials ?? toInitials(safeName),
    color: pickColor(id ?? safeName),
  };
}

export function fromMarketplace(row: DSMarketplaceSvRow): Omit<Product, "accessState"> {
  const type = normalizeType(row.product_type);
  const ownerUser = buildOwnerUser(row.owner_id, row.owner_name);
  return {
    id: row.data_product_id ?? row.slug ?? "",
    type,
    name: row.name ?? "",
    family: row.domain_name ?? row.product_type ?? "",
    domain: row.domain_name ?? "",
    territory: "National",
    segment: "Consumer",
    owner: row.owner_name ?? "",
    ownerUser,
    steward: ownerUser,
    rating: 0,
    reviews: 0,
    certified: row.certification_status === "Certified",
    trust: normalizeTrust(row.certification_status),
    launchType: "external_url",
    launchUrl: row.product_url ?? "",
    icon: TYPE_ICONS[type],
    accent: pickColor(row.domain_name),
    desc: row.description ?? "",
    purpose: row.description ?? "",
    kpis: [],
    tags: row.tags ?? [],
    updated: "",
    refresh: "Daily",
    features: [],
  };
}

export function fromDetail(row: DSDataProductDetailRow): Omit<Product, "accessState"> {
  const type = normalizeType(row.product_type);
  const ownerUser = buildOwnerUser(
    row.owner?.owner_id,
    row.owner?.owner_name,
    "Data Owner",
    row.owner?.owner_initials,
  );
  return {
    id: row.data_product_id ?? row.slug ?? "",
    type,
    name: row.name ?? "",
    family: row.domain?.domain_name ?? row.product_type ?? "",
    domain: row.domain?.domain_name ?? "",
    territory: "National",
    segment: "Consumer",
    owner: row.owner?.owner_team ?? row.owner?.owner_name ?? "",
    ownerUser,
    steward: ownerUser,
    rating: 0,
    reviews: 0,
    certified: row.certification_status === "Certified",
    trust: normalizeTrust(row.certification_status),
    launchType: "external_url",
    launchUrl: row.product_url ?? "",
    icon: TYPE_ICONS[type],
    accent: pickColor(row.domain?.domain_name),
    desc: row.description ?? "",
    purpose: row.description ?? "",
    kpis: (row.kpis ?? []).map((k) => k.kpi_id ?? "").filter((x) => x !== ""),
    tags: (row.tags ?? []).map((t) => t.tag_name ?? "").filter((x) => x !== ""),
    updated: "",
    refresh: "Daily",
    features: [],
  };
}

export function fromKpiDetail(row: DSKpiDetailRow): Kpi {
  const ownerUser = buildOwnerUser(
    row.owner?.owner_id,
    row.owner?.owner_name,
    row.owner?.owner_team ?? "Data Owner",
  );
  const thresholds: Array<[string, string, string]> = [];
  if (row.threshold_good) thresholds.push(["Good", row.threshold_good, "#10B981"]);
  if (row.threshold_warning) thresholds.push(["Warning", row.threshold_warning, "#F59E0B"]);
  if (row.threshold_critical) thresholds.push(["Critical", row.threshold_critical, "#EF4444"]);
  const sortedLineage = (row.lineage ?? []).sort((a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0));
  const upstream = sortedLineage.map((l) => l.stage_label ?? "").filter((x) => x !== "");
  return {
    id: row.kpi_id ?? row.kpi_code ?? "",
    name: row.kpi_name ?? "",
    short: row.kpi_code ?? (row.kpi_name ?? "").split(" ").slice(0, 2).join(" "),
    family: row.domain?.domain_name ?? row.business_domain ?? "",
    domain: row.business_domain ?? row.domain?.domain_name ?? "",
    owner: row.owner?.owner_team ?? row.owner?.owner_name ?? "",
    ownerUser,
    rating: 0,
    reviews: 0,
    trust: normalizeTrust(row.certification_status),
    dq: 0,
    value: "",
    trend: "",
    trendDir: "up",
    accent: pickColor(row.business_domain ?? row.domain?.domain_name),
    tags: [],
    category: row.kpi_category ?? "",
    upstream,
    desc: row.kpi_description ?? "",
    definition: row.kpi_description ?? "",
    formula: row.kpi_formula ?? "",
    context: "",
    source: upstream[0] ?? "",
    frequency: normalizeRefresh(row.refresh_frequency),
    aggregation: "",
    thresholds,
    relatedProducts: (row.used_in_products ?? []).map((p) => p.slug ?? "").filter((x) => x !== ""),
  };
}

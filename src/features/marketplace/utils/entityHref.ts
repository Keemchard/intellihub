import type { DSSearchIndexRow } from "@/features/bigquery/use-bigquery";

function entityHref(r: DSSearchIndexRow): string {
  if (!r.id) return "/marketplace";
  if (r.entity_type === "data_product") return `/product/${r.id}`;
  if (r.entity_type === "kpi") return `/kpi/${r.id}`;
  return "/glossary";
}

export default entityHref;

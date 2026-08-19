import "server-only";

const BASE = process.env.INTELLIHUB_API_URL;
const API_KEY = process.env.INTELLIHUB_API_KEY;

export interface BqMeta {
  totalCount: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BqPage<T> {
  data: T[];
  meta: BqMeta;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface DSMarketplaceSvRow {
  data_product_id: string | null;
  name: string | null;
  slug: string | null;
  description: string | null;
  product_type: string | null;
  segments: string | null;
  certification_status: string | null;
  status: string | null;
  product_url: string | null;
  view_count_30d: number | null;
  domain_id: string | null;
  domain_name: string | null;
  owner_id: string | null;
  owner_name: string | null;
  tags: string[] | null;
  kpi_count: number | null;
}

export interface DSDataProductDetailRow {
  data_product_id: string | null;
  name: string | null;
  slug: string | null;
  description: string | null;
  business_purpose: string | null;
  product_type: string | null;
  domain_id: string | null;
  segments: string | null;
  certification_status: string | null;
  owner_id: string | null;
  kpi_count: number | null;
  refresh_frequency: string | null;
  status: string | null;
  product_url: string | null;
  documentation_url: string | null;
  created_at: { value: string } | null;
  last_updated_at: { value: string } | null;
  domain: { domain_id: string | null; domain_name: string | null } | null;
  owner: {
    owner_id: string | null;
    owner_name: string | null;
    owner_email: string | null;
    owner_team: string | null;
    owner_initials: string | null;
    is_active: boolean | null;
  } | null;
  tags: Array<{
    tag_id: string | null;
    tag_name: string | null;
    slug: string | null;
    tag_group: string | null;
    is_active: boolean | null;
  }> | null;
  kpis: Array<{
    kpi_id: string | null;
    kpi_name: string | null;
    kpi_category: string | null;
    kpi_unit: string | null;
    certification_status: string | null;
    kpi_status: string | null;
    kpi_code: string | null;
    kpi_description: string | null;
  }> | null;
}

export interface DSKpiDetailRow {
  kpi_id: string | null;
  kpi_code: string | null;
  kpi_name: string | null;
  kpi_description: string | null;
  kpi_category: string | null;
  kpi_formula: string | null;
  kpi_unit: string | null;
  business_domain: string | null;
  sub_domain: string | null;
  threshold_good: string | null;
  threshold_warning: string | null;
  threshold_critical: string | null;
  refresh_frequency: string | null;
  time_granularity: string | null;
  entity_granularity: string | null;
  certification_status: string | null;
  kpi_status: string | null;
  data_classification: string | null;
  last_reviewed_date: { value: string } | null;
  business_impact: string | null;
  typical_questions: string | null;
  interpretation_rules: string | null;
  data_owner: string | null;
  business_rule_owner: string | null;
  data_steward: string | null;
  primary_data_product_ids: string | null;
  contains_pii: boolean | null;
  domain_id: string | null;
  domain: { domain_id: string | null; domain_name: string | null } | null;
  owner: {
    owner_id: string | null;
    owner_name: string | null;
    initials: string | null;
    owner_email: string | null;
    owner_team: string | null;
    is_active: boolean | null;
  } | null;
  used_in_products: Array<{
    data_product_id: string | null;
    product_name: string | null;
    slug: string | null;
    product_url: string | null;
  }> | null;
  lineage: Array<{
    stage_order: number | null;
    stage_type: string | null;
    stage_label: string | null;
    stage_sub_label: string | null;
    system_reference: string | null;
  }> | null;
}

export interface DSGlossaryDetailRow {
  term_id: string | null;
  term: string | null;
  definition: string | null;
  category: string | null;
  status: string | null;
  steward: {
    owner_id: string | null;
    steward_name: string | null;
    steward_email: string | null;
  } | null;
  related_terms: Array<{ term_id: string | null; term: string | null }> | null;
}

export interface DSSearchIndexRow {
  entity_type: string | null;
  id: string | null;
  title: string | null;
  subtitle: string | null;
  certification_status: string | null;
  search_text: string | null;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

type Params = Record<string, string | number | undefined>;

async function bqGet<T>(
  endpoint: string,
  params: Params = {},
): Promise<BqPage<T>> {
  if (!BASE || !API_KEY) {
    throw new Error(
      "BigQuery API not configured — set INTELLIHUB_API_URL and INTELLIHUB_API_KEY in .env",
    );
  }
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "x-api-key": API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`BigQuery API ${res.status} (${endpoint}): ${body}`);
  }
  return res.json();
}

// ─── Endpoint callers ─────────────────────────────────────────────────────────

export const bq = {
  marketplace: (params: Params = {}) =>
    bqGet<DSMarketplaceSvRow>("ds_marketplace_sv", params),

  productDetail: (params: Params = {}) =>
    bqGet<DSDataProductDetailRow>("ds_data_product_detail_sv", params),

  kpiDetail: (params: Params = {}) =>
    bqGet<DSKpiDetailRow>("ds_kpi_detail_sv", params),

  glossary: (params: Params = {}) =>
    bqGet<DSGlossaryDetailRow>("ds_glossary_detail_sv", params),

  searchIndex: (params: Params = {}) =>
    bqGet<DSSearchIndexRow>("ds_search_index_sv", params),
};

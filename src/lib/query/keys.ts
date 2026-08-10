export const qk = {
  products: (filters?: unknown) => ["products", filters ?? {}] as const,
  product: (id: string) => ["product", id] as const,
  kpis: (q?: string) => ["kpis", q ?? ""] as const,
  kpi: (id: string) => ["kpi", id] as const,
  myAccess: () => ["me", "access"] as const,

  bq: {
    marketplace: (params?: unknown) => ["bq", "ds_marketplace_sv", params ?? {}] as const,
    dataProductDetail: (params?: unknown) => ["bq", "ds_data_product_detail_sv", params ?? {}] as const,
    kpiDetail: (params?: unknown) => ["bq", "ds_kpi_detail_sv", params ?? {}] as const,
    glossaryDetail: (params?: unknown) => ["bq", "ds_glossary_detail_sv", params ?? {}] as const,
    searchIndex: (params?: unknown) => ["bq", "ds_search_index_sv", params ?? {}] as const,
  },
};

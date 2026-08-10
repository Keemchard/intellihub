"use client";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import type {
  DSMarketplaceSvRow,
  DSDataProductDetailRow,
  DSKpiDetailRow,
  DSGlossaryDetailRow,
  DSSearchIndexRow,
} from "@/lib/bigquery-client";

export type {
  DSMarketplaceSvRow,
  DSDataProductDetailRow,
  DSKpiDetailRow,
  DSGlossaryDetailRow,
  DSSearchIndexRow,
};

type Params = Record<string, string | number | undefined>;
type Opts = { enabled?: boolean; staleTime?: number };

interface BqResult<T> {
  data: T[];
  meta: { total: number; limit: number; offset: number };
}

async function fetchBqEndpoint<T>(endpoint: string, params: Params = {}): Promise<BqResult<T>> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const qs = sp.toString();
  const res = await fetch(`/api/bigquery/${endpoint}${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  const json = await res.json();
  return { data: json.data, meta: json.meta };
}

export function useMarketplace(params?: Params, opts?: Opts) {
  return useQuery({
    queryKey: qk.bq.marketplace(params),
    queryFn: () => fetchBqEndpoint<DSMarketplaceSvRow>("ds_marketplace_sv", params),
    ...opts,
  });
}

export function useDataProductDetail(params?: Params, opts?: Opts) {
  return useQuery({
    queryKey: qk.bq.dataProductDetail(params),
    queryFn: () => fetchBqEndpoint<DSDataProductDetailRow>("ds_data_product_detail_sv", params),
    ...opts,
  });
}

export function useKpiDetail(params?: Params, opts?: Opts) {
  return useQuery({
    queryKey: qk.bq.kpiDetail(params),
    queryFn: () => fetchBqEndpoint<DSKpiDetailRow>("ds_kpi_detail_sv", params),
    ...opts,
  });
}

export function useGlossaryDetail(params?: Params, opts?: Opts) {
  return useQuery({
    queryKey: qk.bq.glossaryDetail(params),
    queryFn: () => fetchBqEndpoint<DSGlossaryDetailRow>("ds_glossary_detail_sv", params),
    ...opts,
  });
}

export function useSearchIndex(params?: Params, opts?: Opts) {
  return useQuery({
    queryKey: qk.bq.searchIndex(params),
    queryFn: () => fetchBqEndpoint<DSSearchIndexRow>("ds_search_index_sv", params),
    ...opts,
  });
}

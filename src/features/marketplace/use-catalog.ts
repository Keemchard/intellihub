"use client";
import { useQuery } from "@tanstack/react-query";
import type { DetailKpi } from "@/lib/bigquery-mappers";
import type { MarketplaceProduct } from "@/lib/bigquery-mappers";

export type Facets = { domains: string[]; segments: string[]; certification: string[]; tags: string[] };

export function useProducts(params: URLSearchParams) {
  return useQuery({
    queryKey: ["products", params.toString()],
    queryFn: async (): Promise<{ products: MarketplaceProduct[]; facets: Facets }> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/products?${params.toString()}`);
      const json = await res.json();
      return { products: json.data as MarketplaceProduct[], facets: json.meta.facets as Facets };
    },
  });
}

export function useKpis(q: string) {
  return useQuery({
    queryKey: ["kpis", q],
    queryFn: async (): Promise<DetailKpi[]> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/kpis?q=${encodeURIComponent(q)}`);
      return (await res.json()).data as DetailKpi[];
    },
  });
}

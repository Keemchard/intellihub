import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a DataHub deep-link URN URL. (Button is disabled in Phase 1; helper is ready.) */
export function dataHubUrl(kind: "dataset" | "dataProduct" | "glossaryTerm", id: string) {
  const base = process.env.NEXT_PUBLIC_DATAHUB_BASE_URL ?? "https://datahub.nai.io";
  const org = process.env.NEXT_PUBLIC_DATAHUB_ORG ?? "nai";
  return `${base}/${kind}/urn:li:${kind}:(${org},${id},PROD)`;
}

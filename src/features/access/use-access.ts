"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AccessRequest, CreateAccessRequestInput } from "@/types";

export function useMyRequests() {
  return useQuery({
    queryKey: ["access-requests"],
    queryFn: async (): Promise<AccessRequest[]> => (await (await fetch("/api/access-requests")).json()).data,
  });
}

export function useCreateAccessRequest(productId: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: CreateAccessRequestInput): Promise<AccessRequest> => {
      const res = await fetch("/api/access-requests", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Submission failed");
      return json.data;
    },
    // The CTA must flip everywhere the moment the request lands.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-requests"] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["me", "access"] });
      router.refresh(); // server components re-derive accessState
    },
  });
}

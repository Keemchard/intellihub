"use client";
import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import type { BotResponse } from "@/types";

export type Turn = { role: "user"; text: string } | { role: "bot"; response: BotResponse };

export function useBotConversation() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const mutation = useMutation({
    mutationFn: async (query: string): Promise<BotResponse> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/intellibot/query`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("IntelliBot is unavailable");
      return (await res.json()).data;
    },
  });

  const ask = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setTurns((t) => [...t, { role: "user", text: q }]);
    try {
      const response = await mutation.mutateAsync(q);
      setTurns((t) => [...t, { role: "bot", response }]);
    } catch {
      setTurns((t) => [...t, { role: "bot", response: { intro: "Sorry — I couldn't reach the catalog. Please try again.", products: [], kpis: [] } }]);
    }
  }, [mutation]);

  return { turns, ask, isPending: mutation.isPending, reset: () => setTurns([]) };
}

export const SUGGESTIONS = [
  "Show me network quality dashboards",
  "What is the Ookla Consistency Score?",
  "How do I request access?",
  "KPIs about customer experience",
];

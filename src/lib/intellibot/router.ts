import "server-only";
import { products, kpis } from "@/lib/seed";
import type { BotResponse } from "@/types";

/**
 * Phase-1 IntelliBot = deterministic keyword router. No GenAI, no model calls.
 * It returns the SAME contract (BotResponse) that a future RAG/GenAI service will,
 * so the widget and page never change when the brain is swapped.
 */

const HOWTO: Array<{ match: RegExp; text: string }> = [
  { match: /\b(request|get|gain|need)\b.*\baccess\b|\baccess\b.*\b(request|how)\b/i,
    text: "Open the product page and use the **Request Access** button. Choose an access tier, add a business justification, and submit — you can track the status any time under **Access & Enablement**." },
  { match: /\bcertif|trust|reliab|quality\b/i,
    text: "A **Certified** badge means the product is governed and endorsed by its owning team. KPIs also carry a **DQ** (data quality) score. Ownership and steward details appear on every detail page." },
  { match: /\bdatahub|lineage\b/i,
    text: "Full technical lineage lives in **DataHub**. IntelliHub surfaces business-readable **Data Sources & Provenance** on each KPI today; the DataHub deep-link activates in a future phase." },
  { match: /\bexport|download\b/i,
    text: "IntelliHub links you to the source product — exports happen there. Once access is granted, use **View Data Product** to open it in a new tab." },
];

const tokenize = (q: string) => q.toLowerCase().match(/[a-z0-9]+/g) ?? [];

const STOP = new Set(["the","a","an","for","of","to","in","on","me","my","show","find","i","what","is","how","do","with","and","get","need","about","which","where"]);

function score(hay: string, tokens: string[]): number {
  const h = hay.toLowerCase();
  return tokens.reduce((n, t) => (t.length > 2 && !STOP.has(t) && h.includes(t) ? n + 1 : n), 0);
}

export function routeQuery(query: string): BotResponse {
  const tokens = tokenize(query);
  const meaningful = tokens.filter((t) => t.length > 2 && !STOP.has(t));

  const rankedProducts = products
    .map((p) => ({ p, s: score(`${p.name} ${p.desc} ${p.domain} ${p.family} ${p.tags.join(" ")} ${p.type}`, tokens) }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3)
    .map(({ p }) => ({ id: p.id, name: p.name, type: p.type, icon: p.icon, accent: p.accent, desc: p.desc }));

  const rankedKpis = kpis
    .map((k) => ({ k, s: score(`${k.name} ${k.desc} ${k.domain} ${k.tags.join(" ")} ${k.category}`, tokens) }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3)
    .map(({ k }) => ({ id: k.id, name: k.name, value: k.value, accent: k.accent }));

  const howto = HOWTO.find((h) => h.match.test(query))?.text;

  let intro: string;
  if (!meaningful.length) intro = "Ask me about a dashboard, a KPI, or how to get access to something.";
  else if (rankedProducts.length || rankedKpis.length) intro = `Here's what I found for "${query.trim()}".`;
  else if (howto) intro = "Here's how that works.";
  else intro = `I couldn't match "${query.trim()}" to anything in the catalog. Try a product name, a KPI, or a domain like "network quality".`;

  return { intro, products: rankedProducts, kpis: rankedKpis, howto };
}

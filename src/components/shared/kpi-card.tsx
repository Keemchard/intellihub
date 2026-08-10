import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TrustBadge, DqBadge, TrendChip } from "@/components/shared/badges";
import type { Kpi } from "@/types";

export function KpiCard({ k }: { k: Kpi }) {
  return (
    <Link href={`/kpi/${k.id}`} className="ring-focus block rounded-2xl">
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-float">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.category}</span>
          <TrustBadge trust={k.trust} />
        </div>
        <h3 className="font-bold text-foreground">{k.name}</h3>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-3xl font-extrabold tracking-tight" style={{ color: k.accent }}>{k.value}</span>
          <TrendChip trend={k.trend} dir={k.trendDir} />
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          <DqBadge dq={k.dq} />
          <span className="text-xs text-muted-foreground">{k.domain}</span>
        </div>
      </Card>
    </Link>
  );
}

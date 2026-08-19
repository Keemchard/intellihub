import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/badges";
import type { DetailKpi } from "@/lib/bigquery-mappers";

export function KpiCard({ k }: { k: DetailKpi }) {
  return (
    <Link href={`/kpi/${k.kpi_id}`} className="ring-focus block rounded-2xl">
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-float">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {k.kpi_category}
          </span>
          <TrustBadge trust={k.certification_status ?? ""} />
        </div>
        <h3 className="truncate font-bold text-foreground" title={k.kpi_code ?? k.kpi_name ?? ""}>
          {k.kpi_code ?? k.kpi_name}
        </h3>
        <div className="mt-3">
          <span
            className="text-3xl font-extrabold tracking-tight text-muted-foreground/40"
            title="Value coming in Phase 2"
          >
            —
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {k.business_domain ?? k.domain?.domain_name}
          </span>
        </div>
      </Card>
    </Link>
  );
}

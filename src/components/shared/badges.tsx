import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/types";

const TYPE_LABEL: Record<ProductType, string> = {
  dashboard: "Dashboard", dataproduct: "Data Product", kpi: "KPI", report: "Report",
};
export function TypePill({ type }: { type: ProductType }) {
  return <Badge variant="muted" className="uppercase tracking-wide text-[10px]"><Icon name="tag" size={11} />{TYPE_LABEL[type]}</Badge>;
}

export function TrustBadge({ trust }: { trust: string }) {
  if (trust === "Certified")
    return <Badge variant="success"><Icon name="badge-check" size={12} />Certified</Badge>;
  if (trust === "Validated")
    return <Badge variant="success"><Icon name="badge-check" size={12} />Validated</Badge>;
  return <Badge variant="warning"><Icon name="clock" size={12} />{trust || "In Review"}</Badge>;
}

export function DqBadge({ dq }: { dq: number }) {
  const variant = dq >= 90 ? "success" : dq >= 80 ? "warning" : "muted";
  return <Badge variant={variant}>DQ {dq}</Badge>;
}

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground/50" title="Ratings coming in Phase 2">
      <Icon name="star" size={13} /> {rating.toFixed(1)}
      {reviews != null && <span className="font-normal">({reviews})</span>}
    </span>
  );
}

export function TrendChip({ trend, dir }: { trend: string; dir: "up" | "down" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-bold", dir === "up" ? "text-emerald-600" : "text-rose-500")}>
      <Icon name={dir === "up" ? "trending-up" : "trending-down"} size={13} />{trend}
    </span>
  );
}

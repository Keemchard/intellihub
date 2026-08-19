import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/shared/icon";
import { TypePill, TrustBadge, Stars } from "@/components/shared/badges";
import type { MarketplaceProduct } from "@/lib/bigquery-mappers";

export function ProductCard({ p }: { p: MarketplaceProduct }) {
  return (
    <Link href={`/product/${p.data_product_id}`} className="ring-focus block rounded-2xl">
      <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-float">
        <div className="mb-3 flex items-start justify-between">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: `${p.accent}1a`, color: p.accent }}
          >
            <Icon name={p.icon} size={22} />
          </div>
          <TrustBadge trust={p.certification_status ?? ""} />
        </div>
        <div className="mb-1 flex items-center gap-2">
          {p.productTypes.map((t) => <TypePill key={t} type={t} />)}
        </div>
        <h3 className="font-bold leading-tight text-foreground">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {p.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            {p.domain_name}
          </span>
          <Stars rating={0} reviews={0} />
        </div>
      </Card>
    </Link>
  );
}

export function ProductRow({ p }: { p: MarketplaceProduct }) {
  return (
    <Link href={`/product/${p.data_product_id}`} className="ring-focus block rounded-2xl">
      <Card className="flex items-center gap-4 p-4 transition hover:shadow-float">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ background: `${p.accent}1a`, color: p.accent }}
        >
          <Icon name={p.icon} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {p.productTypes.map((t) => <TypePill key={t} type={t} />)}
            <TrustBadge trust={p.certification_status ?? ""} />
          </div>
          <h3 className="truncate font-bold text-foreground">{p.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{p.description}</p>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <Stars rating={0} reviews={0} />
          <span className="text-xs text-muted-foreground">{p.domain_name}</span>
        </div>
        <Icon
          name="arrow-right"
          size={18}
          className="shrink-0 text-muted-foreground"
        />
      </Card>
    </Link>
  );
}

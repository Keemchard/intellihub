import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/shared/icon";
import { TypePill, TrustBadge, Stars } from "@/components/shared/badges";
import type { Product } from "@/types";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.id}`} className="ring-focus block rounded-2xl">
      <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-float">
        <div className="mb-3 flex items-start justify-between">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: `${p.accent}1a`, color: p.accent }}
          >
            <Icon name={p.icon} size={22} />
          </div>
          <TrustBadge trust={p.trust} />
        </div>
        <div className="mb-1 flex items-center gap-2">
          <TypePill type={p.type} />
        </div>
        <h3 className="font-bold leading-tight text-foreground">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {p.desc}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            {p.family}
          </span>
          <Stars rating={p.rating} reviews={p.reviews} />
        </div>
      </Card>
    </Link>
  );
}

export function ProductRow({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.id}`} className="ring-focus block rounded-2xl">
      <Card className="flex items-center gap-4 p-4 transition hover:shadow-float">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ background: `${p.accent}1a`, color: p.accent }}
        >
          <Icon name={p.icon} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <TypePill type={p.type} />
            <TrustBadge trust={p.trust} />
          </div>
          <h3 className="truncate font-bold text-foreground">{p.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{p.desc}</p>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <Stars rating={p.rating} reviews={p.reviews} />
          <span className="text-xs text-muted-foreground">{p.domain}</span>
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

import Link from "next/link";
import { listProducts, getMyAccessSummary } from "@/lib/data-access";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/shared/product-card";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/shared/icon";
import type { MarketplaceProduct } from "@/lib/bigquery-mappers";

function Rail({ title, sub, items }: { title: string; sub?: string; items: MarketplaceProduct[] }) {
  if (!items.length) return null;
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <div><h2 className="text-lg font-extrabold tracking-tight">{title}</h2>{sub && <p className="text-sm text-muted-foreground">{sub}</p>}</div>
        <Link href="/marketplace" className="text-sm font-semibold text-primary hover:underline">Browse all →</Link>
      </div>
      <div data-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map((p) => <ProductCard key={p.data_product_id} p={p} />)}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const all = await listProducts(session.id);
  const access = await getMyAccessSummary(session.id);
  const featured = all.filter((p) => p.certification_status === "Certified");
  const trending = all;
  const recent = all;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {session.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">Discover, understand and access trusted analytics across NAI.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/access" className="ring-focus rounded-2xl">
            <Card className="flex items-center gap-3 px-4 py-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15"><Icon name="check-circle" size={18} /></div>
              <div><div className="text-lg font-extrabold leading-none">{access.grantedCount}</div><div className="text-xs text-muted-foreground">Granted</div></div>
            </Card>
          </Link>
          <Link href="/access" className="ring-focus rounded-2xl">
            <Card className="flex items-center gap-3 px-4 py-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15"><Icon name="clock" size={18} /></div>
              <div><div className="text-lg font-extrabold leading-none">{access.pendingCount}</div><div className="text-xs text-muted-foreground">In Review</div></div>
            </Card>
          </Link>
        </div>
      </div>

      <Rail title="Featured" sub="Certified, trusted analytics" items={featured} />
      <Rail title="Trending" sub="Most highly rated across NAI" items={trending} />
      <Rail title="Recently Added" sub="New to the marketplace" items={recent} />
    </div>
  );
}

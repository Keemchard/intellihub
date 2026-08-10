import { Icon } from "@/components/shared/icon";
export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon name="search" size={24} /></div>
      <h3 className="font-bold text-foreground">{title}</h3>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

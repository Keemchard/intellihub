"use client";
import { cn } from "@/lib/utils";

export function FilterGroup({ title, options, value, onToggle }: { title: string; options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="border-b border-border py-4 last:border-0">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="space-y-1.5">
        {options.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={value.includes(o)} onChange={() => onToggle(o)}
              className={cn("h-4 w-4 rounded border-border accent-primary")} />
            <span className={cn(value.includes(o) ? "font-semibold text-foreground" : "text-muted-foreground")}>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

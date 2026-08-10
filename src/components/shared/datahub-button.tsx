"use client";
import { Icon } from "@/components/shared/icon";
/** Phase 1: present but DISABLED — placeholder for future-state DataHub integration. */
export function DataHubButton() {
  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 opacity-60"
      title="DataHub integration is planned for a future phase" aria-disabled>
      <Icon name="layers" size={18} className="text-muted-foreground" />
      <div className="flex-1">
        <span className="block text-sm font-bold text-foreground">View in DataHub</span>
        <span className="block text-[11px] text-muted-foreground">Technical metadata — available in a future phase</span>
      </div>
      <Icon name="external-link" size={16} className="text-muted-foreground" />
    </div>
  );
}

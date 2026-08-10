"use client";
import { useUi } from "@/stores/ui";
import { useBotConversation, SUGGESTIONS } from "./use-bot";
import { Conversation } from "./conversation";
import { Composer, Suggestions } from "./composer";
import { Icon } from "@/components/shared/icon";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Floating assistant, available across the authenticated shell. */
export function BotWidget() {
  const { botOpen, openBot, closeBot } = useUi();
  const { turns, ask, isPending, reset } = useBotConversation();
  const pathname = usePathname();

  if (pathname === "/intellibot") return null; // the full page owns the surface

  if (!botOpen) {
    return (
      <button onClick={openBot} aria-label="Open IntelliBot"
        className="grad-brand fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-float transition hover:brightness-110">
        <Icon name="sparkles" size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[min(560px,80vh)] w-[min(400px,calc(100vw-3rem))] animate-fadein flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float">
      <header className="flex items-center gap-2.5 border-b border-border p-4">
        <div className="grad-brand grid h-9 w-9 place-items-center rounded-xl text-white"><Icon name="sparkles" size={17} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold">IntelliBot<span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-muted-foreground">BETA</span></div>
          <div className="text-[11px] text-muted-foreground">Your analytics guide</div>
        </div>
        {turns.length > 0 && (
          <button onClick={reset} aria-label="Clear" className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"><Icon name="help-circle" size={16} /></button>
        )}
        <button onClick={closeBot} aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"><Icon name="chevron-down" size={18} /></button>
      </header>

      <div className={cn("flex-1 overflow-y-auto p-4", !turns.length && "grid place-items-center")}>
        {turns.length ? <Conversation turns={turns} isPending={isPending} /> : (
          <div className="text-center">
            <div className="grad-brand mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl text-white"><Icon name="sparkles" size={22} /></div>
            <p className="mb-4 text-sm text-muted-foreground">Ask me to find analytics, explain a KPI, or walk you through access.</p>
            <Suggestions items={SUGGESTIONS.slice(0, 3)} onPick={ask} />
          </div>
        )}
      </div>

      <div className="border-t border-border p-3"><Composer onAsk={ask} disabled={isPending} /></div>
    </div>
  );
}

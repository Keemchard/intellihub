import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { AccessRequestEvent, RequestStatus } from "@/types";

const STYLE: Record<
  RequestStatus,
  { icon: string; dot: string; text: string }
> = {
  "In Review": { icon: "clock", dot: "bg-amber-500", text: "text-amber-600" },
  Approved: {
    icon: "check-circle",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  Rejected: { icon: "shield-check", dot: "bg-rose-500", text: "text-rose-600" },
  "More Information Required": {
    icon: "help-circle",
    dot: "bg-sky-500",
    text: "text-sky-600",
  },
  Expired: {
    icon: "",
    dot: "",
    text: "",
  },
  Pending: {
    icon: "",
    dot: "",
    text: "",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const s = STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold",
        s.text,
      )}
    >
      <Icon name={s.icon} size={13} />
      {status}
    </span>
  );
}

/** Append-only history — newest last, exactly as recorded. */
export function StatusTimeline({ events }: { events: AccessRequestEvent[] }) {
  return (
    <ol className="relative ml-1 border-l border-border pl-5">
      {events.map((e, i) => {
        const s = STYLE[e.status];
        const last = i === events.length - 1;
        return (
          <li key={e.id} className={cn("relative", !last && "pb-5")}>
            <span
              className={cn(
                "absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-card",
                s.dot,
              )}
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <StatusBadge status={e.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(e.at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {e.note && (
              <p className="mt-1 text-sm text-muted-foreground">{e.note}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">by {e.actor}</p>
          </li>
        );
      })}
    </ol>
  );
}

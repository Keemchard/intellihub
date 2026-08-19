"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/shared/icon";
import { Avatar } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { useSearchIndex } from "@/features/bigquery/use-bigquery";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ENTITY_ICONS: Record<string, string> = {
  data_product: "database",
  kpi: "trending-up",
  glossary: "book-open",
};

function entityHref(entityType: string | null, id: string | null): string {
  if (!id) return "/marketplace";
  if (entityType === "data_product") return `/product/${id}`;
  if (entityType === "kpi") return `/kpi/${id}`;
  return `/marketplace?q=${encodeURIComponent(id)}`;
}

export function TopBar({
  user,
}: {
  user: { name: string; role: string; color: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setOpen(debouncedQ.length >= 2);
  }, [debouncedQ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: searchData, isLoading: searching } = useSearchIndex(
    { q: debouncedQ, limit: 6 },
    { enabled: debouncedQ.length >= 2 },
  );
  const results = searchData?.data ?? [];

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/logout`, {
      method: "POST",
    });
    router.push("/login");
    router.refresh();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (!q) {
      return router.push("/marketplace");
    }
    if (q.trim()) router.push(`/marketplace?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-4 border-b border-border bg-background/85 px-6 backdrop-blur-md">
      <div ref={wrapperRef} className="relative mx-auto max-w-2xl flex-1">
        <form onSubmit={submit}>
          <Icon
            name="search"
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          {searching && debouncedQ.length >= 2 && (
            <Icon
              name="loader"
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            />
          )}
          <input
            value={q}
            onChange={(e) => {
              if (e.target.value.length === 0) {
                router.push("/marketplace");
              }
              setQ(e.target.value);
            }}
            onFocus={() => {
              if (debouncedQ.length >= 2) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQ("");
              }
            }}
            placeholder="Search analytics products, dashboards, KPIs…"
            className="h-11 w-full rounded-2xl border border-transparent bg-muted pl-11 pr-10 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
        </form>

        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {results.map((r) => (
              <button
                key={`${r.entity_type}-${r.id}`}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  router.push(entityHref(r.entity_type, r.id));
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon
                    name={
                      (r.entity_type ? ENTITY_ICONS[r.entity_type] : null) ??
                      "search"
                    }
                    size={15}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {r.title}
                  </div>
                  {r.subtitle && (
                    <div className="truncate text-xs text-muted-foreground">
                      {r.subtitle}
                    </div>
                  )}
                </div>
                {r.entity_type && (
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {r.entity_type.replace(/_/g, " ")}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/marketplace?q=${encodeURIComponent(debouncedQ)}`);
              }}
              className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <Icon name="search" size={15} /> See all results for &ldquo;
              {debouncedQ}&rdquo;
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <button
          disabled
          title="Coming in Phase 2"
          className="relative grid h-10 w-10 cursor-not-allowed place-items-center rounded-xl opacity-40"
        >
          <Icon name="bell" size={19} />
          <span className="absolute right-1.5 top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
            3
          </span>
        </button>
        <div className="mx-1.5 h-7 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="ring-focus flex cursor-not-allowed items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 opacity-40"
            title="Coming in Phase 2"
            disabled
          >
            <Avatar name={user.name} color={user.color} size={36} />
            <div className="hidden text-left leading-tight md:block">
              <div className="text-[13px] font-bold text-foreground">
                {user.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {user.role}
              </div>
            </div>
            <Icon
              name="chevron-down"
              size={15}
              className="hidden text-muted-foreground md:block"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center gap-3 p-3">
              <Avatar name={user.name} color={user.color} size={42} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground">
                  {user.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {user.role} · NAI
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon name="user" size={17} />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="settings" size={17} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={logout}
              className="font-semibold text-rose-600 hover:text-rose-600"
            >
              <Icon name="log-out" size={17} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

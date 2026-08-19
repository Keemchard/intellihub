"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/config/nav";
import { useUi } from "@/stores/ui";
import { Logo } from "@/components/shared/brand";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUi();

  return (
    <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground transition-[width] duration-300 md:flex",
      collapsed ? "w-[76px]" : "w-[260px]")}>
      <div className={cn("flex h-[68px] items-center gap-2.5 px-5", collapsed && "justify-center px-0")}>
        <Link href="/home" className="ring-focus flex items-center gap-2.5 rounded-lg">
          <Logo size={30} />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[17px] font-extrabold tracking-tight">IntelliHub</div>
              <div className="text-[10px] font-medium text-white/60">Network Analytics &amp; Insights</div>
            </div>
          )}
        </Link>
      </div>

      <nav className="mt-2 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.id === "marketplace" && (pathname.startsWith("/product") || pathname.startsWith("/kpi")));
          return (
            <Link key={item.id} href={item.href} title={collapsed ? item.label : undefined}
              className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ring-focus",
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white", collapsed && "justify-center")}>
              <span className="relative grid place-items-center">
                {active && <span className="grad-brand absolute -left-[18px] h-5 w-1 rounded-full" />}
                <Icon name={item.icon} size={19} />
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-7 px-3">
          <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 opacity-40" title="Coming in Phase 2">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10"><Icon name="sparkles" size={16} /></div>
              <span className="text-sm font-bold">IntelliBot</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white/80">BETA</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-white/60">Ask questions and find the right analytics across NAI.</p>
            <div className="block w-full cursor-not-allowed rounded-xl bg-white/10 py-2 text-center text-sm font-semibold text-white/60 select-none">
              Ask IntelliBot
            </div>
          </div>
        </div>
      )}

      <div className="flex-1" />
      <div className="border-t border-white/5 px-3 py-3">
        <button onClick={toggleSidebar}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-white/55 transition hover:bg-white/5 hover:text-white ring-focus", collapsed && "justify-center")}>
          <Icon name={collapsed ? "chevron-right" : "chevron-left"} size={17} />{!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}

// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { useMyRequests } from "./use-access";
// import { StatusBadge, StatusTimeline } from "./status-timeline";
// import { Card } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { EmptyState } from "@/components/shared/empty-state";
// import { TypePill } from "@/components/shared/badges";
// import { Icon } from "@/components/shared/icon";
// import { cn } from "@/lib/utils";
// import type { AccessRequest } from "@/types";

// const GROUPS = [
//   { id: "open", label: "Open", match: (r: AccessRequest) => r.currentStatus === "In Review" || r.currentStatus === "More Information Required" },
//   { id: "approved", label: "Approved", match: (r: AccessRequest) => r.currentStatus === "Approved" },
//   { id: "closed", label: "Rejected", match: (r: AccessRequest) => r.currentStatus === "Rejected" },
// ] as const;

// function RequestRow({ r }: { r: AccessRequest }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <Card className="overflow-hidden">
//       <button onClick={() => setOpen((v) => !v)} className="ring-focus flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/50">
//         <div className="min-w-0 flex-1">
//           <div className="mb-1 flex flex-wrap items-center gap-2">
//             <TypePill type={r.productType} />
//             <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{r.roleTier}</span>
//           </div>
//           <div className="truncate font-bold">{r.productName}</div>
//           <div className="mt-0.5 text-xs text-muted-foreground">
//             {r.id} · updated {new Date(r.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
//           </div>
//         </div>
//         <StatusBadge status={r.currentStatus} />
//         <Icon name="chevron-down" size={17} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
//       </button>
//       {open && (
//         <div className="animate-fadein border-t border-border bg-muted/25 p-5">
//           <div className="mb-4">
//             <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Justification</div>
//             <p className="mt-1 text-sm">{r.justification}</p>
//           </div>
//           <div className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">History</div>
//           <StatusTimeline events={r.events} />
//           <div className="mt-5 flex items-center gap-3">
//             <Link href={`/product/${r.productId}`} className="text-sm font-semibold text-primary hover:underline">Open product →</Link>
//           </div>
//         </div>
//       )}
//     </Card>
//   );
// }

// export function AccessClient() {
//   const { data, isLoading } = useMyRequests();
//   const [tab, setTab] = useState<(typeof GROUPS)[number]["id"]>("open");
//   const active = GROUPS.find((g) => g.id === tab)!;
//   const rows = (data ?? []).filter(active.match);

//   return (
//     <div className="mx-auto max-w-4xl px-6 py-8">
//       <h1 className="text-2xl font-extrabold tracking-tight">Access &amp; Enablement</h1>
//       <p className="mt-1 text-muted-foreground">Track your access requests and see what you can consume.</p>

//       <div className="mb-6 mt-6 flex items-center gap-1 border-b border-border">
//         {GROUPS.map((g) => {
//           const n = (data ?? []).filter(g.match).length;
//           return (
//             <button key={g.id} onClick={() => setTab(g.id)}
//               className={cn("relative px-4 py-3 text-sm font-semibold transition ring-focus", tab === g.id ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
//               {g.label} <span className="ml-1 text-xs text-muted-foreground">{n}</span>
//               {tab === g.id && <span className="grad-brand absolute inset-x-3 -bottom-px h-[2.5px] rounded-full" />}
//             </button>
//           );
//         })}
//       </div>

//       {isLoading ? (
//         <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)}</div>
//       ) : rows.length ? (
//         <div data-stagger className="space-y-3">{rows.map((r) => <RequestRow key={r.id} r={r} />)}</div>
//       ) : (
//         <EmptyState title={`No ${active.label.toLowerCase()} requests`} sub="Request access from any product page to see it here." />
//       )}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import Link from "next/link";
import { useMyRequests } from "./use-access";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { AccessRequest } from "@/types";

const GROUPS = [
  { id: "open", label: "Open", match: (r: AccessRequest) => r.currentStatus === "In Review" || r.currentStatus === "More Information Required" },
  { id: "approved", label: "Approved", match: (r: AccessRequest) => r.currentStatus === "Approved" },
  { id: "closed", label: "Rejected", match: (r: AccessRequest) => r.currentStatus === "Rejected" },
] as const;

export function AccessClient() {
  const { data, isLoading } = useMyRequests();
  
  // Tab states for the main pages and sub-pill filters
  const [activeTab, setActiveTab] = useState("overview");
  const [tab, setTab] = useState<(typeof GROUPS)[number]["id"]>("open");
  const [showFilters, setShowFilters] = useState(false);

  const active = GROUPS.find((g) => g.id === tab)!;
  const rows = (data ?? []).filter(active.match);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "requests", label: "Access Requests" },
    { id: "my-access", label: "My Access" },
    { id: "onboarding", label: "Onboarding" },
    { id: "navigation", label: "Guided Navigation" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 text-[#0f172a] antialiased bg-[#f8fafc] min-h-screen">
      
      {/* GLOBAL SEARCH NAV BAR (Top Mockup representation) */}
      <div className="mb-6 flex max-w-xl items-center relative">
        <span className="absolute left-4 text-slate-400">
          <Icon name="search" size={16} />
        </span>
        <input 
          type="text" 
          placeholder="Search analytics products, dashboards, KPIs and more..." 
          className="w-full bg-white border border-slate-200/80 pl-11 pr-4 py-2.5 text-xs rounded-xl outline-none shadow-sm focus:border-slate-300"
        />
      </div>

      {/* PAGE HEADER */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
          <Icon name="shield-check" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Access &amp; Enablement</h1>
          <p className="mt-1 text-sm text-slate-500">Simplifying onboarding, navigation and access to trusted analytics across NAI.</p>
        </div>
      </div>

      {/* TAB NAVIGATION HEADER */}
      <div className="mb-8 flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all duration-200 pb-3 -mb-[1px]",
              activeTab === t.id ? "text-indigo-600 border-b-2 border-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Access Status</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">12</span>
                  <span className="text-xs text-slate-400 font-medium">Total Active</span>
                </div>
                <div className="text-xs space-y-1 text-slate-500 pt-2">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> 8 Approved</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> 2 In Review</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300"></span> 2 Expired</div>
                </div>
              </div>
              <div className="h-20 w-20 relative flex items-center justify-center rounded-full border-4 border-slate-100 border-t-indigo-600 border-r-emerald-500">
                <span className="text-sm font-bold text-slate-500">Status</span>
              </div>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-700">
                  <Icon name="file-text" size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Requests</span>
                </div>
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex justify-between"><span>Pending Review</span><span className="font-bold text-slate-900">2</span></div>
                  <div className="flex justify-between"><span>Approved (This week)</span><span className="font-bold text-emerald-600">1</span></div>
                  <div className="flex justify-between"><span>Rejected</span><span className="font-bold text-slate-900">0</span></div>
                </div>
              </div>
              <button onClick={() => setActiveTab("requests")} className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 pt-3 border-t border-slate-50">
                View all requests <Icon name="arrow-right" size={12} />
              </button>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-700">
                  <Icon name="graduation-cap" size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Onboarding Progress</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-sm border-2 border-emerald-500">75%</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">You're doing great!</h4>
                    <p className="text-xs text-slate-400">3 of 4 steps completed.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab("onboarding")} className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 pt-3 border-t border-slate-50">
                Continue onboarding <Icon name="arrow-right" size={12} />
              </button>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recommended for You</span>
              <div className="space-y-2">
                <div className="p-2 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                  <span className="truncate max-w-[200px]">Network Quality Overview Dashboard</span>
                  <Icon name="chevron-right" size={12} className="text-slate-400" />
                </div>
                <div className="p-2 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                  <span className="truncate max-w-[200px]">Territory Performance Overview</span>
                  <Icon name="chevron-right" size={12} className="text-slate-400" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-6 p-6 border border-slate-100 bg-white rounded-2xl shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 mb-4">Recent System Overview</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Select the tabs above to drill deeper into comprehensive audit matrices, user onboarding roadmaps, and active access sessions.</p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ACCESS REQUESTS TABLE (UPDATED FROM MOCKUP) */}
      {activeTab === "requests" && (
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Action Row containing pill filtering states */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 flex-wrap gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => setTab("open")} className={cn("px-3.5 py-1.5 text-xs font-bold rounded-full transition shadow-sm", tab === "open" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>All</button>
              <button onClick={() => setTab("open")} className={cn("px-3.5 py-1.5 text-xs font-bold rounded-full transition", tab === "open" ? "bg-blue-900 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>Pending</button>
              <button onClick={() => setTab("approved")} className={cn("px-3.5 py-1.5 text-xs font-bold rounded-full transition", tab === "approved" ? "bg-blue-900 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>Approved</button>
              <button onClick={() => setTab("closed")} className={cn("px-3.5 py-1.5 text-xs font-bold rounded-full transition", tab === "closed" ? "bg-blue-900 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>Rejected</button>
            </div>
            <button className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-blue-950 transition">
              <Icon name="plus" size={14} /> New Request
            </button>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-12 bg-slate-50/50 px-6 py-3 border-b border-slate-100 text-xs font-bold text-slate-400 tracking-wide">
              <div className="col-span-5">Product / Dashboard</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Requested On</div>
              <div className="col-span-1 text-right pr-4">Approver</div>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : rows.length ? (
              <div className="min-w-[800px] divide-y divide-slate-50">
                {rows.map((req, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50/30 transition cursor-pointer group">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Icon name={req.productType === "Dashboard" ? "activity" : "file-text"} size={14} />
                      </div>
                      <div className="truncate pr-4">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-900 transition">{req.productName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Eagle Eye — {req.productType === "Dashboard" ? "CWN" : "Territory"}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50 uppercase tracking-wide">
                        {req.productType}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border",
                        req.currentStatus === "Approved" && "bg-emerald-50 text-emerald-700 border-emerald-200/40",
                        req.currentStatus === "In Review" && "bg-amber-50 text-amber-700 border-amber-200/40",
                        req.currentStatus === "Expired" && "bg-slate-50 text-slate-500 border-slate-200/50",
                        req.currentStatus === "Pending" && "bg-blue-50 text-blue-700 border-blue-200/40",
                        req.currentStatus === "Rejected" && "bg-rose-50 text-rose-700 border-rose-200/40"
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          req.currentStatus === "Approved" && "bg-emerald-500",
                          req.currentStatus === "In Review" && "bg-amber-500",
                          req.currentStatus === "Expired" && "bg-slate-400",
                          req.currentStatus === "Pending" && "bg-blue-500",
                          req.currentStatus === "Rejected" && "bg-rose-500"
                        )}></span>
                        {req.currentStatus}
                      </span>
                    </div>

                    <div className="col-span-2 text-sm text-slate-500 font-medium">
                      {new Date(req.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>

                    <div className="col-span-1 flex items-center justify-between pr-2">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm bg-indigo-500">
                        {req.productName.substring(0, 2)}
                      </div>
                      <Icon name="chevron-right" size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No match records found" sub="Adjust sub-tabs filter selection parameters." />
            )}
          </div>
        </Card>
      )}

      {/* FALLBACK TRACK HOOK STUBS */}
      {activeTab === "my-access" && (
        <Card className="p-6 border border-slate-100 bg-white rounded-2xl shadow-sm text-center py-12">
          <Icon name="lock" size={32} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-extrabold text-base text-slate-900">My Authorized Access Nodes</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Active network profiles authenticated to your credentials dashboard module display here.</p>
        </Card>
      )}

      {activeTab === "onboarding" && (
        <Card className="p-6 border border-slate-100 bg-white rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Onboarding Checklist</h3>
          <p className="text-xs text-slate-400">Complete these baseline workspace setups to configure target NAI asset permissions.</p>
        </Card>
      )}

      {activeTab === "navigation" && (
        <Card className="p-6 border border-slate-100 bg-white rounded-2xl shadow-sm text-center py-12">
          <Icon name="compass" size={32} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-extrabold text-base text-slate-900">Guided Product Navigation Engine</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Input functional goals above to calculate automated pathway mappings.</p>
        </Card>
      )}

    </div>
  );
}
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/shared/brand";
import { Icon } from "@/components/shared/icon";
import type { RoleName } from "@/types";

const roles: Array<{ id: RoleName; label: string; desc: string; icon: string }> = [
  { id: "executive", label: "Executive", desc: "Strategic scorecards & board-ready views", icon: "layout-grid" },
  { id: "territory", label: "Territory Team", desc: "Regional performance & field operations", icon: "map-pin" },
  { id: "business", label: "Business User", desc: "Discover & consume trusted analytics", icon: "grid" },
  { id: "analyst", label: "Analyst", desc: "Deep dives, data products & KPIs", icon: "activity" },
];

export function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/home";
  const [busy, setBusy] = useState<string | null>(null);

  async function signIn(role: RoleName) {
    setBusy(role);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }),
    });
    if (res.ok) { router.push(next); router.refresh(); } else setBusy(null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={44} />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Welcome to IntelliHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with enterprise SSO to continue.</p>
        </div>

        <button onClick={() => signIn("business")} disabled={!!busy}
          className="grad-brand mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
          <Icon name="shield-check" size={18} />
          {busy === "business" ? "Signing in…" : "Continue with Enterprise SSO"}
        </button>

        <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">or explore as</div>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <button key={r.id} onClick={() => signIn(r.id)} disabled={!!busy}
              className="ring-focus rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary hover:shadow-card disabled:opacity-60">
              <div className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon name={r.icon} size={17} /></div>
              <div className="text-sm font-bold">{r.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{r.desc}</div>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Dev sign-in. Production wires the OIDC authorization-code flow to this same session.
        </p>
      </div>
    </main>
  );
}

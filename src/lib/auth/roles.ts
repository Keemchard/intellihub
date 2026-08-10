import type { RoleName } from "@/types";

export const ROLE_LABEL: Record<RoleName, string> = {
  executive: "Executive",
  territory: "Territory Lead",
  business: "NTG Manager",
  analyst: "Business Analyst",
  intellihub_admin: "IntelliHub Admin",
};

/** Route-level RBAC. Phase 1: every authenticated role may use the whole app surface. */
export const ROUTE_ROLES: Array<{ prefix: string; roles: RoleName[] }> = [
  { prefix: "/admin", roles: ["intellihub_admin"] }, // reserved; no admin UI in P1
];

export function canAccessRoute(pathname: string, role: RoleName): boolean {
  const rule = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  return rule ? rule.roles.includes(role) : true;
}

/** CYOD / Self-Serve tiers exist only for Eagle Eye products. Enforced server-side. */
export function allowedTiers(family: string): Array<"Viewer" | "CYOD" | "Self-Serve"> {
  return family.startsWith("Eagle Eye") ? ["Viewer", "CYOD", "Self-Serve"] : ["Viewer"];
}

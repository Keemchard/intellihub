import "server-only";
import type {
  AccessRequest,
  AccessRequestEvent,
  AccessState,
  RequestStatus,
  RoleTier,
} from "@/types";

/**
 * Append-only access-request log.
 *
 * Phase 1 / DATA_SOURCE=seed: in-memory (survives HMR via globalThis).
 * Production: the same functions back onto BigQuery — inserts only, never updates.
 * `accessState` is always DERIVED from the latest event, never stored on the product row.
 */

type Store = { requests: Map<string, AccessRequest>; seq: number };

const g = globalThis as unknown as { __ih_access?: Store };
function store(): Store {
  if (!g.__ih_access) {
    g.__ih_access = { requests: new Map(), seq: 0 };
    seedInitial(g.__ih_access);
  }
  return g.__ih_access;
}

const now = () => new Date().toISOString();
const nextId = (s: Store, p: string) =>
  `${p}-${String(++s.seq).padStart(4, "0")}`;

function event(
  requestId: string,
  status: RequestStatus,
  actor: string,
  note?: string,
): AccessRequestEvent {
  return {
    id: `${requestId}-e${Math.random().toString(36).slice(2, 8)}`,
    requestId,
    status,
    actor,
    note,
    at: now(),
  };
}

/** Mirrors the demo entitlements the Tranche-1 seed implied. */
function seedInitial(s: Store) {
  const mk = (
    productId: string,
    productName: string,
    productType: AccessRequest["productType"],
    family: string,
    roleTier: RoleTier,
    status: RequestStatus,
    justification: string,
    daysAgo: number,
  ) => {
    const id = nextId(s, "REQ");
    const created = new Date(Date.now() - daysAgo * 864e5).toISOString();
    const events: AccessRequestEvent[] = [
      {
        ...event(id, "In Review", "Maria Santos"),
        at: created,
        note: "Request submitted",
      },
    ];
    if (status !== "In Review") {
      events.push({
        ...event(id, status, "Access Review Board"),
        at: new Date(Date.now() - (daysAgo - 1) * 864e5).toISOString(),
        note:
          status === "Approved"
            ? "Approved — entitlement provisioned"
            : "Additional context required",
      });
    }
    s.requests.set(id, {
      id,
      userId: "maria",
      productId,
      productName,
      productType,
      family,
      roleTier,
      justification,
      currentStatus: status,
      providerRef: `local:${id}`,
      createdAt: created,
      updatedAt: events[events.length - 1].at,
      events,
    });
  };

  mk(
    "territory-perf",
    "Territory Performance Overview",
    "dashboard",
    "Eagle Eye — Territory",
    "Self-Serve",
    "Approved",
    "Needed for weekly territory performance reviews with regional leads.",
    12,
  );
  mk(
    "cwn-capacity",
    "CWN Capacity Report",
    "report",
    "Eagle Eye — CWN",
    "Viewer",
    "Approved",
    "Capacity planning inputs for the quarterly network investment cycle.",
    20,
  );
  mk(
    "ntg-mancom",
    "NTG Mancom Dashboard",
    "dashboard",
    "Eagle Eye — Mancom",
    "Viewer",
    "In Review",
    "Preparing the executive committee pack; require access to top-line KPIs.",
    2,
  );
}

/** Latest request per (user, product) determines effective state. */
export function resolveAccessState(
  userId: string,
  productId: string,
): AccessState {
  const rs = [...store().requests.values()]
    .filter((r) => r.userId === userId && r.productId === productId)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  if (!rs.length) return "none";
  switch (rs[0].currentStatus) {
    case "Approved":
      return "granted";
    case "In Review":
    case "More Information Required":
    case "Pending":
      return "pending";
    case "Rejected":
    case "Expired":
      return "rejected";
  }
}

export function listRequests(userId: string): AccessRequest[] {
  return [...store().requests.values()]
    .filter((r) => r.userId === userId)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getRequest(id: string): AccessRequest | null {
  return store().requests.get(id) ?? null;
}

export function findOpenRequest(
  userId: string,
  productId: string,
): AccessRequest | null {
  return (
    listRequests(userId).find(
      (r) => r.productId === productId && r.currentStatus !== "Rejected",
    ) ?? null
  );
}

export function createRequest(input: {
  userId: string;
  actor: string;
  productId: string;
  productName: string;
  productType: AccessRequest["productType"];
  family: string;
  roleTier: RoleTier;
  justification: string;
}): AccessRequest {
  const s = store();
  const id = nextId(s, "REQ");
  const ev = event(id, "In Review", input.actor, "Request submitted");
  const req: AccessRequest = {
    id,
    userId: input.userId,
    productId: input.productId,
    productName: input.productName,
    productType: input.productType,
    family: input.family,
    roleTier: input.roleTier,
    justification: input.justification,
    currentStatus: "In Review",
    providerRef: null,
    createdAt: ev.at,
    updatedAt: ev.at,
    events: [ev],
  };
  s.requests.set(id, req);
  return req;
}

export function attachProviderRef(
  id: string,
  providerRef: string | null,
): void {
  const r = store().requests.get(id);
  if (r) r.providerRef = providerRef;
}

/** Append a transition. Never mutates history — only pushes a new event. */
export function appendStatus(
  id: string,
  status: RequestStatus,
  actor: string,
  note?: string,
): AccessRequest | null {
  const r = store().requests.get(id);
  if (!r) return null;
  const ev = event(id, status, actor, note);
  r.events = [...r.events, ev];
  r.currentStatus = status;
  r.updatedAt = ev.at;
  return r;
}

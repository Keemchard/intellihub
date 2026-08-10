import "server-only";
import type { AccessProvisioningProvider } from "./types";
import type { AccessRequest, RequestStatus } from "@/types";

/**
 * AppSheet is the Phase-1 workflow engine. It keeps its OWN Google Sheet store —
 * IntelliHub never writes analytics/governance data into it, and AppSheet never
 * writes into BigQuery. Status flows back via the secured webhook (event-driven,
 * not polling); getStatus() exists only for reconciliation.
 */
const APPSHEET_API = "https://api.appsheet.com/api/v2/apps";

function config() {
  const appId = process.env.APPSHEET_APP_ID;
  const apiKey = process.env.APPSHEET_API_KEY;
  if (!appId || !apiKey) throw new Error("AppSheet is not configured (APPSHEET_APP_ID / APPSHEET_API_KEY)");
  return { appId, apiKey };
}

async function call(action: "Add" | "Find", rows: unknown[]) {
  const { appId, apiKey } = config();
  const res = await fetch(`${APPSHEET_API}/${appId}/tables/AccessRequests/Action`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ApplicationAccessKey: apiKey },
    body: JSON.stringify({ Action: action, Properties: { Locale: "en-US" }, Rows: rows }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`AppSheet ${action} failed (${res.status})`);
  return res.json();
}

export const appSheetProvider: AccessProvisioningProvider = {
  name: "appsheet",

  async submit(request: AccessRequest) {
    const json = await call("Add", [{
      RequestId: request.id,
      UserId: request.userId,
      ProductId: request.productId,
      ProductName: request.productName,
      RoleTier: request.roleTier,
      Justification: request.justification,
      Status: request.currentStatus,
      CreatedAt: request.createdAt,
    }]);
    const ref = Array.isArray(json?.Rows) ? (json.Rows[0]?.RequestId ?? null) : null;
    return { providerRef: ref ?? request.id };
  },

  async getStatus(request: AccessRequest) {
    const json = await call("Find", [{ RequestId: request.id }]);
    const row = Array.isArray(json?.Rows) ? json.Rows[0] : null;
    if (!row?.Status) return null;
    return { status: row.Status as RequestStatus, note: row.Note as string | undefined };
  },
};

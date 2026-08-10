import "server-only";
import type { AccessProvisioningProvider } from "./types";
import type { AccessRequest } from "@/types";

/**
 * Dev/demo provider. No network. The request simply sits at "In Review" until a
 * reviewer transitions it — locally you can simulate the approval webhook via:
 *   POST /api/integrations/appsheet/status
 */
export const localProvider: AccessProvisioningProvider = {
  name: "local",
  async submit(request: AccessRequest) {
    return { providerRef: `local:${request.id}` };
  },
  async getStatus() {
    return null; // no external truth to reconcile against
  },
};

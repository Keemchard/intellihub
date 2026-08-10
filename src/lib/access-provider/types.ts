import type { AccessRequest, RequestStatus } from "@/types";

/**
 * AccessProvisioningProvider — the seam between IntelliHub (system of engagement)
 * and whatever workflow engine approves access (system of record).
 *
 * IntelliHub ALWAYS owns the request record + append-only event log.
 * The provider only drives status transitions. Swapping AppSheet for ServiceNow,
 * Jira, or an internal IAM service changes ONLY this folder.
 */
export interface AccessProvisioningProvider {
  readonly name: string;
  /** Push a newly-created request into the workflow engine. Returns the provider's row/ticket ref. */
  submit(request: AccessRequest): Promise<{ providerRef: string | null }>;
  /** Pull current status (fallback / reconciliation; the webhook is the primary path). */
  getStatus(request: AccessRequest): Promise<{ status: RequestStatus; note?: string } | null>;
}

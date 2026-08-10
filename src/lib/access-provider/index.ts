import "server-only";
import type { AccessProvisioningProvider } from "./types";
import { localProvider } from "./local-provider";
import { appSheetProvider } from "./appsheet-provider";

export type { AccessProvisioningProvider } from "./types";

/** Selected by env. Callers depend on the interface, never the implementation. */
export function getAccessProvider(): AccessProvisioningProvider {
  const configured = process.env.ACCESS_PROVIDER ?? "local";
  if (configured === "appsheet") return appSheetProvider;
  return localProvider;
}

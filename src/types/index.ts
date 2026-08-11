import { z } from "zod";

export const ProductType = z.enum([
  "dashboard",
  "dataproduct",
  "kpi",
  "report",
]);
export type ProductType = z.infer<typeof ProductType>;

export const TrustStatus = z.enum(["Trusted", "In Review"]);
export const Segment = z.enum(["Consumer", "B2B", "VIP"]);
export const LaunchType = z.enum(["eagle_eye", "looker", "external_url"]);

/** Resolved server-side; drives the single entitlement-gated CTA. */
export const AccessState = z.enum(["granted", "pending", "none", "rejected"]);
export type AccessState = z.infer<typeof AccessState>;

export const OwnerUser = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  initials: z.string(),
  color: z.string(),
});

export const Product = z.object({
  id: z.string(),
  type: ProductType,
  name: z.string(),
  family: z.string(),
  domain: z.string(),
  territory: z.string(),
  segment: Segment,
  owner: z.string(),
  ownerUser: OwnerUser,
  steward: OwnerUser,
  rating: z.number(),
  reviews: z.number(),
  certified: z.boolean(),
  trust: TrustStatus,
  accessState: AccessState, // DERIVED server-side from the access-request event log
  launchType: LaunchType,
  launchUrl: z.string(),
  icon: z.string(),
  accent: z.string(),
  desc: z.string(),
  purpose: z.string(),
  kpis: z.array(z.string()),
  tags: z.array(z.string()),
  updated: z.string(),
  refresh: z.enum(["Daily", "Weekly", "Monthly"]),
  features: z.array(z.string()),
});
export type Product = z.infer<typeof Product>;

export const Threshold = z.tuple([z.string(), z.string(), z.string()]);

export const Kpi = z.object({
  id: z.string(),
  name: z.string(),
  short: z.string(),
  family: z.string(),
  domain: z.string(),
  owner: z.string(),
  ownerUser: OwnerUser,
  rating: z.number(),
  reviews: z.number(),
  trust: TrustStatus,
  dq: z.number(),
  value: z.string(),
  trend: z.string(),
  trendDir: z.enum(["up", "down"]),
  accent: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
  upstream: z.array(z.string()), // surfaced as "Data Sources & Provenance"
  desc: z.string(),
  definition: z.string(), // inline glossary
  formula: z.string(),
  context: z.string(),
  source: z.string(),
  frequency: z.string(),
  aggregation: z.string(),
  thresholds: z.array(Threshold),
  relatedProducts: z.array(z.string()),
});
export type Kpi = z.infer<typeof Kpi>;

/** Phase 1 access tiers (CYOD / Self-Serve are Eagle-Eye-only, enforced server-side). */
export const RoleTier = z.enum(["Viewer", "CYOD", "Self-Serve"]);
export type RoleTier = z.infer<typeof RoleTier>;

export const RequestStatus = z.enum([
  "In Review",
  "Approved",
  "Rejected",
  "More Information Required",
  "Expired",
  "Pending",
]);
export type RequestStatus = z.infer<typeof RequestStatus>;

/** Client -> BFF submission payload. Validated on both sides with this one schema. */
export const CreateAccessRequestInput = z.object({
  productId: z.string().min(1, "Product is required"),
  roleTier: RoleTier,
  justification: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters of business justification")
    .max(1000, "Justification must be under 1000 characters"),
});
export type CreateAccessRequestInput = z.infer<typeof CreateAccessRequestInput>;

/** Append-only event on a request. IntelliHub owns this log; AppSheet drives transitions. */
export const AccessRequestEvent = z.object({
  id: z.string(),
  requestId: z.string(),
  status: RequestStatus,
  note: z.string().optional(),
  actor: z.string(),
  at: z.string(),
});
export type AccessRequestEvent = z.infer<typeof AccessRequestEvent>;

export const AccessRequest = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  productName: z.string(),
  productType: ProductType,
  family: z.string(),
  roleTier: RoleTier,
  justification: z.string(),
  currentStatus: RequestStatus,
  providerRef: z.string().nullable(), // AppSheet row key
  createdAt: z.string(),
  updatedAt: z.string(),
  events: z.array(AccessRequestEvent),
});
export type AccessRequest = z.infer<typeof AccessRequest>;

/** Effective entitlement, derived from the event log. */
export const AccessGrant = z.object({
  userId: z.string(),
  productId: z.string(),
  roleTier: RoleTier,
  grantedAt: z.string(),
});
export type AccessGrant = z.infer<typeof AccessGrant>;

/** IntelliBot response contract — stable across keyword router (P1) and GenAI (later). */
export const BotResponse = z.object({
  intro: z.string(),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: ProductType,
      icon: z.string(),
      accent: z.string(),
      desc: z.string(),
    }),
  ),
  kpis: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.string(),
      accent: z.string(),
    }),
  ),
  howto: z.string().optional(),
});
export type BotResponse = z.infer<typeof BotResponse>;

/** Session identity. Populated by OIDC in production; dev-mock in local. */
export const RoleName = z.enum([
  "executive",
  "territory",
  "business",
  "analyst",
  "intellihub_admin",
]);
export type RoleName = z.infer<typeof RoleName>;

export const SessionUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: RoleName,
  color: z.string(),
  roleLabel: z.string(),
});
export type SessionUser = z.infer<typeof SessionUser>;

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
  error?: null;
};

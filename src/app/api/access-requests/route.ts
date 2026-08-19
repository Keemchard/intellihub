import { NextRequest } from "next/server";
import { CreateAccessRequestInput } from "@/types";
import { getSession } from "@/lib/auth/session";
import { allowedTiers } from "@/lib/auth/roles";
import { getProductRaw } from "@/lib/data-access";
import { createRequest, listRequests, findOpenRequest, attachProviderRef } from "@/lib/data-access/access-store";
import { getAccessProvider } from "@/lib/access-provider";
import { ok, unauthorized, badRequest, notFound } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  const data = listRequests(session.id);
  return ok(data, { count: data.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = CreateAccessRequestInput.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);

  const product = await getProductRaw(parsed.data.productId);
  if (!product) return notFound();

  const family = product.domain?.domain_name ?? product.product_type ?? "";
  // Server-side enforcement: CYOD / Self-Serve exist only for Eagle Eye products.
  if (!allowedTiers(family).includes(parsed.data.roleTier)) {
    return badRequest({ roleTier: [`${parsed.data.roleTier} is not available for ${family}`] });
  }
  // Idempotency: never stack duplicate open requests.
  const existing = findOpenRequest(session.id, product.data_product_id ?? "");
  if (existing) return ok(existing, { deduped: true });

  const request = createRequest({
    userId: session.id,
    actor: session.name,
    productId: product.data_product_id ?? "",
    productName: product.name ?? "",
    productType: product.productType,
    family,
    roleTier: parsed.data.roleTier,
    justification: parsed.data.justification,
  });

  // Hand off to the workflow engine. A provider failure must not lose the request:
  // IntelliHub owns the record; the ref can be reconciled later.
  try {
    const { providerRef } = await getAccessProvider().submit(request);
    attachProviderRef(request.id, providerRef);
  } catch (err) {
    console.error("[access-requests] provider submit failed:", err);
  }

  return ok({ ...request, providerRef: request.providerRef }, { created: true });
}

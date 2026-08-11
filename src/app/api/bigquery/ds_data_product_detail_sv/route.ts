import { NextRequest } from "next/server";
import { bq } from "@/lib/bigquery-client";
import { getSession } from "@/lib/auth/session";
import { ok, unauthorized } from "@/lib/http";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => { params[k] = v; });
  const resp = await bq.productDetail(params);
  return ok(resp.data, resp.meta);
}

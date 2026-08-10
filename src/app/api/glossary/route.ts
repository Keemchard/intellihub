import { NextRequest } from "next/server";
import { bq } from "@/lib/bigquery-client";
import { getSession } from "@/lib/auth/session";
import { ok, unauthorized } from "@/lib/http";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const resp = await bq.glossary({
    term: sp.get("term") ?? undefined,
    category: sp.get("category") ?? undefined,
    status: sp.get("status") ?? undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : 100,
    offset: sp.get("offset") ? Number(sp.get("offset")) : undefined,
  });

  return ok(resp.data, { count: resp.data.length, total: resp.total });
}

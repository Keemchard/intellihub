import { NextRequest } from "next/server";
import { listProducts, getFacets } from "@/lib/data-access";
import { getSession } from "@/lib/auth/session";
import { ok, unauthorized } from "@/lib/http";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const sp = req.nextUrl.searchParams;
  const arr = (k: string) => sp.getAll(k).flatMap((v) => v.split(",")).filter(Boolean);
  const filters = {
    q: sp.get("q") ?? undefined,
    type: sp.get("type") ?? undefined,
    domain: arr("domain"),
    segment: arr("segment"),
    certification: arr("certification"),
    tags: arr("tags"),
    sort: sp.get("sort") ?? undefined,
  };
  const [data, facets] = await Promise.all([listProducts(session.id, filters), getFacets()]);
  return ok(data, { count: data.length, facets });
}

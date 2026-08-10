import { NextRequest } from "next/server";
import { z } from "zod";
import { routeQuery } from "@/lib/intellibot/router";
import { getSession } from "@/lib/auth/session";
import { ok, unauthorized, badRequest } from "@/lib/http";

const Body = z.object({ query: z.string().trim().min(1).max(300) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);
  // Contract is stable: a GenAI implementation swaps routeQuery() and nothing else.
  return ok(routeQuery(parsed.data.query));
}

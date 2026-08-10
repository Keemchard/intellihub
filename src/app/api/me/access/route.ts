import { getMyAccessSummary } from "@/lib/data-access";
import { getSession } from "@/lib/auth/session";
import { ok, unauthorized } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return ok(await getMyAccessSummary(session.id));
}

import { getSession } from "@/lib/auth/session";
import { getRequest } from "@/lib/data-access/access-store";
import { ok, unauthorized, notFound } from "@/lib/http";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const r = getRequest(id);
  // Ownership check — a user may only read their own request.
  if (!r || r.userId !== session.id) return notFound();
  return ok(r);
}

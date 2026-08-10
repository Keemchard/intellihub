import { getProduct } from "@/lib/data-access";
import { getSession } from "@/lib/auth/session";
import { ok, unauthorized, notFound } from "@/lib/http";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const data = await getProduct(session.id, id);
  return data ? ok(data) : notFound();
}

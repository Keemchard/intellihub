import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { RequestStatus } from "@/types";
import { appendStatus, getRequest } from "@/lib/data-access/access-store";

/**
 * Secured webhook: AppSheet -> IntelliHub status callback (event-driven, not polling).
 * Appends a new event to the request log. History is never mutated.
 */
const Payload = z.object({
  requestId: z.string().min(1),
  status: RequestStatus,
  note: z.string().max(500).optional(),
  actor: z.string().default("AppSheet Workflow"),
});

function authorized(req: NextRequest): boolean {
  const secret = process.env.APPSHEET_WEBHOOK_SECRET;
  // Local dev convenience: with no secret configured, allow (seed mode only).
  if (!secret) return process.env.NODE_ENV !== "production";
  const provided = req.headers.get("x-intellihub-signature") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = Payload.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { requestId, status, note, actor } = parsed.data;
  if (!getRequest(requestId)) return NextResponse.json({ error: "Unknown requestId" }, { status: 404 });

  const updated = appendStatus(requestId, status, actor, note);
  return NextResponse.json({ data: updated });
}

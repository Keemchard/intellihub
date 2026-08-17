import { NextRequest, NextResponse } from "next/server";
import { RoleName } from "@/types";
import { buildSessionUser, encodeSession, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Tranche 2 dev-mock sign-in. In production this route is replaced by the OIDC
 * authorization-code flow (/auth/callback exchanges the code and sets the same cookie),
 * so nothing downstream — middleware, RSC, BFF — changes.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = RoleName.safeParse(body?.role);
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const user = buildSessionUser(parsed.data);
  const res = NextResponse.json({ data: user });
  res.cookies.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

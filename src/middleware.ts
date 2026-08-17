import { NextResponse, type NextRequest } from "next/server";
import { SessionUser } from "@/types";
import { canAccessRoute } from "@/lib/auth/roles";

const SESSION_COOKIE = "ih_session";

/**
 * Edge route guard — first line of defense-in-depth.
 * (RSC/data-access and every BFF handler re-check the session independently;
 * middleware alone is never the authorization boundary.)
 */
function readSession(req: NextRequest) {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const json = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    const parsed = SessionUser.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = readSession(req);

  // Authenticated users never see the login screen.
  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/home", req.url)) : NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + search); // preserve return URL
    return NextResponse.redirect(url);
  }

  if (!canAccessRoute(pathname, session.role)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/home/:path*",
    "/marketplace/:path*",
    "/product/:path*",
    "/kpi/:path*",
    "/access/:path*",
    "/intellibot/:path*",
    "/admin/:path*",
  ],
};

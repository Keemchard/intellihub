import "server-only";
import { cookies } from "next/headers";
import { SessionUser, type RoleName } from "@/types";
import { ROLE_LABEL } from "./roles";

export const SESSION_COOKIE = "ih_session";

const DEV_USERS: Record<
  RoleName,
  { id: string; name: string; email: string; color: string }
> = {
  executive: {
    id: "maria",
    name: "Maria Santos",
    email: "maria.santos@nai.example",
    color: "#7C3AED",
  },
  territory: {
    id: "rodney",
    name: "Rodney Rodriguez",
    email: "rodney.r@nai.example",
    color: "#0EA5E9",
  },
  business: {
    id: "maria",
    name: "Maria Santos",
    email: "maria.santos@nai.example",
    color: "#7C3AED",
  },
  analyst: {
    id: "karen",
    name: "Karen Li",
    email: "karen.li@nai.example",
    color: "#F59E0B",
  },
  intellihub_admin: {
    id: "arjay",
    name: "Arjay Reyes",
    email: "arjay.reyes@nai.example",
    color: "#10B981",
  },
};

/** Builds the session payload for a role. Tranche 2 dev-mock; OIDC claims map here in production. */
export function buildSessionUser(role: RoleName) {
  const u = DEV_USERS[role];
  return SessionUser.parse({ ...u, role, roleLabel: ROLE_LABEL[role] });
}

/**
 * Reads the signed session. In production this verifies the OIDC-issued JWT
 * (AUTH_SECRET); locally it decodes the dev-mock cookie set at /login.
 */
export async function getSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = SessionUser.safeParse(
      JSON.parse(Buffer.from(raw, "base64url").toString("utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Use in RSC/route handlers where a session is mandatory. */
export async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  return s;
}

export function encodeSession(user: unknown) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

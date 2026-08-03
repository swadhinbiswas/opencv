import "server-only";
import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth/session";

/**
 * Shared guard for route handlers / server actions. Returns the session when
 * authenticated, or a 401 JSON response. Never trust a client-sent userId —
 * always derive it from the verified session.
 */
export async function requireUser(): Promise<
  | { session: SessionPayload }
  | { response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      response: NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }
  return { session };
}

export function unauth(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}
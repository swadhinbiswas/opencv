import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { ensureUserExists } from "@/lib/users";
import { MAX_AGE_SECONDS, SESSION_COOKIE, sessionSecret } from "@/lib/auth/session-constants";

export { SESSION_COOKIE };

function secret() {
  return new TextEncoder().encode(sessionSecret());
}

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("opencv")
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "opencv",
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

/** Sets the auth cookie on the outgoing response. */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

/** Reads and verifies the current request's session, if any. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;

  // Reconcile the users row so stale sessions (signed before a DB switch)
  // don't leave child rows pointing at a missing parent.
  try {
    await ensureUserExists(session);
  } catch (err) {
    console.error("Failed to reconcile user row for session:", err);
  }

  return session;
}
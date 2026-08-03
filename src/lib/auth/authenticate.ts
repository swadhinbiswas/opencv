import "server-only";
import { z } from "zod";
import { signSession } from "@/lib/auth/session";
import { verifyFirebaseIdToken } from "@/lib/auth/firebase-admin";
import { getUserForIdentity } from "@/lib/users";

const devLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
});

const firebaseLoginSchema = z.object({
  idToken: z.string().min(1),
});

/**
 * Core auth entrypoint shared by /api/auth/login and /api/auth/signup.
 *
 * Firebse mode:   verify the client ID token, upsert a user, return a session.
 * Dev mode:       accept account identity directly (no external backend) and
 *                 return a signed session — used for local development only.
 */
export async function authenticate(input: unknown): Promise<
  | { ok: true; sessionToken: string; userId: string; email: string }
  | { ok: false; error: string }
> {
  // Firebsse-behavior path first — a token always wins.
  if (isRecord(input) && typeof input.idToken === "string") {
    const parsed = firebaseLoginSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid token payload" };
    const identity = await verifyFirebaseIdToken(parsed.data.idToken);
    if (!identity) return { ok: false, error: "Token verification failed" };
    const user = await getUserForIdentity({
      email: identity.email ?? `${identity.uid}@opencv.local`,
      name: identity.name ?? undefined,
      firebaseUid: identity.uid,
    });
    const sessionToken = await signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    return { ok: true, sessionToken, userId: user.id, email: user.email };
  }

  // Dev-auth fallback (signup passes name; login may too).
  const parsed = devLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "A valid email, password and name are required" };
  }
  const user = await getUserOrIdentity({
    email: parsed.data.email,
    name: parsed.data.name,
  });
  const sessionToken = await signSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });
  return { ok: true, sessionToken, userId: user.id, email: user.email };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

async function getUserOrIdentity({
  email,
  name,
  firebaseUid,
}: {
  email: string;
  name?: string;
  firebaseUid?: string;
}) {
  return getUserForIdentity({ email, name, firebaseUid });
}
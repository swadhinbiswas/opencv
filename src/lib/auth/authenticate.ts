import "server-only";
import { z } from "zod";
import { signSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { verifyFirebaseIdToken } from "@/lib/auth/firebase-admin";
import { getUserForIdentity } from "@/lib/users";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { genId } from "@/lib/id";

export type AuthResult =
  | { ok: true; sessionToken: string; userId: string; email: string }
  | { ok: false; error: string };

const emailSchema = z.string().trim().email();

const firebaseLoginSchema = z.object({
  idToken: z.string().min(1),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  password: z.string().min(1),
});

/**
 * Password login for the built-in auth path.
 * Verifies the stored PBKDF2 hash; legacy accounts created before hashing
 * (passwordHash = NULL) are accepted as-is, but Firebase-only accounts must
 * use Google sign-in.
 */
export async function authenticateLogin(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "A valid email and password are required" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!user) {
    return { ok: false, error: "Invalid email or password" };
  }

  if (user.passwordHash) {
    const matches = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!matches) return { ok: false, error: "Invalid email or password" };
  } else if (user.firebaseUid) {
    // Firebase-created account with no local password — force Google sign-in.
    return { ok: false, error: "This account uses Google sign-in" };
  }

  const sessionToken = await signSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });
  return { ok: true, sessionToken, userId: user.id, email: user.email };
}

/**
 * Password signup for the built-in auth path. Creates the account with a
 * PBKDF2 hash of the password and returns a signed session.
 */
export async function authenticateSignup(input: unknown): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "A name, valid email and password are required" };
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing) {
    return { ok: false, error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [created] = await db
    .insert(users)
    .values({
      id: genId("usr"),
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    })
    .returning();

  const sessionToken = await signSession({
    userId: created.id,
    email: created.email,
    name: created.name,
  });
  return { ok: true, sessionToken, userId: created.id, email: created.email };
}

/**
 * Dispatcher for /api/auth/login. Firebase ID tokens and email/password
 * logins share the endpoint.
 */
export async function authenticate(input: unknown): Promise<AuthResult> {
  if (isRecord(input) && typeof input.idToken === "string") {
    return authenticateFirebase(input);
  }
  return authenticateLogin(input);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Firebase ID-token path — verifies the client token, upserts a user, and
 * returns a session. Used for Google sign-in.
 */
export async function authenticateFirebase(input: unknown): Promise<AuthResult> {
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

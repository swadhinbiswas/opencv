import "server-only";
import { genId } from "@/lib/id";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface AuthIdentity {
  email: string;
  name?: string;
  firebaseUid?: string;
}

/**
 * Resolves an identity to a `users` row, creating one on first appearance.
 * `firebaseUid` is preferred as the stable key when present (real auth),
 * otherwise the row is keyed/looked up by email (dev-auth fallback).
 */
export async function getUserForIdentity(identity: AuthIdentity) {
  const { email, name, firebaseUid } = identity;

  const existing = await db
    .select()
    .from(users)
    .where(firebaseUid
      ? eq(users.firebaseUid, firebaseUid)
      : eq(users.email, email))
    .limit(1);

  if (existing.length) {
    const user = existing[0];
    // Back-fill firebaseUid on the first Firebase login for a dev-created user.
    if (firebaseUid && !user.firebaseUid) {
      const updated = await db
        .update(users)
        .set({ firebaseUid, name: user.name || name || user.name })
        .where(eq(users.id, user.id))
        .returning();
      return updated[0] ?? user;
    }
    return user;
  }

  const [created] = await db
    .insert(users)
    .values({
      id: genId("usr"),
      email,
      name: name ?? "",
      firebaseUid,
    })
    .returning();
  return created;
}

/**
 * Ensures a `users` row exists for a verified session's identity. Sessions are
 * self-contained (signed JWT), so after a DB switch (e.g. local file → Turso)
 * or a restored backup the cookie can reference a user that no longer exists.
 * Recreating the row here keeps foreign-key child rows (master_profiles, CVs,
 * jobs, …) from failing on their parent lookup.
 */
export async function ensureUserExists(session: {
  userId: string;
  email: string;
  name?: string;
}): Promise<void> {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (existing) return;

  await db.insert(users).values({
    id: session.userId,
    email: session.email,
    name: session.name ?? "",
  });
}
import "server-only";
import { firebaseAdminConfigured, getFirebaseUserByEmail, deleteFirebaseUser } from "@/lib/auth/firebase-admin";

/** Resolve the Firebase UID for a user row, if any. */
export async function getFirebaseUid(user: { firebaseUid?: string | null; email: string }): Promise<string | null> {
  if (user.firebaseUid) return user.firebaseUid;
  if (!firebaseAdminConfigured()) return null;
  const record = await getFirebaseUserByEmail(user.email);
  return record?.uid ?? null;
}

/** Delete the Firebase auth account for a UID (no-op when not configured). */
export async function deleteFirebaseUserAccount(uid: string | null): Promise<void> {
  if (!uid || !firebaseAdminConfigured()) return;
  await deleteFirebaseUser(uid);
}

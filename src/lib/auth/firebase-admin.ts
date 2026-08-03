import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";

/**
 * Edge-compatible Firebase Admin replacement.
 * Uses jose for JWT verification + Firebase REST API for user management.
 * No Node.js dependencies — works on Cloudflare Workers.
 */

const GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const FIREBASE_AUTH_API = "https://identitytoolkit.googleapis.com/v1/accounts";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_CERTS_URL));
  }
  return jwks;
}

/** Mint a Google OAuth2 access token from the service account. */
async function getAccessToken(): Promise<string> {
  const { projectId, clientEmail, privateKey } = env.firebaseAdmin;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase service account credentials not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/identity.platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const { importPKCS8, SignJWT } = await import("jose");
  const key = await importPKCS8(privateKey, "RS256");
  const jwt = await new SignJWT(payload)
    .setProtectedHeader(header)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Failed to mint Firebase access token");
  return data.access_token;
}

export function firebaseAdminConfigured(): boolean {
  return env.FIREBASE_SERVER_CONFIGURED;
}

/**
 * Verifies a Firebase ID token using Google's public JWK set.
 * Works on any runtime (Node.js, Edge, Cloudflare Workers).
 */
export async function verifyFirebaseIdToken(token: string): Promise<
  { uid: string; email: string | null; name?: string | null } | null
> {
  if (!env.FIREBASE_SERVER_CONFIGURED) return null;
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: `https://securetoken.google.com/${env.firebaseAdmin.projectId}`,
      audience: env.firebaseAdmin.projectId,
    });
    return {
      uid: payload.sub!,
      email: (payload as JWTPayload & { email?: string }).email ?? null,
      name: (payload as JWTPayload & { name?: string }).name ?? null,
    };
  } catch (err) {
    console.error("[firebase] token verification failed", err);
    return null;
  }
}

/**
 * Look up a Firebase user by email via REST API.
 * Returns { uid } or null.
 */
export async function getFirebaseUserByEmail(email: string): Promise<{ uid: string } | null> {
  if (!env.FIREBASE_SERVER_CONFIGURED) return null;
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `${FIREBASE_AUTH_API}:lookup?key=${env.firebase.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      },
    );
    const data = (await res.json()) as { users?: { localId: string }[] };
    if (data.users?.length) return { uid: data.users[0].localId };
    return null;
  } catch {
    return null;
  }
}

/**
 * Delete a Firebase user by UID via REST API.
 * Best-effort: local DB deletion is authoritative.
 */
export async function deleteFirebaseUser(uid: string | null): Promise<void> {
  if (!uid || !env.FIREBASE_SERVER_CONFIGURED) return;
  try {
    const token = await getAccessToken();
    await fetch(
      `${FIREBASE_AUTH_API}/${uid}?key=${env.firebase.apiKey}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
  } catch {
    // Best-effort
  }
}

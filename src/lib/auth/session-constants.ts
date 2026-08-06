// Edge-safe shared constant. No server-only deps — safe to import from proxy.
export const SESSION_COOKIE = "rf_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Single source of truth for the signing key. Reads the env var lazily so it
// works in the proxy (edge) and in server components / route handlers alike.
export function sessionSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

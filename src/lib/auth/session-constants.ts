// Edge-safe shared constant. No server-only deps — safe to import from proxy.
export const SESSION_COOKIE = "rf_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
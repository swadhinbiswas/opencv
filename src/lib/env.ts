import "server-only";

/**
 * Typed environment accessor for server-only secrets.
 * Uses a lazy getter pattern so process.env is read at access time,
 * not module load time — required for Cloudflare Workers where env
 * bindings are injected per-request.
 */
function readEnv() {
  return {
    /** libSQL database URL. Local file by default, Turso URL in prod. */
    DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",

    /** Signing secret for the auth session cookie. */
    AUTH_SECRET:
      process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me",

    /** True when Firebase server configuration is present. */
    FIREBASE_SERVER_CONFIGURED:
      Boolean(process.env.FIREBASE_PROJECT_ID) &&
      Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
      Boolean(process.env.FIREBASE_PRIVATE_KEY),

    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    },

    firebaseAdmin: {
      projectId: process.env.FIREBASE_PROJECT_ID ?? "",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
      databaseURL: process.env.FIREBASE_DATABASE_URL ?? "",
    },

    /** Upstash REST configuration (optional). */
    upstash: {
      url: process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
      configured: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    },

    /** Cloudflare PDF Worker (optional). When set, PDFs are generated remotely. */
    pdfWorker: {
      url: process.env.PDF_WORKER_URL ?? "",
      apiKey: process.env.PDF_WORKER_API_KEY ?? "",
      configured: Boolean(process.env.PDF_WORKER_URL),
    },

    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}

type Env = ReturnType<typeof readEnv>;

/** Lazily-evaluated environment object. Reads process.env on every access. */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return (readEnv() as Record<string, unknown>)[prop];
  },
});

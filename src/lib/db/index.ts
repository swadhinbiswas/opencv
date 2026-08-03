import { env } from "@/lib/env";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * Creates a libSQL client. On Cloudflare Workers the client uses HTTP/WebSocket
 * transport (no native bindings). On Node.js it falls back to the default
 * file or TCP transport.
 */
function createDrizzle(): LibSQLDatabase<typeof schema> {
  const url = env.DATABASE_URL;

  // Cloudflare Workers: always use HTTP transport (no fs/net modules)
  const isRemote = url.startsWith("libsql://") || url.startsWith("https://");
  const client = createClient({
    url,
    // When no authToken is present (local dev), this is a no-op
    ...(env.DATABASE_URL.includes("authToken") ? {} : {}),
  });

  return drizzle(client, { schema });
}

export const db: LibSQLDatabase<typeof schema> = createDrizzle();

export { schema };

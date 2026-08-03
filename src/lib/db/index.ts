import { env } from "@/lib/env";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * Creates a libSQL client with Turso support.
 * Uses HTTP/WebSocket transport for remote databases (Cloudflare Workers compatible).
 * Falls back to file-based local database for development.
 */
function createDrizzle(): LibSQLDatabase<typeof schema> {
  const url = env.DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  return drizzle(client, { schema });
}

export const db: LibSQLDatabase<typeof schema> = createDrizzle();

export { schema };

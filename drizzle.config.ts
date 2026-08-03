import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const token = process.env.TURSO_AUTH_TOKEN;

// For Turso, embed the authToken in the URL so drizzle-kit can connect
const dbUrl = token && url.startsWith("libsql://")
  ? `${url}?authToken=${token}`
  : url;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
  },
  strict: true,
  verbose: true,
});

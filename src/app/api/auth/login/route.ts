import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cache, key } from "@/lib/cache/cache";
import { getRatelimit } from "@/lib/cache/rate-limit";
import { authenticate } from "@/lib/auth/authenticate";
import { setSessionCookie } from "@/lib/auth/session";

const COOLDOWN_MS = 2_000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";

  const limited = await getRatelimit("auth", { limit: 20, windowSeconds: 60 });
  const check = await limited.limit(`auth:${ip}`);
  if (!check.success) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Coalesce rapid duplicate submissions.
  const burstKey = key("auth:burst", ip);
  const last = await cache.get(burstKey);
  if (last && typeof last === "number" && Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json(
      { ok: false, error: "Please wait a moment before trying again." },
      { status: 429 },
    );
  }
  await cache.set(burstKey, Date.now(), 10);

  const result = await authenticate(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.sessionToken);
  return NextResponse.json({
    ok: true,
    data: { userId: result.userId, email: result.email },
  });
}
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth/authenticate";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

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
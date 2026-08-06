import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: true, data: null });
  }
  return NextResponse.json({
    ok: true,
    data: { userId: session.userId, email: session.email, name: session.name },
  });
}



export const dynamic = "force-dynamic";
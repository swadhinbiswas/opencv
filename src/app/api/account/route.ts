import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getUserInfo, deleteUserAccount } from "@/lib/account/service";
import { clearSessionCookie } from "@/lib/auth/session";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const info = await getUserInfo(auth.session.userId);
  if (!info) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: info });
}

export async function DELETE(_request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const ok = await deleteUserAccount(auth.session.userId);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true });
  await clearSessionCookie();
  return res;
}

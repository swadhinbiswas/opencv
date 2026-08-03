import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getFullProfile, getMasterProfile, updateProfileMeta } from "@/lib/profile/service";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const full = await getFullProfile(auth.session.userId);
  return NextResponse.json({ ok: true, data: full });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const profile = await getMasterProfile(auth.session.userId);
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  try {
    const meta = await updateProfileMeta(profile.id, body);
    return NextResponse.json({ ok: true, data: { headline: meta.headline, personalInfo: meta.personalInfo } });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Invalid profile data" },
      { status: 400 },
    );
  }
}
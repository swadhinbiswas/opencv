import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getMasterProfile } from "@/lib/profile/service";
import { isProfileSection, reorderSection } from "@/lib/profile/sections";
import { z } from "zod";

const reorderSchema = z.object({
  section: z.string(),
  ids: z.array(z.string()), // client-provided ordering (includes removed? no: live array)
});

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Malformed reorder payload" }, { status: 400 });
  }

  const { section: key, ids } = parsed.data;
  if (!isProfileSection(key)) {
    return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  }

  const profile = await getMasterProfile(auth.session.userId);
  await reorderSection(key, ids, profile.id);
  return NextResponse.json({ ok: true });
}
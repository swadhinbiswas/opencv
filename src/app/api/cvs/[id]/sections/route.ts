import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { updateCvSections, type SectionPatch } from "@/lib/cv/service";
import { SECTION_LABELS, type SectionKey } from "@/lib/cv/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const raw = Array.isArray(body?.sections) ? body.sections : null;
  if (!raw) {
    return NextResponse.json({ ok: false, error: "Expected a sections array" }, { status: 400 });
  }

  const patches: SectionPatch[] = [];
  for (const r of raw) {
    if (!r || typeof r.sectionType !== "string" || !(r.sectionType in SECTION_LABELS)) continue;
    const p: SectionPatch = { sectionType: r.sectionType as SectionKey };
    if (typeof r.isVisible === "boolean") p.isVisible = r.isVisible;
    if (Number.isInteger(r.orderIndex)) p.orderIndex = r.orderIndex;
    patches.push(p);
  }

  const data = await updateCvSections(id, auth.session.userId, patches);
  if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data });
}
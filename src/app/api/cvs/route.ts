import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { createCv, listCvs } from "@/lib/cv/service";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const cvs = await listCvs(auth.session.userId);
  return NextResponse.json({ ok: true, data: cvs });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const templateId = body?.templateId;
  if (typeof templateId !== "string" || !templateId) {
    return NextResponse.json({ ok: false, error: "templateId is required" }, { status: 400 });
  }

  try {
    const cv = await createCv(auth.session.userId, {
      templateId,
      name: typeof body?.name === "string" ? body.name : undefined,
    });
    return NextResponse.json({ ok: true, data: cv }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create CV";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { deleteCv, getCv, updateCv } from "@/lib/cv/service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const data = await getCv(id, auth.session.userId);
  if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const patch: {
    name?: string;
    status?: "draft" | "ready" | "archived";
    templateId?: string;
    settings?: Record<string, unknown>;
  } = {};
  if (typeof body?.name === "string") patch.name = body.name;
  if (["draft", "ready", "archived"].includes(body?.status)) patch.status = body.status;
  if (typeof body?.templateId === "string") patch.templateId = body.templateId;
  if (body?.settings && typeof body.settings === "object") patch.settings = body.settings;

  try {
    const data = await updateCv(id, auth.session.userId, patch);
    if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update CV";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const ok = await deleteCv(id, auth.session.userId);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
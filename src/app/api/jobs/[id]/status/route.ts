import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { setJobStatus } from "@/lib/jobs/service";
import { jobStatusSchema } from "@/lib/validations/jobs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = jobStatusSchema.safeParse(body?.status);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const data = await setJobStatus(id, auth.session.userId, parsed.data, typeof body?.note === "string" ? body.note : "");
  if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data });
}
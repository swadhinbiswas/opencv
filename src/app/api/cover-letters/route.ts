import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { createLetter, listLetters } from "@/lib/cover-letters/service";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const letters = await listLetters(auth.session.userId);
  return NextResponse.json({ ok: true, data: letters });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null);
  const input = {
    name: typeof body?.name === "string" ? body.name : undefined,
    templateId: typeof body?.templateId === "string" ? body.templateId : undefined,
    cvId: typeof body?.cvId === "string" ? body.cvId : undefined,
    jobId: typeof body?.jobId === "string" ? body.jobId : undefined,
  };

  const letter = await createLetter(auth.session.userId, input);
  return NextResponse.json({ ok: true, data: letter }, { status: 201 });
}
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { addJobEvent } from "@/lib/jobs/service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  try {
    const data = await addJobEvent(id, auth.session.userId, body);
    if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "ZodError"
        ? "There's an error in one of the fields."
        : err instanceof Error
          ? err.message
          : "Could not add event";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
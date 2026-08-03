import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { createJob, listJobs } from "@/lib/jobs/service";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const jobs = await listJobs(auth.session.userId);
  return NextResponse.json({ ok: true, data: jobs });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  try {
    const data = await createJob(auth.session.userId, body);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "ZodError"
        ? "There's an error in one of the fields."
        : err instanceof Error
          ? err.message
          : "Could not create job";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
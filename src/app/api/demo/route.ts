import "server-only";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { seedDemoData } from "@/lib/sample-data";

export async function POST() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const result = await seedDemoData(auth.session.userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load sample data";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getCvTemplates } from "@/lib/cv/templates";
import { getLetterTemplates } from "@/lib/cover-letters/templates";

/** Returns CV templates by default; pass ?type=letter for letter templates. */
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const type = request.nextUrl.searchParams.get("type") ?? "cv";
  const data = type === "letter" ? await getLetterTemplates() : await getCvTemplates();
  return NextResponse.json({ ok: true, data });
}

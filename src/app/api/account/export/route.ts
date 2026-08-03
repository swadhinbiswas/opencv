import "server-only";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { exportUserData } from "@/lib/account/service";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const data = await exportUserData(auth.session.userId);
  if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const body = JSON.stringify(data, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="opencv-export-${data.user.email.replace(/[^a-z0-9@.-]/gi, "").replace(/@/g, "-")}.json"`,
    },
  });
}

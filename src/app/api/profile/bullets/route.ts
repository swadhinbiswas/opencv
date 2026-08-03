import "server-only";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getMasterProfile } from "@/lib/profile/service";
import {
  createBullet,
  deleteBullet,
  reorderBullets,
  updateBullet,
} from "@/lib/profile/sections";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experienceBlocks } from "@/lib/db/schema";

async function ownsExperience(userId: string, experienceId: string) {
  const profile = await getMasterProfile(userId);
  const [row] = await db
    .select({ id: experienceBlocks.id })
    .from(experienceBlocks)
    .where(
      and(
        eq(experienceBlocks.id, experienceId),
        eq(experienceBlocks.masterProfileId, profile.id),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);

  // Reorder path: { action: "reorder", experienceId, ids[] }
  if (body?.action === "reorder") {
    const experienceId = body.experienceId as string | undefined;
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    if (!experienceId || !(await ownsExperience(auth.session.userId, experienceId))) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    await reorderBullets(experienceId, ids);
    return NextResponse.json({ ok: true });
  }

  const experienceId = body?.experienceId as string | undefined;
  if (!experienceId || !(await ownsExperience(auth.session.userId, experienceId))) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  try {
    const bullet = await createBullet(experienceId, body?.data ?? body);
    return NextResponse.json({ ok: true, data: bullet }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Invalid bullet" },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  try {
    const bullet = await updateBullet(id, body?.data ?? body);
    return NextResponse.json({ ok: true, data: bullet });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Invalid bullet" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  await deleteBullet(id);
  return NextResponse.json({ ok: true });
}
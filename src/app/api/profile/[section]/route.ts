import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getMasterProfile } from "@/lib/profile/service";
import {
  createBlock,
  deleteBlock,
  isProfileSection,
  replaceSection,
  updateBlockById,
  type ProfileSectionKey,
} from "@/lib/profile/sections";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { section } from "@/lib/profile/sections";

type Ctx = { params: Promise<{ section: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { section: key } = await params;
  if (!isProfileSection(key)) {
    return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  }

  const profile = await getMasterProfile(auth.session.userId);
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  try {
    const row = await createBlock(key, profile.id, body.data ?? body);
    return NextResponse.json({ ok: true, data: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: errMessage(err) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { section: key } = await params;
  if (!isProfileSection(key)) {
    return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  if (!(await verifyOwned(auth.session.userId, key, id))) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  try {
    const row = await updateBlockById(key, id, body.data ?? body);
    return NextResponse.json({ ok: true, data: row });
  } catch (err) {
    const notFound = err instanceof Error && err.message === "Not found";
    return NextResponse.json(
      { ok: false, error: notFound ? "Not found" : errMessage(err) },
      { status: notFound ? 404 : 400 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { section: key } = await params;
  if (!isProfileSection(key)) {
    return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  if (!(await verifyOwned(auth.session.userId, key, id))) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await deleteBlock(key, id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { section: key } = await params;
  if (!isProfileSection(key)) {
    return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  }

  const profile = await getMasterProfile(auth.session.userId);
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items) {
    return NextResponse.json({ ok: false, error: "Expected an items array" }, { status: 400 });
  }

  try {
    await replaceSection(key, profile.id, items);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: errMessage(err) }, { status: 400 });
  }
}

export async function verifyOwned(userId: string, key: ProfileSectionKey, id: string) {
  const profile = await getMasterProfile(userId);
  const conf = section[key];
  const [row] = await db
    .select({ id: conf.table.id })
    .from(conf.table)
    .where(and(eq(conf.table.id, id), eq(conf.table[conf.ownerCol], profile.id)))
    .limit(1);
  return Boolean(row);
}

function errMessage(err: unknown) {
  if (err instanceof Error) {
    if (err.name === "ZodError") return "There's an error in one of the fields.";
    return err.message;
  }
  return "Invalid request";
}
import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { genId } from "@/lib/id";
import {
  coverLetterPatchSchema,
  emptyLetterContent,
  type LetterContent,
} from "@/lib/validations/cover-letters";
import { getLetterTemplateTokens } from "@/lib/cover-letters/templates";

function owned(row: { userId: string } | undefined, userId: string) {
  return Boolean(row && row.userId === userId);
}

export async function listLetters(userId: string) {
  const rows = await db
    .select({
      letter: s.coverLetters,
      templateName: s.templates.name,
      jobCompany: s.jobs.company,
      jobRole: s.jobs.role,
      cvName: s.cvs.name,
    })
    .from(s.coverLetters)
    .leftJoin(s.templates, eq(s.templates.id, s.coverLetters.templateId))
    .leftJoin(s.jobs, eq(s.jobs.id, s.coverLetters.jobId))
    .leftJoin(s.cvs, eq(s.cvs.id, s.coverLetters.cvId))
    .where(eq(s.coverLetters.userId, userId))
    .orderBy(desc(s.coverLetters.updatedAt));

  return rows.map((r) => ({
    ...r.letter,
    content: (r.letter.content ?? {}) as LetterContent,
    templateName: r.templateName ?? null,
    jobCompany: r.jobCompany ?? null,
    jobRole: r.jobRole ?? null,
    cvName: r.cvName ?? null,
  }));
}

export async function getLetter(letterId: string, userId: string) {
  const [letter] = await db
    .select()
    .from(s.coverLetters)
    .where(eq(s.coverLetters.id, letterId))
    .limit(1);
  if (!owned(letter, userId)) return null;

  const [template] = letter.templateId
    ? await db.select().from(s.templates).where(eq(s.templates.id, letter.templateId)).limit(1)
    : [];
  const [job] = letter.jobId
    ? await db.select().from(s.jobs).where(eq(s.jobs.id, letter.jobId)).limit(1)
    : [];
  const [cv] = letter.cvId
    ? await db.select().from(s.cvs).where(eq(s.cvs.id, letter.cvId)).limit(1)
    : [];
  const tokens = await getLetterTemplateTokens(letter.templateId);

  return {
    ...letter,
    content: (letter.content ?? {}) as LetterContent,
    templateName: template?.name ?? null,
    templateStyle: tokens.style,
    templateAccent: tokens.accent,
    templateFont: tokens.font,
    job: job ? { company: job.company, role: job.role } : null,
    cvName: cv?.name ?? null,
  };
}

/** Letters paired to a specific CV, newest first. */
export async function listLettersForCv(cvId: string, userId: string) {
  const rows = await db
    .select({
      letter: s.coverLetters,
      templateName: s.templates.name,
    })
    .from(s.coverLetters)
    .leftJoin(s.templates, eq(s.templates.id, s.coverLetters.templateId))
    .where(eq(s.coverLetters.cvId, cvId))
    .orderBy(desc(s.coverLetters.updatedAt));

  return rows
    .filter((r) => r.letter.userId === userId)
    .map((r) => ({
      ...r.letter,
      content: (r.letter.content ?? {}) as LetterContent,
      templateName: r.templateName ?? null,
    }));
}

export async function createLetter(
  userId: string,
  input: { name?: string; templateId?: string; cvId?: string; jobId?: string },
) {
  const id = genId("let");
  await db.insert(s.coverLetters).values({
    id,
    userId,
    cvId: input.cvId || null,
    templateId: input.templateId || null,
    jobId: input.jobId || null,
    name: input.name?.trim() || "Untitled letter",
    content: emptyLetterContent(),
  });
  return getLetter(id, userId);
}

export async function updateLetter(letterId: string, userId: string, raw: unknown) {
  const parsed = coverLetterPatchSchema.parse(raw);
  const [letter] = await db
    .select()
    .from(s.coverLetters)
    .where(eq(s.coverLetters.id, letterId))
    .limit(1);
  if (!owned(letter, userId)) return null;

  const content = (letter.content ?? {}) as LetterContent;
  const set: Partial<typeof s.coverLetters.$inferInsert> = {};

  if (parsed.name !== undefined) set.name = parsed.name.trim() || "Untitled letter";
  if (parsed.cvId !== undefined) set.cvId = parsed.cvId;
  if (parsed.templateId !== undefined) set.templateId = parsed.templateId;
  if (parsed.jobId !== undefined) set.jobId = parsed.jobId;
  if (parsed.content !== undefined) {
    set.content = { ...content, ...parsed.content };
  }

  if (Object.keys(set).length) {
    await db.update(s.coverLetters).set(set).where(eq(s.coverLetters.id, letterId));
  }
  return getLetter(letterId, userId);
}

export async function deleteLetter(letterId: string, userId: string) {
  const [letter] = await db
    .select()
    .from(s.coverLetters)
    .where(eq(s.coverLetters.id, letterId))
    .limit(1);
  if (!owned(letter, userId)) return false;
  await db.delete(s.coverLetters).where(eq(s.coverLetters.id, letterId));
  return true;
}
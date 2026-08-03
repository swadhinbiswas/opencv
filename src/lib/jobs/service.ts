import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { genId } from "@/lib/id";
import { jobEventSchema, jobPatchSchema, jobSchema } from "@/lib/validations/jobs";

function owned(row: { userId: string } | undefined, userId: string) {
  return Boolean(row && row.userId === userId);
}

export async function listJobs(userId: string) {
  const jobs = await db
    .select()
    .from(s.jobs)
    .where(eq(s.jobs.userId, userId))
    .orderBy(desc(s.jobs.updatedAt));

  const events =
    jobs.length > 0
      ? await db
          .select({
            jobId: s.jobEvents.jobId,
            createdAt: s.jobEvents.createdAt,
            type: s.jobEvents.type,
          })
          .from(s.jobEvents)
          .where(inArray(s.jobEvents.jobId, jobs.map((j) => j.id)))
          .orderBy(asc(s.jobEvents.createdAt))
      : [];

  const latest = new Map<string, { type: string; createdAt: string }>();
  for (const e of events) latest.set(e.jobId, { type: e.type, createdAt: e.createdAt });

  return jobs.map((j) => ({ ...j, latestEvent: latest.get(j.id) ?? null }));
}

export async function getJob(jobId: string, userId: string) {
  const [job] = await db.select().from(s.jobs).where(eq(s.jobs.id, jobId)).limit(1);
  if (!owned(job, userId)) return null;
  const events = await db
    .select()
    .from(s.jobEvents)
    .where(eq(s.jobEvents.jobId, jobId))
    .orderBy(asc(s.jobEvents.createdAt));
  return { job, events };
}

export async function createJob(userId: string, raw: unknown) {
  const parsed = jobSchema.parse(raw);
  const id = genId("job");
  await db.insert(s.jobs).values({
    id,
    userId,
    company: parsed.company,
    role: parsed.role,
    jobUrl: parsed.jobUrl || null,
    status: parsed.status,
    salaryRange: parsed.salaryRange || null,
    contactName: parsed.contactName || null,
    notes: parsed.notes || null,
    followUpDate: parsed.followUpDate || null,
    cvId: parsed.cvId || null,
  });
  await db.insert(s.jobEvents).values({
    id: genId("ev"),
    jobId: id,
    type: parsed.status === "wishlist" ? "Added to wishlist" : `Moved to ${parsed.status}`,
    note: "",
  });
  return getJob(id, userId);
}

export async function updateJob(jobId: string, userId: string, raw: unknown) {
  const parsed = jobPatchSchema.parse(raw);
  const [job] = await db.select().from(s.jobs).where(eq(s.jobs.id, jobId)).limit(1);
  if (!owned(job, userId)) return null;

  const set: Partial<typeof s.jobs.$inferInsert> = {};
  if (parsed.company !== undefined) set.company = parsed.company;
  if (parsed.role !== undefined) set.role = parsed.role;
  if (parsed.jobUrl !== undefined) set.jobUrl = parsed.jobUrl;
  if (parsed.status !== undefined) set.status = parsed.status;
  if (parsed.salaryRange !== undefined) set.salaryRange = parsed.salaryRange;
  if (parsed.contactName !== undefined) set.contactName = parsed.contactName;
  if (parsed.notes !== undefined) set.notes = parsed.notes;
  if (parsed.followUpDate !== undefined) set.followUpDate = parsed.followUpDate;
  if (parsed.cvId !== undefined) set.cvId = parsed.cvId;
  if (Object.keys(set).length) {
    await db.update(s.jobs).set(set).where(eq(s.jobs.id, jobId));
  }
  return getJob(jobId, userId);
}

export async function setJobStatus(jobId: string, userId: string, status: string, note = "") {
  const [job] = await db.select().from(s.jobs).where(eq(s.jobs.id, jobId)).limit(1);
  if (!owned(job, userId)) return null;
  if (status === job.status) return getJob(jobId, userId);

  await db
    .update(s.jobs)
    .set({ status: status as (typeof s.jobs.$inferInsert)["status"] })
    .where(eq(s.jobs.id, jobId));
  await db.insert(s.jobEvents).values({
    id: genId("ev"),
    jobId,
    type: `Moved to ${status}`,
    note,
  });
  return getJob(jobId, userId);
}

export async function addJobEvent(jobId: string, userId: string, raw: unknown) {
  const [job] = await db.select().from(s.jobs).where(eq(s.jobs.id, jobId)).limit(1);
  if (!owned(job, userId)) return null;

  const parsed = jobEventSchema.parse(raw);
  await db.insert(s.jobEvents).values({
    id: genId("ev"),
    jobId,
    type: parsed.type,
    note: parsed.note || "",
  });
  await db
    .update(s.jobs)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(s.jobs.id, jobId));
  return getJob(jobId, userId);
}

export async function deleteJob(jobId: string, userId: string) {
  const [job] = await db.select().from(s.jobs).where(eq(s.jobs.id, jobId)).limit(1);
  if (!owned(job, userId)) return false;
  await db.delete(s.jobs).where(eq(s.jobs.id, jobId));
  return true;
}
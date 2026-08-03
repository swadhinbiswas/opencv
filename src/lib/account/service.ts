import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getMasterProfile } from "@/lib/profile/service";
import { getFirebaseUid, deleteFirebaseUserAccount } from "@/lib/auth/account-firebase";

/** Gathers every piece of the user's data into one JSON-serializable object. */
export async function exportUserData(userId: string) {
  const [user] = await db.select().from(s.users).where(eq(s.users.id, userId)).limit(1);
  if (!user) return null;

  const profile = await getMasterProfile(userId);
  const pid = profile.id;

  const [
    summaries,
    experience,
    bullets,
    education,
    skills,
    languages,
    certifications,
    projects,
    publications,
    awards,
    volunteer,
    references,
    customSections,
    cvs,
    letters,
    jobs,
  ] = await Promise.all([
    db.select().from(s.summaries).where(eq(s.summaries.masterProfileId, pid)),
    db.select().from(s.experienceBlocks).where(eq(s.experienceBlocks.masterProfileId, pid)),
    db.select().from(s.experienceBullets),
    db.select().from(s.educationBlocks).where(eq(s.educationBlocks.masterProfileId, pid)),
    db.select().from(s.skills).where(eq(s.skills.masterProfileId, pid)),
    db.select().from(s.languages).where(eq(s.languages.masterProfileId, pid)),
    db.select().from(s.certifications).where(eq(s.certifications.masterProfileId, pid)),
    db.select().from(s.projects).where(eq(s.projects.masterProfileId, pid)),
    db.select().from(s.publications).where(eq(s.publications.masterProfileId, pid)),
    db.select().from(s.awards).where(eq(s.awards.masterProfileId, pid)),
    db.select().from(s.volunteerBlocks).where(eq(s.volunteerBlocks.masterProfileId, pid)),
    db.select().from(s.references).where(eq(s.references.masterProfileId, pid)),
    db.select().from(s.customSections).where(eq(s.customSections.masterProfileId, pid)),
    db.select().from(s.cvs).where(eq(s.cvs.userId, userId)),
    db.select().from(s.coverLetters).where(eq(s.coverLetters.userId, userId)),
    db.select().from(s.jobs).where(eq(s.jobs.userId, userId)),
  ]);

  const expIds = experience.map((e) => e.id);
  const scopedBullets = bullets.filter((b) => expIds.includes(b.experienceBlockId));
  const cvIds = cvs.map((c) => c.id);
  const cvSections = cvIds.length
    ? await db.select().from(s.cvSections).where(inArray(s.cvSections.cvId, cvIds))
    : [];
  const jobIds = jobs.map((j) => j.id);
  const jobEvents = jobIds.length
    ? await db.select().from(s.jobEvents).where(inArray(s.jobEvents.jobId, jobIds))
    : [];

  return {
    exportedAt: new Date().toISOString(),
    app: "OpenCV",
    user: {
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    },
    masterProfile: {
      headline: profile.headline,
      personalInfo: profile.personalInfo,
      summaries,
      experience: experience.map((e) => ({ ...e, bullets: scopedBullets.filter((b) => b.experienceBlockId === e.id) })),
      education,
      skills,
      languages,
      certifications,
      projects,
      publications,
      awards,
      volunteer,
      references,
      customSections,
    },
    cvs: cvs.map((c) => ({ ...c, sections: cvSections.filter((sec) => sec.cvId === c.id) })),
    coverLetters: letters,
    jobs: jobs.map((j) => ({ ...j, events: jobEvents.filter((e) => e.jobId === j.id) })),
  };
}

/** Hard-deletes the user and all cascade-owned rows, plus the Firebase account. */
export async function deleteUserAccount(userId: string) {
  const [user] = await db.select().from(s.users).where(eq(s.users.id, userId)).limit(1);
  if (!user) return false;

  const uid = await getFirebaseUid(user);
  await deleteFirebaseUserAccount(uid);

  await db.delete(s.users).where(eq(s.users.id, userId));
  return true;
}

export async function getUserInfo(userId: string) {
  const [user] = await db.select().from(s.users).where(eq(s.users.id, userId)).limit(1);
  if (!user) return null;
  return { email: user.email, name: user.name, plan: user.plan, createdAt: user.createdAt };
}

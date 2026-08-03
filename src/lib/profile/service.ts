import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { genId } from "@/lib/id";
import { profileMetaSchema } from "@/lib/validations/profile";

/** Fetch the user's master profile row, creating one on first access. */
export async function getMasterProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(s.masterProfiles)
    .where(eq(s.masterProfiles.userId, userId))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(s.masterProfiles)
    .values({ id: genId("mp"), userId, personalInfo: {} })
    .returning();
  return created;
}

/** Fully hydrate a user's profile: meta + every section + experience bullets. */
export async function getFullProfile(userId: string) {
  const profile = await getMasterProfile(userId);

  const [summaries, experience, bullets, education, skills, languages, certifications, projects, publications, awards, volunteer, references, customSections] =
    await Promise.all([
      db.select().from(s.summaries).where(eq(s.summaries.masterProfileId, profile.id)),
      db.select().from(s.experienceBlocks).where(eq(s.experienceBlocks.masterProfileId, profile.id)),
      db.select().from(s.experienceBullets),
      db.select().from(s.educationBlocks).where(eq(s.educationBlocks.masterProfileId, profile.id)),
      db.select().from(s.skills).where(eq(s.skills.masterProfileId, profile.id)),
      db.select().from(s.languages).where(eq(s.languages.masterProfileId, profile.id)),
      db.select().from(s.certifications).where(eq(s.certifications.masterProfileId, profile.id)),
      db.select().from(s.projects).where(eq(s.projects.masterProfileId, profile.id)),
      db.select().from(s.publications).where(eq(s.publications.masterProfileId, profile.id)),
      db.select().from(s.awards).where(eq(s.awards.masterProfileId, profile.id)),
      db.select().from(s.volunteerBlocks).where(eq(s.volunteerBlocks.masterProfileId, profile.id)),
      db.select().from(s.references).where(eq(s.references.masterProfileId, profile.id)),
      db.select().from(s.customSections).where(eq(s.customSections.masterProfileId, profile.id)),
    ]);

  const experienceIds = new Set(experience.map((e) => e.id));
  const scopedBullets = bullets.filter((b) => experienceIds.has(b.experienceBlockId));
  const bulletsByExp = new Map<string, typeof scopedBullets>();
  for (const b of scopedBullets) {
    const arr = bulletsByExp.get(b.experienceBlockId) ?? [];
    arr.push(b);
    bulletsByExp.set(b.experienceBlockId, arr);
  }

  return {
    profile: {
      id: profile.id,
      headline: profile.headline,
      personalInfo: (profile.personalInfo ?? {}) as Record<string, unknown>,
    },
    summaries,
    experience: experience.map((e) => ({
      ...e,
      bullets: bulletsByExp.get(e.id) ?? [],
    })),
    education,
    skills,
    languages,
    certifications,
    projects,
    publications,
    awards,
    volunteer,
    references,
    customSections: customSections.map((c) => ({
      ...c,
      items: Array.isArray(c.content)
        ? c.content.map((it) => ({
            title: (it as { title?: string }).title ?? "",
            text: (it as { text?: string }).text ?? "",
          }))
        : [],
    })),
  };
}

/** Update headline + personalInfo on the master profile. */
export async function updateProfileMeta(
  profileId: string,
  raw: unknown,
) {
  const parsed = profileMetaSchema.parse(raw);
  const [row] = await db
    .update(s.masterProfiles)
    .set({ headline: parsed.headline, personalInfo: parsed.personalInfo })
    .where(eq(s.masterProfiles.id, profileId))
    .returning();
  return row;
}
import "server-only";
import type { z } from "zod";
import { genId } from "@/lib/id";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import * as v from "@/lib/validations/profile";

// ---------------------------------------------------------------------------
// Section registry: maps a URL section key to its table, schema and the DB
// columns that are writable. Keeps the route handlers fully generic.
// ---------------------------------------------------------------------------
interface SectionDef<TSchema extends z.ZodTypeAny> {
  table: any;
  schema: TSchema;
  /** master_profile owner column on the row */
  ownerCol: string;
  columns: string[];
}

const section = {
  summaries: {
    table: s.summaries,
    schema: v.summarySchema,
    ownerCol: "masterProfileId",
    columns: ["label", "text", "orderIndex"],
  },
  experience: {
    table: s.experienceBlocks,
    schema: v.experienceSchema,
    ownerCol: "masterProfileId",
    columns: [
      "company",
      "role",
      "location",
      "startDate",
      "endDate",
      "isCurrent",
      "employmentType",
      "tags",
      "orderIndex",
    ],
  },
  education: {
    table: s.educationBlocks,
    schema: v.educationSchema,
    ownerCol: "masterProfileId",
    columns: [
      "institution",
      "degree",
      "field",
      "startDate",
      "endDate",
      "gpa",
      "details",
      "orderIndex",
    ],
  },
  skills: {
    table: s.skills,
    schema: v.skillSchema,
    ownerCol: "masterProfileId",
    columns: ["name", "category", "level", "years", "orderIndex"],
  },
  languages: {
    table: s.languages,
    schema: v.languageSchema,
    ownerCol: "masterProfileId",
    columns: ["name", "cefrLevel", "orderIndex"],
  },
  certifications: {
    table: s.certifications,
    schema: v.certificationSchema,
    ownerCol: "masterProfileId",
    columns: ["name", "issuer", "date", "credentialUrl", "orderIndex"],
  },
  projects: {
    table: s.projects,
    schema: v.projectSchema,
    ownerCol: "masterProfileId",
    columns: [
      "name",
      "description",
      "tech",
      "link",
      "startDate",
      "endDate",
      "orderIndex",
    ],
  },
  publications: {
    table: s.publications,
    schema: v.publicationSchema,
    ownerCol: "masterProfileId",
    columns: ["citation", "date", "link", "orderIndex"],
  },
  awards: {
    table: s.awards,
    schema: v.awardSchema,
    ownerCol: "masterProfileId",
    columns: ["title", "issuer", "date", "orderIndex"],
  },
  volunteer: {
    table: s.volunteerBlocks,
    schema: v.volunteerSchema,
    ownerCol: "masterProfileId",
    columns: [
      "organization",
      "role",
      "startDate",
      "endDate",
      "details",
      "orderIndex",
    ],
  },
  references: {
    table: s.references,
    schema: v.referenceSchema,
    ownerCol: "masterProfileId",
    columns: ["name", "relation", "contact", "visible", "orderIndex"],
  },
  custom_sections: {
    table: s.customSections,
    schema: v.customSectionSchema,
    ownerCol: "masterProfileId",
    columns: ["title", "content", "orderIndex"],
  },
} as const satisfies Record<string, SectionDef<z.ZodTypeAny>>;

export type ProfileSectionKey = keyof typeof section;

export const isProfileSection = (key: string): key is ProfileSectionKey =>
  key in section;

/** Validates a client payload and strips non-writable keys. */
function toDbValues(key: ProfileSectionKey, data: Record<string, unknown>) {
  const conf = section[key];
  const out: Record<string, unknown> = {};
  for (const col of conf.columns) {
    if (col === "content") {
      const items = Array.isArray(data.items)
        ? (data.items as { title?: string; text?: string }[])
        : [];
      out.content = items.map((it) => ({
        title: it.title ?? "",
        text: it.text ?? "",
      }));
      continue;
    }
    if (col in data) out[col] = data[col];
  }
  return out;
}

function toClientData(key: ProfileSectionKey, row: Record<string, unknown>) {
  if (key === "custom_sections") {
    const content = Array.isArray(row.content)
      ? (row.content as { title?: string; text?: string }[])
      : [];
    return {
      id: row.id,
      title: row.title,
      orderIndex: row.orderIndex,
      items: content.map((it) => ({ title: it.title ?? "", text: it.text ?? "" })),
    };
  }
  return row;
}

// ---------------------------------------------------------------------------
/// CRUD (ownership is assumed enforced by the caller via masterProfileId)
// ---------------------------------------------------------------------------
export async function createBlock(key: ProfileSectionKey, masterProfileId: string, raw: unknown) {
  const conf = section[key];
  const parsed = conf.schema.parse(raw) as Record<string, unknown>;
  const values = toDbValues(key, parsed);
  const clientId = typeof parsed.id === "string" && parsed.id.length > 0 ? parsed.id : genId("blk");
  const [row] = await db
    .insert(conf.table)
    .values({ id: clientId, [conf.ownerCol]: masterProfileId, ...values } as any)
    .returning();
  return toClientData(key, row as Record<string, unknown>);
}

export async function updateBlockById(
  key: ProfileSectionKey,
  id: string,
  raw: unknown,
) {
  const conf = section[key];
  const parsed = conf.schema.parse(raw);
  const values = toDbValues(key, parsed as Record<string, unknown>);
  const [row] = await db
    .update(conf.table)
    .set(values as any)
    .where(eq(conf.table.id, id))
    .returning();
  if (!row) throw new Error("Not found");
  return toClientData(key, row as Record<string, unknown>);
}

export async function deleteBlock(key: ProfileSectionKey, id: string) {
  const conf = section[key];
  await db.delete(conf.table).where(eq(conf.table.id, id));
}

export async function reorderSection(
  key: ProfileSectionKey,
  ids: string[],
  masterProfileId: string,
) {
  const conf = section[key];
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(conf.table)
      .set({ orderIndex: i } as any)
      .where(
        and(
          eq(conf.table.id, ids[i]),
          eq(conf.table[conf.ownerCol], masterProfileId),
        ),
      );
  }
}

/**
 * Upserts an entire section from the client's canonical array. This makes
 * debounced autosave trivial: the editor's local array is the source of truth
 * and is flushed wholesale on save. Handles experience bullets as a sub-resource.
 */
export async function replaceSection(
  key: ProfileSectionKey,
  masterProfileId: string,
  rawItems: unknown[],
) {
  const conf = section[key];
  const parsed = rawItems.map((r) => conf.schema.parse(r)) as (Record<
    string,
    unknown
  > & { id: string; bullets?: unknown[] })[];

  const existing = await db
    .select({ id: conf.table.id })
    .from(conf.table)
    .where(eq(conf.table[conf.ownerCol], masterProfileId));
  const existingIds = new Set(existing.map((r) => r.id));

  const incoming = new Set(parsed.map((p) => p.id));

  // Remove items the client no longer references.
  for (const row of existing) {
    if (!incoming.has(row.id)) {
      await db.delete(conf.table).where(eq(conf.table.id, row.id));
    }
  }

  // Upsert each item in order.
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    const values = { ...toDbValues(key, item), orderIndex: i };
    if (existingIds.has(item.id)) {
      await db
        .update(conf.table)
        .set(values as any)
        .where(eq(conf.table.id, item.id));
    } else {
      await db
        .insert(conf.table)
        .values({ id: item.id, [conf.ownerCol]: masterProfileId, ...values } as any);
    }

    // Bullets ride along for experience blocks.
    if (key === "experience" && Array.isArray(item.bullets)) {
      await replaceBullets(item.id, item.bullets);
    }
  }
}

async function replaceBullets(experienceId: string, rawBullets: unknown[]) {
  const parsed = rawBullets.map((r) => v.experienceBulletSchema.parse(r));
  const existing = await db
    .select({ id: s.experienceBullets.id })
    .from(s.experienceBullets)
    .where(eq(s.experienceBullets.experienceBlockId, experienceId));
  const incoming = new Set(parsed.map((p) => p.id));
  const existingIds = new Set(existing.map((r) => r.id));
  for (const row of existing) {
    if (!incoming.has(row.id)) {
      await db.delete(s.experienceBullets).where(eq(s.experienceBullets.id, row.id));
    }
  }
  for (let i = 0; i < parsed.length; i++) {
    const b = parsed[i];
    const upsert = existingIds.has(b.id);
    const values = { text: b.text, tags: b.tags, orderIndex: i };
    if (upsert) {
      await db
        .update(s.experienceBullets)
        .set(values)
        .where(eq(s.experienceBullets.id, b.id));
    } else {
      await db
        .insert(s.experienceBullets)
        .values({ id: b.id, experienceBlockId: experienceId, ...values });
    }
  }
}

// ---------------------------------------------------------------------------
// Experience bullets (a sub-resource of experience blocks)
// ---------------------------------------------------------------------------
export async function createBullet(experienceId: string, raw: unknown) {
  const parsed = v.experienceBulletSchema.parse(raw);
  const [row] = await db
    .insert(s.experienceBullets)
    .values({
      id: genId("bl"),
      experienceBlockId: experienceId,
      text: parsed.text,
      tags: parsed.tags,
      orderIndex: parsed.orderIndex,
    })
    .returning();
  return row;
}

export async function updateBullet(id: string, raw: unknown) {
  const parsed = v.experienceBulletSchema.parse(raw);
  const [row] = await db
    .update(s.experienceBullets)
    .set({ text: parsed.text, tags: parsed.tags, orderIndex: parsed.orderIndex })
    .where(eq(s.experienceBullets.id, id))
    .returning();
  return row;
}

export async function deleteBullet(id: string) {
  await db.delete(s.experienceBullets).where(eq(s.experienceBullets.id, id));
}

export async function reorderBullets(experienceId: string, ids: string[]) {
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(s.experienceBullets)
      .set({ orderIndex: i })
      .where(eq(s.experienceBullets.id, ids[i]));
  }
}

export { section };
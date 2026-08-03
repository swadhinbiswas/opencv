import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { genId } from "@/lib/id";
import { getFullProfile, getMasterProfile } from "@/lib/profile/service";
import { getTemplate } from "@/lib/cv/templates";
import type { SectionKey, TemplateLayout } from "@/lib/cv/types";

function assertOwned(cv: { userId: string }, userId: string) {
  return cv.userId === userId;
}

export async function createCv(
  userId: string,
  input: { templateId: string; name?: string },
) {
  const template = await getTemplate(input.templateId);
  if (!template) throw new Error("Unknown template");

  const profile = await getMasterProfile(userId);
  const id = genId("cv");

  await db.insert(s.cvs).values({
    id,
    userId,
    masterProfileId: profile.id,
    templateId: template.id,
    name: input.name?.trim() || template.name,
    settings: {},
    status: "draft",
  });

  const order = template.layoutSchema.order;
  if (order.length) {
    await db.insert(s.cvSections).values(
      order.map((sectionType, i) => ({
        id: genId("sec"),
        cvId: id,
        sectionType,
        sourceBlockId: null,
        overrideContent: null,
        isVisible: true,
        orderIndex: i,
      })),
    );
  }

  return getCv(id, userId);
}

export async function listCvs(userId: string) {
  const rows = await db
    .select({
      cv: s.cvs,
      templateName: s.templates.name,
      sectionCount: db.$count(s.cvSections, eq(s.cvSections.cvId, s.cvs.id)),
      visibleCount: db.$count(
        s.cvSections,
        and(eq(s.cvSections.cvId, s.cvs.id), eq(s.cvSections.isVisible, true)),
      ),
    })
    .from(s.cvs)
    .leftJoin(s.templates, eq(s.templates.id, s.cvs.templateId))
    .where(eq(s.cvs.userId, userId))
    .orderBy(desc(s.cvs.updatedAt));

  return rows;
}

export async function getCv(cvId: string, userId: string) {
  const [cv] = await db.select().from(s.cvs).where(eq(s.cvs.id, cvId)).limit(1);
  if (!cv || !assertOwned(cv, userId)) return null;
  const template = cv.templateId ? await getTemplate(cv.templateId) : null;
  const sections = await db
    .select()
    .from(s.cvSections)
    .where(eq(s.cvSections.cvId, cvId))
    .orderBy(s.cvSections.orderIndex);
  return { cv, template, sections };
}

/** Full document bundle for rendering: CV, template, section toggles + master data. */
export async function getCvDocument(cvId: string, userId: string) {
  const base = await getCv(cvId, userId);
  if (!base) return null;
  const master = await getFullProfile(userId);
  return { ...base, master };
}

export async function updateCv(
  cvId: string,
  userId: string,
  patch: {
    name?: string;
    status?: "draft" | "ready" | "archived";
    templateId?: string;
    settings?: Record<string, unknown>;
  },
) {
  const [cv] = await db.select().from(s.cvs).where(eq(s.cvs.id, cvId)).limit(1);
  if (!cv || !assertOwned(cv, userId)) return null;

  const set: Partial<typeof s.cvs.$inferInsert> = {};
  if (patch.name !== undefined) set.name = patch.name.trim();
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.settings !== undefined && typeof patch.settings === "object") {
    set.settings = { ...(cv.settings ?? {}), ...patch.settings };
  }

  if (patch.templateId !== undefined && patch.templateId !== cv.templateId) {
    const template = await getTemplate(patch.templateId);
    if (!template) throw new Error("Unknown template");
    set.templateId = template.id;
    await db.delete(s.cvSections).where(eq(s.cvSections.cvId, cvId));
    const order = template.layoutSchema.order;
    if (order.length) {
      await db.insert(s.cvSections).values(
        order.map((sectionType, i) => ({
          id: genId("sec"),
          cvId,
          sectionType,
          isVisible: true,
          orderIndex: i,
        })),
      );
    }
  }

  await db.update(s.cvs).set(set).where(eq(s.cvs.id, cvId));
  return getCv(cvId, userId);
}

export async function deleteCv(cvId: string, userId: string) {
  const [cv] = await db.select().from(s.cvs).where(eq(s.cvs.id, cvId)).limit(1);
  if (!cv || !assertOwned(cv, userId)) return false;
  await db.delete(s.cvs).where(eq(s.cvs.id, cvId));
  return true;
}

export type SectionPatch = {
  sectionType: SectionKey;
  isVisible?: boolean;
  orderIndex?: number;
};

export async function updateCvSections(cvId: string, userId: string, patches: SectionPatch[]) {
  const [cv] = await db.select().from(s.cvs).where(eq(s.cvs.id, cvId)).limit(1);
  if (!cv || !assertOwned(cv, userId)) return null;

  for (const p of patches) {
    if (p.isVisible === undefined && p.orderIndex === undefined) continue;
    const [existing] = await db
      .select()
      .from(s.cvSections)
      .where(and(eq(s.cvSections.cvId, cvId), eq(s.cvSections.sectionType, p.sectionType)))
      .limit(1);
    if (existing) {
      await db
        .update(s.cvSections)
        .set({
          ...(p.isVisible !== undefined ? { isVisible: p.isVisible } : {}),
          ...(p.orderIndex !== undefined ? { orderIndex: p.orderIndex } : {}),
        })
        .where(eq(s.cvSections.id, existing.id));
    } else {
      await db.insert(s.cvSections).values({
        id: genId("sec"),
        cvId,
        sectionType: p.sectionType,
        isVisible: p.isVisible ?? true,
        orderIndex: p.orderIndex ?? 0,
      });
    }
  }
  return getCv(cvId, userId);
}

/** Default section order a template renders into when the CV has no overrides. */
export const DEFAULT_SECTION_ORDER = (layout?: TemplateLayout | null): SectionKey[] =>
  layout?.order ?? (["summary", "experience", "education", "projects", "skills", "certifications", "languages", "publications", "awards", "volunteer", "references", "custom"] as SectionKey[]);
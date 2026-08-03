import "server-only";
import { getCvDocument } from "@/lib/cv/service";
import { buildSections, contactLine, type DocTheme } from "@/lib/cv/render";
import type { SectionConfig, SectionKey } from "@/lib/cv/types";

const THEME_DEFAULTS: DocTheme = {
  accent: "#1e3a8a",
  paper: "#ffffff",
  ink: "#111827",
  muted: "#6b7280",
  font: "Inter, ui-sans-serif, system-ui, sans-serif",
};

/** Resolve everything needed to render a CV: name, contact, theme, sections. */
export async function getCvRenderProps(cvId: string, userId: string) {
  const doc = await getCvDocument(cvId, userId);
  if (!doc) return null;

  const theme: DocTheme = {
    ...THEME_DEFAULTS,
    ...(doc.template?.themeTokens ?? {}),
    ...((doc.cv.settings?.theme as Record<string, unknown>) ?? {}),
  };
  const format = doc.template?.layoutSchema.format ?? "classic";
  const order = doc.template?.layoutSchema.order ?? [];
  const config: SectionConfig[] = doc.sections.map((s) => ({
    sectionType: s.sectionType as SectionKey,
    isVisible: s.isVisible,
    orderIndex: s.orderIndex,
  }));

  const sections = buildSections(doc.master, order, config);
  const personal = doc.master.profile?.personalInfo as Record<string, unknown> | undefined;
  const name = (personal?.fullName as string) || doc.cv.name;
  const headline = doc.master.profile?.headline ?? "";
  const contact = contactLine(personal);

  return {
    cv: doc.cv,
    templateName: doc.template?.name ?? null,
    name,
    headline,
    contact,
    personalInfo: personal,
    sections,
    format,
    theme,
  };
}
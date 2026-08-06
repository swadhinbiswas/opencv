import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { SECTION_ORDER, type SectionKey, type TemplateLayout } from "@/lib/cv/types";

export interface SeedTemplate {
  id: string;
  name: string;
  formatType: string;
  layoutSchema: TemplateLayout;
  themeTokens: Record<string, unknown>;
  isPremium: boolean;
  description?: string;
}

/** Orderings used by specific template families. */
const ORDER_ACADEMIC: SectionKey[] = [
  "summary",
  "education",
  "publications",
  "experience",
  "projects",
  "awards",
  "skills",
  "certifications",
  "languages",
  "volunteer",
  "references",
  "custom",
];

const ORDER_TECHNICAL: SectionKey[] = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "languages",
  "awards",
  "publications",
  "volunteer",
  "references",
  "custom",
];

const ORDER_EXECUTIVE: SectionKey[] = [
  "experience",
  "education",
  "projects",
  "publications",
  "awards",
  "volunteer",
  "references",
  "custom",
];

/**
 * Built-in templates, keyed by stable ids so they survive re-seeds. Each maps
 * to a render layout the CvDocument knows how to draw (see src/lib/cv/render.tsx).
 */
export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    id: "tpl_charter",
    name: "Charter",
    formatType: "classic",
    layoutSchema: { format: "classic", order: SECTION_ORDER },
    themeTokens: {
      accent: "#1e3a8a",
      paper: "#ffffff",
      ink: "#0f2937",
      muted: "#6b7280",
      font: "Georgia, 'Times New Roman', serif",
    },
    isPremium: false,
    description: "A classic single-column layout with a strong headline.",
  },
  {
    id: "tpl_focus",
    name: "Focus",
    formatType: "main",
    layoutSchema: { format: "main", order: SECTION_ORDER },
    themeTokens: {
      accent: "#0f766e",
      paper: "#ffffff",
      ink: "#111827",
      muted: "#4b5563",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "A clean, condensed resume tuned for ATS parsing.",
  },
  {
    id: "tpl_sidebar",
    name: "Sidebar",
    formatType: "sidebar",
    layoutSchema: { format: "sidebar", order: SECTION_ORDER },
    themeTokens: {
      accent: "#7c3aed",
      paper: "#ffffff",
      ink: "#1f2a37",
      muted: "#6b7280",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "A two-column layout with a tinted sidebar and main body.",
  },
  {
    id: "tpl_ats",
    name: "ATS Pro",
    formatType: "ats",
    layoutSchema: { format: "ats", order: SECTION_ORDER },
    themeTokens: {
      accent: "#111827",
      paper: "#ffffff",
      ink: "#111827",
      muted: "#4b5563",
      font: "Arial, Helvetica, sans-serif",
    },
    isPremium: false,
    description: "Ultra-parseable single column — the safest choice for applicant tracking systems.",
  },
  {
    id: "tpl_minimal",
    name: "Minimal",
    formatType: "minimal",
    layoutSchema: { format: "minimal", order: SECTION_ORDER },
    themeTokens: {
      accent: "#334155",
      paper: "#ffffff",
      ink: "#1e293b",
      muted: "#64748b",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "Generous whitespace, dotted rules and airy typography.",
  },
  {
    id: "tpl_elegant",
    name: "Elegant",
    formatType: "elegant",
    layoutSchema: { format: "elegant", order: SECTION_ORDER },
    themeTokens: {
      accent: "#1f3a5f",
      paper: "#ffffff",
      ink: "#1c2633",
      muted: "#66717e",
      font: "Georgia, 'Times New Roman', serif",
      headingFont: "Georgia, 'Times New Roman', serif",
    },
    isPremium: false,
    description: "A refined, centered serif resume for traditional industries.",
  },
  {
    id: "tpl_academic",
    name: "Academic",
    formatType: "academic",
    layoutSchema: { format: "academic", order: ORDER_ACADEMIC },
    themeTokens: {
      accent: "#334155",
      paper: "#ffffff",
      ink: "#111827",
      muted: "#4b5563",
      font: "'Times New Roman', Times, serif",
      headingFont: "'Times New Roman', Times, serif",
    },
    isPremium: false,
    description: "Publication-first CV format with a formal type scale.",
  },
  {
    id: "tpl_technical",
    name: "Technical",
    formatType: "technical",
    layoutSchema: { format: "technical", order: ORDER_TECHNICAL },
    themeTokens: {
      accent: "#059669",
      paper: "#ffffff",
      ink: "#111827",
      muted: "#4b5563",
      font: "'JetBrains Mono', ui-monospace, monospace",
      headingFont: "'JetBrains Mono', ui-monospace, monospace",
    },
    isPremium: false,
    description: "Skills-first with keyword chips and a developer-friendly feel.",
  },
  {
    id: "tpl_creative",
    name: "Creative",
    formatType: "creative",
    layoutSchema: { format: "creative", order: SECTION_ORDER },
    themeTokens: {
      accent: "#9333ea",
      paper: "#ffffff",
      ink: "#1e1b2e",
      muted: "#6d6a7a",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
      headerBg: "#9333ea",
      headerText: "#ffffff",
    },
    isPremium: false,
    description: "A bold accent header band for design and marketing roles.",
  },
  {
    id: "tpl_executive",
    name: "Executive",
    formatType: "executive",
    layoutSchema: { format: "executive", order: ORDER_EXECUTIVE },
    themeTokens: {
      accent: "#0f172a",
      paper: "#ffffff",
      ink: "#0f172a",
      muted: "#475569",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
      headingFont: "Georgia, 'Times New Roman', serif",
    },
    isPremium: false,
    description: "A leadership layout with a contact rail and strong headline.",
  },
  {
    id: "tpl_twocolumn",
    name: "Two Column",
    formatType: "twocolumn",
    layoutSchema: { format: "twocolumn", order: SECTION_ORDER },
    themeTokens: {
      accent: "#0d9488",
      paper: "#ffffff",
      ink: "#134e4a",
      muted: "#64748b",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "Main content left, a clean right rail for skills and extras.",
  },
  {
    id: "tpl_compact",
    name: "Compact",
    formatType: "compact",
    layoutSchema: { format: "compact", order: SECTION_ORDER },
    themeTokens: {
      accent: "#475569",
      paper: "#ffffff",
      ink: "#1e293b",
      muted: "#64748b",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "A tight one-page format that still reads cleanly on screen.",
  },
  {
    id: "tpl_ink",
    name: "Ink",
    formatType: "ink",
    layoutSchema: { format: "ink", order: SECTION_ORDER },
    themeTokens: {
      accent: "#2a1852",
      paper: "#ffffff",
      ink: "#231f20",
      muted: "#5f537f",
      font: "'EB Garamond', 'Gentium Book Plus', Georgia, 'Liberation Serif', serif",
      headingFont: "'EB Garamond', 'Gentium Book Plus', Georgia, 'Liberation Serif', serif",
    },
    isPremium: false,
    description: "A literary serif resume in deep indigo with small-caps headings — inspired by RenderCV Ink.",
  },
  {
    id: "tpl_ember",
    name: "Ember",
    formatType: "ember",
    layoutSchema: { format: "ember", order: SECTION_ORDER },
    themeTokens: {
      accent: "#9b2319",
      paper: "#ffffff",
      ink: "#231f20",
      muted: "#64574a",
      font: "Ubuntu, 'Noto Sans', ui-sans-serif, system-ui, sans-serif",
      headingFont: "'Gentium Book Plus', 'EB Garamond', Georgia, 'Liberation Serif', serif",
    },
    isPremium: false,
    description: "A warm, editorial design with a serif nameplate, small-caps accents and diamond bullets.",
  },
  {
    id: "tpl_opal",
    name: "Opal",
    formatType: "opal",
    layoutSchema: { format: "opal", order: SECTION_ORDER },
    themeTokens: {
      accent: "#00645a",
      paper: "#ffffff",
      ink: "#0f2a26",
      muted: "#5d7a74",
      font: "Lato, 'Noto Sans', ui-sans-serif, system-ui, sans-serif",
      headingFont: "Lato, 'Noto Sans', ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "A calm, modern teal design with a centred header and generous whitespace.",
  },
  {
    id: "tpl_harvard",
    name: "Harvard",
    formatType: "harvard",
    layoutSchema: { format: "harvard", order: ORDER_ACADEMIC },
    themeTokens: {
      accent: "#000000",
      paper: "#ffffff",
      ink: "#000000",
      muted: "#444444",
      font: "'XCharter', Charter, Georgia, 'Liberation Serif', serif",
      headingFont: "'XCharter', Charter, Georgia, 'Liberation Serif', serif",
    },
    isPremium: false,
    description: "A restrained academic serif format with a centred nameplate and elegant framed headings.",
  },
  {
    id: "tpl_moderncv",
    name: "ModernCV",
    formatType: "moderncv",
    layoutSchema: { format: "moderncv", order: SECTION_ORDER },
    themeTokens: {
      accent: "#004f90",
      paper: "#ffffff",
      ink: "#111111",
      muted: "#55606e",
      font: "Fontin, 'Gentium Book Plus', Georgia, 'Liberation Serif', serif",
      headingFont: "Fontin, 'Gentium Book Plus', Georgia, 'Liberation Serif', serif",
    },
    isPremium: false,
    description: "Classic ModernCV styling with bold colour-bar section headers and a clean blue accent.",
  },
  {
    id: "tpl_sb2nov",
    name: "Sb2nov",
    formatType: "sb2nov",
    layoutSchema: { format: "sb2nov", order: SECTION_ORDER },
    themeTokens: {
      accent: "#000000",
      paper: "#ffffff",
      ink: "#000000",
      muted: "#333333",
      font: "'New Computer Modern', 'CMU Serif', Georgia, 'Liberation Serif', serif",
      headingFont: "'New Computer Modern', 'CMU Serif', Georgia, 'Liberation Serif', serif",
    },
    isPremium: false,
    description: "A position-first serif format with thin full-width rules — a recruiter favourite.",
  },
  {
    id: "tpl_engineering",
    name: "Engineering",
    formatType: "engineering",
    layoutSchema: { format: "engineering", order: ORDER_TECHNICAL },
    themeTokens: {
      accent: "#0f4c81",
      paper: "#ffffff",
      ink: "#111827",
      muted: "#4b5563",
      font: "Raleway, 'Noto Sans', ui-sans-serif, system-ui, sans-serif",
      headingFont: "Raleway, 'Noto Sans', ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "A crisp geometric-sans format with clean full-width rules and a skills-first order.",
  },
  {
    id: "tpl_cvfy",
    name: "Indigo Two-Column",
    formatType: "cvfy",
    layoutSchema: { format: "cvfy", order: SECTION_ORDER },
    themeTokens: {
      accent: "#5b21b6",
      paper: "#ffffff",
      ink: "#1f2937",
      muted: "#6b7280",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
      headingFont: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    isPremium: false,
    description: "A friendly indigo two-column layout with skill chips and a tinted side rail.",
  },
];

/** Insert any built-in templates that are missing (idempotent, runs on boot). */
export async function ensureTemplates() {
  const rows = await db.select({ id: s.templates.id }).from(s.templates);
  const present = new Set(rows.map((r) => r.id));
  const missing = SEED_TEMPLATES.filter((t) => !present.has(t.id));
  if (missing.length > 0) {
    await db
      .insert(s.templates)
      .values(
        missing.map((t) => ({
          id: t.id,
          name: t.name,
          formatType: t.formatType,
          layoutSchema: t.layoutSchema as unknown as Record<string, unknown>,
          themeTokens: t.themeTokens,
          isPremium: t.isPremium,
        })),
      )
      .returning();
  }

  // Everything is free — normalise any premium flags on built-in templates.
  // Batched into a single statement; a remote DB (e.g. Turso) would otherwise
  // add a ~100ms round-trip per template on every page load.
  const ids = SEED_TEMPLATES.map((t) => t.id);
  await db
    .update(s.templates)
    .set({ isPremium: false })
    .where(and(inArray(s.templates.id, ids), eq(s.templates.isPremium, true)));
}

export interface TemplateRecord {
  id: string;
  name: string;
  formatType: string;
  layoutSchema: TemplateLayout;
  themeTokens: Record<string, unknown>;
  isPremium: boolean;
  description?: string;
}

export async function getTemplates(): Promise<TemplateRecord[]> {
  await ensureTemplates();
  const rows = await db.select().from(s.templates);
  const byId = new Map(SEED_TEMPLATES.map((t) => [t.id, t]));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    formatType: r.formatType,
    layoutSchema: (r.layoutSchema ?? {
      format: "classic",
      order: SECTION_ORDER,
    }) as unknown as TemplateLayout,
    themeTokens: (r.themeTokens ?? {}) as Record<string, unknown>,
    isPremium: r.isPremium,
    description: byId.get(r.id)?.description,
  }));
}

/** CV templates only (excludes letter templates). */
export async function getCvTemplates(): Promise<TemplateRecord[]> {
  const templates = await getTemplates();
  return templates.filter((t) => t.formatType !== "letter");
}

/** Lookup a single template by id, or null. */
export async function getTemplate(id: string) {
  const [row] = await db.select().from(s.templates).where(eq(s.templates.id, id)).limit(1);
  if (!row) return null;
  return {
    ...row,
    layoutSchema: (row.layoutSchema ?? {
      format: "classic",
      order: SECTION_ORDER,
    }) as unknown as TemplateLayout,
  };
}

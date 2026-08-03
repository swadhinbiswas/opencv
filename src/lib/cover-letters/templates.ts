import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { genId } from "@/lib/id";
import {
  LETTER_STYLE_ACCENT,
  LETTER_STYLE_FONT,
  type LetterStyle,
} from "@/lib/cover-letters/styles";

export type { LetterStyle } from "@/lib/cover-letters/styles";

export interface LetterTemplateSeed {
  id: string;
  name: string;
  style: LetterStyle;
  isPremium: boolean;
  description?: string;
}

export const LETTER_TEMPLATES: LetterTemplateSeed[] = [
  {
    id: "let_classic",
    name: "Classic Block",
    style: "block",
    isPremium: false,
    description: "The traditional full-block business letter.",
  },
  {
    id: "let_modern",
    name: "Modern",
    style: "modern",
    isPremium: false,
    description: "Clean sans-serif typography with an accent rule.",
  },
  {
    id: "let_modified",
    name: "Modified Block",
    style: "modified",
    isPremium: false,
    description: "Date and closing aligned to the right for balance.",
  },
  {
    id: "let_semiblock",
    name: "Semi-Block",
    style: "semiblock",
    isPremium: false,
    description: "Indented paragraphs for a slightly warmer tone.",
  },
  {
    id: "let_minimal",
    name: "Minimal",
    style: "minimal",
    isPremium: false,
    description: "Plain, generous whitespace — nothing to distract.",
  },
  {
    id: "let_executive",
    name: "Executive",
    style: "executive",
    isPremium: false,
    description: "A formal letterhead-style header for senior roles.",
  },
  {
    id: "let_creative",
    name: "Creative",
    style: "creative",
    isPremium: false,
    description: "A bold accent header band for design-led roles.",
  },
];

const STYLE_ACCENT = LETTER_STYLE_ACCENT;
const STYLE_FONT = LETTER_STYLE_FONT;

/** Insert any missing letter templates (idempotent). */
export async function ensureLetterTemplates() {
  const rows = await db.select({ id: s.templates.id }).from(s.templates);
  const present = new Set(rows.map((r) => r.id));
  const missing = LETTER_TEMPLATES.filter((t) => !present.has(t.id));
  if (missing.length > 0) {
    await db
      .insert(s.templates)
      .values(
        missing.map((t) => ({
          id: t.id,
          name: t.name,
          formatType: "letter",
          layoutSchema: { format: "letter", style: t.style },
          themeTokens: {
            accent: STYLE_ACCENT[t.style],
            font: STYLE_FONT[t.style],
          },
          isPremium: t.isPremium,
        })),
      )
      .returning();
  }

  // Everything is free — normalise any premium flags on built-in templates.
  for (const t of LETTER_TEMPLATES) {
    await db.update(s.templates).set({ isPremium: false }).where(eq(s.templates.id, t.id));
  }
}

export interface LetterTemplateRecord {
  id: string;
  name: string;
  style: LetterStyle;
  isPremium: boolean;
  accent: string;
  font: string;
  description?: string;
}

export async function getLetterTemplates(): Promise<LetterTemplateRecord[]> {
  await ensureLetterTemplates();
  const rows = await db
    .select()
    .from(s.templates)
    .where(eq(s.templates.formatType, "letter"));

  const byId = new Map(LETTER_TEMPLATES.map((t) => [t.id, t]));
  return rows.map((r) => {
    const meta = byId.get(r.id);
    const style = (r.layoutSchema?.style as LetterStyle) ?? meta?.style ?? "block";
    const tokens = (r.themeTokens ?? {}) as Record<string, string>;
    return {
      id: r.id,
      name: r.name,
      style,
      isPremium: r.isPremium,
      accent: tokens.accent ?? STYLE_ACCENT[style],
      font: tokens.font ?? STYLE_FONT[style],
      description: meta?.description,
    };
  });
}

/** Resolve a letter template's render tokens for preview/print. */
export async function getLetterTemplateTokens(
  templateId: string | null | undefined,
): Promise<{ style: LetterStyle; accent: string; font: string }> {
  if (!templateId) return { style: "modern", accent: STYLE_ACCENT.modern, font: STYLE_FONT.modern };
  const [row] = await db.select().from(s.templates).where(eq(s.templates.id, templateId)).limit(1);
  if (!row || row.formatType !== "letter") {
    return { style: "modern", accent: STYLE_ACCENT.modern, font: STYLE_FONT.modern };
  }
  const style = (row.layoutSchema?.style as LetterStyle) ?? "modern";
  const tokens = (row.themeTokens ?? {}) as Record<string, string>;
  return {
    style,
    accent: tokens.accent ?? STYLE_ACCENT[style],
    font: tokens.font ?? STYLE_FONT[style],
  };
}

export async function createLetterTemplate(seed: LetterTemplateSeed) {
  await ensureLetterTemplates();
  const id = genId("tpl");
  await db.insert(s.templates).values({
    id,
    name: seed.name,
    formatType: "letter",
    layoutSchema: { format: "letter", style: seed.style },
    themeTokens: { accent: STYLE_ACCENT[seed.style], font: STYLE_FONT[seed.style] },
    isPremium: seed.isPremium,
  });
  return id;
}

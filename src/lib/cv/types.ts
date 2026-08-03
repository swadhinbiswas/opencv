/**
 * Client-safe shared types for the CV domain. No server-only imports here so
 * both server renderers and the client-side editor can use them.
 */

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "projects"
  | "publications"
  | "awards"
  | "volunteer"
  | "references"
  | "custom";

export const SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "languages",
  "publications",
  "awards",
  "volunteer",
  "references",
  "custom",
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  certifications: "Certifications",
  projects: "Projects",
  publications: "Publications",
  awards: "Awards",
  volunteer: "Volunteering",
  references: "References",
  custom: "Additional",
};

/**
 * Every layout the renderer knows how to draw. `format` values stored on a
 * template's layoutSchema must be one of these.
 */
export type LayoutKind =
  | "classic"
  | "main"
  | "ats"
  | "minimal"
  | "elegant"
  | "academic"
  | "compact"
  | "technical"
  | "creative"
  | "sidebar"
  | "executive"
  | "twocolumn"
  | "ink"
  | "ember"
  | "opal"
  | "harvard"
  | "moderncv"
  | "sb2nov"
  | "engineering"
  | "cvfy";

export interface TemplateLayout {
  format: LayoutKind;
  order: SectionKey[];
}

export type SectionConfig = {
  sectionType: SectionKey;
  isVisible?: boolean;
  orderIndex?: number;
};

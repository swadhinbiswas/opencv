/**
 * Client-safe cover letter style constants. No server-only imports here so
 * both the renderer (client + server) and the DB layer can use them.
 */

export type LetterStyle =
  | "block"
  | "modern"
  | "modified"
  | "semiblock"
  | "minimal"
  | "executive"
  | "creative";

export const LETTER_STYLE_ACCENT: Record<LetterStyle, string> = {
  block: "#1e3a8a",
  modern: "#0f766e",
  modified: "#334155",
  semiblock: "#475569",
  minimal: "#334155",
  executive: "#0f172a",
  creative: "#9333ea",
};

export const LETTER_STYLE_FONT: Record<LetterStyle, string> = {
  block: "Georgia, 'Times New Roman', serif",
  modern: "Inter, ui-sans-serif, system-ui, sans-serif",
  modified: "'Times New Roman', Times, serif",
  semiblock: "Georgia, 'Times New Roman', serif",
  minimal: "Inter, ui-sans-serif, system-ui, sans-serif",
  executive: "'Times New Roman', Times, serif",
  creative: "Inter, ui-sans-serif, system-ui, sans-serif",
};

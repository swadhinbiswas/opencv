import type { RenderedSection } from "@/lib/cv/render";

export type ScoreCheck = {
  key: string;
  label: string;
  passed: boolean;
  weight: number;
  hint?: string;
};

export type ScoreResult = {
  score: number;
  grade: "excellent" | "good" | "fair" | "poor";
  checks: ScoreCheck[];
};

const NON_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with",
  "at", "by", "from", "as", "is", "was", "are", "were", "be", "been",
  "it", "its", "this", "that", "these", "those", "we", "our", "us",
  "i", "my", "me", "their", "them", "they", "he", "she", "his", "her",
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !NON_WORDS.has(w));
}

function sectionText(sections: RenderedSection[]): string {
  const parts: string[] = [];
  for (const sec of sections) {
    parts.push(sec.label);
    for (const item of sec.items) {
      if (item.title) parts.push(item.title);
      if (item.subtitle) parts.push(item.subtitle);
      if (item.lines) parts.push(...item.lines);
      if (item.nested) parts.push(...item.nested.map((n) => `${n.title ?? ""} ${n.text}`));
    }
  }
  return parts.join(" ");
}

export function scoreCv({
  name,
  headline,
  contact,
  personalInfo,
  sections,
  jobDescription,
}: {
  name?: string;
  headline?: string;
  contact?: string[];
  personalInfo?: Record<string, unknown>;
  sections: RenderedSection[];
  jobDescription?: string;
}): ScoreResult {
  const info = personalInfo ?? {};
  const joined = contact ?? [];
  const all = sectionText(sections);
  const wordCount = words(all).length;

  const has = (field: string) =>
    typeof info[field] === "string" && (info[field] as string).trim().length > 0;

  const sec = (key: string) => sections.find((s) => s.key === key);
  const summary = sec("summary");
  const experience = sec("experience");
  const education = sec("education");
  const skills = sec("skills");

  const summaryWords = summary ? words(summary.items.map((i) => i.lines ?? []).flat().join(" ")).length : 0;

  const bulletCount = experience?.items.reduce((n, i) => n + (i.lines?.length ?? 0), 0) ?? 0;
  const thinEntries = experience?.items.filter((i) => (i.lines?.length ?? 0) < 2).length ?? 0;
  const skillsCount = skills?.items.length ?? 0;

  let keywordHit = 0;
  let keywordTotal = 0;
  if (jobDescription && jobDescription.trim()) {
    const jd = words(jobDescription);
    const seen = new Set<string>();
    for (const kw of jd.slice(0, 40)) {
      if (seen.has(kw)) continue;
      seen.add(kw);
      keywordTotal += 1;
      if (all.includes(kw) || joined.some((c) => c.toLowerCase().includes(kw))) keywordHit += 1;
    }
  }

  const checks: ScoreCheck[] = [
    {
      key: "name",
      label: "Full name shown",
      passed: Boolean(name && name.trim().length > 0),
      weight: 5,
    },
    {
      key: "email",
      label: "Email address",
      passed: has("email") || joined.some((c) => c.includes("@")),
      weight: 8,
      hint: "Add an email — recruiters must be able to reply.",
    },
    {
      key: "phone",
      label: "Phone number",
      passed: has("phone"),
      weight: 6,
      hint: "A phone number helps for quick-screen calls.",
    },
    {
      key: "location",
      label: "Location",
      passed: has("city") || has("country"),
      weight: 5,
      hint: "Include at least a city for local roles.",
    },
    {
      key: "online",
      label: "Online profile (LinkedIn/portfolio)",
      passed: has("website") || has("linkedin") || joined.some((c) => c.includes("linkedin") || c.startsWith("http")),
      weight: 4,
      hint: "A LinkedIn or portfolio link boosts credibility.",
    },
    {
      key: "headline",
      label: "Professional headline",
      passed: Boolean(headline && headline.trim().length > 0),
      weight: 6,
      hint: "One line stating your role/level right under your name.",
    },
    {
      key: "summary",
      label: "Summary present & substantial",
      passed: Boolean(summary && summaryWords >= 25),
      weight: 10,
      hint: "Write 2–4 sentences summarising your value — 25+ words reads better.",
    },
    {
      key: "experience",
      label: "Experience with detail",
      passed: Boolean(experience && experience.items.length >= 1 && thinEntries === 0 && bulletCount >= 3),
      weight: 14,
      hint: "Each role needs 2–3 achievement bullets with measurable results.",
    },
    {
      key: "education",
      label: "Education section",
      passed: Boolean(education && education.items.length > 0),
      weight: 8,
    },
    {
      key: "skills",
      label: "Skill set (5+)",
      passed: skillsCount >= 5,
      weight: 8,
      hint: "List 5–10 relevant skills — many ATS filter on them.",
    },
    {
      key: "length",
      label: "Content length",
      passed: wordCount >= 180,
      weight: 10,
      hint: `Aim for 250–450 words of substantive content (currently ${wordCount}).`,
    },
  ];

  if (keywordTotal > 0) {
    const ratio = keywordHit / keywordTotal;
    checks.push({
      key: "keywords",
      label: `Keyword match vs job (${keywordHit}/${keywordTotal})`,
      passed: ratio >= 0.5,
      weight: 16,
      hint:
        ratio >= 0.5
          ? "Strong keyword overlap with the job description."
          : "Mirror more of the job's language in your summary, skills and bullets.",
    });
  } else {
    checks.push({
      key: "keywords",
      label: "Keyword targeting",
      passed: false,
      weight: 0,
      hint: "Optional: paste a job description to check keyword match.",
    });
  }

  const totalWeight = checks.reduce((n, c) => n + c.weight, 0);
  const earned = checks.reduce((n, c) => n + (c.passed ? c.weight : 0), 0);
  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
  const grade: ScoreResult["grade"] =
    score >= 85 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "fair" : "poor";

  return { score, grade, checks };
}

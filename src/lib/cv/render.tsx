import {
  SECTION_LABELS,
  type SectionConfig,
  type SectionKey,
} from "@/lib/cv/types";

/**
 * Plain, serializable render model: a CV is an ordered list of "sections", each
 * holding a simple list of items. Dumb data means the same bundle renders
 * server-side (preview), client-side (live editor), and later to print/PDF.
 */

export type RenderedItem = {
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  lines?: string[];
  inline?: boolean;
  nested?: { title?: string | null; text?: string | null }[];
};

export type RenderedSection = {
  key: SectionKey;
  label: string;
  items: RenderedItem[];
};

export type MasterProfile = {
  profile?: { headline?: string; personalInfo?: Record<string, unknown> };
  summaries?: { text?: string; label?: string }[];
  experience?: {
    role?: string | null;
    company?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean | null;
    bullets?: { text: string }[];
  }[];
  education?: {
    institution?: string | null;
    degree?: string | null;
    field?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    gpa?: string | null;
    details?: string | null;
  }[];
  skills?: { name?: string | null; category?: string | null; level?: number | null }[];
  languages?: { name?: string | null; cefrLevel?: string | null }[];
  certifications?: { name?: string | null; issuer?: string | null; date?: string | null; credentialUrl?: string | null }[];
  projects?: { name?: string | null; description?: string | null; tech?: string[] | null; startDate?: string | null; endDate?: string | null }[];
  publications?: { citation?: string | null; date?: string | null; link?: string | null }[];
  awards?: { title?: string | null; issuer?: string | null; date?: string | null }[];
  volunteer?: { organization?: string | null; role?: string | null; startDate?: string | null; endDate?: string | null; details?: string | null }[];
  references?: { name?: string | null; relation?: string | null; contact?: string | null; visible?: boolean | null }[];
  customSections?: { title?: string | null; items?: { title?: string | null; text?: string | null }[] }[];
};

export type DocTheme = {
  accent: string;
  paper: string;
  ink: string;
  muted: string;
  font: string;
  /** Optional serif/sans heading font override. */
  headingFont?: string;
  /** Optional solid header band background for band/creative layouts. */
  headerBg?: string;
  /** Optional text color on the header band. */
  headerText?: string;
};

type HeaderVariant = "standard" | "centered" | "band" | "split";
type BodyVariant = "single" | "sidebar" | "rightrail";

type CvLayoutConfig = {
  header: HeaderVariant;
  body: BodyVariant;
  sideSections?: SectionKey[];
  /** Tighter type scale for compact/ATS layouts. */
  compact?: boolean;
};

/** Side sections shared by two-column families. */
const DEFAULT_SIDE_SECTIONS: SectionKey[] = [
  "summary",
  "skills",
  "languages",
  "certifications",
  "references",
];

const EXEC_SIDE_SECTIONS: SectionKey[] = [
  "summary",
  "skills",
  "languages",
  "certifications",
  "awards",
];

const RIGHTRAIL_SECTIONS: SectionKey[] = [
  "skills",
  "languages",
  "certifications",
  "awards",
  "references",
];

/** Full description of every supported layout. */
export const CV_LAYOUTS: Record<string, CvLayoutConfig> = {
  classic: { header: "standard", body: "single" },
  main: { header: "standard", body: "single" },
  ats: { header: "standard", body: "single", compact: true },
  minimal: { header: "standard", body: "single" },
  elegant: { header: "centered", body: "single" },
  academic: { header: "centered", body: "single", compact: true },
  compact: { header: "standard", body: "single", compact: true },
  technical: { header: "standard", body: "single" },
  creative: { header: "band", body: "single" },
  sidebar: { header: "standard", body: "sidebar", sideSections: DEFAULT_SIDE_SECTIONS },
  executive: { header: "split", body: "sidebar", sideSections: EXEC_SIDE_SECTIONS },
  twocolumn: { header: "standard", body: "rightrail", sideSections: RIGHTRAIL_SECTIONS },

  /* ---- RenderCV-inspired families ---- */
  ink: { header: "standard", body: "single" },
  ember: { header: "centered", body: "single" },
  opal: { header: "centered", body: "single" },
  harvard: { header: "centered", body: "single" },
  moderncv: { header: "standard", body: "single" },
  sb2nov: { header: "standard", body: "single" },
  engineering: { header: "standard", body: "single" },
  cvfy: { header: "standard", body: "rightrail", sideSections: RIGHTRAIL_SECTIONS },
};

const FALLBACK_ORDER: SectionKey[] = [
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

function dates(start?: string | null, end?: string | null): string {
  return [start, end].filter(Boolean).join(" — ");
}

function buildItems(master: MasterProfile, key: SectionKey): RenderedItem[] {
  const items: RenderedItem[] = [];

  switch (key) {
    case "summary": {
      const s = master.summaries?.[0];
      if (s?.text) items.push({ lines: [s.text] });
      break;
    }
    case "experience": {
      for (const e of master.experience ?? []) {
        items.push({
          title: e.role || e.company,
          subtitle: [e.company, e.location].filter(Boolean).join(" · ") || undefined,
          badge: dates(e.startDate, e.isCurrent ? "Present" : e.endDate),
          lines: e.bullets?.map((b) => b.text).filter(Boolean) ?? [],
        });
      }
      break;
    }
    case "education": {
      for (const ed of master.education ?? []) {
        items.push({
          title: [ed.degree, ed.field].filter(Boolean).join(", ") || ed.institution || "Education",
          subtitle: ed.institution,
          badge: dates(ed.startDate, ed.endDate),
          lines: ed.details ? [ed.details] : [],
        });
      }
      break;
    }
    case "skills": {
      const groups = new Map<string, string[]>();
      for (const sk of master.skills ?? []) {
        const cat = sk.category || "Skills";
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat)!.push(sk.name || "");
      }
      for (const [cat, names] of groups) {
        items.push({ title: cat, lines: names });
      }
      break;
    }
    case "languages": {
      for (const l of master.languages ?? []) {
        items.push({ title: l.name, badge: l.cefrLevel, inline: true });
      }
      break;
    }
    case "certifications": {
      for (const c of master.certifications ?? []) {
        items.push({ title: c.name, subtitle: c.issuer, badge: c.date });
      }
      break;
    }
    case "projects": {
      for (const p of master.projects ?? []) {
        items.push({
          title: p.name,
          badge: dates(p.startDate, p.endDate),
          lines: [p.description, p.tech?.length ? p.tech.join(", ") : ""].filter(Boolean) as string[],
        });
      }
      break;
    }
    case "publications": {
      for (const p of master.publications ?? []) {
        items.push({ title: p.citation, badge: p.date });
      }
      break;
    }
    case "awards": {
      for (const a of master.awards ?? []) {
        items.push({ title: a.title, subtitle: a.issuer, badge: a.date });
      }
      break;
    }
    case "volunteer": {
      for (const v of master.volunteer ?? []) {
        items.push({
          title: v.organization,
          subtitle: v.role,
          badge: dates(v.startDate, v.endDate),
          lines: v.details ? [v.details] : [],
        });
      }
      break;
    }
    case "references": {
      for (const r of master.references ?? []) {
        if (r.visible === false) continue;
        items.push({
          title: r.name,
          subtitle: [r.relation, r.contact].filter(Boolean).join(" · ") || undefined,
        });
      }
      break;
    }
    case "custom": {
      for (const c of master.customSections ?? []) {
        items.push({
          title: c.title,
          nested: c.items?.map((it) => ({ title: it.title ?? "", text: it.text ?? "" })),
        });
      }
      break;
    }
  }
  return items;
}

/** Build the ordered list of rendered sections honoring per-section visibility. */
export function buildSections(
  master: MasterProfile,
  order: SectionKey[],
  config: SectionConfig[],
): RenderedSection[] {
  const vis = new Map<SectionKey, boolean>();
  for (const c of config ?? []) vis.set(c.sectionType, c.isVisible ?? true);

  const ordered = order.length ? order : FALLBACK_ORDER;

  const index = new Map<SectionKey, number>();
  for (const c of config ?? []) {
    if (typeof c.orderIndex === "number" && Number.isInteger(c.orderIndex)) {
      index.set(c.sectionType, c.orderIndex);
    }
  }
  const sorted = [...ordered].sort((a, b) => {
    const ai = index.get(a);
    const bi = index.get(b);
    if (ai === undefined && bi === undefined) return 0;
    if (ai === undefined) return 1;
    if (bi === undefined) return -1;
    return ai - bi;
  });

  const result: RenderedSection[] = [];

  for (const key of sorted) {
    if (vis.get(key) === false) continue;
    const items = buildItems(master, key);
    if (items.length === 0) continue;
    result.push({ key, label: SECTION_LABELS[key], items });
  }
  return result;
}

/** Split resolved sections into side vs main columns for a given format. */
export function partitionSections(sections: RenderedSection[], format: string) {
  const cfg = CV_LAYOUTS[format] ?? CV_LAYOUTS.main;
  if (cfg.body === "single") return { side: [] as RenderedSection[], main: sections };
  const sideKeys = cfg.sideSections ?? DEFAULT_SIDE_SECTIONS;
  const side: RenderedSection[] = [];
  const main: RenderedSection[] = [];
  for (const sec of sections) {
    (sideKeys.includes(sec.key) ? side : main).push(sec);
  }
  return { side, main };
}

/** Contact line derived from the personal info block. */
export function contactLine(info: Record<string, unknown> | undefined): string[] {
  const parts: string[] = [];
  for (const field of ["email", "phone", "city", "country"] as const) {
    const v = info?.[field];
    if (typeof v === "string" && v) parts.push(v);
  }
  const links = info?.links;
  if (Array.isArray(links)) {
    for (const l of links) {
      const label = (l as { label?: string })?.label;
      const url = (l as { url?: string })?.url;
      const text = label || url;
      if (typeof text === "string" && text) parts.push(text);
    }
  }
  return parts;
}

/** The resume itself. Pure presentational, usable on server and client. */
export function CvDocument({
  name,
  headline,
  contact,
  sections,
  format,
  theme,
}: {
  name?: string;
  headline?: string;
  contact?: string[];
  sections: RenderedSection[];
  format: string;
  theme: DocTheme;
}) {
  const cfg = CV_LAYOUTS[format] ?? CV_LAYOUTS.main;
  const { side, main } = partitionSections(sections, format);
  const headerVariant = cfg.header;
  const isBand = headerVariant === "band";
  const isCentered = headerVariant === "centered";

  const rootClass = [
    "cv-root",
    `cv--${format}`,
    cfg.compact ? "cv--compact" : "",
    isBand ? "cv--band" : "",
    isCentered ? "cv--centered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const vars = {
    "--cv-accent": theme.accent,
    "--cv-paper": theme.paper,
    "--cv-ink": theme.ink,
    "--cv-muted": theme.muted,
    "--cv-head-bg": theme.headerBg ?? theme.accent,
    "--cv-head-ink": theme.headerText ?? "#ffffff",
    "--cv-head-font": theme.headingFont ?? theme.font,
  } as React.CSSProperties;

  const headerStyle = isBand
    ? { background: theme.headerBg ?? theme.accent, color: theme.headerText ?? "#fff" }
    : undefined;

  const headInner = (
    <>
      <div className="cv-head-left">
        {name ? (
          <div className="cv-name" style={{ fontFamily: theme.headingFont }}>
            {name}
          </div>
        ) : null}
        {headline ? <div className="cv-title">{headline}</div> : null}
      </div>
      {contact && contact.length > 0 ? (
        <div className="cv-contact">
          {contact.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div className={rootClass} style={{ fontFamily: theme.font, color: theme.ink, background: theme.paper, ...vars }}>
      <header className={`cv-head cv-head--${headerVariant}`} style={headerStyle}>
        {headerVariant === "split" ? headInner : (
          <>
            {name ? (
              <div className="cv-name" style={{ fontFamily: theme.headingFont }}>
                {name}
              </div>
            ) : null}
            {headline ? <div className="cv-title">{headline}</div> : null}
            {contact && contact.length > 0 ? (
              <div className="cv-contact">
                {contact.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </header>

      <div className={cfg.body !== "single" ? `cv-body cv-body--${cfg.body}` : "cv-body"}>
        {cfg.body !== "single" && (
          <aside className="cv-side">
            {side.map((sec) => (
              <SectionBlock key={sec.key} section={sec} accent={theme.accent} muted={theme.muted} />
            ))}
          </aside>
        )}
        <div className="cv-main">
          {main.map((sec) => (
            <SectionBlock key={sec.key} section={sec} accent={theme.accent} muted={theme.muted} />
          ))}
        </div>
      </div>

      <style suppressHydrationWarning>{cvStyles}</style>
    </div>
  );
}

function SectionBlock({
  section,
  accent,
  muted,
}: {
  section: RenderedSection;
  accent: string;
  muted: string;
}) {
  return (
    <section className="cv-sec" data-sec={section.key}>
      <h2 className="cv-sec-title" style={{ color: accent }}>
        {section.label}
      </h2>
      {section.items.map((item, i) => (
        <div className="cv-item" key={i}>
          <div className="cv-item-row">
            {item.title ? <span className="cv-item-title">{item.title}</span> : null}
            {item.badge ? (
              <span className="cv-item-badge" style={{ color: muted }}>
                {item.badge}
              </span>
            ) : null}
          </div>
          {item.subtitle ? (
            <div className="cv-item-sub" style={{ color: muted }}>
              {item.subtitle}
            </div>
          ) : null}
          {item.lines && item.lines.length > 0 ? (
            <ul className="cv-bullets">
              {item.lines.map((line, j) => (
                <li key={j}>{line}</li>
              ))}
            </ul>
          ) : null}
          {item.nested && item.nested.length > 0 ? (
            <ul className="cv-bullets">
              {item.nested.map((n, j) => (
                <li key={j}>
                  {n.title ? <strong>{n.title}: </strong> : null}
                  {n.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  );
}

const cvStyles = `
  .cv-root {
    font-size: 13px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cv-head { padding: 24px 28px 14px; border-bottom: 3px solid var(--cv-accent, #111); }
  .cv-name { font-size: 24px; font-weight: 700; letter-spacing: 0.01em; }
  .cv-title { font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--cv-accent, #111); }
  .cv-contact { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 6px; font-size: 11px; color: var(--cv-muted, #666); }
  .cv-body { display: flex; padding: 0 28px 24px; }
  .cv-body--sidebar { padding: 0; }
  .cv-side { width: 34%; flex: 0 0 34%; background: color-mix(in srgb, var(--cv-accent, #111) 6%, #fff); padding: 16px 18px 24px; }
  .cv-main { flex: 1; min-width: 0; padding: 16px 28px 24px; }
  .cv-side + .cv-main { padding-left: 20px; }
  .cv-sec { margin-top: 14px; }
  .cv-sec:first-child { margin-top: 0; }
  .cv-sec-title {
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    border-bottom: 1px solid #00000022; padding-bottom: 3px; margin-bottom: 8px;
  }
  .cv-item { margin-bottom: 8px; break-inside: avoid; }
  .cv-item-row { display: flex; justify-content: space-between; gap: 10px; }
  .cv-item-title { font-weight: 700; font-size: 12.5px; }
  .cv-item-badge { font-size: 10.5px; white-space: nowrap; }
  .cv-item-sub { font-size: 11.5px; margin-top: 1px; }
  .cv-bullets { margin: 4px 0 0; padding-left: 16px; }
  .cv-bullets li { font-size: 11.5px; margin-bottom: 2px; }

  /* ---- right-rail two-column layout ---- */
  .cv-body--rightrail { padding: 0; }
  .cv-body--rightrail .cv-main { padding: 16px 24px 24px 28px; }
  .cv-body--rightrail .cv-side {
    order: 2; width: 30%; flex: 0 0 30%; background: #fff; border-left: 1px solid #00000018;
    padding: 16px 18px 24px;
  }

  /* ---- centered header (elegant, academic) ---- */
  .cv-head--centered { text-align: center; border-bottom: none; padding-bottom: 18px; }
  .cv-head--centered .cv-name { font-size: 26px; }
  .cv-head--centered::after { content: ""; display: block; width: 64px; height: 3px; background: var(--cv-accent, #111); margin: 12px auto 0; }
  .cv-head--centered .cv-contact { justify-content: center; }

  /* ---- band header (creative) ---- */
  .cv-head--band { border-bottom: none; padding: 26px 28px 18px; }
  .cv-head--band .cv-name { font-size: 27px; letter-spacing: 0.02em; }
  .cv-head--band .cv-title { color: inherit; opacity: 0.92; }
  .cv-head--band .cv-contact { color: inherit; opacity: 0.85; }

  /* ---- split header (executive) ---- */
  .cv-head--split { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: none; padding-bottom: 16px; position: relative; }
  .cv-head--split .cv-head-left { flex: 1; }
  .cv-head--split .cv-contact { flex-direction: column; align-items: flex-end; margin-top: 0; text-align: right; gap: 2px; }
  .cv-head--split::after { content: ""; position: absolute; left: 28px; right: 28px; bottom: 0; height: 3px; background: var(--cv-accent, #111); }

  /* ---- compact (ats, compact, academic) ---- */
  .cv--compact { font-size: 12px; line-height: 1.42; }
  .cv--compact .cv-head { padding: 18px 24px 10px; }
  .cv--compact .cv-name { font-size: 20px; }
  .cv--compact .cv-main { padding: 12px 24px 18px; }
  .cv--compact .cv-sec { margin-top: 10px; }
  .cv--compact .cv-bullets li { font-size: 11px; }

  /* ---- minimal ---- */
  .cv--minimal .cv-head { border-bottom: 1px solid #00000022; padding-bottom: 12px; }
  .cv--minimal .cv-sec-title { letter-spacing: 0.22em; border-bottom: none; font-weight: 600; }
  .cv--minimal .cv-item { border-bottom: 1px dotted #00000018; padding-bottom: 6px; }
  .cv--minimal .cv-item:last-child { border-bottom: none; }

  /* ---- elegant serif ---- */
  .cv--elegant .cv-head { border-bottom: none; padding-bottom: 16px; }
  .cv--elegant .cv-sec-title { font-weight: 600; letter-spacing: 0.12em; }

  /* ---- technical: skill chips + project-first accent ---- */
  .cv--technical .cv-sec[data-sec="skills"] .cv-bullets { display: flex; flex-wrap: wrap; gap: 4px; padding-left: 0; }
  .cv--technical .cv-sec[data-sec="skills"] .cv-bullets li {
    background: color-mix(in srgb, var(--cv-accent, #111) 10%, #fff);
    color: var(--cv-ink, #111); padding: 1px 8px; border-radius: 999px; font-size: 10.5px; margin: 0;
  }
  .cv--technical .cv-item-title { color: var(--cv-accent, #111); }

  /* ---- creative accent details ---- */
  .cv--creative .cv-sec-title { color: var(--cv-accent, #111); }
  .cv--creative .cv-item-title { color: var(--cv-accent, #111); }
  .cv--creative .cv-bullets li::marker { color: var(--cv-accent, #111); }

  /* ---- executive accent rail accents ---- */
  .cv--executive .cv-head--split .cv-name { color: var(--cv-ink, #111); }
  .cv--executive .cv-side .cv-sec-title { border-bottom-color: color-mix(in srgb, var(--cv-accent, #111) 35%, transparent); }

  /* ===================== RenderCV-inspired families ===================== */

  /* ---- ink: serif, deep indigo, small-caps titles, no rules ---- */
  .cv--ink .cv-head { border-bottom: none; padding-bottom: 16px; }
  .cv--ink .cv-name { font-size: 29px; letter-spacing: 0.01em; color: var(--cv-accent, #111); }
  .cv--ink .cv-title { font-weight: 400; letter-spacing: 0.02em; }
  .cv--ink .cv-sec-title { text-transform: none; font-variant-caps: small-caps; border-bottom: none; font-weight: 600; letter-spacing: 0.04em; }
  .cv--ink .cv-item-sub { font-style: italic; }
  .cv--ink .cv-bullets { padding-left: 14px; }

  /* ---- ember: warm brick red, serif name, small-caps headline + titles, diamond bullets ---- */
  .cv--ember .cv-head--centered { padding-bottom: 16px; }
  .cv--ember .cv-head--centered::after { height: 2px; background: var(--cv-accent, #111); }
  .cv--ember .cv-name { font-size: 30px; color: var(--cv-accent, #111); }
  .cv--ember .cv-title { font-variant-caps: small-caps; letter-spacing: 0.05em; font-weight: 400; }
  .cv--ember .cv-sec-title { text-transform: none; font-variant-caps: small-caps; border-bottom: none; font-weight: 600; letter-spacing: 0.05em; }
  .cv--ember .cv-item-title { font-weight: 600; }
  .cv--ember .cv-item-sub { font-style: italic; }
  .cv--ember .cv-bullets li::marker { content: "◆  "; color: var(--cv-accent, #111); }
  .cv--ember .cv-bullets { padding-left: 16px; }

  /* ---- opal: teal, Lato, centered small-caps headline + titles, hollow bullets ---- */
  .cv--opal .cv-head--centered { padding-bottom: 14px; }
  .cv--opal .cv-head--centered::after { height: 2px; background: var(--cv-accent, #111); }
  .cv--opal .cv-name { font-size: 26px; color: var(--cv-accent, #111); letter-spacing: 0.01em; }
  .cv--opal .cv-title { font-variant-caps: small-caps; letter-spacing: 0.06em; font-weight: 400; color: var(--cv-accent, #111); }
  .cv--opal .cv-sec-title { text-transform: none; font-variant-caps: small-caps; border-bottom: none; font-weight: 600; letter-spacing: 0.06em; }
  .cv--opal .cv-item-title { font-weight: 600; color: var(--cv-accent, #111); }
  .cv--opal .cv-bullets li::marker { content: "◦  "; color: var(--cv-accent, #111); }
  .cv--opal .cv-bullets { padding-left: 16px; }

  /* ---- harvard: black serif, centered header, centered partial-line titles ---- */
  .cv--harvard .cv-head--centered { border-bottom: none; padding-bottom: 16px; }
  .cv--harvard .cv-head--centered::after { display: none; }
  .cv--harvard .cv-name { font-size: 27px; letter-spacing: 0.02em; }
  .cv--harvard .cv-title { font-weight: 400; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12.5px; }
  .cv--harvard .cv-sec-title { display: flex; align-items: center; justify-content: center; gap: 10px; border-bottom: none; letter-spacing: 0.06em; }
  .cv--harvard .cv-sec-title::before,
  .cv--harvard .cv-sec-title::after { content: ""; flex: 0 1 42px; height: 1px; background: currentColor; opacity: 0.5; }
  .cv--harvard .cv-item-sub { font-style: italic; }

  /* ---- moderncv: bold color-bar section titles, left header ---- */
  .cv--moderncv .cv-name { font-size: 22px; letter-spacing: 0.02em; }
  .cv--moderncv .cv-sec-title { border-bottom: 3px solid var(--cv-accent, #111); border-bottom-color: var(--cv-accent, #111); padding-bottom: 3px; font-weight: 600; }
  .cv--moderncv .cv-item-title { font-weight: 600; }

  /* ---- sb2nov: Computer-Modern serif, position-first, thin full rules ---- */
  .cv--sb2nov .cv-head { border-bottom: 1px solid #000; padding-bottom: 12px; }
  .cv--sb2nov .cv-name { font-size: 26px; letter-spacing: 0.01em; }
  .cv--sb2nov .cv-title { font-weight: 400; }
  .cv--sb2nov .cv-sec-title { border-bottom: 1px solid #000; text-transform: uppercase; letter-spacing: 0.05em; }
  .cv--sb2nov .cv-item-title { font-weight: 700; }
  .cv--sb2nov .cv-item-sub { font-style: italic; }
  .cv--sb2nov .cv-bullets li::marker { content: "◦  "; }
  .cv--sb2nov .cv-bullets { padding-left: 14px; }

  /* ---- engineering: Raleway sans, light name, full-line titles, crisp ---- */
  .cv--engineering .cv-head { border-bottom: 1px solid var(--cv-accent, #111); padding-bottom: 12px; }
  .cv--engineering .cv-name { font-size: 24px; font-weight: 600; letter-spacing: 0.03em; }
  .cv--engineering .cv-title { font-weight: 500; letter-spacing: 0.02em; }
  .cv--engineering .cv-sec-title { border-bottom: 1px solid var(--cv-accent, #111); text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em; padding-bottom: 3px; }
  .cv--engineering .cv-item-title { font-weight: 700; }

  /* ---- cvfy: clean indigo two-column, tinted right rail with chips ---- */
  .cv--cvfy .cv-head { border-bottom: none; padding-bottom: 14px; }
  .cv--cvfy .cv-name { font-size: 24px; letter-spacing: 0.01em; color: var(--cv-accent, #111); }
  .cv--cvfy .cv-title { font-weight: 500; color: var(--cv-accent, #111); }
  .cv--cvfy .cv-body--rightrail .cv-side { border-left: none; background: color-mix(in srgb, var(--cv-accent, #111) 4%, #fff); }
  .cv--cvfy .cv-sec-title { border-bottom: none; font-weight: 600; letter-spacing: 0.05em; padding-left: 8px; border-left: 3px solid var(--cv-accent, #111); }
  .cv--cvfy .cv-side .cv-sec-title { border-left: none; padding-left: 0; }
  .cv--cvfy .cv-side .cv-sec-title::before { content: ""; display: block; width: 22px; height: 3px; background: var(--cv-accent, #111); margin-bottom: 5px; }
  .cv--cvfy .cv-sec[data-sec="skills"] .cv-bullets { display: flex; flex-wrap: wrap; gap: 4px; padding-left: 0; }
  .cv--cvfy .cv-sec[data-sec="skills"] .cv-bullets li {
    background: color-mix(in srgb, var(--cv-accent, #111) 9%, #fff);
    color: var(--cv-ink, #111); padding: 1px 8px; border-radius: 999px; font-size: 10.5px; margin: 0;
  }
  .cv--cvfy .cv-item-title { color: var(--cv-accent, #111); }
  .cv--cvfy .cv-side .cv-item-title { color: var(--cv-ink, #111); }

  @media print {
    .cv-root { margin: 0; }
    .cv-sec { break-inside: avoid; }
  }
`;

/**
 * SEO landing-page slugs for templates. Kept server-safe (no client imports)
 * and shared by the sitemap, the template landing pages and the public
 * templates gallery.
 */

export type TplSlug = {
  templateId?: string;
  letters?: boolean;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  blurb: string;
  faq: { q: string; a: string }[];
};

export const TEMPLATE_SLUGS: Record<string, TplSlug> = {
  "ats-optimized-cv-template": {
    templateId: "tpl_ats",
    title: "Free ATS-Friendly CV Template — Pass Applicant Tracking Systems",
    description:
      "Use our free ATS-optimized CV template. Single-column, standard headings, no tables or graphics — built to parse cleanly through Workday, Greenhouse, Lever and iCIMS.",
    keywords: "ats cv template, ats resume template, ats friendly resume, free ats resume, applicant tracking system resume",
    h1: "ATS-Friendly CV Template",
    blurb:
      "Most resumes never reach a human — they fail an Applicant Tracking System first. This template uses a single column, standard section headings and zero graphics, so every recruiter sees exactly what you wrote.",
    faq: [
      { q: "What is an ATS-friendly CV?", a: "An ATS-friendly CV is a plain, single-column document with standard headings like 'Work Experience' and 'Skills' that software can parse into structured fields without confusion." },
      { q: "Do ATS systems reject two-column resumes?", a: "Often. Many parsers read left-to-right and mangle sidebars. OpenCV's ATS Pro template is deliberately single-column to avoid this." },
    ],
  },
  "classic-resume-template": {
    templateId: "tpl_charter",
    title: "Classic Resume Template — Timeless Single-Column CV",
    description:
      "A timeless, single-column resume template with elegant serif typography. Perfect for finance, law, healthcare and traditional industries. Free to use and download as PDF.",
    keywords: "classic resume template, traditional resume format, serif resume, timeless cv template",
    h1: "Classic Resume Template",
    blurb:
      "The traditional reverse-chronological resume, refined. Clean serif headings, a strong nameplate and generous spacing make this the safest choice for formal industries.",
    faq: [
      { q: "When should I use a classic resume template?", a: "Classic formats work best in formal industries — finance, law, academia, government and healthcare — where tradition and clarity are valued over flashy design." },
    ],
  },
  "modern-resume-template": {
    templateId: "tpl_focus",
    title: "Modern Resume Template — Clean ATS-Optimized Design",
    description:
      "A modern, clean resume template that still passes ATS. Sans-serif, condensed, and easy to scan. The everyday resume builder choice for 2026.",
    keywords: "modern resume template, clean resume template, simple resume format, modern cv design",
    h1: "Modern Resume Template",
    blurb:
      "Our most-used layout. Clean sans-serif type, a compact body and crisp section rules keep the focus on your achievements while staying fully ATS-safe.",
    faq: [
      { q: "Is the modern template ATS-safe?", a: "Yes. It is a single column with standard headings and no tables, so applicant tracking systems parse it cleanly." },
    ],
  },
  "minimal-resume-template": {
    templateId: "tpl_minimal",
    title: "Minimal Resume Template — Simple, Airy One-Page CV",
    description:
      "A minimalist resume template with generous whitespace and dotted rules. Ideal for design, product and startup roles. Free one-page CV maker.",
    keywords: "minimal resume template, simple resume, minimalist cv, one page resume template",
    h1: "Minimal Resume Template",
    blurb:
      "Nothing distracts from your words. Wide margins, quiet rules and airy spacing give recruiters a calm, readable page that feels premium without shouting.",
    faq: [
      { q: "Who is a minimal resume best for?", a: "Designers, product managers and creative professionals who want a clean, editorial look that still reads perfectly through ATS." },
    ],
  },
  "executive-cv-template": {
    templateId: "tpl_executive",
    title: "Executive CV Template — Leadership Resume Format",
    description:
      "A two-column executive CV template built for senior leaders. Contact rail, strong headline and metric-driven sections. Free professional CV maker.",
    keywords: "executive resume template, leadership resume, senior executive cv, two column resume",
    h1: "Executive CV Template",
    blurb:
      "Made for senior leaders: a contact rail, a commanding headline and sections that let measurable impact lead. Your track record deserves a layout that matches it.",
    faq: [
      { q: "How is an executive resume different?", a: "It leads with a short positioning summary and quantifiable achievements rather than job duties, and keeps everything to a scannable two pages." },
    ],
  },
  "two-column-resume-template": {
    templateId: "tpl_twocolumn",
    title: "Two-Column Resume Template — Split Layout CV",
    description:
      "A clean two-column resume template with a right rail for skills, languages and certifications. A popular, modern CV layout. Free download.",
    keywords: "two column resume template, split resume, right sidebar resume, 2 column cv",
    h1: "Two-Column Resume Template",
    blurb:
      "Main experience on the left, a tidy right rail for skills, languages, certifications and awards. Pack more into one page without the clutter.",
    faq: [
      { q: "Are two-column resumes ATS-safe?", a: "They can trip simpler parsers. If your target ATS is strict, our single-column ATS Pro template is the safer pick — this layout is best for human-reviewed applications." },
    ],
  },
  "technical-developer-cv-template": {
    templateId: "tpl_technical",
    title: "Technical Developer CV Template — Skills-First Resume",
    description:
      "A developer CV template with keyword skill chips, a projects-first feel and clean mono accents. Perfect for engineers, data scientists and IT pros.",
    keywords: "developer resume template, technical resume, software engineer cv, tech resume format",
    h1: "Technical Developer CV Template",
    blurb:
      "Built for engineers: skills as scannable keyword chips, projects given pride of place, and a technical typeface that signals exactly who you are.",
    faq: [
      { q: "Should developers use a skills-first resume?", a: "For tech roles, yes. Recruiters and automated keyword filters both scan for the right stack — a skills section up top makes matching instant." },
    ],
  },
  "academic-cv-template": {
    templateId: "tpl_academic",
    title: "Academic CV Template — Publication-First CV Format",
    description:
      "A formal academic CV template that puts publications, research and teaching first. Ideal for researchers, PhDs and faculty applications. Free.",
    keywords: "academic cv template, research cv, publication first cv, faculty resume template",
    h1: "Academic CV Template",
    blurb:
      "An academic CV is a different document — publications, research and teaching lead. This formal, publication-first format presents your scholarship with the right gravity.",
    faq: [
      { q: "How is an academic CV different from a resume?", a: "An academic CV is longer and lists publications, grants, teaching and talks in full, in reverse-chronological order — often 3+ pages." },
    ],
  },
  "creative-resume-template": {
    templateId: "tpl_creative",
    title: "Creative Resume Template — Bold Design CV",
    description:
      "A bold creative resume template with an accent header band — for designers, marketers and brand roles that expect visual flair. Free CV maker.",
    keywords: "creative resume template, design resume, bold cv, creative cv design",
    h1: "Creative Resume Template",
    blurb:
      "An accent header band and confident typography signal design ability before a word is read. Made for creative, marketing and brand roles.",
    faq: [
      { q: "Can a creative resume still be professional?", a: "Yes. Bold colour lives in the header band while content stays left-aligned and scannable — creative, but never at the cost of readability." },
    ],
  },
  "sidebar-resume-template": {
    templateId: "tpl_sidebar",
    title: "Sidebar Resume Template — Tinted Two-Column CV",
    description:
      "A two-column sidebar resume template with a tinted rail for summary, skills and languages. A polished, balanced CV layout. Free download.",
    keywords: "sidebar resume template, two column resume, side rail cv, balanced resume format",
    h1: "Sidebar Resume Template",
    blurb:
      "A tinted sidebar gives structure without stealing attention: contact, summary and skills on the rail, experience and education in the main column.",
    faq: [
      { q: "What goes in a resume sidebar?", a: "Secondary material that supports the main story: profile summary, core skills, languages, certifications and references." },
    ],
  },
  "ink-cv-template": {
    templateId: "tpl_ink",
    title: "Ink CV Template — Literary Serif Resume",
    description:
      "A literary serif CV template in deep indigo with small-caps headings, inspired by RenderCV Ink. Distinctive, elegant and free to download as PDF.",
    keywords: "ink cv template, serif resume, literary resume, small caps resume, elegant cv",
    h1: "Ink CV Template",
    blurb:
      "Inspired by RenderCV's Ink theme: warm serif type, a deep indigo nameplate and small-caps section headings with no hard rules between them. It reads like a well-set book page — memorable without being loud.",
    faq: [
      { q: "Who is a serif CV template best for?", a: "Serif faces suit editorial, humanities, academia, publishing and any role where a refined, traditional voice wins points — while still parsing cleanly through ATS." },
    ],
  },
  "ember-cv-template": {
    templateId: "tpl_ember",
    title: "Ember CV Template — Warm Editorial Resume",
    description:
      "A warm editorial CV template with a serif nameplate, small-caps accents and diamond bullets in a brick-red palette, inspired by RenderCV Ember. Free.",
    keywords: "ember cv template, editorial resume, brick red resume, serif nameplate, distinctive cv",
    h1: "Ember CV Template",
    blurb:
      "Inspired by RenderCV's Ember theme: a serif nameplate in warm brick red, small-caps accents and diamond bullets. Creative, editorial and unmistakably personal — ideal for design-adjacent and content roles.",
    faq: [
      { q: "Can a coloured name still be professional?", a: "Absolutely. A single accent colour on the name and section headings reads intentional, not childish — recruiters respond well to a confident, cohesive look." },
    ],
  },
  "opal-cv-template": {
    templateId: "tpl_opal",
    title: "Opal CV Template — Calm Modern Teal Resume",
    description:
      "A calm modern CV template in soft teal with a centred header, small-caps accents and generous whitespace, inspired by RenderCV Opal. Free to use.",
    keywords: "opal cv template, teal resume, calm resume, modern cv, soft colour resume",
    h1: "Opal CV Template",
    blurb:
      "Inspired by RenderCV's Opal theme: a soft teal accent, a centred nameplate and small-caps touches over generous whitespace. Calm, modern and friendly — a great fit for healthcare, education and people-focused roles.",
    faq: [
      { q: "Is a light accent colour safe for corporate applications?", a: "Yes — teal is one of the most corporate-friendly hues. Keep the body black and let the accent do the talking, exactly as this template does." },
    ],
  },
  "harvard-cv-template": {
    templateId: "tpl_harvard",
    title: "Harvard CV Template — Formal Academic Resume",
    description:
      "A formal serif CV template with a centred nameplate and elegantly framed headings, inspired by RenderCV Harvard. Ideal for academia and law. Free.",
    keywords: "harvard cv template, academic cv, formal resume, serif resume, law resume",
    h1: "Harvard CV Template",
    blurb:
      "Inspired by RenderCV's Harvard theme: black serif type, a centred nameplate and section headings framed by short rules. Conservative in colour, confident in craft — built for academia, law and senior policy roles.",
    faq: [
      { q: "What makes a CV look 'formal'?", a: "A restrained black-and-white palette, a serif face, centred alignment on the header and quiet rules around section headings — all of which this template applies." },
    ],
  },
  "moderncv-cv-template": {
    templateId: "tpl_moderncv",
    title: "ModernCV CV Template — Bold Colour-Bar Resume",
    description:
      "A classic ModernCV-style CV template with bold colour-bar section headers and a clean blue accent. Structured, readable, free to download.",
    keywords: "moderncv template, colour bar resume, blue resume, classic cv, structured resume",
    h1: "ModernCV CV Template",
    blurb:
      "The well-loved ModernCV look: bold colour bars beneath every section heading give the page a strong visual rhythm. A clean blue accent keeps it professional while the structure makes information effortless to scan.",
    faq: [
      { q: "Is the ModernCV style still current?", a: "Yes — its bold section bars are one of the most recognised resume structures in academia and engineering, and the strong hierarchy helps both humans and ATS find content fast." },
    ],
  },
  "sb2nov-cv-template": {
    templateId: "tpl_sb2nov",
    title: "Sb2nov CV Template — Position-First Serif Resume",
    description:
      "A position-first serif CV template with thin full-width rules, inspired by RenderCV's Sb2nov theme. A recruiter favourite. Free PDF download.",
    keywords: "sb2nov cv template, position first resume, serif resume, thin rule resume, recruiter favourite",
    h1: "Sb2nov CV Template",
    blurb:
      "Inspired by RenderCV's popular Sb2nov theme: each role leads with your job title, the company sits beneath in italics, and thin full-width rules keep every section crisp. Understated, classic and recruiter-approved.",
    faq: [
      { q: "Why put the job title before the company?", a: "Recruiters skim for the roles you've held. Leading each entry with the title surfaces the most important information in the first words they read." },
    ],
  },
  "engineering-cv-template": {
    templateId: "tpl_engineering",
    title: "Engineering CV Template — Geometric Sans Resume",
    description:
      "A crisp engineering CV template in a geometric sans-serif with clean full-width rules and a skills-first order. Built for engineers and analysts. Free.",
    keywords: "engineering cv template, geometric sans resume, technical resume, engineer cv, analyst resume",
    h1: "Engineering CV Template",
    blurb:
      "A crisp geometric sans-serif in the style of classic engineering CVs: skills lead, full-width rules structure the page and nothing competes with your content. Built for engineers, analysts and technical specialists.",
    faq: [
      { q: "What should an engineering resume include first?", a: "A short summary followed by a skills block. Automated keyword filters and busy hiring managers both scan the top of the page first — this template puts exactly that there." },
    ],
  },
  "indigo-two-column-cv-template": {
    templateId: "tpl_cvfy",
    title: "Indigo Two-Column CV Template — Friendly Modern Resume",
    description:
      "A friendly indigo two-column CV template with skill chips and a tinted side rail, inspired by CVfy. Modern, approachable and free to download.",
    keywords: "indigo resume, two column resume, skill chips resume, cvfy style, modern two column cv",
    h1: "Indigo Two-Column CV Template",
    blurb:
      "Inspired by CVfy: a warm indigo accent, a tinted side rail for skills and extras, and skill chips that turn your stack into scannable tags. Friendly, modern and perfect for product, design and startup roles.",
    faq: [
      { q: "Are two-column CVs ATS-safe?", a: "They can trip simpler parsers. If you're applying through a strict ATS, our single-column ATS Pro template is the safer pick — use this one for human-reviewed applications." },
    ],
  },
  "cover-letter-templates": {
    letters: true,
    title: "Free Cover Letter Templates — 7 Professional Formats",
    description:
      "Seven free cover letter templates: classic block, modern, modified block, semi-block, minimal, executive and creative. Pair any letter with a matching CV and download as PDF.",
    keywords: "cover letter template, cover letter builder, free cover letter, professional cover letter format",
    h1: "Cover Letter Templates",
    blurb:
      "Your cover letter should match your CV. Pick from seven professional formats — from the traditional block letter to a modern accent design — and export both as one PDF.",
    faq: [
      { q: "What is the best cover letter format?", a: "For most jobs the full-block or modern format works best: left-aligned, one page, three to four paragraphs. Creative roles can use a bolder design." },
      { q: "Should my cover letter match my resume?", a: "Yes. Matching typography and colour makes the application feel cohesive and intentional — OpenCV pairs any letter with your CV automatically." },
    ],
  },
};

/** Reverse map: template id → SEO slug. */
export const SLUG_BY_TEMPLATE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(TEMPLATE_SLUGS)
    .filter(([, v]) => v.templateId)
    .map(([slug, v]) => [v.templateId!, slug]),
);

export function slugForTemplateId(id: string): string | null {
  return SLUG_BY_TEMPLATE_ID[id] ?? null;
}

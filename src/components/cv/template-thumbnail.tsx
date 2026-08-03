"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildSections,
  contactLine,
  CvDocument,
  type DocTheme,
  type MasterProfile,
} from "@/lib/cv/render";
import type { SectionKey } from "@/lib/cv/types";
import { cn } from "@/lib/utils";

/** Realistic sample data used to render every template thumbnail. */
const SAMPLE_PROFILE: MasterProfile = {
  profile: {
    headline: "Senior Product Engineer",
    personalInfo: {
      fullName: "Alex Rivera",
      email: "alex.rivera@email.com",
      phone: "+1 555 014 2388",
      city: "Berlin",
      country: "Germany",
      links: [{ label: "linkedin.com/in/alexrivera", url: "" }],
    },
  },
  summaries: [
    {
      text: "Product engineer with 8+ years shipping scalable SaaS, leading cross-functional teams and driving measurable growth across web and mobile.",
    },
  ],
  experience: [
    {
      role: "Senior Product Engineer",
      company: "Nova Labs",
      location: "Berlin",
      startDate: "2022",
      endDate: "Present",
      isCurrent: true,
      bullets: [
        { text: "Led a 6-person team building a platform used by 2M+ monthly users." },
        { text: "Cut API latency 40% by re-architecting the data layer." },
        { text: "Drove adoption of CI/CD, reducing release time from days to hours." },
      ],
    },
    {
      role: "Product Engineer",
      company: "Bright Systems",
      location: "Amsterdam",
      startDate: "2018",
      endDate: "2022",
      bullets: [
        { text: "Shipped 20+ customer-facing features with an average 4.6/5 review score." },
        { text: "Collaborated with design and data to increase activation by 18%." },
      ],
    },
  ],
  education: [
    {
      degree: "B.Sc. Computer Science",
      institution: "Technical University of Munich",
      startDate: "2014",
      endDate: "2018",
      details: "Graduated with honours; focus on distributed systems.",
    },
  ],
  skills: [
    { name: "TypeScript", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "Go", category: "Languages" },
    { name: "React", category: "Frameworks" },
    { name: "Next.js", category: "Frameworks" },
    { name: "Node.js", category: "Frameworks" },
    { name: "PostgreSQL", category: "Data" },
    { name: "Redis", category: "Data" },
    { name: "AWS", category: "Cloud" },
    { name: "Docker", category: "Cloud" },
  ],
  certifications: [{ name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023" }],
  languages: [
    { name: "English", cefrLevel: "C2" },
    { name: "German", cefrLevel: "B2" },
    { name: "Spanish", cefrLevel: "C1" },
  ],
  projects: [
    {
      name: "openbench — OSS benchmarking suite",
      description: "10k+ GitHub stars; used by 30+ teams for CI performance budgets.",
      tech: ["TypeScript", "GitHub Actions"],
    },
  ],
  awards: [{ title: "Rising Star Award", issuer: "Bright Systems", date: "2021" }],
  volunteer: [
    {
      organization: "CodeFirst Girls",
      role: "Mentor",
      startDate: "2023",
      endDate: "Present",
      details: "Mentoring career-changers through their first engineering roles.",
    },
  ],
  references: [{ name: "Jordan Lee", relation: "Engineering Manager", contact: "jordan@novalabs.io" }],
};

const DEFAULT_THEME: DocTheme = {
  accent: "#1e3a8a",
  paper: "#ffffff",
  ink: "#111827",
  muted: "#6b7280",
  font: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const DESIGN_W = 600;
const DESIGN_H = Math.round((600 * 297) / 210); // A4 aspect

/**
 * Renders a real, miniature CV preview for a template — the actual CvDocument
 * scaled to fit its container exactly (A4 aspect ratio, never clipped).
 */
export function TemplateThumbnail({
  format,
  order,
  theme,
  scale = 0.5,
  className,
}: {
  format: string;
  order: SectionKey[];
  theme: Partial<DocTheme>;
  scale?: number;
  className?: string;
}) {
  const resolved = { ...DEFAULT_THEME, ...theme };
  const sections = buildSections(SAMPLE_PROFILE, order, []);
  const contact = contactLine(SAMPLE_PROFILE.profile?.personalInfo);

  const ref = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setFit(Math.min(w / DESIGN_W, h / DESIGN_H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const final = fit ?? scale;
  const boxW = Math.round(DESIGN_W * final);
  const boxH = Math.round(DESIGN_H * final);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none relative aspect-[210/297] w-full select-none overflow-hidden rounded-sm bg-white",
        className,
      )}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div style={{ width: boxW, height: boxH, overflow: "hidden" }}>
          <div
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${final})`,
              transformOrigin: "top left",
              background: resolved.paper,
            }}
          >
            <CvDocument
              name="Alex Rivera"
              headline={SAMPLE_PROFILE.profile?.headline}
              contact={contact}
              sections={sections}
              format={format}
              theme={resolved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

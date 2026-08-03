import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { genId } from "@/lib/id";
import { getMasterProfile } from "@/lib/profile/service";
import { getTemplate } from "@/lib/cv/templates";
import { ensureLetterTemplates } from "@/lib/cover-letters/templates";
import type { SectionKey } from "@/lib/cv/types";

/**
 * Seeds a realistic demo profile + a flagship CV + a paired cover letter for a
 * brand-new user so they can see the full product without typing anything.
 * Idempotent per user: refuses to overwrite existing content.
 */
export async function seedDemoData(userId: string) {
  const profile = await getMasterProfile(userId);
  const existing = await db
    .select({ id: s.experienceBlocks.id })
    .from(s.experienceBlocks)
    .where(eq(s.experienceBlocks.masterProfileId, profile.id))
    .limit(1);
  if (existing.length > 0) return { seeded: false, cvId: null };

  await db
    .update(s.masterProfiles)
    .set({
      headline: "Senior Product Engineer · Data Platform Specialist",
      personalInfo: {
        fullName: "Alex Rivera",
        email: "alex.rivera@example.com",
        phone: "+34 612 345 678",
        city: "Berlin",
        country: "Germany",
        nationality: "EU",
        website: "linkedin.com/in/alexrivera",
        links: [
          { label: "linkedin.com/in/alexrivera", url: "https://linkedin.com/in/alexrivera" },
          { label: "github.com/alexrivera", url: "https://github.com/alexrivera" },
        ],
      },
    })
    .where(eq(s.masterProfiles.id, profile.id));

  const summaryId = genId("sum");
  await db.insert(s.summaries).values({
    id: summaryId,
    masterProfileId: profile.id,
    label: "Profile",
    orderIndex: 0,
    text:
      "Product Engineer with 8+ years building data platforms and developer tools. " +
      "Led migrations that cut query latency by 60% and shipped features used by 2M+ monthly users. " +
      "Comfortable across the stack, from streaming pipelines to polished React UIs.",
  });

  const exp1 = genId("exp");
  const exp2 = genId("exp");
  await db.insert(s.experienceBlocks).values([
    {
      id: exp1,
      masterProfileId: profile.id,
      company: "Nordwind Analytics",
      role: "Senior Product Engineer",
      location: "Berlin, Germany",
      startDate: "Mar 2022",
      endDate: "Present",
      isCurrent: true,
      employmentType: "Full-time",
      tags: ["Data Platform", "TypeScript", "Kafka"],
      orderIndex: 0,
    },
    {
      id: exp2,
      masterProfileId: profile.id,
      company: "Brightloop Systems",
      role: "Backend Engineer",
      location: "Lisbon, Portugal",
      startDate: "Jun 2018",
      endDate: "Feb 2022",
      isCurrent: false,
      employmentType: "Full-time",
      tags: ["Go", "PostgreSQL", "AWS"],
      orderIndex: 1,
    },
  ]);

  await db.insert(s.experienceBullets).values([
    { id: genId("blt"), experienceBlockId: exp1, text: "Re-architected the ingestion pipeline, reducing event processing latency by 60% at 40k events/sec.", tags: [], orderIndex: 0 },
    { id: genId("blt"), experienceBlockId: exp1, text: "Led a team of 4 to ship a self-serve reporting product adopted by 500+ organisations.", tags: [], orderIndex: 1 },
    { id: genId("blt"), experienceBlockId: exp1, text: "Introduced typed API contracts, cutting integration bugs by 45% across three teams.", tags: [], orderIndex: 2 },
    { id: genId("blt"), experienceBlockId: exp2, text: "Built and operated REST and gRPC services handling 200M requests/month on AWS.", tags: [], orderIndex: 0 },
    { id: genId("blt"), experienceBlockId: exp2, text: "Cut cold-start times 70% by moving compute to Lambda and adopting PostgreSQL read replicas.", tags: [], orderIndex: 1 },
    { id: genId("blt"), experienceBlockId: exp2, text: "Mentored 3 junior engineers; one promoted to mid-level within 12 months.", tags: [], orderIndex: 2 },
  ]);

  await db.insert(s.educationBlocks).values({
    id: genId("edu"),
    masterProfileId: profile.id,
    institution: "TU Delft",
    degree: "MSc",
    field: "Computer Science",
    startDate: "2016",
    endDate: "2018",
    gpa: "8.2/10",
    details: "Thesis on distributed consensus algorithms.",
    orderIndex: 0,
  });

  await db.insert(s.skills).values([
    { id: genId("skl"), masterProfileId: profile.id, name: "TypeScript", category: "Languages", level: 5, years: 7, orderIndex: 0 },
    { id: genId("skl"), masterProfileId: profile.id, name: "Python", category: "Languages", level: 4, years: 6, orderIndex: 1 },
    { id: genId("skl"), masterProfileId: profile.id, name: "Go", category: "Languages", level: 4, years: 4, orderIndex: 2 },
    { id: genId("skl"), masterProfileId: profile.id, name: "React", category: "Frameworks", level: 5, years: 6, orderIndex: 3 },
    { id: genId("skl"), masterProfileId: profile.id, name: "Apache Kafka", category: "Data", level: 4, years: 5, orderIndex: 4 },
    { id: genId("skl"), masterProfileId: profile.id, name: "PostgreSQL", category: "Data", level: 4, years: 6, orderIndex: 5 },
    { id: genId("skl"), masterProfileId: profile.id, name: "AWS", category: "Cloud", level: 4, years: 5, orderIndex: 6 },
    { id: genId("skl"), masterProfileId: profile.id, name: "Kubernetes", category: "Cloud", level: 3, years: 3, orderIndex: 7 },
  ]);

  await db.insert(s.languages).values([
    { id: genId("lng"), masterProfileId: profile.id, name: "English", cefrLevel: "C2", orderIndex: 0 },
    { id: genId("lng"), masterProfileId: profile.id, name: "German", cefrLevel: "B2", orderIndex: 1 },
    { id: genId("lng"), masterProfileId: profile.id, name: "Spanish", cefrLevel: "Native", orderIndex: 2 },
  ]);

  await db.insert(s.certifications).values([
    { id: genId("crt"), masterProfileId: profile.id, name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023", orderIndex: 0 },
    { id: genId("crt"), masterProfileId: profile.id, name: "Professional Scrum Master I", issuer: "Scrum.org", date: "2021", orderIndex: 1 },
  ]);

  await db.insert(s.projects).values({
    id: genId("prj"),
    masterProfileId: profile.id,
    name: "Streamline CLI",
    description: "Open-source CLI for inspecting Kafka consumer lag; 1.4k GitHub stars.",
    tech: ["Go", "Kafka", "cobra"],
    link: "github.com/alexrivera/streamline",
    startDate: "2023",
    endDate: "Present",
    orderIndex: 0,
  });

  const cvId = genId("cv");
  const template = await getTemplate("tpl_charter");
  const templateId = template?.id ?? null;
  await db.insert(s.cvs).values({
    id: cvId,
    userId,
    masterProfileId: profile.id,
    templateId,
    name: "Alex Rivera — Product Engineer",
    settings: {},
    status: "ready",
  });

  const order = (template?.layoutSchema?.order ?? []) as SectionKey[];
  if (order.length === 0) {
    await db.insert(s.cvSections).values({
      id: genId("sec"),
      cvId,
      sectionType: "summary",
      isVisible: true,
      orderIndex: 0,
    });
  } else {
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

  await ensureLetterTemplates();
  const letterId = genId("ltr");
  await db.insert(s.coverLetters).values({
    id: letterId,
    userId,
    cvId,
    templateId: "let_modern",
    jobId: null,
    name: "Cover letter for Alex Rivera",
    content: {
      greeting: "Dear Hiring Team,",
      paragraphs: [
        "I am writing to apply for a Senior Product Engineer role. Over the past eight years I have built data platforms and developer tools used by millions, and I would love to bring that experience to your team.",
        "At Nordwind Analytics I re-architected the ingestion pipeline to cut latency by 60% and led the launch of a self-serve reporting product adopted by 500+ organisations. I care deeply about clean APIs, measurable outcomes, and helping teammates grow.",
        "I would welcome the chance to discuss how I could contribute to your roadmap.",
      ],
      closing: "Thank you for your time and consideration.",
      signOff: "Best regards,",
    },
  });

  return { seeded: true, cvId, letterId };
}

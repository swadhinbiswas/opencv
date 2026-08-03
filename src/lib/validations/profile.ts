import { z } from "zod";

// ---------------------------------------------------------------------------
// Master Profile personal info
// ---------------------------------------------------------------------------
export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  headline: z.string().trim().max(160).default(""),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")),
  phone: z.string().trim().max(40).default(""),
  city: z.string().trim().max(80).default(""),
  country: z.string().trim().max(80).default(""),
  nationality: z.string().trim().max(60).default(""),
  dateOfBirth: z.string().trim().max(20).default("").optional(),
  website: z.string().trim().max(200).default("").optional(),
  photoUrl: z.string().trim().max(500).default("").optional(),
  links: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().trim().max(40).default(""),
        url: z.string().trim().max(500).default(""),
      }),
    )
    .default([]),
  // Privacy-sensitive, opt-in: surfaced for EU formats, discouraged for ATS.
  includeDateOfBirth: z.boolean().default(false),
  includePhoto: z.boolean().default(false),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

export const profileMetaSchema = z.object({
  headline: z.string().trim().max(160).default(""),
  personalInfo: personalInfoSchema,
});

// ---------------------------------------------------------------------------
// Master profile blocks
// ---------------------------------------------------------------------------
export const blockBase = {
  id: z.string().min(1),
  orderIndex: z.number().int().default(0),
};

export const summarySchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(60),
  text: z.string().trim().min(1).max(2000),
  orderIndex: z.number().int().default(0),
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().max(120).default(""),
  location: z.string().trim().max(120).default(""),
  startDate: z.string().trim().max(20).default(""),
  endDate: z.string().trim().max(20).default(""),
  isCurrent: z.boolean().default(false),
  employmentType: z.string().trim().max(40).default("Full-time"),
  tags: z.array(z.string()).default([]),
  bulletIds: z.array(z.string()).default([]),
  bullets: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().trim().min(1).max(500),
        tags: z.array(z.string()).default([]),
        orderIndex: z.number().int().default(0),
      }),
    )
    .default([]),
  orderIndex: z.number().int().default(0),
});

export const experienceBulletSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(500),
  tags: z.array(z.string()).default([]),
  orderIndex: z.number().int().default(0),
});

export const educationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().trim().min(1, "Institution is required").max(160),
  degree: z.string().trim().max(160).default(""),
  field: z.string().trim().max(160).default(""),
  startDate: z.string().trim().max(20).default(""),
  endDate: z.string().trim().max(20).default(""),
  gpa: z.string().trim().max(20).default(""),
  details: z.string().trim().max(2000).default(""),
  orderIndex: z.number().int().default(0),
});

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Skill name is required").max(80),
  category: z.string().trim().max(60).default("Tools"),
  level: z.number().int().min(1).max(5).default(3),
  years: z.number().int().min(0).max(60).nullable().default(null),
  orderIndex: z.number().int().default(0),
});

export const languageSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "Native"]).default("B1"),
  orderIndex: z.number().int().default(0),
});

export const certificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Certification name required").max(160),
  issuer: z.string().trim().max(160).default(""),
  date: z.string().trim().max(20).default(""),
  credentialUrl: z.string().trim().max(500).default(""),
  orderIndex: z.number().int().default(0),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Project name is required").max(160),
  description: z.string().trim().max(2000).default(""),
  tech: z.array(z.string()).default([]),
  link: z.string().trim().max(500).default(""),
  startDate: z.string().trim().max(20).default(""),
  endDate: z.string().trim().max(20).default(""),
  orderIndex: z.number().int().default(0),
});

export const publicationSchema = z.object({
  id: z.string().min(1),
  citation: z.string().trim().min(1).max(2000),
  date: z.string().trim().max(20).default(""),
  link: z.string().trim().max(500).default(""),
  orderIndex: z.number().int().default(0),
});

export const awardSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Award title is required").max(160),
  issuer: z.string().trim().max(160).default(""),
  date: z.string().trim().max(20).default(""),
  orderIndex: z.number().int().default(0),
});

export const volunteerSchema = z.object({
  id: z.string().min(1),
  organization: z.string().trim().min(1).max(160),
  role: z.string().trim().max(160).default(""),
  startDate: z.string().trim().max(20).default(""),
  endDate: z.string().trim().max(20).default(""),
  details: z.string().trim().max(2000).default(""),
  orderIndex: z.number().int().default(0),
});

export const referenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  relation: z.string().trim().max(120).default(""),
  contact: z.string().trim().max(200).default(""),
  visible: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export const customSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  items: z
    .array(z.object({ title: z.string().default(""), text: z.string().default("") }))
    .default([]),
  orderIndex: z.number().int().default(0),
});

// ---------------------------------------------------------------------------
// Generic API envelope shared by profile endpoints
// ---------------------------------------------------------------------------
export const apiOk = <Data extends z.ZodTypeAny>(data: Data) =>
  z.object({ ok: z.literal(true), data });

export const apiErr = z.object({ ok: z.literal(false), error: z.string() });
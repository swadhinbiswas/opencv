import { z } from "zod";

export const jobStatusSchema = z.enum([
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export const jobSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(160),
  role: z.string().trim().min(1, "Role is required").max(160),
  jobUrl: z.string().trim().max(500).default(""),
  status: jobStatusSchema.default("wishlist"),
  salaryRange: z.string().trim().max(120).default(""),
  contactName: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(5000).default(""),
  followUpDate: z.string().trim().max(20).default(""),
  cvId: z.string().trim().max(60).nullable().default(null),
});

/** Patch variant: every field optional WITHOUT defaults, so absent keys stay untouched. */
export const jobPatchSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(160).optional(),
  role: z.string().trim().min(1, "Role is required").max(160).optional(),
  jobUrl: z.string().trim().max(500).optional(),
  status: jobStatusSchema.optional(),
  salaryRange: z.string().trim().max(120).optional(),
  contactName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(5000).optional(),
  followUpDate: z.string().trim().max(20).optional(),
  cvId: z.string().trim().max(60).nullable().optional(),
});

export const jobEventSchema = z.object({
  type: z.string().trim().min(1, "Event type is required").max(80),
  note: z.string().trim().max(5000).default(""),
});

export type JobInput = z.infer<typeof jobSchema>;
export type JobPatch = z.infer<typeof jobPatchSchema>;
export type JobEventInput = z.infer<typeof jobEventSchema>;

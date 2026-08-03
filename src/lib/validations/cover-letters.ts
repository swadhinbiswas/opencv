import { z } from "zod";

export const letterContentSchema = z.object({
  greeting: z.string().trim().max(200).default("Dear Hiring Team,"),
  paragraphs: z.array(z.string().trim().max(5000)).default([]),
  closing: z.string().trim().max(5000).default(""),
  signOff: z.string().trim().max(200).default("Best regards,"),
});

export type LetterContent = z.infer<typeof letterContentSchema>;

export const coverLetterSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  templateId: z.string().trim().max(60).nullable().default(null),
  cvId: z.string().trim().max(60).nullable().default(null),
  jobId: z.string().trim().max(60).nullable().default(null),
  content: letterContentSchema,
});

export const coverLetterPatchSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160).optional(),
  templateId: z.string().trim().max(60).nullable().optional(),
  cvId: z.string().trim().max(60).nullable().optional(),
  jobId: z.string().trim().max(60).nullable().optional(),
  content: letterContentSchema.partial().optional(),
});

export const emptyLetterContent = (): LetterContent => ({
  greeting: "Dear Hiring Team,",
  paragraphs: [
    "I am writing to express my interest in the role at your company.",
    "My experience and skills align well with what you are looking for, and I am excited about the opportunity to contribute to your team.",
  ],
  closing: "Thank you for your time and consideration.",
  signOff: "Best regards,",
});

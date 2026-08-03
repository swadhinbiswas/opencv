import "server-only";
import { listCvs } from "@/lib/cv/service";
import { listLetters } from "@/lib/cover-letters/service";
import { listJobs } from "@/lib/jobs/service";
import { getFullProfile } from "@/lib/profile/service";

const JOB_STAGES = ["wishlist", "applied", "screening", "interview", "offer"] as const;

export async function getDashboardStats(userId: string) {
  const [cvs, letters, jobs, full] = await Promise.all([
    listCvs(userId),
    listLetters(userId),
    listJobs(userId),
    getFullProfile(userId),
  ]);

  const info = (full.profile.personalInfo ?? {}) as Record<string, unknown>;
  const filledSections = [
    full.summaries.length,
    full.experience.length,
    full.education.length,
    full.skills.length,
    full.certifications.length,
    full.languages.length,
    full.projects.length,
    full.awards.length,
    full.volunteer.length,
    full.publications.length,
    full.customSections.length,
  ].filter((n) => n > 0).length;

  const checklist = [
    {
      key: "profile",
      label: "Fill your Master Profile",
      href: "/profile",
      done: Boolean(
        (info.fullName as string)?.trim() ||
          (info.email as string)?.trim() ||
          full.profile.headline?.trim() ||
          full.experience.length > 0,
      ),
    },
    {
      key: "cv",
      label: "Create your first CV",
      href: "/cv/new",
      done: cvs.length > 0,
    },
    {
      key: "letter",
      label: "Write a cover letter",
      href: "/cover-letters",
      done: letters.length > 0,
    },
    {
      key: "job",
      label: "Track a job application",
      href: "/jobs",
      done: jobs.length > 0,
    },
  ];

  const byStatus: Record<string, number> = {};
  for (const j of jobs) byStatus[j.status] = (byStatus[j.status] ?? 0) + 1;

  return {
    counts: {
      cvs: cvs.length,
      letters: letters.length,
      jobs: jobs.length,
      profileSections: filledSections,
    },
    byStatus,
    pipeline: JOB_STAGES.map((stage) => ({ stage, count: byStatus[stage] ?? 0 })),
    recentCvs: cvs.slice(0, 4).map((c) => ({
      id: c.cv.id,
      name: c.cv.name,
      status: c.cv.status,
      updatedAt: c.cv.updatedAt,
      templateName: c.templateName ?? null,
    })),
    recentLetters: letters.slice(0, 4).map((l) => ({
      id: l.id,
      name: l.name,
      jobCompany: l.jobCompany,
      jobRole: l.jobRole,
      updatedAt: l.updatedAt ?? "",
    })),
    checklist,
  };
}

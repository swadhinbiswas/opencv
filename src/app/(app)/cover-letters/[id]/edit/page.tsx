import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getLetter } from "@/lib/cover-letters/service";
import { listJobs } from "@/lib/jobs/service";
import { listCvs } from "@/lib/cv/service";
import { getFullProfile } from "@/lib/profile/service";
import { buildFromBlock } from "@/lib/cover-letters/format";
import { LetterEditor } from "@/components/cover-letters/letter-editor";

export const metadata: Metadata = { title: "Edit cover letter" };

export default async function EditLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { id } = await params;

  const letter = await getLetter(id, session.userId);
  if (!letter) notFound();

  const [jobs, cvs, master] = await Promise.all([
    listJobs(session.userId),
    listCvs(session.userId),
    getFullProfile(session.userId),
  ]);

  const from = buildFromBlock(master.profile?.personalInfo as Record<string, unknown>);

  return (
    <LetterEditor
      letter={{
        id: letter.id,
        name: letter.name,
        cvId: letter.cvId,
        templateId: letter.templateId,
        jobId: letter.jobId,
        content: letter.content,
        templateName: letter.templateName,
        job: letter.job,
      }}
      jobs={jobs.map((j) => ({ id: j.id, company: j.company, role: j.role }))}
      cvs={cvs.map((c) => ({ id: c.cv.id, name: c.cv.name }))}
      from={from}
    />
  );
}
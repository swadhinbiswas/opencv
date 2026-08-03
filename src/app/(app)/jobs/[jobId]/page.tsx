import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getJob } from "@/lib/jobs/service";
import { listCvs } from "@/lib/cv/service";
import { JobDetail } from "@/components/jobs/job-detail";

export const metadata: Metadata = { title: "Job" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { jobId } = await params;

  const data = await getJob(jobId, session.userId);
  if (!data) notFound();
  const cvs = await listCvs(session.userId);

  return (
    <JobDetail
      job={data.job}
      events={data.events}
      cvs={cvs.map((c) => ({ cv: { id: c.cv.id, name: c.cv.name } }))}
    />
  );
}
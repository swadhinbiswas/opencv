import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { listJobs } from "@/lib/jobs/service";
import { KanbanBoard } from "@/components/jobs/kanban-board";

export const metadata: Metadata = { title: "Job tracker" };

export default async function JobsPage() {
  const session = await getSession();
  const jobs = session ? await listJobs(session.userId) : [];

  return (
    <div className="mx-auto max-w-full px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Job tracker</h1>
        <p className="mt-1 text-muted-foreground">
          Kanban board of your applications, from wishlist to offer.
        </p>
      </header>
      <div className="mt-8">
        <KanbanBoard initial={jobs} />
      </div>
    </div>
  );
}
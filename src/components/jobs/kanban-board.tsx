"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/jobs/format";
import { JobFormDialog } from "@/components/jobs/job-form";
import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  PIPELINE,
  STATUS_TINTS,
  type JobStatus,
} from "@/lib/jobs/constants";

type Job = {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  status: JobStatus;
  salaryRange: string | null;
  contactName: string | null;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  latestEvent?: { type: string; createdAt: string } | null;
};

export function KanbanBoard({ initial }: { initial: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initial);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const body = await res.json();
      if (body.ok) setJobs(body.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byStatus = useMemo(() => {
    const map = new Map<JobStatus, Job[]>();
    for (const st of JOB_STATUSES) map.set(st, []);
    for (const j of jobs) {
      const arr = map.get(j.status);
      if (arr) arr.push(j);
    }
    return map;
  }, [jobs]);

  async function move(job: Job, direction: -1 | 1) {
    const idx = PIPELINE.indexOf(job.status);
    const next = PIPELINE[idx + direction];
    if (!next) return;
    setMoving(job.id);
    try {
      const res = await fetch(`/api/jobs/${job.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) await refresh();
    } finally {
      setMoving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const total = jobs.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} job{total === 1 ? "" : "s"} · click a card for details
        </p>
        <JobFormDialog onCreated={refresh} />
      </div>

      {total === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">Nothing tracked yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Add your first application — wishlist roles before you apply, then move
            them through the pipeline.
          </p>
          <div className="mt-5">
            <JobFormDialog onCreated={refresh} />
          </div>
        </div>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {JOB_STATUSES.map((st) => {
            const items = byStatus.get(st) ?? [];
            return (
              <section key={st} className="flex w-64 shrink-0 flex-col rounded-xl border bg-muted/20">
                <header className="flex items-center justify-between px-3 py-2">
                  <h3 className={cn("text-sm font-semibold", STATUS_TINTS[st])}>
                    {JOB_STATUS_LABELS[st]}
                  </h3>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </header>
                <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                  {items.map((job) => (
                    <div
                      key={job.id}
                      className="group rounded-lg border bg-background p-3 shadow-sm transition hover:border-primary/40"
                    >
                      <Link href={`/jobs/${job.id}`} className="block">
                        <div className="font-semibold leading-tight">{job.company}</div>
                        <div className="mt-0.5 truncate text-sm text-muted-foreground">
                          {job.role}
                        </div>
                        {job.followUpDate ? (
                          <div className="mt-1.5 text-xs text-muted-foreground">
                            Follow-up: {job.followUpDate}
                          </div>
                        ) : null}
                        <div className="mt-1.5 text-[11px] text-muted-foreground">
                          {job.latestEvent
                            ? `${job.latestEvent.type} · ${timeAgo(job.latestEvent.createdAt)}`
                            : `Updated ${timeAgo(job.updatedAt)}`}
                        </div>
                      </Link>
                      <div className="mt-2 flex justify-end gap-0.5 opacity-0 transition group-hover:opacity-100">
                        {PIPELINE.includes(job.status) && PIPELINE.indexOf(job.status) > 0 ? (
                          <button
                            onClick={() => move(job, -1)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                            aria-label="Move backward"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        ) : null}
                        {PIPELINE.includes(job.status) && PIPELINE.indexOf(job.status) < PIPELINE.length - 1 ? (
                          <button
                            onClick={() => move(job, 1)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                            aria-label="Move forward"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : null}
                        {moving === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                      Empty
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
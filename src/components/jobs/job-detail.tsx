"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ExternalLink,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/jobs/format";
import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  STATUS_TINTS,
  type JobStatus,
} from "@/lib/jobs/constants";
import { NewLetterButton } from "@/components/cover-letters/new-letter-button";

type JobEvent = { id: string; type: string; note: string | null; createdAt: string };

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
  cvId: string | null;
  createdAt: string;
  updatedAt: string;
};

type Cv = { cv: { id: string; name: string } };

export function JobDetail({
  job: initial,
  events: initialEvents,
  cvs,
}: {
  job: Job;
  events: JobEvent[];
  cvs: Cv[];
}) {
  const router = useRouter();
  const [job, setJob] = useState<Job>(initial);
  const [events, setEvents] = useState<JobEvent[]>(initialEvents);
  const [editing, setEditing] = useState<Job>(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [note, setNote] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/jobs/${job.id}`);
    const body = await res.json();
    if (body.ok) {
      setJob(body.data.job);
      setEvents(body.data.events);
    }
  }, [job.id]);

  function save() {
    setBusy(true);
    setError(null);
    fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
      .then((r) => r.json())
      .then((b) => {
        if (!b.ok) throw new Error(b.error ?? "Could not save");
        setJob(b.data.job);
        setDirty(false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }

  async function changeStatus(status: JobStatus) {
    setStatusBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const b = await res.json();
      if (!b.ok) throw new Error(b.error ?? "Could not update status");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setStatusBusy(false);
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setNoteBusy(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "Note", note }),
      });
      const b = await res.json();
      if (!b.ok) throw new Error(b.error ?? "Could not add note");
      setNote("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setNoteBusy(false);
    }
  }

  async function remove() {
    setDeleting(true);
    await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    router.push("/jobs");
    router.refresh();
  }

  const meta = [
    { icon: DollarSign, label: "Salary", value: job.salaryRange },
    { icon: User, label: "Contact", value: job.contactName },
    { icon: Calendar, label: "Follow-up", value: job.followUpDate },
    { icon: Calendar, label: "Applied", value: new Date(job.createdAt).toLocaleDateString() },
  ].filter((m) => m.value);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/jobs">
            <ArrowLeft className="mr-1 h-4 w-4" /> Jobs
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {job.role}
          </h1>
          <p className="text-muted-foreground">{job.company}</p>
        </div>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select value={job.status} onValueChange={(v) => changeStatus(v as JobStatus)} disabled={statusBusy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((st) => (
              <SelectItem key={st} value={st}>
                {JOB_STATUS_LABELS[st]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className={cn("font-medium", STATUS_TINTS[job.status])}>
          {JOB_STATUS_LABELS[job.status]}
        </Badge>
        {job.jobUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={job.jobUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Job posting
            </a>
          </Button>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {meta.map((m) => (
          <div key={m.label} className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm">
            <m.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="truncate">{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Company</Label>
            <Input value={editing.company} onChange={(e) => { setEditing({ ...editing, company: e.target.value }); setDirty(true); }} />
          </div>
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Input value={editing.role} onChange={(e) => { setEditing({ ...editing, role: e.target.value }); setDirty(true); }} />
          </div>
          <div className="grid gap-1.5">
            <Label>Job URL</Label>
            <Input value={editing.jobUrl ?? ""} onChange={(e) => { setEditing({ ...editing, jobUrl: e.target.value }); setDirty(true); }} />
          </div>
          <div className="grid gap-1.5">
            <Label>Salary range</Label>
            <Input value={editing.salaryRange ?? ""} onChange={(e) => { setEditing({ ...editing, salaryRange: e.target.value }); setDirty(true); }} />
          </div>
          <div className="grid gap-1.5">
            <Label>Contact name</Label>
            <Input value={editing.contactName ?? ""} onChange={(e) => { setEditing({ ...editing, contactName: e.target.value }); setDirty(true); }} />
          </div>
          <div className="grid gap-1.5">
            <Label>Follow-up date</Label>
            <Input type="date" value={editing.followUpDate ?? ""} onChange={(e) => { setEditing({ ...editing, followUpDate: e.target.value }); setDirty(true); }} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Linked CV</Label>
            <Select
              value={editing.cvId ?? "none"}
              onValueChange={(v) => { setEditing({ ...editing, cvId: v === "none" ? null : v }); setDirty(true); }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {cvs.map((c) => (
                  <SelectItem key={c.cv.id} value={c.cv.id}>
                    {c.cv.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={4} value={editing.notes ?? ""} onChange={(e) => { setEditing({ ...editing, notes: e.target.value }); setDirty(true); }} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={!dirty || busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold">Activity</h2>
        <ol className="mt-4 space-y-4 border-l pl-4">
          {[...events].reverse().map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-primary bg-background" />
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">{ev.type}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(ev.createdAt)}</span>
              </div>
              {ev.note ? <p className="mt-0.5 text-sm text-muted-foreground">{ev.note}</p> : null}
            </li>
          ))}
        </ol>

        <form onSubmit={addNote} className="mt-6 flex gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note, e.g. ‘Phone screen Tue 10:00 CET’…"
            className="flex-1"
          />
          <Button type="submit" disabled={!note.trim() || noteBusy}>
            {noteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Send the application with a tailored letter:
          </p>
          <NewLetterButton jobId={job.id} />
        </div>
      </div>
    </div>
  );
}
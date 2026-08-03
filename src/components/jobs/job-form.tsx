"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
} from "@/lib/jobs/constants";

export type JobFormValues = {
  company: string;
  role: string;
  jobUrl: string;
  status: string;
  salaryRange: string;
  contactName: string;
  followUpDate: string;
  notes: string;
};

export function JobFormDialog({
  onCreated,
  trigger,
}: {
  onCreated: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<JobFormValues>({
    company: "",
    role: "",
    jobUrl: "",
    status: "wishlist",
    salaryRange: "",
    contactName: "",
    followUpDate: "",
    notes: "",
  });

  function set<K extends keyof JobFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!body.ok) throw new Error(body.error ?? "Could not create job");
      setOpen(false);
      setValues({ company: "", role: "", jobUrl: "", status: "wishlist", salaryRange: "", contactName: "", followUpDate: "", notes: "" });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> Add job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Track a new job</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" required value={values.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" required value={values.role} onChange={(e) => set("role", e.target.value)} placeholder="Senior Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="jobUrl">Job URL</Label>
              <Input id="jobUrl" value={values.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} placeholder="https://…" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger id="status">
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
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="salary">Salary range</Label>
              <Input id="salary" value={values.salaryRange} onChange={(e) => set("salaryRange", e.target.value)} placeholder="€90k–€110k" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact">Contact name</Label>
              <Input id="contact" value={values.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Hiring manager" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="followUp">Follow-up date</Label>
            <Input id="followUp" type="date" value={values.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={values.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Stack, referral, recruiter contact…" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LetterDocument } from "@/components/cover-letters/letter-document";
import { LETTER_STYLE_ACCENT, LETTER_STYLE_FONT, type LetterStyle } from "@/lib/cover-letters/styles";
import type { LetterContent } from "@/lib/validations/cover-letters";

type LetterTemplate = {
  id: string;
  name: string;
  style: LetterStyle;
  isPremium: boolean;
  accent: string;
  font: string;
};

type Letter = {
  id: string;
  name: string;
  cvId: string | null;
  templateId: string | null;
  jobId: string | null;
  content: LetterContent;
  templateName: string | null;
  job: { company: string; role: string } | null;
};

export function LetterEditor({
  letter: initial,
  jobs,
  cvs,
  from,
}: {
  letter: Letter;
  jobs: { id: string; company: string; role: string }[];
  cvs: { id: string; name: string }[];
  from?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name || "Untitled letter");
  const [jobId, setJobId] = useState<string | null>(initial.jobId);
  const [cvId, setCvId] = useState<string | null>(initial.cvId);
  const [templateId, setTemplateId] = useState<string | null>(initial.templateId);
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplate[]>([]);
  const [content, setContent] = useState<LetterContent>({
    greeting: initial.content.greeting ?? "",
    paragraphs: initial.content.paragraphs ?? [],
    closing: initial.content.closing ?? "",
    signOff: initial.content.signOff ?? "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), []);
  const selectedJob = jobs.find((j) => j.id === jobId) ?? null;
  const selectedTemplate = letterTemplates.find((t) => t.id === templateId) ?? null;
  const letterStyle = selectedTemplate?.style ?? "modern";
  const letterAccent = selectedTemplate?.accent ?? LETTER_STYLE_ACCENT.modern;
  const letterFont = selectedTemplate?.font ?? LETTER_STYLE_FONT.modern;

  useEffect(() => {
    fetch("/api/templates?type=letter")
      .then((r) => r.json())
      .then((body) => setLetterTemplates(body.data ?? []))
      .catch(() => {});
  }, []);

  function setParagraph(i: number, value: string) {
    setContent((c) => {
      const next = [...c.paragraphs];
      next[i] = value;
      return { ...c, paragraphs: next };
    });
    setDirty(true);
  }

  function addParagraph() {
    setContent((c) => ({ ...c, paragraphs: [...c.paragraphs, ""] }));
    setDirty(true);
  }

  function removeParagraph(i: number) {
    setContent((c) => ({ ...c, paragraphs: c.paragraphs.filter((_, idx) => idx !== i) }));
    setDirty(true);
  }

  function moveParagraph(i: number, dir: -1 | 1) {
    setContent((c) => {
      const next = [...c.paragraphs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return c;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...c, paragraphs: next };
    });
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cover-letters/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, jobId, cvId, templateId, content }),
      });
      const b = await res.json();
      if (!b.ok) throw new Error(b.error ?? "Could not save");
      setDirty(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    await fetch(`/api/cover-letters/${initial.id}`, { method: "DELETE" });
    router.push("/cover-letters");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/cover-letters">
            <ArrowLeft className="mr-1 h-4 w-4" /> Letters
          </Link>
        </Button>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDirty(true);
          }}
          className="h-8 w-52 font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
          {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          <Button asChild size="sm" variant="outline">
            <Link href={`/cover-letters/${initial.id}`}>Preview</Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[420px] shrink-0 overflow-y-auto border-r bg-muted/20 p-5">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Linked job</Label>
              <Select value={jobId ?? "none"} onValueChange={(v) => { setJobId(v === "none" ? null : v); setDirty(true); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — general letter</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.role} · {j.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Template</Label>
              <Select
                value={templateId ?? "none"}
                onValueChange={(v) => {
                  setTemplateId(v === "none" ? null : v);
                  setDirty(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Modern (default)</SelectItem>
                  {letterTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Paired CV</Label>
              <Select value={cvId ?? "none"} onValueChange={(v) => { setCvId(v === "none" ? null : v); setDirty(true); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {cvs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Greeting</Label>
              <Input value={content.greeting} onChange={(e) => { setContent({ ...content, greeting: e.target.value }); setDirty(true); }} />
            </div>
            <div className="grid gap-2">
              <Label>Body paragraphs</Label>
              {content.paragraphs.map((p, i) => (
                <div key={i} className="flex items-start gap-1">
                  <Textarea
                    rows={3}
                    value={p}
                    onChange={(e) => setParagraph(i, e.target.value)}
                    placeholder="Paragraph…"
                    className="min-h-0 flex-1"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveParagraph(i, -1)} disabled={i === 0} className="rounded p-1 text-xs text-muted-foreground hover:bg-background disabled:opacity-30">↑</button>
                    <button onClick={() => moveParagraph(i, 1)} disabled={i === content.paragraphs.length - 1} className="rounded p-1 text-xs text-muted-foreground hover:bg-background disabled:opacity-30">↓</button>
                    <button onClick={() => removeParagraph(i)} className="rounded p-1 text-xs text-destructive hover:bg-background">
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addParagraph}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add paragraph
              </Button>
            </div>
            <div className="grid gap-1.5">
              <Label>Closing</Label>
              <Textarea rows={2} value={content.closing} onChange={(e) => { setContent({ ...content, closing: e.target.value }); setDirty(true); }} />
            </div>
            <div className="grid gap-1.5">
              <Label>Sign-off</Label>
              <Input value={content.signOff} onChange={(e) => { setContent({ ...content, signOff: e.target.value }); setDirty(true); }} />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-muted/40 p-6">
          <div className="mx-auto w-full max-w-[794px] rounded-sm bg-white p-1 shadow-md">
            <div className="overflow-hidden rounded-sm">
              <LetterDocument
                from={from}
                date={today}
                content={content}
                role={selectedJob?.role}
                company={selectedJob?.company}
                style={letterStyle}
                accent={letterAccent}
                font={letterFont}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextField, TextAreaField, SelectField } from "./fields";

type RenderProps = {
  item: Record<string, any>;
  update: (patch: Record<string, unknown>) => void;
};

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

export function ExperienceFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Company" value={item.company ?? ""} onChange={(v) => update({ company: v })} />
        <TextField label="Role / title" value={item.role ?? ""} onChange={(v) => update({ role: v })} />
      </Row>
      <Row>
        <TextField label="Location" value={item.location ?? ""} onChange={(v) => update({ location: v })} />
        <TextField label="Employment type" value={item.employmentType ?? "Full-time"} onChange={(v) => update({ employmentType: v })} />
      </Row>
      <Row>
        <TextField label="Start" placeholder="Jan 2022" value={item.startDate ?? ""} onChange={(v) => update({ startDate: v })} />
        <TextField label="End" placeholder="Present" value={item.endDate ?? ""} onChange={(v) => update({ endDate: v })} />
      </Row>
      <BulletsEditor item={item} update={update} />
    </>
  );
}

function BulletsEditor({ item, update }: RenderProps) {
  const bullets = Array.isArray(item.bullets) ? (item.bullets as any[]) : [];
  const setBullets = (b: any[]) => update({ bullets: b });

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">Achievements (each bullet can be tagged + tailored later)</Label>
        <Button variant="outline" size="sm" onClick={() => setBullets([...bullets, { id: uid(), text: "", tags: [], orderIndex: bullets.length }])}>
          <Plus className="mr-1 h-3 w-3" /> Add bullet
        </Button>
      </div>
      {bullets.length === 0 && (
        <p className="text-xs text-muted-foreground">No bullets yet — add a few strong, quantified outcomes.</p>
      )}
      {bullets.map((b, i) => (
        <div key={b.id} className="flex items-start gap-2">
          <Textarea
            rows={2}
            className="min-h-0 flex-1"
            value={b.text}
            placeholder="e.g. Shipped an analytics dashboard used by 400+ daily users, cutting report time by 60%."
            onChange={(e) => {
              const next = [...bullets];
              next[i] = { ...b, text: e.target.value };
              setBullets(next);
            }}
          />
          <Button variant="ghost" size="icon" className="mt-0.5 text-muted-foreground hover:text-destructive" onClick={() => setBullets(bullets.filter((x) => x.id !== b.id))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={className}>{children}</p>;
}

export function EducationFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Institution" value={item.institution ?? ""} onChange={(v) => update({ institution: v })} />
        <TextField label="Degree" value={item.degree ?? ""} onChange={(v) => update({ degree: v })} />
      </Row>
      <Row>
        <TextField label="Field of study" value={item.field ?? ""} onChange={(v) => update({ field: v })} />
        <TextField label="GPA / grade (optional)" value={item.gpa ?? ""} onChange={(v) => update({ gpa: v })} />
      </Row>
      <Row>
        <TextField label="Start" value={item.startDate ?? ""} onChange={(v) => update({ startDate: v })} />
        <TextField label="End" value={item.endDate ?? ""} onChange={(v) => update({ endDate: v })} />
      </Row>
      <TextAreaField label="Details" className="" value={item.details ?? ""} onChange={(v) => update({ details: v })} />
    </>
  );
}

export function SkillFields({ item, update }: RenderProps) {
  return (
    <Row>
      <TextField label="Skill" value={item.name ?? ""} onChange={(v) => update({ name: v })} />
      <SelectField
        label="Category"
        value={item.category ?? "Tools"}
        onChange={(v) => update({ category: v })}
        options={["Languages", "Tools", "Frameworks", "Soft skills", "Other"].map((c) => ({ value: c, label: c }))}
      />
      <div className="sm:col-span-2">
        <SelectField
          label="Proficiency"
          value={String(item.level ?? 3)}
          onChange={(v) => update({ level: Number(v) })}
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: ["Beginner", "Familiar", "Working", "Advanced", "Expert"][n - 1] }))}
        />
      </div>
    </Row>
  );
}

export function LanguageFields({ item, update }: RenderProps) {
  return (
    <Row>
      <TextField label="Language" value={item.name ?? ""} onChange={(v) => update({ name: v })} />
      <SelectField
        label="CEFR level"
        value={item.cefrLevel ?? "B1"}
        onChange={(v) => update({ cefrLevel: v })}
        options={["A1", "A2", "B1", "B2", "C1", "C2", "Native"].map((l) => ({ value: l, label: l }))}
      />
    </Row>
  );
}

export function CertificationFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Certification" value={item.name ?? ""} onChange={(v) => update({ name: v })} />
        <TextField label="Issuer" value={item.issuer ?? ""} onChange={(v) => update({ issuer: v })} />
      </Row>
      <Row>
        <TextField label="Date" value={item.date ?? ""} onChange={(v) => update({ date: v })} />
        <TextField label="Credential URL" value={item.credentialUrl ?? ""} onChange={(v) => update({ credentialUrl: v })} />
      </Row>
    </>
  );
}

export function ProjectFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Project" value={item.name ?? ""} onChange={(v) => update({ name: v })} />
        <TextField label="Link" value={item.link ?? ""} onChange={(v) => update({ link: v })} />
      </Row>
      <TextAreaField label="Description" value={item.description ?? ""} onChange={(v) => update({ description: v })} />
      <TextField label="Tech (comma separated)" value={(item.tech ?? []).join(", ")} onChange={(v) => update({ tech: splitList(v) })} />
    </>
  );
}

export function SummaryFields({ item, update }: RenderProps) {
  return (
    <>
      <TextField label="Label (e.g. Concise, Leadership-focused, Technical)" value={item.label ?? ""} onChange={(v) => update({ label: v })} />
      <TextAreaField label="Summary" rows={4} value={item.text ?? ""} onChange={(v) => update({ text: v })} />
    </>
  );
}

export function PublicationFields({ item, update }: RenderProps) {
  return (
    <>
      <TextAreaField label="Citation" value={item.citation ?? ""} onChange={(v) => update({ citation: v })} />
      <Row>
        <TextField label="Date" value={item.date ?? ""} onChange={(v) => update({ date: v })} />
        <TextField label="Link" value={item.link ?? ""} onChange={(v) => update({ link: v })} />
      </Row>
    </>
  );
}

export function AwardFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Award" value={item.title ?? ""} onChange={(v) => update({ title: v })} />
        <TextField label="Issuer" value={item.issuer ?? ""} onChange={(v) => update({ issuer: v })} />
      </Row>
      <TextField label="Date" value={item.date ?? ""} onChange={(v) => update({ date: v })} />
    </>
  );
}

export function VolunteerFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Organization" value={item.organization ?? ""} onChange={(v) => update({ organization: v })} />
        <TextField label="Role" value={item.role ?? ""} onChange={(v) => update({ role: v })} />
      </Row>
      <Row>
        <TextField label="Start" value={item.startDate ?? ""} onChange={(v) => update({ startDate: v })} />
        <TextField label="End" value={item.endDate ?? ""} onChange={(v) => update({ endDate: v })} />
      </Row>
      <TextAreaField label="Details" value={item.details ?? ""} onChange={(v) => update({ details: v })} />
    </>
  );
}

export function ReferenceFields({ item, update }: RenderProps) {
  return (
    <>
      <Row>
        <TextField label="Name" value={item.name ?? ""} onChange={(v) => update({ name: v })} />
        <TextField label="Relationship" value={item.relation ?? ""} onChange={(v) => update({ relation: v })} />
      </Row>
      <TextField label="Contact" value={item.contact ?? ""} onChange={(v) => update({ contact: v })} />
    </>
  );
}

export function CustomSectionFields({ item, update }: RenderProps) {
  const items = Array.isArray(item.items) ? item.items : [];
  const setItems = (n: any[]) => update({ items: n });
  return (
    <>
      <TextField label="Section title" value={item.title ?? ""} onChange={(v) => update({ title: v })} />
      {items.map((it, i) => (
        <div key={it.id ?? i} className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
          <TextField label="Entry title" value={it.title ?? ""} onChange={(v) => setItems(items.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
          <TextAreaField label="Details" value={it.text ?? ""} onChange={(v) => setItems(items.map((x, j) => (j === i ? { ...x, text: v } : x)))} />
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            Remove entry
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="border-dashed" onClick={() => setItems([...items, { id: uid(), title: "", text: "" }])}>
        <Plus className="mr-1 h-3 w-3" /> Add entry
      </Button>
    </>
  );
}

function splitList(v: string) {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}
function uid() {
  return `new_${Math.random().toString(36).slice(2, 10)}`;
}
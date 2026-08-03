"use client";

import { useEffect } from "react";
import { Check, Circle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProfile, type SectionKey } from "@/store/profile";
import { TextField } from "./fields";
import { SectionCard, AddItemButton } from "./section-card";
import {
  EducationFields,
  ReferenceFields,
  SummaryFields,
  CertificationFields,
  LanguageFields,
  VolunteerFields,
  CustomSectionFields,
  ProjectFields,
  SkillFields,
  AwardFields,
  PublicationFields,
  ExperienceFields,
} from "./fields-block";

export function ProfileEditor() {
  const status = useProfile((s) => s.status);
  const load = useProfile((s) => s.load);

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  if (status === "loading" || status === "idle") return <EditorLoading />;
  if (status === "error")
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="font-semibold">Could not load your profile.</p>
        <Button className="mt-4" onClick={() => void load()}>Retry</Button>
      </div>
    );
  return <EditorLoaded />;
}

function EditorLoading() {
  return (
    <div className="mx-auto max-w-3xl py-20">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
    </div>
  );
}

function EditorLoaded() {
  const { headline, personalInfo, saveState, undo, updateMeta, sections, flush } = useProfile();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Master Profile</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Your single source of truth — enter everything once, then every CV, cover letter and
            application draws from here.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </header>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">Personal details</p>
          <Button variant="ghost" size="sm" onClick={undo}><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Undo</Button>
        </div>
        <PersonalEditor headline={headline} info={personalInfo} onHeadline={(v) => updateMeta({ headline: v })} onInfo={(patch) => updateMeta({ personalInfo: patch })} />
      </section>

      <Accordion type="single" collapsible defaultValue="Work experience" className="mt-8">
        <SectionAccordion keyName="experience" title="Work experience" subtitleOf={(it) => it.company ?? ""} items={sections.experience} addLabel="Add experience" render={(item, update, i) => <ExperienceFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="education" title="Education" subtitleOf={(it) => it.institution ?? ""} items={sections.education} addLabel="Add education" render={(item, update, i) => <EducationFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="skills" title="Skills" subtitleOf={(it) => it.name ?? ""} items={sections.skills} addLabel="Add a skill" render={(item, update, i) => <SkillFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="languages" title="Languages" subtitleOf={(it) => it.name ?? ""} items={sections.languages} addLabel="Add a language" render={(item, update, i) => <LanguageFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="certifications" title="Certifications" subtitleOf={(it) => it.name ?? ""} items={sections.certifications} addLabel="Add certification" render={(item, update, i) => <CertificationFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="projects" title="Projects" subtitleOf={(it) => it.name ?? ""} items={sections.projects} addLabel="Add project" render={(item, update, i) => <ProjectFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="summaries" title="Professional summaries" subtitleOf={(it) => it.label ?? ""} items={sections.summaries} addLabel="Add a summary" render={(item, update, i) => <SummaryFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="publications" title="Publications & research" subtitleOf={undefined} items={sections.publications} addLabel="Add a publication" render={(item, update, i) => <PublicationFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="awards" title="Awards & honors" subtitleOf={(it) => it.title ?? ""} items={sections.awards} addLabel="Add an award" render={(item, update, i) => <AwardFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="volunteer" title="Volunteer experience" subtitleOf={(it) => it.organization ?? ""} items={sections.volunteer} addLabel="Add volunteer role" render={(item, update, i) => <VolunteerFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="references" title="References" subtitleOf={(it) => it.name ?? ""} items={sections.references} addLabel="Add a reference" render={(item, update, i) => <ReferenceFields item={item} update={update} key={i} />} />
        <SectionAccordion keyName="customSections" title="Custom sections" subtitleOf={(it) => it.title ?? ""} items={sections.customSections} addLabel="Add a custom section" render={(item, update, i) => <CustomSectionFields item={item} update={update} key={i} />} />
      </Accordion>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => void flush()}>Save now</Button>
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">Autosaves as you type.</p>
    </div>
  );
}

function SaveIndicator({ state }: { state: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      {state === "saving" ? (
        <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
      ) : state === "saved" ? (
        <><Check className="h-3 w-3 text-emerald-500" /> Saved</>
      ) : (
        <><Circle className="h-3 w-3" /> Autosave on</>
      )}
    </span>
  );
}

function SectionAccordion({
  keyName,
  title,
  subtitleOf,
  items,
  addLabel,
  render,
}: {
  keyName: SectionKey;
  title: string;
  subtitleOf?: (item: any) => string | undefined;
  items: unknown[];
  addLabel: string;
  render: (item: Record<string, any>, update: (patch: Record<string, unknown>) => void, index: number) => React.ReactNode;
}) {
  const addItem = useProfile((s) => s.addItem);
  const updateItem = useProfile((s) => s.updateItem);
  const removeItem = useProfile((s) => s.removeItem);
  const moveItem = useProfile((s) => s.moveItem);

  return (
    <AccordionItem value={title} className="rounded-lg border border-border bg-card">
      <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3">
          {(items as Record<string, any>[]).map((item, i) => (
            <SectionCard
              key={item.id}
              id={item.id}
              title={subtitleOf?.(item) || title}
              onRemove={() => removeItem(keyName, item.id)}
              onMove={(dir) => moveItem(keyName, item.id, dir)}
              disable={items.length <= 1}
            >
              {render(item, (patch) => updateItem(keyName, item.id, patch), i)}
            </SectionCard>
          ))}
          <AddItemButton label={addLabel} onClick={() => addItem(keyName)} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function PersonalEditor({
  headline,
  info,
  onHeadline,
  onInfo,
}: {
  headline: string;
  info: Record<string, any>;
  onHeadline: (v: string) => void;
  onInfo: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Full name" value={info.fullName ?? ""} onChange={(v) => onInfo({ fullName: v })} />
        <TextField label="Email" value={info.email ?? ""} onChange={(v) => onInfo({ email: v })} />
        <TextField label="Job title / headline" value={headline} onChange={onHeadline} />
        <TextField label="Phone" value={info.phone ?? ""} onChange={(v) => onInfo({ phone: v })} />
        <TextField label="City" value={info.city ?? ""} onChange={(v) => onInfo({ city: v })} />
        <TextField label="Country" value={info.country ?? ""} onChange={(v) => onInfo({ country: v })} />
        <TextField label="Nationality (EU formats)" value={info.nationality ?? ""} onChange={(v) => onInfo({ nationality: v })} />
        <TextField label="Website / portfolio" value={info.website ?? ""} onChange={(v) => onInfo({ website: v })} />
      </div>
    </div>
  );
}
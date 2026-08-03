"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Palette,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CvScorePanel } from "@/components/cv/cv-score-panel";
import { cn } from "@/lib/utils";
import {
  buildSections,
  CvDocument,
  contactLine,
  type DocTheme,
  type MasterProfile,
} from "@/lib/cv/render";
import { SECTION_LABELS, type SectionConfig, type SectionKey } from "@/lib/cv/types";

type CvTemplate = {
  id: string;
  name: string;
  formatType: string;
  description?: string;
  isPremium: boolean;
  themeTokens?: Record<string, string>;
  layoutSchema?: { format?: string; order?: SectionKey[] };
};

type DocBundle = {
  cv: {
    id: string;
    name: string;
    status: string;
    settings?: Record<string, unknown>;
  };
  template: {
    id: string;
    name: string;
    layoutSchema: { format: string; order: SectionKey[] };
    themeTokens: Record<string, unknown>;
  } | null;
  sections: { sectionType: SectionKey; isVisible: boolean; orderIndex: number }[];
  master: MasterProfile;
};

const THEME_DEFAULTS: DocTheme = {
  accent: "#1e3a8a",
  paper: "#ffffff",
  ink: "#111827",
  muted: "#6b7280",
  font: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const ACCENTS: { name: string; value: string }[] = [
  { name: "Navy", value: "#1e3a8a" },
  { name: "Teal", value: "#0f766e" },
  { name: "Green", value: "#059669" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Purple", value: "#9333ea" },
  { name: "Slate", value: "#334155" },
  { name: "Ink", value: "#111827" },
  { name: "Crimson", value: "#b91c1c" },
  { name: "Amber", value: "#b45309" },
];

const FONTS: { name: string; value: string }[] = [
  { name: "Inter (sans)", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', ui-monospace, monospace" },
  { name: "EB Garamond (serif)", value: "'EB Garamond', 'Gentium Book Plus', Georgia, 'Liberation Serif', serif" },
  { name: "Gentium Book Plus (serif)", value: "'Gentium Book Plus', 'EB Garamond', Georgia, 'Liberation Serif', serif" },
  { name: "Lato (sans)", value: "Lato, 'Noto Sans', ui-sans-serif, system-ui, sans-serif" },
  { name: "Ubuntu (sans)", value: "Ubuntu, 'Noto Sans', ui-sans-serif, system-ui, sans-serif" },
  { name: "Raleway (sans)", value: "Raleway, 'Noto Sans', ui-sans-serif, system-ui, sans-serif" },
  { name: "New Computer Modern (serif)", value: "'New Computer Modern', 'CMU Serif', Georgia, 'Liberation Serif', serif" },
];

type ThemeOverride = { accent?: string; font?: string };

export function CvEditor({ doc }: { doc: DocBundle }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<CvTemplate[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(doc.template?.id ?? null);
  const [overrides, setOverrides] = useState<ThemeOverride>(
    (doc.cv.settings?.theme as ThemeOverride) ?? {},
  );
  const [config, setConfig] = useState<SectionConfig[]>(
    doc.sections.map((s) => ({ sectionType: s.sectionType, isVisible: s.isVisible, orderIndex: s.orderIndex })),
  );
  const [name, setName] = useState(doc.cv.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialTemplate = useMemo<CvTemplate | null>(
    () =>
      doc.template
        ? {
            id: doc.template.id,
            name: doc.template.name,
            formatType: doc.template.layoutSchema.format,
            isPremium: false,
            themeTokens: doc.template.themeTokens as Record<string, string>,
            layoutSchema: doc.template.layoutSchema,
          }
        : null,
    [doc.template],
  );

  useEffect(() => {
    fetch("/api/templates?type=cv")
      .then((r) => r.json())
      .then((body) => setTemplates(body.data ?? []))
      .catch(() => {});
  }, []);

  const effectiveTemplate = templates.find((t) => t.id === templateId) ?? initialTemplate;

  const theme: DocTheme = useMemo(() => {
    const t = effectiveTemplate?.themeTokens ?? {};
    return {
      ...THEME_DEFAULTS,
      ...t,
      ...(overrides.accent ? { accent: overrides.accent } : {}),
      ...(overrides.font ? { font: overrides.font } : {}),
    };
  }, [effectiveTemplate, overrides]);

  const format = effectiveTemplate?.layoutSchema?.format ?? "classic";

  const sections = useMemo(
    () => buildSections(doc.master, effectiveTemplate?.layoutSchema?.order ?? [], config),
    [doc.master, effectiveTemplate, config],
  );

  const personal = doc.master.profile?.personalInfo as Record<string, unknown> | undefined;
  const name_ = (personal?.fullName as string) || doc.cv.name;
  const headline = doc.master.profile?.headline ?? "";
  const contact = contactLine(personal);

  async function patchSections(next: SectionConfig[]) {
    setSaving(true);
    try {
      await fetch(`/api/cvs/${doc.cv.id}/sections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: next.map((c) => ({
            sectionType: c.sectionType,
            isVisible: c.isVisible,
            orderIndex: c.orderIndex,
          })),
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  function toggle(sectionType: SectionKey, isVisible: boolean) {
    const next = config.map((c) =>
      c.sectionType === sectionType ? { ...c, isVisible } : c,
    );
    setConfig(next);
    patchSections(next);
  }

  function move(sectionType: SectionKey, dir: -1 | 1) {
    const arr = [...config];
    const i = arr.findIndex((c) => c.sectionType === sectionType);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const next = arr.map((c, k) => ({ ...c, orderIndex: k }));
    setConfig(next);
    patchSections(next);
  }

  async function changeTemplate(id: string) {
    if (id === templateId) return;
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t?.layoutSchema?.order?.length) {
      setConfig(t.layoutSchema.order.map((sectionType, i) => ({ sectionType, isVisible: true, orderIndex: i })));
    }
    setSaving(true);
    try {
      await fetch(`/api/cvs/${doc.cv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: id }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveOverrides(next: ThemeOverride) {
    const clean: ThemeOverride = {};
    if (next.accent) clean.accent = next.accent;
    if (next.font) clean.font = next.font;
    setOverrides(clean);
    setSaving(true);
    try {
      await fetch(`/api/cvs/${doc.cv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { theme: clean } }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function resetTheme() {
    setOverrides({});
    setSaving(true);
    try {
      await fetch(`/api/cvs/${doc.cv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { theme: {} } }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function rename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === doc.cv.name) return;
    setSaving(true);
    try {
      await fetch(`/api/cvs/${doc.cv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    await fetch(`/api/cvs/${doc.cv.id}`, { method: "DELETE" });
    router.push("/cv");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/cv">
            <ArrowLeft className="mr-1 h-4 w-4" /> CVs
          </Link>
        </Button>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={rename}
          className="h-8 w-48 font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          <Button asChild size="sm" variant="outline">
            <Link href={`/cv/${doc.cv.id}`}>Preview</Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-80 shrink-0 overflow-y-auto border-r bg-muted/20 p-4">
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Template
              </Label>
              <Select value={templateId ?? "none"} onValueChange={changeTemplate}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Loading…
                    </SelectItem>
                  ) : (
                    templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {effectiveTemplate?.description ?? "Custom layout"}
              </p>
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Palette className="h-3 w-3" /> Theme
                </Label>
                <button
                  type="button"
                  onClick={resetTheme}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    title={a.name}
                    aria-label={`Accent ${a.name}`}
                    onClick={() => saveOverrides({ ...overrides, accent: a.value })}
                    className={cn(
                      "h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition",
                      (overrides.accent ?? theme.accent) === a.value
                        ? "ring-foreground"
                        : "ring-transparent hover:ring-border",
                    )}
                    style={{ background: a.value }}
                  />
                ))}
              </div>
              <Select
                value={overrides.font ?? "template"}
                onValueChange={(v) =>
                  v === "template"
                    ? saveOverrides({ ...overrides, font: undefined })
                    : saveOverrides({ ...overrides, font: v })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template default</SelectItem>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sections
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Toggle visibility and drag order. Content comes from your Master Profile.
              </p>
              <ul className="space-y-1">
                {config.map((c) => (
                  <li key={c.sectionType}>
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm",
                        c.isVisible ? "bg-background" : "bg-muted/60 text-muted-foreground",
                      )}
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            c.isVisible ? "bg-primary" : "bg-border",
                          )}
                        />
                        <span className="truncate">{SECTION_LABELS[c.sectionType]}</span>
                      </label>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => move(c.sectionType, -1)}
                          disabled={config[0]?.sectionType === c.sectionType}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(c.sectionType, 1)}
                          disabled={config[config.length - 1]?.sectionType === c.sectionType}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <Switch
                          checked={c.isVisible !== false}
                          onCheckedChange={(v) => toggle(c.sectionType, v)}
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {sections.length === 0 ? (
                <p className="rounded-md bg-background p-3 text-xs text-muted-foreground">
                  No sections are visible or the Master Profile is empty. Add content in{" "}
                  <Link href="/profile" className="underline">
                    your profile
                  </Link>
                  .
                </p>
              ) : null}
            </div>

            <CvScorePanel
              name={name_}
              headline={headline}
              contact={contact}
              personalInfo={personal}
              sections={sections}
            />
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-muted/40 p-6">
          <div
            className="mx-auto w-full max-w-[210mm] rounded-sm bg-white p-1 shadow-md"
            style={{ width: "min(100%, 794px)" }}
          >
            <div className="overflow-hidden rounded-sm">
              <CvDocument
                name={name_}
                headline={headline}
                contact={contact}
                sections={sections}
                format={format}
                theme={theme}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

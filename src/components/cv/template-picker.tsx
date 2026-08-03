"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumbnail } from "@/components/cv/template-thumbnail";
import { cn } from "@/lib/utils";
import type { SectionKey } from "@/lib/cv/types";

type Template = {
  id: string;
  name: string;
  formatType: string;
  description?: string;
  isPremium: boolean;
  themeTokens?: Record<string, unknown>;
  layoutSchema?: { format?: string; order?: SectionKey[] };
};

export function TemplatePicker() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates?type=cv")
      .then((r) => r.json())
      .then((body) => setTemplates(body.data ?? []))
      .catch(() => setError("Could not load templates."));
  }, []);

  async function create() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected }),
      });
      const body = await res.json();
      if (!body.ok) throw new Error(body.error ?? "Could not create CV");
      router.push(`/cv/${body.data.cv.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card text-left transition",
              selected === t.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/40",
            )}
          >
            <div className="flex items-center justify-center bg-muted/30 p-4">
              <TemplateThumbnail
                format={t.layoutSchema?.format ?? t.formatType}
                order={t.layoutSchema?.order ?? []}
                theme={(t.themeTokens ?? {}) as Record<string, string>}
                className="shadow-sm ring-1 ring-black/5"
              />
            </div>
            <div className="p-4">
              <span className="font-semibold">{t.name}</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.description ?? "A clean template built from your Master Profile."}
              </p>
            </div>
            {selected === t.id ? (
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={create} disabled={!selected || busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create CV
        </Button>
        <Button asChild variant="ghost">
          <Link href="/cv">Back</Link>
        </Button>
      </div>
    </div>
  );
}

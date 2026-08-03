"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Sparkles, TriangleAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { scoreCv, type ScoreResult } from "@/lib/cv/score";
import type { RenderedSection } from "@/lib/cv/render";
import { cn } from "@/lib/utils";

const GRADE_STYLE: Record<ScoreResult["grade"], string> = {
  excellent: "text-emerald-600",
  good: "text-sky-600",
  fair: "text-amber-600",
  poor: "text-red-600",
};

export function CvScorePanel({
  name,
  headline,
  contact,
  personalInfo,
  sections,
}: {
  name?: string;
  headline?: string;
  contact?: string[];
  personalInfo?: Record<string, unknown>;
  sections: RenderedSection[];
}) {
  const [jobDescription, setJobDescription] = useState("");

  const result = useMemo(
    () =>
      scoreCv({
        name,
        headline,
        contact,
        personalInfo,
        sections,
        jobDescription: jobDescription || undefined,
      }),
    [name, headline, contact, personalInfo, sections, jobDescription],
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">ATS score</span>
        </div>
        <span className={cn("text-lg font-bold", GRADE_STYLE[result.grade])}>
          {result.score}
          <span className="text-xs font-medium text-muted-foreground">/100</span>
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        A quick self-check on how readable and complete this CV looks to a recruiter or ATS.
      </p>

      <details className="group mt-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
          Compare against a job description
        </summary>
        <Textarea
          className="mt-2 min-h-20 text-xs"
          placeholder="Paste the job description here to check keyword match…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </details>

      <ul className="mt-3 space-y-1.5">
        {result.checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-xs">
            {c.passed ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            ) : c.weight > 0 ? (
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            ) : (
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
            )}
            <span>
              <span className={cn("font-medium", c.passed ? "text-foreground" : "text-muted-foreground")}>
                {c.label}
              </span>
              {!c.passed && c.hint ? (
                <span className="block text-muted-foreground/80">{c.hint}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

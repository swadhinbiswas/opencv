import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";
import { GithubIcon } from "@/components/layout/github-icon";
import { Button } from "@/components/ui/button";
import { TemplateThumbnail } from "@/components/cv/template-thumbnail";
import { LetterThumbnail } from "@/components/cover-letters/letter-thumbnail";
import { getCvTemplates } from "@/lib/cv/templates";
import { getLetterTemplates } from "@/lib/cover-letters/templates";
import { slugForTemplateId } from "@/lib/cv/seo-slugs";

export const metadata: Metadata = {
  title: "Free CV Templates & Resume Formats — ATS-Friendly Designs",
  description:
    "Browse 20+ free CV and resume templates: ATS-optimized, classic, modern, minimal, executive, two-column, technical, academic and creative. Plus 7 professional cover letter templates. Every template is a real render — see exactly what you'll get. 100% free, no paywall.",
  keywords:
    "cv templates, resume templates, free cv templates, ats resume template, resume formats, cover letter templates, cv builder templates",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "Free CV Templates & Resume Formats",
    description: "20+ ATS-friendly CV templates and 7 cover letter formats — previewed as real renders before you build. All free.",
    type: "website",
  },
};

export default async function TemplatesPage() {
  const [cvTemplates, letterTemplates] = await Promise.all([getCvTemplates(), getLetterTemplates()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">CV templates</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Twelve professional resume formats — from ATS-safe single columns to
            executive two-column layouts. Every preview below is a real render of
            the template, and switching templates never loses your content.
            Everything is free — no paywall, no watermarks.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://github.com/swadhinbiswas"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OpenCV on GitHub — made by Swadhin Biswas"
            title="Made by Swadhin Biswas"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <Button asChild className="hidden shrink-0 sm:inline-flex">
            <Link href="/signup">Create yours free</Link>
          </Button>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cvTemplates.map((t) => {
          const slug = slugForTemplateId(t.id);
          return (
            <div
              key={t.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40"
            >
              <Link
                href={slug ? `/templates/${slug}` : "/signup"}
                className="flex items-center justify-center bg-muted/30 p-5"
                aria-label={`Preview ${t.name} template`}
              >
                <TemplateThumbnail
                  format={t.layoutSchema.format}
                  order={t.layoutSchema.order}
                  theme={t.themeTokens as Record<string, string>}
                  className="shadow-md ring-1 ring-black/5"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{t.name}</h2>
                  {t.formatType === "ats" ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">ATS</span>
                  ) : null}
                </div>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={slug ? `/templates/${slug}` : "/signup"}>
                      Use template <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href="/signup">Start free</Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-16">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Cover letter templates</h2>
        </div>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Seven professional cover letter formats — from the traditional block
          letter to a bold creative design. Each preview below is a real render.
          Pair any letter with a CV and download both as a single PDF — all free.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {letterTemplates.map((l) => (
            <div
              key={l.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40"
            >
              <Link
                href="/templates/cover-letter-templates"
                className="flex items-center justify-center bg-muted/30 p-5"
                aria-label={`Preview ${l.name} cover letter template`}
              >
                <LetterThumbnail style={l.style} accent={l.accent} font={l.font} className="shadow-md ring-1 ring-black/5" />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold">{l.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{l.description}</p>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href="/templates/cover-letter-templates">
                    Use template <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

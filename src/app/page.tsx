import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, Layout, Sparkles, FolderKanban } from "lucide-react";
import { GithubIcon } from "@/components/layout/github-icon";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TemplateThumbnail } from "@/components/cv/template-thumbnail";
import { getCvTemplates } from "@/lib/cv/templates";
import { slugForTemplateId } from "@/lib/cv/seo-slugs";

export const metadata: Metadata = {
  title: "OpenCV — Free CV Builder, Resume Maker & Cover Letter Templates",
  description:
    "Create a professional CV or resume for free with OpenCV. Choose from 20+ ATS-friendly templates, pair a matching cover letter, and download a polished PDF in minutes. The best free CV builder online.",
  keywords:
    "cv builder, free cv builder, resume builder, cv maker, resume maker, free resume builder, online resume builder, cv templates, resume templates, cover letter builder, best cv builder, ats friendly resume, professional cv, create cv online",
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: Layout,
    title: "One master profile",
    body: "Enter every role, project and skill once. Spin up a tailored CV for each job without retyping a thing.",
  },
  {
    icon: FileText,
    title: "20+ real template formats",
    body: "ATS-safe, classic, modern, executive, two-column, technical, academic and creative — previewed as real renders, switchable without losing content.",
  },
  {
    icon: Sparkles,
    title: "Pair a matching cover letter",
    body: "Seven professional cover letter formats. Pair any letter with its CV and download both as a single combined PDF.",
  },
  {
    icon: FolderKanban,
    title: "Job application tracker",
    body: "A kanban board that links every application to the exact CV + cover letter you actually sent.",
  },
];

export default async function LandingPage() {
  const templates = (await getCvTemplates()).slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">OC</span>
            <span className="font-semibold tracking-tight">OpenCV</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/templates" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
              CV templates
            </Link>
            <Link href="/templates/cover-letter-templates" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
              Cover letters
            </Link>
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link href="/signup">Start free</Link></Button>
            <a
              href="https://github.com/swadhinbiswas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OpenCV on GitHub — made by Swadhin Biswas"
              title="Made by Swadhin Biswas"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Free CV builder · 20+ templates · ATS-friendly · no credit card
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            Build a professional CV that <span className="text-primary">gets you hired</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            OpenCV is the free online resume and CV builder that turns one master
            profile into unlimited ATS-friendly CVs and matching cover letters.
            Choose a template, tailor it to the job, and download a polished PDF
            in minutes — no design skills needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Build my CV free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/templates">Browse CV templates</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Trusted by job seekers for chronological, combination and academic CV formats
          </p>
        </section>

        <section className="py-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Popular CV templates</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Every preview is a real render of the template — what you see is exactly the format you&apos;ll get.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {templates.map((t) => {
              const slug = slugForTemplateId(t.id);
              return (
                <Link
                  key={t.id}
                  href={slug ? `/templates/${slug}` : "/templates"}
                  className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-center bg-muted/30 p-3">
                    <TemplateThumbnail
                      format={t.layoutSchema.format}
                      order={t.layoutSchema.order}
                      theme={t.themeTokens as Record<string, string>}
                    />
                  </div>
                  <div className="p-3 text-center text-sm font-medium">{t.name}</div>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/templates">See all 20+ templates</Link>
            </Button>
          </div>
        </section>

        <section className="py-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-14">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            {[
              {
                q: "Is OpenCV really free?",
                a: "Yes. Creating a CV or resume is completely free — no credit card, no trials. You can build unlimited CVs and cover letters and download them as PDFs.",
              },
              {
                q: "Which resume format should I use?",
                a: "For most job seekers a reverse-chronological CV is the safest and most ATS-friendly choice. If you're changing careers, a combination (hybrid) format that leads with skills works best. OpenCV supports both, plus academic, executive and two-column formats.",
              },
              {
                q: "Are your CV templates ATS-friendly?",
                a: "Yes. Our single-column templates use standard section headings and avoid tables and graphics, so applicant tracking systems like Workday, Greenhouse and Lever parse them cleanly.",
              },
              {
                q: "Can I create a CV and cover letter together?",
                a: "Yes. Pair any cover letter with a CV and download both as a single combined PDF, formatted to match each other.",
              },
              {
                q: "How do I download my CV as a PDF?",
                a: "Click 'Download PDF' on any CV or cover letter. OpenCV renders a clean A4 document and opens your browser's print dialog so you can save it as a PDF.",
              },
              {
                q: "What's the difference between a CV and a resume?",
                a: "In most of the world a CV is a longer, comprehensive career document; a resume is a shorter, tailored summary. OpenCV lets you build both from the same master profile.",
              },
            ].map((f) => (
              <details key={f.q} className="rounded-lg border border-border bg-card p-4">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
              OpenCV — © {new Date().getFullYear()} · Free CV builder, resume maker & cover letter templates.
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/templates" className="hover:text-foreground">CV templates</Link>
              <Link href="/templates/cover-letter-templates" className="hover:text-foreground">Cover letter templates</Link>
              <Link href="/templates/ats-optimized-cv-template" className="hover:text-foreground">ATS resume</Link>
              <Link href="/login" className="hover:text-foreground">Sign in</Link>
              <Link href="/signup" className="hover:text-foreground">Create free CV</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

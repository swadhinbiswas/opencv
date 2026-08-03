import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { GithubIcon } from "@/components/layout/github-icon";
import { Button } from "@/components/ui/button";
import { TemplateThumbnail } from "@/components/cv/template-thumbnail";
import { LetterThumbnail } from "@/components/cover-letters/letter-thumbnail";
import { getTemplate } from "@/lib/cv/templates";
import { getLetterTemplates } from "@/lib/cover-letters/templates";
import { TEMPLATE_SLUGS } from "@/lib/cv/seo-slugs";
import { BRAND } from "@/lib/brand";

export function generateStaticParams() {
  return Object.keys(TEMPLATE_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = TEMPLATE_SLUGS[slug];
  if (!meta) return { title: "Template" };
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/templates/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BRAND.domain}/templates/${slug}`,
      type: "website",
    },
  };
}

export default async function TemplateSeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = TEMPLATE_SLUGS[slug];
  if (!meta) notFound();

  const tpl = meta.templateId ? await getTemplate(meta.templateId) : null;
  const letters = meta.letters ? await getLetterTemplates() : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">OpenCV</Link>
          <span className="mx-2">/</span>
          <Link href="/templates" className="hover:text-foreground">CV templates</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{slug.replace(/-/g, " ")}</span>
        </nav>
        <a
          href="https://github.com/swadhinbiswas"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="OpenCV on GitHub — made by Swadhin Biswas"
          title="Made by Swadhin Biswas"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <GithubIcon className="h-4 w-4" />
        </a>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{meta.h1}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{meta.blurb}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Use this template free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/templates">Browse all templates</Link>
            </Button>
          </div>

          <ul className="mt-8 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              "Fill in your master profile once",
              "Switch templates without losing content",
              "Pair with a matching cover letter",
              "Download a polished A4 PDF — all free",
            ].map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-primary" /> {point}
              </li>
            ))}
          </ul>

          {meta.letters && letters.length > 0 ? (
            <section className="mt-12">
              <h2 className="text-xl font-semibold">All cover letter templates</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Real renders of every format — pick one and it stays free forever.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {letters.map((l) => (
                  <div
                    key={l.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center justify-center bg-muted/30 p-5">
                      <LetterThumbnail style={l.style} accent={l.accent} font={l.font} className="shadow-md ring-1 ring-black/5" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-semibold">{l.name}</h3>
                      <p className="mt-1 flex-1 text-sm text-muted-foreground">{l.description}</p>
                      <Button asChild size="sm" className="mt-4 w-full">
                        <Link href="/signup">
                          Use this template free <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="text-xl font-semibold">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {meta.faq.map((f) => (
                <details key={f.q} className="rounded-lg border border-border bg-card p-4">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-8">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded-sm bg-white">
              {tpl ? (
                <TemplateThumbnail
                  format={tpl.layoutSchema.format}
                  order={tpl.layoutSchema.order}
                  theme={(tpl.themeTokens ?? {}) as Record<string, string>}
                />
              ) : letters.length > 0 ? (
                <LetterThumbnail
                  style={letters[0].style}
                  accent={letters[0].accent}
                  font={letters[0].font}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

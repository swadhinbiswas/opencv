import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getCvRenderProps } from "@/lib/cv/prepare";
import { CvDocument } from "@/lib/cv/render";
import { DownloadMenu } from "@/components/export/download-menu";
import { NewLetterButton } from "@/components/cover-letters/new-letter-button";
import { CvScorePanel } from "@/components/cv/cv-score-panel";
import { listLettersForCv } from "@/lib/cover-letters/service";

export const metadata: Metadata = { title: "CV Preview" };

export default async function PreviewCvPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { cvId } = await params;

  const props = await getCvRenderProps(cvId, session.userId);
  if (!props) notFound();

  const letters = await listLettersForCv(cvId, session.userId);
  const paired = letters[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/cv">
            <ArrowLeft className="mr-1 h-4 w-4" /> CVs
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{props.cv.name}</h1>
          <p className="text-sm text-muted-foreground">
            {props.templateName ?? "Custom"} · {props.cv.status}
            {letters.length > 0 ? ` · ${letters.length} cover letter${letters.length === 1 ? "" : "s"} linked` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DownloadMenu scope="cv" id={cvId} label="Download CV" />
          {paired ? (
            <DownloadMenu scope="bundle" id={paired.id} label="CV + letter" />
          ) : (
            <NewLetterButton cvId={cvId} />
          )}
          <Button asChild size="sm">
            <Link href={`/cv/${cvId}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </header>

      {letters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Paired cover letters:</span>
          {letters.map((l) => (
            <Link
              key={l.id}
              href={`/cover-letters/${l.id}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {l.name || "Untitled letter"}
            </Link>
          ))}
          <div className="ml-auto">
            <NewLetterButton cvId={cvId} />
          </div>
        </div>
      )}

      <div className="rounded-sm bg-white p-2 shadow-md">
        <div className="overflow-hidden rounded-sm">
          <CvDocument
            name={props.name}
            headline={props.headline}
            contact={props.contact}
            sections={props.sections}
            format={props.format}
            theme={props.theme}
          />
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
        <CvScorePanel
          name={props.name}
          headline={props.headline}
          contact={props.contact}
          personalInfo={props.personalInfo}
          sections={props.sections}
        />
      </div>
    </div>
  );
}

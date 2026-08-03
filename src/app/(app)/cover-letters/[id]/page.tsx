import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getLetter } from "@/lib/cover-letters/service";
import { getFullProfile } from "@/lib/profile/service";
import { buildFromBlock } from "@/lib/cover-letters/format";
import { LetterDocument } from "@/components/cover-letters/letter-document";
import { DownloadMenu } from "@/components/export/download-menu";

export const metadata: Metadata = { title: "Cover letter" };

export default async function PreviewLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { id } = await params;

  const letter = await getLetter(id, session.userId);
  if (!letter) notFound();

  const master = await getFullProfile(session.userId);
  const from = buildFromBlock(master.profile?.personalInfo as Record<string, unknown>);
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/cover-letters">
            <ArrowLeft className="mr-1 h-4 w-4" /> Letters
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{letter.name}</h1>
          <p className="text-sm text-muted-foreground">
            {letter.job ? `${letter.job.role} · ${letter.job.company}` : "General letter"}
            {letter.templateName ? ` · ${letter.templateName}` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DownloadMenu scope="letter" id={letter.id} label="Download" />
          {letter.cvId ? (
            <DownloadMenu scope="bundle" id={letter.id} label="CV + letter" />
          ) : null}
          <Button asChild size="sm">
            <Link href={`/cover-letters/${letter.id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </header>

      <div className="rounded-sm bg-white p-2 shadow-md">
        <div className="overflow-hidden rounded-sm">
          <LetterDocument
            from={from}
            date={today}
            content={letter.content}
            role={letter.job?.role}
            company={letter.job?.company}
            style={letter.templateStyle}
            accent={letter.templateAccent}
            font={letter.templateFont}
          />
        </div>
      </div>
    </div>
  );
}
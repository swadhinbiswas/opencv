import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getLetter } from "@/lib/cover-letters/service";
import { getFullProfile } from "@/lib/profile/service";
import { buildFromBlock } from "@/lib/cover-letters/format";
import { getCvRenderProps } from "@/lib/cv/prepare";
import { LetterDocument } from "@/components/cover-letters/letter-document";
import { CvDocument } from "@/lib/cv/render";
import { AutoPrint } from "@/components/export/auto-print";

export const metadata = { title: "Print CV + cover letter" };

/**
 * Combined PDF export: the paired cover letter first, then the CV, on
 * consecutive A4 pages. Requires the letter to be linked to a CV.
 */
export default async function PrintBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { id } = await params;

  const letter = await getLetter(id, session.userId);
  if (!letter || !letter.cvId) notFound();

  const [master, cvProps] = await Promise.all([
    getFullProfile(session.userId),
    getCvRenderProps(letter.cvId, session.userId),
  ]);
  if (!cvProps) notFound();

  const from = buildFromBlock(master.profile?.personalInfo as Record<string, unknown>);
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AutoPrint />
      <div className="print-area print-sheet">
        <div className="bundle-sheet">
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
        <div className="bundle-sheet">
          <CvDocument
            name={cvProps.name}
            headline={cvProps.headline}
            contact={cvProps.contact}
            sections={cvProps.sections}
            format={cvProps.format}
            theme={cvProps.theme}
          />
        </div>
      </div>
      <div className="no-print fixed bottom-4 right-4">
        <Link
          href={`/cover-letters/${letter.id}`}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white no-underline"
        >
          Back to letter
        </Link>
      </div>
      <style suppressHydrationWarning>{`.bundle-sheet { page-break-after: always; break-after: page; } .bundle-sheet:last-child { page-break-after: auto; break-after: auto; }`}</style>
    </>
  );
}

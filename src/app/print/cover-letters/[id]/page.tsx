import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getLetter } from "@/lib/cover-letters/service";
import { getFullProfile } from "@/lib/profile/service";
import { buildFromBlock } from "@/lib/cover-letters/format";
import { LetterDocument } from "@/components/cover-letters/letter-document";
import { AutoPrint } from "@/components/export/auto-print";

export const metadata = { title: "Print cover letter" };

export default async function PrintLetterPage({
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
    <>
      <AutoPrint />
      <div className="print-area print-sheet">
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
      <div className="no-print fixed bottom-4 right-4">
        <Link
          href={`/cover-letters/${id}`}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white no-underline"
        >
          Back to letter
        </Link>
      </div>
    </>
  );
}
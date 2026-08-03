import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCvRenderProps } from "@/lib/cv/prepare";
import { CvDocument } from "@/lib/cv/render";
import { AutoPrint } from "@/components/export/auto-print";

export const metadata = { title: "Print CV" };

export default async function PrintCvPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { cvId } = await params;

  const props = await getCvRenderProps(cvId, session.userId);
  if (!props) notFound();

  return (
    <>
      <AutoPrint />
      <div className="print-area print-sheet">
        <CvDocument
          name={props.name}
          headline={props.headline}
          contact={props.contact}
          sections={props.sections}
          format={props.format}
          theme={props.theme}
        />
      </div>
      <div className="no-print fixed bottom-4 right-4">
        <Link
          href={`/cv/${cvId}`}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white no-underline"
        >
          Back to CV
        </Link>
      </div>
    </>
  );
}
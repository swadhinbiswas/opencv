import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getCvDocument } from "@/lib/cv/service";
import { CvEditor } from "@/components/cv/cv-editor";
import type { SectionKey } from "@/lib/cv/types";

export const metadata: Metadata = { title: "Edit CV" };

export default async function EditCvPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();
  const { cvId } = await params;

  const doc = await getCvDocument(cvId, session.userId);
  if (!doc) notFound();

  const bundle = {
    ...doc,
    sections: doc.sections.map((s) => ({
      sectionType: s.sectionType as SectionKey,
      isVisible: s.isVisible,
      orderIndex: s.orderIndex,
    })),
  };

  return <CvEditor doc={bundle} />;
}
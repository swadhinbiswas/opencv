import "server-only";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { RenderedSection } from "@/lib/cv/render";

export type DocxCvProps = {
  name?: string;
  headline?: string;
  contact?: string[];
  sections: RenderedSection[];
};

const H1 = { bold: true, size: 26, color: "1E293B" } as const;
const ACCENT = "2563EB";
const MUTED = "64748B";

export async function cvToDocx(props: DocxCvProps): Promise<Buffer> {
  const children: Paragraph[] = [];

  if (props.name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: props.name, ...H1 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
    );
  }
  if (props.headline) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: props.headline, bold: true, size: 20, color: ACCENT })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
    );
  }
  if (props.contact && props.contact.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: props.contact.join("  ·  "), size: 18, color: MUTED }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );
  }

  for (const section of props.sections) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.label, bold: true, size: 20, color: ACCENT })],
        spacing: { before: 220, after: 100 },
        border: { bottom: { color: "CBD5E1", style: BorderStyle.SINGLE, size: 4 } },
      }),
    );

    for (const item of section.items) {
      const row: TextRun[] = [];
      if (item.title) row.push(new TextRun({ text: item.title, bold: true, size: 19 }));
      if (item.badge) row.push(new TextRun({ text: `   ${item.badge}`, size: 18, color: MUTED }));
      if (row.length > 0) {
        children.push(new Paragraph({ children: row, spacing: { before: 80, after: 20 } }));
      }
      if (item.subtitle) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.subtitle ?? "", size: 18, color: MUTED })],
            spacing: { after: 40 },
          }),
        );
      }
      for (const line of item.lines ?? []) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: line, size: 19 })],
            spacing: { after: 20 },
          }),
        );
      }
      for (const nested of item.nested ?? []) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              ...(nested.title ? [new TextRun({ text: `${nested.title}: `, bold: true, size: 19 })] : []),
              new TextRun({ text: nested.text ?? "", size: 19 }),
            ],
            spacing: { after: 20 },
          }),
        );
      }
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
    sections: [{ properties: {}, children }],
  });

  const buf = await Packer.toArrayBuffer(doc);
  return Buffer.from(buf);
}

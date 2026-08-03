import "server-only";
import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http/server";
import { getCvRenderProps } from "@/lib/cv/prepare";
import { getLetter } from "@/lib/cover-letters/service";
import { getFullProfile } from "@/lib/profile/service";
import { buildFromBlock } from "@/lib/cover-letters/format";
import { CvDocument, type DocTheme, type RenderedSection } from "@/lib/cv/render";
import { LetterDocument } from "@/components/cover-letters/letter-document";
import type { LetterContent } from "@/lib/validations/cover-letters";
import type { LetterStyle } from "@/lib/cover-letters/styles";
import { htmlToPdf } from "@/lib/export/pdf";
import { cvToDocx } from "@/lib/export/docx";
import { cvToTxt, letterToTxt } from "@/lib/export/txt";
import { FONTS_CDN_LINK } from "@/lib/fonts";

const PRINT_CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  @page { size: A4; margin: 12mm; }
  .cv-root, .letter-root {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cv-sec { break-inside: avoid; }
  .sheet-break { break-after: page; }
`;

async function renderMarkup(tree: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(tree);
}

function shell(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS_CDN_LINK}<style>${PRINT_CSS}</style></head><body>${body}</body></html>`;
}

type CvProps = {
  name?: string;
  headline?: string;
  contact?: string[];
  sections: RenderedSection[];
  format: string;
  theme: DocTheme;
};

async function cvHtml(props: CvProps): Promise<string> {
  return shell(await renderMarkup(createElement(CvDocument, props)));
}

type LetterProps = {
  from?: string;
  date?: string;
  content: LetterContent;
  role?: string | null;
  company?: string | null;
  style: LetterStyle;
  accent: string;
  font: string;
};

async function letterHtml(props: LetterProps): Promise<string> {
  return shell(await renderMarkup(createElement(LetterDocument, props)));
}

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const kind = request.nextUrl.searchParams.get("kind") ?? "pdf";
  const scope = request.nextUrl.searchParams.get("scope") ?? "cv";
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  if (!["pdf", "docx", "txt"].includes(kind)) {
    return NextResponse.json({ ok: false, error: "Unknown kind" }, { status: 400 });
  }

  try {
    if (scope === "letter") {
      const letter = await getLetter(id, auth.session.userId);
      if (!letter) return notFound();
      const master = await getFullProfile(auth.session.userId);
      const from = buildFromBlock(master.profile?.personalInfo as Record<string, unknown>);
      const date = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const props = {
        from,
        date,
        content: letter.content,
        role: letter.job?.role ?? null,
        company: letter.job?.company ?? null,
        style: letter.templateStyle,
        accent: letter.templateAccent,
        font: letter.templateFont,
      };
      if (kind === "pdf") {
        const buf = await htmlToPdf(await letterHtml(props));
        return pdf(buf, `${safe(letter.name)}.pdf`);
      }
      return text(letterToTxt({ ...props, greeting: letter.content.greeting ?? "", paragraphs: letter.content.paragraphs ?? [], closing: letter.content.closing ?? "", signOff: letter.content.signOff ?? "" }), `${safe(letter.name)}.txt`);
    }

    if (scope === "bundle") {
      const letter = await getLetter(id, auth.session.userId);
      if (!letter) return notFound();
      const cvId = letter.cvId;
      if (!cvId) return NextResponse.json({ ok: false, error: "No paired CV" }, { status: 400 });
      const cv = await getCvRenderProps(cvId, auth.session.userId);
      if (!cv) return notFound();
      const master = await getFullProfile(auth.session.userId);
      const from = buildFromBlock(master.profile?.personalInfo as Record<string, unknown>);
      const date = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const html = shell(
        (await renderMarkup(
          createElement(LetterDocument, {
            from,
            date,
            content: letter.content,
            role: letter.job?.role ?? null,
            company: letter.job?.company ?? null,
            style: letter.templateStyle,
            accent: letter.templateAccent,
            font: letter.templateFont,
          }),
        )) +
          `<div class="sheet-break"></div>` +
          (await renderMarkup(
            createElement(CvDocument, {
              name: cv.name,
              headline: cv.headline,
              contact: cv.contact,
              sections: cv.sections,
              format: cv.format,
              theme: cv.theme,
            }),
          )),
      );
      const buf = await htmlToPdf(html);
      return pdf(buf, `${safe(letter.name)}-cv.pdf`);
    }

    // scope === cv
    const cv = await getCvRenderProps(id, auth.session.userId);
    if (!cv) return notFound();
    const base = {
      name: cv.name,
      headline: cv.headline,
      contact: cv.contact,
      sections: cv.sections,
    };
    if (kind === "docx") {
      const buf = await cvToDocx(base);
      return file(buf, `${safe(cv.cv.name)}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }
    if (kind === "txt") {
      return text(cvToTxt(base), `${safe(cv.cv.name)}.txt`);
    }
    const buf = await htmlToPdf(await cvHtml({ ...base, format: cv.format, theme: cv.theme }));
    return pdf(buf, `${safe(cv.cv.name)}.pdf`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

function safe(name: string): string {
  const clean = name.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "-").toLowerCase();
  return clean || "document";
}

function notFound() {
  return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
}

function pdf(buffer: Buffer, name: string) {
  return file(buffer, name, "application/pdf");
}

function text(body: string, name: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}

function file(buffer: Buffer, name: string, type: string) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}

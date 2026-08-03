import "server-only";
import type { RenderedSection } from "@/lib/cv/render";

export type TxtCvProps = {
  name?: string;
  headline?: string;
  contact?: string[];
  sections: RenderedSection[];
};

export type TxtLetterProps = {
  from?: string;
  date?: string;
  role?: string | null;
  company?: string | null;
  greeting?: string;
  paragraphs: string[];
  closing?: string;
  signOff?: string;
};

export function cvToTxt(props: TxtCvProps): string {
  const out: string[] = [];
  if (props.name) out.push(props.name.toUpperCase());
  if (props.headline) out.push(props.headline);
  if (props.contact && props.contact.length > 0) {
    out.push(props.contact.join("  ·  "));
  }
  out.push("", "=".repeat(48), "");

  for (const section of props.sections) {
    out.push(section.label.toUpperCase());
    out.push("-".repeat(Math.min(section.label.length + 4, 48)));
    for (const item of section.items) {
      const head = [item.title, item.badge].filter(Boolean).join("  ·  ");
      if (head) out.push(head);
      if (item.subtitle) out.push(item.subtitle);
      for (const line of item.lines ?? []) out.push(`  - ${line}`);
      for (const nested of item.nested ?? []) {
        out.push(`  - ${nested.title ? `${nested.title}: ` : ""}${nested.text}`);
      }
    }
    out.push("");
  }
  return out.join("\n");
}

export function letterToTxt(props: TxtLetterProps): string {
  const out: string[] = [];
  if (props.from) out.push(props.from);
  if (props.date) out.push(props.date);
  out.push("");
  if (props.role || props.company) {
    out.push(`RE: ${[props.role, props.company].filter(Boolean).join(" — ")}`);
    out.push("");
  }
  out.push(props.greeting || "Dear Hiring Team,");
  out.push("");
  for (const p of props.paragraphs) {
    out.push(p);
    out.push("");
  }
  if (props.closing) {
    out.push(props.closing);
    out.push("");
  }
  out.push(props.signOff || "Best regards,");
  if (props.from) out.push(props.from.split("\n")[0]);
  return out.join("\n");
}

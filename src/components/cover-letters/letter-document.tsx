import type { LetterContent } from "@/lib/validations/cover-letters";
import type { LetterStyle } from "@/lib/cover-letters/styles";

/**
 * The letter itself. Pure presentational, usable on server and client.
 * Renders a clean A4-style letter sheet, optionally with the target role/company.
 * The `style` prop selects the typographic treatment (see styles below).
 */

export function LetterDocument({
  from,
  date,
  content,
  role,
  company,
  accent = "#1e3a8a",
  font = "Inter, ui-sans-serif, system-ui, sans-serif",
  style = "modern",
}: {
  from?: string;
  date?: string;
  content: LetterContent;
  role?: string | null;
  company?: string | null;
  accent?: string;
  font?: string;
  style?: LetterStyle;
}) {
  const paras = content.paragraphs ?? [];

  return (
    <div
      className={`letter-root letter--${style}`}
      style={{ fontFamily: font, color: "#111827", ["--ltr-accent" as string]: accent }}
    >
      <style suppressHydrationWarning>{letterStyles}</style>

      {(style === "creative" || style === "executive") && (
        <header className="letter-band" style={{ background: accent, color: "#fff" }}>
          <div className="letter-band-name">{from?.split("\n")[0] ?? ""}</div>
          <div className="letter-band-sub">{from?.split("\n").slice(1).join(" · ")}</div>
        </header>
      )}

      <header className="letter-head">
        {from ? <div className="letter-from">{from}</div> : null}
        <div className="letter-date">{date ?? ""}</div>
      </header>

      {(role || company) && (
        <div className="letter-re">
          <span className="letter-re-label">RE: </span>
          {[role, company].filter(Boolean).join(" — ")}
        </div>
      )}

      <div className="letter-greeting">{content.greeting || "Dear Hiring Team,"}</div>

      <div className="letter-body">
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {content.closing ? <p>{content.closing}</p> : null}
      </div>

      <div className="letter-signoff">
        <div>{content.signOff || "Best regards,"}</div>
        <div className="letter-signname">{from?.split("\n")[0] ?? ""}</div>
      </div>
    </div>
  );
}

const letterStyles = `
  .letter-root { font-size: 13.5px; line-height: 1.65; padding: 36px 40px; }
  .letter-head { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: #4b5563; margin-bottom: 22px; }
  .letter-from { white-space: pre-line; }
  .letter-date { white-space: nowrap; }
  .letter-re { font-weight: 600; margin-bottom: 14px; letter-spacing: 0.01em; }
  .letter-re-label { color: var(--ltr-accent, #111); }
  .letter-greeting { margin-bottom: 14px; font-weight: 500; }
  .letter-body p { margin: 0 0 12px; }
  .letter-signoff { margin-top: 22px; }
  .letter-signname { margin-top: 4px; font-weight: 600; }

  /* ---- letter band (creative / executive) ---- */
  .letter-band { padding: 22px 28px; margin: -36px -40px 26px; }
  .letter-band-name { font-size: 22px; font-weight: 700; letter-spacing: 0.01em; }
  .letter-band-sub { margin-top: 4px; font-size: 12px; opacity: 0.85; }
  .letter--creative .letter-head { display: none; }
  .letter--executive .letter-head { display: none; }
  .letter--executive .letter-re { font-size: 14px; margin-top: 4px; }

  /* ---- modern accent rule ---- */
  .letter--modern { padding-top: 40px; }
  .letter--modern .letter-head { border-bottom: 3px solid var(--ltr-accent, #111); padding-bottom: 14px; }

  /* ---- modified block: right-aligned date & signoff ---- */
  .letter--modified .letter-date { text-align: right; }
  .letter--modified .letter-signoff { text-align: right; }
  .letter--modified .letter-signname { font-weight: 600; }

  /* ---- semi-block: indented paragraphs ---- */
  .letter--semiblock .letter-body p { text-indent: 1.5em; margin-left: 0; }

  /* ---- minimal: airy, no decoration ---- */
  .letter--minimal .letter-head { font-size: 12.5px; color: #374151; margin-bottom: 34px; }
  .letter--minimal .letter-re { letter-spacing: 0.02em; }
  .letter--minimal .letter-body { line-height: 1.7; }

  /* ---- executive: formal letterhead ---- */
  .letter--executive .letter-re { font-size: 13.5px; }
  .letter--executive .letter-body { font-size: 13.5px; }
  .letter--executive .letter-signoff { margin-top: 28px; }
`;

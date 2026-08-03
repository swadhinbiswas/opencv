import "server-only";
import { env } from "@/lib/env";

/* ── Local Chrome fallback (puppeteer-core) ──────────────────────────────── */

async function htmlToPdfLocal(html: string): Promise<Buffer> {
  const puppeteer = await import("puppeteer-core");

  const CHROME_PATHS = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/sbin/chromium",
    "/opt/google/chrome/chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;

  for (const executablePath of CHROME_PATHS) {
    try {
      const browser = await puppeteer.default.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
        });
        return Buffer.from(pdf);
      } finally {
        await browser.close();
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Could not render PDF: no Chromium binary found. Set CHROME_PATH.");
}

/* ── Cloudflare Browser Run (primary) ────────────────────────────────────── */

async function htmlToPdfWorker(html: string): Promise<Buffer> {
  const { pdfWorker } = env;
  const res = await fetch(pdfWorker.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(pdfWorker.apiKey ? { Authorization: `Bearer ${pdfWorker.apiKey}` } : {}),
    },
    body: JSON.stringify({ html }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PDF worker returned ${res.status}: ${text}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/* ── Public API ──────────────────────────────────────────────────────────── */

/**
 * Convert an HTML string to a PDF buffer.
 * Tries Cloudflare Browser Run first; falls back to local Chrome.
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  if (env.pdfWorker.configured) {
    try {
      return await htmlToPdfWorker(html);
    } catch (err) {
      console.warn("Cloudflare PDF worker failed, falling back to local Chrome:", err);
    }
  }
  return htmlToPdfLocal(html);
}

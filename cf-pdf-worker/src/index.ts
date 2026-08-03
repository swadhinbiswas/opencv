/**
 * Cloudflare Worker — PDF Generation Service v1.0.1
 *
 * Receives HTML via POST, renders it with Browser Run (cloud-hosted Chromium),
 * and returns a PDF. Designed to be called from the main OpenCV app's export route.
 *
 * POST /  { html: string, filename?: string }  →  application/pdf
 */

import puppeteer from "@cloudflare/puppeteer";

interface Env {
  BROWSER: unknown;
  WORKER_VERSION: string;
  API_KEY?: string;
}

const MAX_HTML_BYTES = 2 * 1024 * 1024;
const PDF_TIMEOUT_MS = 25_000;

/* ── CORS ─────────────────────────────────────────────────────────────────── */

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResp(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/* ── Auth ─────────────────────────────────────────────────────────────────── */

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.API_KEY) return true;
  return request.headers.get("Authorization") === `Bearer ${env.API_KEY}`;
}

/* ── PDF generation via Browser Run ───────────────────────────────────────── */

async function generatePdf(html: string, env: Env): Promise<Buffer> {
  // Validate binding exists
  if (!env.BROWSER) {
    throw new Error("BROWSER binding not configured — redeploy with [browser] binding in wrangler.toml");
  }

  let browser;
  try {
    browser = await puppeteer.launch(env.BROWSER);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to launch browser: ${msg}`);
  }

  try {
    const page = await browser.newPage();

    // Block images/media to speed up rendering (keep fonts for Google CDN)
    await page.setRequestInterception(true);
    page.on("request", (req: Puppeteer.HTTPRequest) => {
      const type = req.resourceType();
      if (["image", "media", "stylesheet"].includes(type) && !req.url().includes("fonts.googleapis.com")) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: PDF_TIMEOUT_MS,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/* ── Worker entry ─────────────────────────────────────────────────────────── */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method === "GET") {
      return jsonResp(200, {
        ok: true,
        version: env.WORKER_VERSION,
        browser: !!env.BROWSER,
      });
    }

    if (request.method !== "POST") {
      return jsonResp(405, { error: "Method not allowed" });
    }

    if (!isAuthorized(request, env)) {
      return jsonResp(401, { error: "Unauthorized" });
    }

    try {
      const body = (await request.json()) as Record<string, unknown>;
      const html = body.html;
      const filename = typeof body.filename === "string" ? body.filename : "document.pdf";

      if (!html || typeof html !== "string") {
        return jsonResp(400, { error: "Missing or invalid 'html' field" });
      }

      if (new TextEncoder().encode(html).byteLength > MAX_HTML_BYTES) {
        return jsonResp(413, { error: "HTML exceeds 2 MB limit" });
      }

      const pdf = await generatePdf(html, env);
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "");

      return new Response(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeName}"`,
          "Cache-Control": "no-store",
          ...CORS,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF generation failed";
      console.error("PDF error:", message);
      return jsonResp(500, { error: message });
    }
  },
};

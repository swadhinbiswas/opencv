# CV PDF Worker

Cloudflare Worker that generates PDFs from HTML using Browser Run (cloud-hosted Chromium). Deployed separately from the main OpenCV app.

## Prerequisites

1. Cloudflare account with **Workers paid plan** ($5/mo) — Browser Run requires it
2. Node.js 18+

## Setup

```bash
cd cf-pdf-worker
npm install
```

## Local Development

```bash
npx wrangler dev
# → http://localhost:8787
# Test: curl -X POST http://localhost:8787 -H 'Content-Type: application/json' -d '{"html":"<h1>Hello</h1>"}' -o test.pdf
```

## Deploy

```bash
# Set the API key (shared secret with the main app)
npx wrangler secret put API_KEY
# Paste a strong random string when prompted

# Deploy
npx wrangler deploy
# → https://cv-pdf-worker.<your-subdomain>.workers.dev
```

## Environment Variables (main app)

Set these in the Next.js app's `.env.local` or Vercel dashboard:

```
PDF_WORKER_URL=https://cv-pdf-worker.<your-subdomain>.workers.dev
PDF_WORKER_API_KEY=<the same secret you set above>
```

When both are set, the main app sends HTML to this worker for PDF generation. If the worker is unreachable, it falls back to local Chrome automatically.

## API

### `POST /`

**Request:**
```json
{
  "html": "<!doctype html>...</html>",
  "filename": "cv.pdf"
}
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <API_KEY>`

**Response:** `application/pdf` binary

### `GET /`

Health check — returns `{ ok: true, version: "1.0.0" }`.

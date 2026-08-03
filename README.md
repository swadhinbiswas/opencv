# OpenCV — Free CV Builder, Resume Maker & Cover Letter Templates

Build a professional, ATS-friendly CV or resume for free. OpenCV turns one master
career profile into unlimited tailored CVs and matching cover letters, and exports
them as clean A4 PDFs — no design skills required.

## Highlights

- **12+ CV template formats** — ATS Pro, Classic, Modern, Minimal, Elegant,
  Academic, Technical, Creative, Executive, Sidebar, Two Column and Compact.
  Every template is rendered live (not a placeholder image), so the preview is
  exactly the document you get.
- **7 cover letter styles** — Classic Block, Modern, Modified Block, Semi-Block,
  Minimal, Executive and Creative. Pair any letter with a CV and download both
  as a single combined PDF.
- **One master profile** — enter every role, project, skill and reference once;
  tailor a CV per job without retyping anything.
- **Job application tracker** — kanban board that links each application to the
  exact CV and cover letter you sent.
- **SEO-ready** — structured data (JSON-LD), sitemap, robots.txt, `ai.txt` and
  `llms.txt` for AI crawlers, Open Graph + Twitter cards, and keyword-rich
  template landing pages.

## Stack

- [Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS
- [Firebase Auth](https://firebase.google.com) — Google sign-in + Firebase Admin
  session verification
- [libSQL](https://libsql.org) via Drizzle ORM (local `dev.db` by default,
  Turso URL for production)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in Firebase + auth values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

See `.env.example`. Key vars:

- `AUTH_SECRET` — required; generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_*` — Firebase client + service-account
  credentials. Without them the app runs in dev-auth fallback mode.
- `DATABASE_URL` — `file:./dev.db` locally, or a Turso URL in production.

### Scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm start            # run production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run db:push      # push schema to the database
```

## Notes

- All user documents live under protected routes (`/dashboard`, `/profile`,
  `/cv`, `/cover-letters`, `/jobs`) and are excluded from crawlers.
- The brand is "OpenCV" and is unrelated to the OpenCV computer-vision library.

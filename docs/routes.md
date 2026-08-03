# OpenCV — Routes & Screens

## Public
- `/` — marketing/landing
- `/templates` — gallery preview

## Auth
- `/login`, `/signup` — Firebase (dev-fallback) sign in/up
- `/onboarding` — first-run wizard (Phase 2)

## Protected (authenticated shell)
- `/dashboard` — CVs, cover letters, job tracker summary, recent activity
- `/profile` — Master Profile editor (accordion sections)
- `/cv` — list CVs
- `/cv/new` — template picker → create instance
- `/cv/[cvId]/edit` — split-screen editor
- `/cv/[cvId]` preview + export
- `/cover-letters`, `/cover-letters/[id]/edit`
- `/jobs` (Kanban + table), `/jobs/[jobId]`
- `/settings` — account, data export/delete (GDPR)

## API (route handlers)
- `POST /api/auth/login|signup|logout`, `GET /api/auth/session`
- `GET/PATCH /api/profile` — master profile + all blocks
- `POST/PUT/DELETE /api/profile/:section` — CRUD per block type
- `POST /api/profile/reorder` — bulk order updates
- `GET /api/templates` — seeded template catalog
- `GET/POST /api/cvs`, `GET/PATCH/DELETE /api/cvs/:id`, `PATCH /api/cvs/:id/sections`
- `GET/POST /api/jobs`, `GET/PATCH/DELETE /api/jobs/:id`, `POST /api/jobs/:id/events`, `POST /api/jobs/:id/status`
- `GET/POST /api/cover-letters`, `GET/PATCH/DELETE /api/cover-letters/:id`

## This session ships (Phase 0–6)
`/`, `/login`, `/signup`, `/dashboard`, `/profile`, the auth + profile API,
the **CV builder** (`/cv`, `/cv/new`, `/cv/:id`, `/cv/:id/edit`), the
**job tracker** (`/jobs` kanban, `/jobs/:id` detail with status moves + event
timeline), the **cover letter builder** (`/cover-letters`, `/cover-letters/:id`
preview + `/edit` with live preview, job/CV pairing), and **PDF/HTML export**
(`/print/cv/:id`, `/print/cover-letters/:id` — chrome-free print views that
open the browser "Save as PDF" dialog).
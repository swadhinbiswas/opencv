# OpenCV — Architecture

## 0. Scope note (this session: Phase 0–6)

This build targets **Phase 0–6**: scaffolding, auth, the Master Profile editor,
the **CV builder** (template catalog, per-CV section snapshots, live section
toggles, HTML preview), the **job tracker** (kanban pipeline, status moves,
event timeline), the **cover letter builder** (structured content with live
preview, paired to jobs/CVs), and **PDF/HTML export** via chrome-free print
routes that drive the browser's "Save as PDF" (a print stylesheet; server-side
react-pdf/chromium generation remains an optional later upgrade).

Build is **local-first**: libSQL file DB, signed-session auth with a guarded
Firebase path, and an in-memory cache fallback. Every external service has a
config-guarded adapter so real credentials can be dropped in via env vars without
code changes.

## 1. Stack

| Layer | Choice | Local-first behavior |
|---|---|---|
| Framework | Next.js 14+ App Router, TypeScript, RSC | Vercel-ready |
| UI | shadcn/ui on Tailwind CSS (Radix) | — |
| Motion | Framer Motion | subtle only |
| Forms | React Hook Form + **shared Zod** | shared `src/types/` schemas |
| Drag & drop | dnd-kit | future phases |
| Editor state | Zustand | local, with undo history |
| Server state | TanStack Query | debounced autosave |
| DB | Turso/libSQL via **Drizzle** | `file:` URL local fallback |
| Cache/ratelimit | Upstash Redis | in-memory fallback |
| Auth | Firebase client + Admin SDK | guarded: signed JWT session fallback |
| Files | Firebase Storage / R2 | guarded; n/a this phase |
| Export | @react-pdf/renderer, docx, chromium | future |
| Analytics | Plausible/PostHog | stub |

## 2. Folder structure

```
src/
  app/
    (marketing)/               landing.tsx, templates/page.tsx       # public
    (auth)/login, (auth)/signup                                       # auth
    (app)/                     # protected shell (dashboard, profile, cv, jobs, ...)
      layout.tsx               AppShell: sidebar, topbar, ⌘K palette
      dashboard/page.tsx
      profile/page.tsx
      cv/  cv/new/  cv/[cvId]/edit/  prex...
    api/                       # route handlers (server actions/JSON)
      auth/login route.ts, logout
      profile/[section]/route.ts
      templates/  cvs/  cvs/[id]/sections
    onboarding/ (phase 2/8)
  components/
    ui/                        # shadcn-generated
    layout/   AppShell, Sidebar, CommandPalette, ThemeToggle, AutosaveBar
    profile/  SectionIndex, <SectionBlock> editor per entity
    cv/       (phase 3-4: template picker, split-screen editor, live preview)
  lib/
    db/  index.ts schema.ts migrations/ client.ts
    auth/  session.ts (jose), firebase-client.ts, firebase-admin.ts (guarded)
    cache/  index.ts (upstash/redis fallback to in-memory LRU)
    http/  server.ts (auth'd server helpers), client.ts (fetch wrapper)
    utils.ts  cn()
  types/
    = zod schemas (shared client/server)
```

Key rules:
- Server mutations verify a signed session cookie; never trust a client-sent `userId`.
- One Zod schema per entity under `src/types/`; RHF uses it on the client, Drizzle
  /api validates with it on the server.
- External-service adapters throw/fall back gracefully when env is absent.

## 2. Auth model

- Client `login`/`signup` call `POST /api/auth/session`.
- If Firebase env is configured: verify the Firebase ID token w/ Admin SDK, map
  `firebaseUid` → `users`, drop a signed session cookie.
- Else (dev mode): accept the requested account creds in the payload, upsert a
  `users` row, sign the same session cookie. This lets the app run with zero
  external dependencies.
- Session = `jose` JWT in httpOnly cookie `rf_session`, 7-day expiry.
- Middleware guards `/dashboard`, `/profile`, `/cv*` by cookie presence; APIs use
  `requireUser()` server helper.

## 3. Cache & rate-limit abstraction

`lib/db/../http` no — `lib/cache/` exports `cacheAdapter` with the same
`get/set/del` surface either backed by Upstash Redis (env present) or a tiny
in-memory store. Rate limiting uses `@upstash/ratelimit` when available, a simple
sliding window otherwise. Applied to `/api/auth` and future export endpoints.

## 4. Security / privacy

- All rich text sanitized server-side (DOMPurify) before persist.
- Zod validation server-side on every write endpoint.
- `dateOfBirth`/`photo` are opt-in flags surfaced in UI for EU vs US formats.
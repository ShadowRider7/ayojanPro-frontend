# AyojanPro Frontend

A production-quality Next.js 16 App Router client for the AyojanPro event-service platform. Clients plan events, professionals apply and get booked, contracts, payments (bKash), deliverables, reviews, and disputes are all managed through this UI.

## Tech stack

- **Next.js 16** (App Router) — React 19, TypeScript
- **Tailwind CSS v4** (via Turbopack loader, not PostCSS)
- **ofetch** — API client
- **@tanstack/react-query** — data fetching/caching
- **@tanstack/react-form** + **zod** — forms + validation
- **@react-oauth/google** — Google sign-in
- **shadcn/ui** (base-nova style on `@base-ui/react`) — UI primitives
- **Biome** — linting + formatting
- **Bun** — package manager

## Prerequisites

- [Bun](https://bun.sh) >= 1.4
- Backend running at `http://localhost:5000` (see [AyojanPro](https://github.com/AyojanPro/AyojanPro) backend repo)
- Node.js >= 20 (for Next.js)

## Setup

```bash
# Install dependencies
bun install

# Copy env file and fill in values
cp .env.example .env.local

# Run dev server (http://localhost:3000)
bun run dev
```

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://ayojan-pro.vercel.app/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (same as backend) | `<your-client-id>` |

The dev frontend must run on `http://localhost:3000` because the backend CORS is configured with `origin: FRONTEND_URL` and credentials.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server on :3000 |
| `bun run build` | Production build |
| `bun run lint` | Biome check |
| `bun run format` | Biome format (write) |
| `bunx tsc --noEmit` | TypeScript type check |

## Architecture

### Directory layout

```
src/
  api/            # Thin API functions over apiClient (one file per domain)
  hooks/          # TanStack Query wrappers (useQuery/useMutation)
  types/          # Domain types + enums + payloads (one file per domain)
  validation/     # Zod schemas (one file per domain)
  routes/         # Sidebar config per role (client/professional/admin)
  providers/      # Query, Google OAuth, Tooltip providers
  lib/            # apiClient, utils (cn), constants, cancellation policy
  utils/          # formatters, phone/country/url helpers, service matching
  components/
    ui/           # shadcn primitives (base-nova)
    shared/       # PageHeader, DataTable, SelectFilter, StatusBadge, states…
    auth/         # The single AuthGuard (session + role + approval)
    form/         # Domain forms (register, verify, apply)
    account/      # Profile menu and notification bell (used by the header)
    dashboard/    # Dashboard shell and role sidebar
    layout/public/# Header, Footer
    modules/      # Feature components (events, contracts, disputes, etc.)
  app/            # Next.js App Router pages
```

### Data flow

- **Read:** Component → `useX()` hook (`useQuery`) → API function (`apiClient`) → backend envelope `{ success, statusCode, message, data, meta? }`. Components read `data?.data`.
- **Write:** Component/form → `useMutation` → API function → toast + invalidate query keys on success.
- **Session:** Backend sets httpOnly cookies; client never reads them. `GET /auth/me` (`useGetMe`, key `["user"]`) is the source of truth.

### Guards

One guard covers the whole dashboard (`src/components/auth/auth-guard.tsx`):

- `AuthGuard` — any authenticated session (wraps the dashboard layout)
- `AuthGuard roles={[…]}` — role-based access (wraps each role layout)
- `AuthGuard requireApprovedProfessional` — APPROVED status only (wraps the approved part of the professional workspace)

### Forms

Every form validates with `validateOnChange(schema)` from
`src/validation/validators.ts`. TanStack Form keeps a validator's error
until **the same** validator runs again, so a form-level `onSubmit` schema
would leave a stale error on screen after the user fixed the field —
validating on change clears it as soon as the value is valid again.

### Back navigation

The back buttons follow the browser history, so the visitor lands where
they came from. The app tracks its own navigation
(`src/lib/navigation-history.ts`) to tell an in-app visit apart from a page
that was opened directly — the fixed route is only the fallback for the
latter. See `useGoBack` in `src/providers/navigation.provider.tsx`.

### Dashboard URLs

- Client: `/dashboard`, `/dashboard/events`, `/dashboard/contracts`, `/dashboard/profile`
- Professional: `/dashboard/professional/*`
- Admin: `/dashboard/admin/*`
- Shared: `/dashboard/contracts`, `/dashboard/notifications`

## Proposal rules

- A proposal covers **one service only** — one requirement + one of the professional's own services. The client accepts or rejects each service separately.
- A professional may only propose for requirements matching a service they actually offer. The match is by name (`src/utils/service-match.util.ts`): names are lowercased and stripped of non-alphanumerics, then compared for equality or containment — "video man" matches "Professional Weedding Videoman". The backend applies the same rule on `POST /proposal/events/:eventId`.
- The proposal dialog therefore lists only the services a professional can cover and sends one request per selected service; a partial failure keeps the failed rows for a retry.

## Development notes

- Package manager is **Bun** — do not add a second lockfile.
- `next.config.ts` enables `reactCompiler`. The app is deployed as a **Next.js server** on Vercel — there is no `output: "export"`, so `bun run build` produces a server build and no `out/` folder.
- Tailwind v4 is wired through the Turbopack loader — no `postcss.config.*`.
- Import alias is `@/*` → `src/*`.
- `.next/types` is generated by `next dev`/`next build` — run dev once before standalone type checks.
- Biome defaults to LF — on Windows with `core.autocrlf=true`, reformat `package.json` if lint reports a format diff.
- The `/style-guide` page was removed in T22 (temp development page).

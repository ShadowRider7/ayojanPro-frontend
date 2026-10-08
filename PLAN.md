# AyojanPro Frontend — Full Build Plan

> Living document. Backend: https://github.com/ShadowRider7/AyojanPro-Backend
> API collection: `C:\projects\AyojanPro\AyojanPro.postman_collection.json` (78 requests, 13 folders)
> Reference conventions: https://github.com/Apollo-Level2-Web-Dev/PH-Healthcare-Nextjs
> Base URL: `NEXT_PUBLIC_API_BASE_URL` = `https://ayojan-pro.vercel.app/api/v1`

Work is divided into **10 segments (S0–S9)**. Finish one segment at a time — each has a
definition of done and a verification step. Do not start a segment until the previous one
passes verification.

---

## Architecture & Conventions (apply to every segment)

```
src/
  api/<domain>.api.ts + index.ts                 # plain functions over apiClient
  hooks/<domain>.hook.ts + index.ts              # TanStack Query wrappers
  types/<domain>.type.ts + index.ts              # Payload interfaces + entity types
  validation/<domain>.validation.ts + index.ts   # Zod schemas
  routes/{admin,professional,client}.routes.ts    # sidebar nav config
  lib/apiClient.ts, utils.ts
  components/auth/          # auth-guard, role-guard, auth-loading, access-denied
  components/dashboard/     # dashboard-shell, dashboard-sidebar, topbar
  components/form/          # page-level forms (login-form, register-form, ...)
  components/modules/<feature>/  # feature UI clusters, kebab-case files
  components/ui/            # shadcn primitives ONLY (never feature-specific)
  components/layout/public/ # Header.tsx, Footer.tsx
```

- **Stack:** Next.js 16 App Router, React 19, Bun, Biome, Tailwind v4, shadcn (Base UI
  `base-maia`), `ofetch` + TanStack Query v5 + TanStack React Form + Zod + `@react-oauth/google`.
  **No** Redux / NextAuth / axios / RTK Query.
- **Import flow:** component → hook (`useX`) → api fn (`x.api.ts`) → `apiClient` → backend.
  Components never touch `apiClient` directly.
- **Barrels:** consumers import `@/api`, `@/hooks`, `@/types`, `@/validation`.
- **Naming:** kebab-case component files; `<domain>.<layer>.ts` for layer files; PascalCase
  only for existing layout/asset components (`Header.tsx`, `Footer.tsx`, `Logo.tsx`).
- **Auth:** cookie session (`credentials: "include"`), `GET /auth/me` is source of truth,
  guards redirect to `/login`. Route groups: `(public)/(marketing)`, `(public)/(authentication)`,
  `(dashboard)` with per-role layouts.
- **Forms:** `useForm` (TanStack React Form) + Zod schema from `@/validation` →
  `mutate(data, { onSuccess, onError })` → toast + `router.push`.
- **Biome** is the linter/formatter. Run `bun run lint` before finishing any segment.

---

## Domain files inventory (created across segments)

| Domain file | Segment |
|---|---|
| `auth`, `user`, `professional` api/hooks/types/validation | S1 |
| `client` | S3 |
| `event`, `proposal` | S4 |
| `contract`, `payment` | S5 |
| `review`, `dispute`, `notification`, `analytics` | S6 |
| `admin` | S7 |

---

## S0 — Foundation fixes (must be first)

**Goal:** make the existing skeleton actually run correctly.

Tasks:
1. Mount `<Providers>` and `<Toaster>` in `src/app/layout.tsx` (currently never imported —
   Header already calls `toast.add` and silently fails).
2. Fix root `metadata` (still create-next-app defaults): title template, description,
   OpenGraph basics for AyojanPro.
3. ~~Fix `userLogout`~~ **Resolved against live backend:** `POST /auth/logout` **does exist**
   (route in backend repo; deployed server returns 200 and clears `accessToken`/`refreshToken`
   httpOnly cookies). The plan's original premise was wrong — client-only logout would leave
   valid cookies and the user logged in on reload. Keep the network call in `userLogout()` and
   keep `queryClient.removeQueries({ queryKey: ["user"] })` in Header `onSuccess`.
4. Upgrade `src/lib/apiClient.ts`:
   - `onResponseError`: on 401 → attempt `POST /auth/refresh-token` **once** (single-flight
     guard to avoid parallel refreshes), retry original request; if refresh fails → clear
     session and redirect to `/login`.
   - ⚠ ~~Q1~~ **answered:** refresh transport is **cookie** (`req.cookies.refreshToken`, no
     body; new tokens set back as cookies). `credentials: "include"` handles it; the client
     retry is a safety net only.
5. Create `src/app/(public)/(authentication)/layout.tsx` — centered card layout with logo,
   no Header/Footer. **Done.**
6. Create `src/proxy.ts` — **Next.js 16 renamed `middleware.ts` → `proxy.ts`** (same
   functionality; export named `proxy`). Light pre-check only: redirect unauthenticated-looking
   requests away from `/admin|/professional|/client` when neither `accessToken` nor
   `refreshToken` cookie is present (names confirmed from backend controller). Real
   enforcement stays in guards (JWT is httpOnly, unreadable client-side).
7. Keep the `AGENTS.md` nextjs-agent-rules block intact — commit it with your work.
8. **Done — lint/type baseline:** set Biome `formatter.lineEnding: "auto"` (repo uses git
   `core.autocrlf=true`; default LF made `bun run lint` fail on every Windows checkout), fixed
   remaining a11y diagnostics, filled the 4 zero-byte dashboard `page.tsx` files with
   placeholders (they broke `tsc` and returned 500), and removed stale `.next/types`
   generated before `src/app/page.tsx` was deleted.

**Verify:** `bun run dev` → homepage renders, toast appears on header logout click, no
hydration/console errors; `bun run lint` clean.

---

## S1 — Auth system (guards + all auth flows)

**Goal:** full signup → verify → login → role-based dashboard loop.

Tasks:
1. **Guards** in `src/components/auth/` (mirror PH-Healthcare):
   - `auth-loading.tsx` — spinner/skeleton
   - `access-denied.tsx` — 403 screen
   - `auth-guard.tsx` — `"use client"`; uses `useGetMe()` (`retry: false`); pending →
     `AuthLoading`; error/no user → `router.replace("/login")`; else children
   - `role-guard.tsx` — `roles: UserRole[]`; wrong role → `AccessDenied`
2. **Apply guards in layouts:**
   - `(dashboard)/layout.tsx` → `<AuthGuard>{children}</AuthGuard>`
   - `(dashboard)/admin/layout.tsx` → `<RoleGuard roles={["ADMIN"]}><DashboardShell role="ADMIN">`
   - `(dashboard)/professional/layout.tsx` → `<RoleGuard roles={["PROFESSIONAL"]}>` (+ if
     `professional.status !== "APPROVED"`, render a "pending review"/"rejected" screen)
   - `(dashboard)/client/layout.tsx` → `<RoleGuard roles={["CLIENT"]}>`
3. **API layer** (extend existing):
   - `auth.api.ts`: add `forgotPassword` (POST `auth/forgot-password`), `resetPassword`
     (POST `auth/reset-password` `{email, otp, newPassword, confirmPassword}`),
     `refreshToken` (POST `auth/refresh-token`). Keep: register, verify-email, login,
     google, getMe.
   - `user.api.ts` (new): `uploadProfileImage` — PATCH `user/profile-image`, multipart
     field `profileImage`.
   - `professional.api.ts`: add `verifyProfessionalAccount` (already exists) — keep.
4. **Types:** complete `auth.type.ts` (`ForgotPasswordPayload`, `ResetPasswordPayload`),
   `user.type.ts` (`UserRole = "ADMIN" | "PROFESSIONAL" | "CLIENT"`, `UserStatus`).
5. **Validation** `auth.validation.ts` (Zod): login, register (nested
   `client{phone,bio,address,city,country}`), verify-otp, forgot-password, reset-password
   (confirm match). Create `validation/index.ts` barrel.
6. **Hooks:** extend `auth.hook.ts` — `useForgotPassword`, `useResetPassword`.
7. **Forms** in `src/components/form/` (TanStack React Form + Zod):
   `login-form.tsx`, `register-form.tsx`, `verify-account-form.tsx` (OTP input, reusable
   — accepts `email` prop), `forgot-password-form.tsx`, `reset-password-form.tsx`.
   All show `toast.add` on success/error; login onSuccess → `router.push` based on
   `role` (`/admin` | `/professional` | `/client`).
8. **Pages** (fill the 0-byte files):
   `/login`, `/register`, `/register/verify-account`, `/forgot-password` (new),
   `/reset-password` (new), `/apply`, `/apply/verify-account`.
9. **Google login:** `components/modules/google-login/GoogleLogin.tsx` using
   `useGoogleOAuth()` → after success call `useGetMe()` refetch → role-redirect.
10. **Apply-as-professional form:** `components/form/apply-form.tsx` — multipart build
    inside `professional.api.ts`: `formData.append("data", JSON.stringify({user, professional}))`,
    `resume` file, `additionalFiles[]` files.

**Verify:** register client → OTP verify → login → lands on `/client`; apply as
professional → OTP → login → `/professional` shows pending state; wrong-role URL →
AccessDenied; `bun run lint` clean.

---

## S2 — API + types + validation for all remaining domains

**Goal:** complete data layer so all later segments only build UI.

Tasks — create, for each domain: `*.api.ts`, `*.type.ts`, `*.validation.ts` (where a form
exists), hooks in `*.hook.ts`, and barrel updates.

1. **`event.api.ts`** — POST `event`, `event/services/:eventId`; GET `event/all-events`
   (query: searchTerm, clientId, email, status, page, limit, sortBy, sortOrder),
   `event/:eventId`, `event/:eventId/required-services` (README-only — see Q5);
   PATCH `event/update/:eventId`, `event/publish-event/:eventId`,
   `event/update/:eventId/services/:serviceId`; DELETE `event/:eventId`,
   `event/:eventId/services/:serviceId`.
2. **`proposal.api.ts`** — POST `proposal/events/:eventId` (body `{message, items[]}`,
   each item `{eventServiceRequirementId, professionalServiceId, proposedAmount,
   currency, proposedStartAt, proposedEndAt}`); GET `proposal/requirements/:requirementId`,
   `proposal/:id`; PATCH `proposal/:id/accept`, `/reject`, `/withdraw`.
3. **`contract.api.ts`** — GET `contract`, `contract/:id`; PATCH `contract/:id/cancel`
   (⚠ Q4: collection says `/contracts/:id/cancel` — verify), `contract/:id/complete`;
   POST `contract/:id/deliverable` (`{title, description, externalUrl: string[]}`);
   GET `contract/:id/deliverable`.
4. **`payment.api.ts`** — POST `payment/contracts/:id/initial`, `/final` (no body;
   response contains bKash redirect URL — handle `redirectUrl`/`gatewayURL` once seen);
   GET `payment/bkash/callback`, `payment/contracts/:id`.
5. **`review.api.ts`** — POST `review/contracts/:id` (`{rating, comment}`); GET
   `review/professionals`, `review/clients` (page, limit).
6. **`dispute.api.ts`** — POST `dispute/contracts/:contractId` multipart
   (`reason` text ≥3, `description` text ≥10, `evidence` file 1+ repeatable); GET
   `dispute` (status filter), `dispute/:id`; PATCH `dispute/:id/status`, `/resolve`.
7. **`notification.api.ts`** — GET `notification?isRead`; PATCH `notification/read-all`,
   `notification/:id/read`.
8. **`admin.api.ts`** — GET `admin/users` (role/status/search), `admin/events` (status),
   `admin/contracts` (status), `admin/payments` (status/stage); PATCH
   `admin/users/:id/status`. Always send `page/limit/sortBy/sortOrder` too (README says
   all lists share `IQuery` even though collection omits it).
9. **`analytics.api.ts`** — GET `analytics/client-analytics`, `professional-analytics`,
   `admin-analytics`.
10. **`client.api.ts`** — PATCH `client/my-profile` (`{bio, phone, address, city, country}`).
11. **Types** — entity types from Prisma models: `User`, `Client`, `Professional`
    (incl. `status`, `rejectionReason`), `ProfessionalService`, `Skill`, `Experience`,
    `PortfolioItem`, `Event`, `EventServiceRequirement`, `Proposal`, `Contract`,
    `Payment`, `Deliverable`, `Review`, `Dispute` (`evidences: string[]`), `Notification`.
    Unions: `ProfessionalStatus`, `EventStatus`,
    `RequirementStatus = OPEN|PARTIALLY_FILLED|FILLED|IN_PROGRESS|COMPLETED|CANCELLED`,
    `ContractStatus = PENDING|CONFIRMED|IN_PROGRESS|DELIVERED|COMPLETED|CANCELLED|DISPUTED|RESOLVED`,
    `PaymentStatus = PENDING|PROCESSING|PARTIALLY_COMPLETED|COMPLETED|FAILED|CANCELLED|REFUNDED`,
    `PaymentStage = INITIAL|FINAL`,
    `DisputeStatus = OPEN|UNDER_REVIEW|RESOLVED|REJECTED|CLOSED`,
    `UserStatus = ACTIVE|DELETED|SUSPENDED|BLOCKED`,
    `IPagination`, `IListResponse<T>`.
12. **Response envelope** — ⚠ Q2: collection has zero saved responses. Define
    `IApiResponse<T>` generically and adjust after first live call.
13. **Validation** — `event.validation.ts` (with `endAt > startAt` refinement),
    `proposal.validation.ts`, `review.validation.ts` (rating 1–5),
    `dispute.validation.ts` (reason ≥3, description ≥10), `client.validation.ts`,
    `professional.validation.ts` (profile update, service, skill, experience, portfolio).
14. **Shared query helper** — `src/lib/query-params.ts` (or `utils/`): serialize
    `IPagination` + filters into query string.

**Verify:** `bunx tsc --noEmit` (or `bun run build`) passes; every function in
`src/api/index.ts` barrel compiles; `bun run lint` clean.

---

## S3 — Dashboard shell + notifications UI

**Goal:** all three roles can log in and navigate their dashboard.

Tasks:
1. `src/routes/admin.routes.ts`, `professional.routes.ts`, `client.routes.ts` — sidebar
   nav config typed by `SidebarItems` (from `types/sidebar.type.ts`), exported as
   `Partial<Record<UserRole, SidebarItems>>` from `routes/index.ts`.
2. `components/dashboard/dashboard-sidebar.tsx` — maps role → routes, active-state
   highlighting, collapses on mobile.
3. `components/dashboard/dashboard-shell.tsx` — shadcn `SidebarProvider` + sidebar +
   `SidebarInset` topbar containing: sidebar trigger, page title, **notification bell**,
   user dropdown (profile image upload via `useUploadProfileImage`, role label, logout).
4. `components/dashboard/dashboard-topbar.tsx` (if split out).
5. **Notifications:** `components/modules/notifications/notification-bell.tsx` +
   `notification-list.tsx` — `useNotifications({isRead})`, mark-one/mark-all mutations,
   unread badge count. Reuse the same component in public `Header.tsx`.
6. Fill `client/page.tsx`, `professional/page.tsx`, `admin/page.tsx` as **placeholder
   analytics dashboards** (stat cards wired to `useClientAnalytics` etc., even if empty
   states).
7. Ensure `admin/approve-professional/page.tsx` exists as shell (fleshed out in S7).

**Verify:** login as each role → correct sidebar items, notification bell loads, logout
works from topbar; mobile sidebar collapses; lint clean.

---

## S4 — Public site + professional profile + events browsing

**Goal:** marketing pages and the professional profile/portfolio system.

Tasks:
1. **shadcn primitives to install** (via `bunx shadcn add ...`): input, label, card,
   badge, avatar, textarea, select, dialog/sheet, dropdown-menu, table, tabs, separator,
   pagination. (Adjust names to Base UI `base-maia` registry.)
2. **Marketing modules** (`components/modules/homepage/`): `hero.tsx`,
   `featured-professionals.tsx` (uses public list API), `how-it-works.tsx`,
   `categories.tsx`, `cta.tsx`. Fill `(marketing)/page.tsx`. Complete `about-us/page.tsx`.
   Update `Header.tsx` nav (professionals, events, about, login/dashboard).
3. **Public professionals browse:** `(marketing)/professionals/page.tsx` +
   `modules/professionals/professional-card.tsx`, `professional-filter-bar.tsx`
   (searchTerm, professionalTitle) with pagination — calls
   `GET professional/public/all-Professionals`.
4. **Public profile:** `(marketing)/professionals/[professionalId]/page.tsx` with sections:
   header (avatar, title, rating, acceptingBookings, socials), about/bio, services table,
   skills, experience timeline, portfolio grid (`modules/portfolio/portfolio-grid.tsx`),
   reviews list. Calls `GET professional/public/:professionalId`.
5. **Professional own-profile management:**
   - `modules/profile/profile-form.tsx` (PATCH `professional/update-my-profile`)
   - `modules/services/` — service CRUD (list, add-dialog, edit, delete)
   - `modules/skills/` — skill add/delete chips
   - `modules/experiences/` — experience CRUD (dialog with dates)
   - `modules/portfolio/` — portfolio CRUD with multipart
     (`data` JSON string + `mediaFile`)
   - Pages under `(dashboard)/professional/`: `profile/`, `services/`, `skills/`,
     `experiences/`, `portfolio/` (+ `portfolio/new`, `portfolio/[id]/edit` as needed)
6. **Public events browse (for professionals):** `(marketing)/events/page.tsx` +
   `modules/events/event-card.tsx` + filter bar (calls `GET event/all-events`), and
   `events/[eventId]/page.tsx` detail (read-only for public visitors).

**Verify:** homepage renders sections; browse professionals with search; open a public
profile; professional can edit profile and manage services/skills/experience/portfolio
incl. file upload; lint clean.

---

## S5 — Client: events, requirements, proposals, hiring

**Goal:** client can post an event, publish it, review proposals and hire.

Tasks:
1. `modules/events/event-form.tsx` — create/update (title, description, eventType, city,
   country, address, startAt, endAt) with Zod (`endAt > startAt`).
2. `modules/events/requirement-form.tsx` — add/update service requirement
   (serviceName, description, budget, currency, startAt, endAt — own time range).
3. `modules/events/requirement-card.tsx` — status badge, actions (edit/delete), link to
   proposals.
4. `modules/events/event-status-badge.tsx` — shared enum → badge color map (reuse across
   contracts/payments/disputes later).
5. **Client pages:**
   - `(dashboard)/client/events/page.tsx` — my events list (status filter, publish button)
   - `events/new/page.tsx`, `events/[eventId]/page.tsx` (detail + requirements section),
     `events/[eventId]/edit/page.tsx`
   - publish action: `PATCH event/publish-event/:eventId` with confirm dialog
6. **Proposals (client side):** `modules/proposals/proposal-list.tsx`,
   `proposal-card.tsx` — `GET proposal/requirements/:requirementId`, accept/reject
   buttons with confirm dialog; accept → toast + refetch (contract created server-side).
   Page: `(dashboard)/client/events/[eventId]/proposals/[requirementId]/page.tsx` (or
   nested under requirement).
7. **Proposals (professional side):**
   - `modules/proposals/proposal-form.tsx` — message + dynamic `items[]` builder
     (pick your professionalServiceId, amount, dates per requirement) — one proposal
     can cover multiple requirements of the event
   - `POST proposal/events/:eventId`; withdraw action on own proposals
   - Page: `(dashboard)/professional/events/[eventId]/propose/page.tsx`
   - Proposal detail: `(dashboard)/proposal/[id]/page.tsx` (both roles, guarded).

**Verify:** client creates → publishes event → adds 2 requirements → professional submits
proposal → client accepts → contract appears (S6 will handle it); lint clean.

---

## S6 — Contracts, payments, delivery, reviews, disputes

**Goal:** the money-and-completion lifecycle works end to end.

Tasks:
1. **Contract status stepper:** `modules/contracts/contract-timeline.tsx` —
   PENDING → CONFIRMED → IN_PROGRESS → DELIVERED → COMPLETED (+ CANCELLED/DISPUTED/RESOLVED).
2. **Contract detail page:** `(dashboard)/contract/[id]/page.tsx` (shared by all roles,
   layout guard handles role) showing parties, event/requirement, time range, payments
   list (`GET payment/contracts/:id`), deliverable, actions by role/status:
   - Client: pay 30% (`POST payment/contracts/:id/initial` → redirect to returned bKash
     URL), pay 70% (only when DELIVERED), complete (`PATCH contract/:id/complete`),
     review, dispute, cancel(reason)
   - Professional: attach deliverable (`POST contract/:id/deliverable`, array
     `externalUrl`), review, dispute, cancel(reason)
3. **Payment result page:** `/payments/result/page.tsx` (or confirm Q3 — backend redirect
   target) reading `paymentID`/`status` query params → success/failure screen →
   `router.push` back to contract. Never trust frontend status — refetch contract.
4. **Contract list pages:** `(dashboard)/client/contracts/page.tsx`,
   `(dashboard)/professional/contracts/page.tsx` — status filter chips, cards with
   timeline preview.
5. **Reviews:** `modules/reviews/review-form.tsx` (star rating + comment, Zod) →
   `POST review/contracts/:id`; `review-list.tsx` for
   `GET review/professionals` / `review/clients`. Pages under each dashboard +
   shown on public profile (S4 section).
6. **Disputes:** `modules/disputes/dispute-form.tsx` — reason, description, file input
   (1+ `evidence` files, validate before submit); raise via
   `POST dispute/contracts/:contractId`. Dispute detail view with evidence JSON array.
   Pages: `contract/[id]/dispute/new`, `dispute/[id]` (parties).
7. **Deliverable viewer:** `modules/contracts/deliverable-card.tsx` — external link list,
   `GET contract/:id/deliverable`.

**Verify:** full lifecycle in staging: create → accept → 30% pay → in-progress → deliver →
70% pay → complete → mutual reviews; raise dispute with evidence; lint clean.

---

## S7 — Admin panel

**Goal:** admin can operate the platform.

Tasks:
1. `modules/professional-approval/` (dir already scaffolded):
   `professional-approval-table.tsx` (GET `professional/all-professionals` with filters:
   status, city, minRating, acceptingBookings…), `professional-review-sheet.tsx`
   (slide-over with resume/profile details), approve action
   (`POST professional/approve-professional` `{professionalId, status}`; rejection flow
   should accept a reason if backend supports `rejectionReason`).
   Page: fill `admin/approve-professional/page.tsx`.
2. **Users:** `admin/users/page.tsx` + `modules/admin/user-table.tsx` — filters
   (role, status, search), row action activate/suspend
   (`PATCH admin/users/:id/status`).
3. **Events:** `admin/events/page.tsx` — status filter table.
4. **Contracts:** `admin/contracts/page.tsx` — status filter table, link to contract
   detail (admin can complete/dispute per README).
5. **Payments:** `admin/payments/page.tsx` — status + stage filters.
6. **Disputes:** `admin/disputes/page.tsx` — status filter; `admin/disputes/[id]/page.tsx`
   detail: contract + payments + evidence gallery, `PATCH dispute/:id/status`
   (UNDER_REVIEW), `PATCH dispute/:id/resolve` (`{resolution}`).
7. **Admin analytics:** replace `admin/page.tsx` placeholder with stat cards from
   `GET analytics/admin-analytics`.
8. Shared `components/modules/admin/data-table.tsx` — generic table w/ filter bar +
   pagination to avoid repeating (Zod-agnostic, accepts columns config).

**Verify:** admin can approve a pending professional, suspend a user, filter all lists,
resolve a dispute with resolution text; lint clean.

---

## S8 — Analytics + cross-cutting polish

Tasks:
1. Real analytics dashboards: `client/page.tsx` and `professional/page.tsx` — stat
   cards + simple breakdowns from `analytics/client-analytics` /
   `professional-analytics` (events count, contracts in progress, earnings, ratings).
2. Empty states + error states + loading skeletons for every list page.
3. Toast messages standardized (success on mutation, error from API `message` field).
4. `routes/` completeness — every dashboard page reachable from sidebar.
5. SEO: per-page `metadata` (title/description), OpenGraph images, `favicon`.
6. Responsive pass: marketing pages + dashboards at 360px / 768px / 1280px.

**Verify:** `bun run build` succeeds; Lighthouse-ish manual check; lint clean.

---

## S9 — Final QA & release

Tasks:
1. Full regression against this plan + the Postman collection (every endpoint exercised
   at least once from the UI).
2. Auth edge cases: expired access token mid-session (refresh path), 403 role access,
   PENDING professional blocked from professional actions.
3. Enum mismatch check vs backend (Q5, Q6 in open questions).
4. `bun run lint && bun run build` clean; fix all Biome warnings.
5. Update `README.md` with real project docs (stack, structure, env vars, scripts).
6. Commit plan + code; deploy preview.

---

## Open questions (verify with backend)

| # | Question | Blocks |
|---|---|---|
| Q1 | ~~Refresh token transport: cookie or body/header?~~ **✅ Cookie** — `req.cookies.refreshToken`, no body; new tokens returned in cookies + JSON body | S0 refresh logic |
| Q2 | ~~Response envelope shape~~ **✅ Observed live:** `{success, statusCode, message, data}`; errors add `name` (`{success:false, statusCode, name, message}`) | S2 types |
| Q3 | Does bKash callback redirect to a frontend URL? Which path? | S6 payments |
| Q4 | `PATCH /contract/:id/cancel` (README) vs `/contracts/:id/cancel` (collection) — which is real? | S2/S6 |
| Q5 | Does `GET /event/:eventId/required-services` exist? (README only, missing/mis-pointed in collection) | S2/S5 |
| Q6 | `/event/all-events` `status` filter: event status or requirement status enum? | S4/S5 |
| Q7 | ~~Does `POST /auth/logout` exist?~~ **✅ Yes** — returns 200, clears `accessToken`/`refreshToken` cookies (verified live). Refresh tokens are stateless signed JWTs — `auth.service.refreshToken()` only verifies signature + active user, **no blacklist/rotation store**, so old refresh tokens stay valid until expiry (7d). | S0/S1 |
| Q8 | Is `professional.rejectionReason` settable via `approve-professional` for REJECTED? | S7 |

## Progress tracker

- [x] S0 — Foundation fixes (verified: `bun run lint` + `bunx tsc --noEmit` clean; dev smoke —
  homepage/auth pages 200 with new metadata, auth card layout renders, proxy 307s unauthenticated
  dashboard routes to `/login?redirect=…`, all three dashboards render with session cookie, zero
  console/server errors)
- [ ] S1 — Auth system (guards + flows)
- [ ] S2 — Full data layer (api/types/validation)
- [ ] S3 — Dashboard shell + notifications
- [ ] S4 — Public site + professional profiles
- [ ] S5 — Events, requirements, proposals
- [ ] S6 — Contracts, payments, reviews, disputes
- [ ] S7 — Admin panel
- [ ] S8 — Analytics + polish
- [ ] S9 — Final QA & release

# AyojanPro Frontend — Implementation Plan / Task Tracker

Frontend repo: `C:\projects\ayojanpro-frontend`
Backend repo: `C:\projects\AyojanPro` (main @ `1ce7b01`; `GET /event/my-events` and `GET /proposal/me` added — see 2.1)
Reference repo: `Apollo-Level2-Web-Dev/PH-Healthcare-Nextjs` (stack + file conventions; shadcn style `base-nova`)

Goal: a production-quality Next.js 16 App Router client for the AyojanPro event-service
platform, matching the reference repo's stack, file layout and patterns.

---

## 0. Reference conventions to copy

### Stack (match exactly)
`next` (App Router) · `react` 19 · `tailwindcss` v4 · `ofetch` · `@tanstack/react-query` ·
`@tanstack/react-form` · `zod` · `@react-oauth/google` · `lucide-react` · `input-otp` ·
`class-variance-authority` · `cn` · `tw-animate-css` · shadcn (`style: base-nova` on `@base-ui/react`) · Biome.

### File layout (mirrors reference)
```
src/
  api/            <domain>.api.ts        # thin fns returning apiClient(...)
  hooks/          <domain>.hook.ts       # TanStack Query wrappers
  types/          <domain>.type.ts       # payload + entity types, enums
  validation/     <domain>.validation.ts # zod schemas
  routes/         <role>.routes.ts       # sidebar config
  providers/      index.tsx, query.provider.tsx, google-auth.provider.tsx
  lib/            apiClient.ts, utils.ts (cn), queryKeys.ts
  utils/          formatters.ts, file-size.util.ts
  components/
    ui/           # shadcn primitives
    auth/         # auth-guard, role-guard, auth-loading, access-denied
    form/         # domain forms
    layout/public/# Header, Footer
    modules/<feature>/  # feature components
  app/
    (public)/(marketing)/...
    (public)/(authentication)/...
    (dashboard)/{client,professional,admin}/...
    layout.tsx, globals.css, page.tsx
```
Barrels: every `api/`, `hooks/`, `types/` folder gets an `index.ts` re-export (reference pattern).

### Logic / data conventions
- `apiClient` = `ofetch.create({ baseURL: NEXT_PUBLIC_API_BASE_URL, credentials: "include" })`.
- All reads via `useQuery`, all writes via `useMutation`; invalidate by `queryKeys`.
- Server session is read from `GET /auth/me` (cookies are httpOnly → never read them in JS).
- Guards are client components: `AuthGuard` (logged in), `RoleGuard` (role), plus our
  `ProfessionalStatusGuard` (APPROVED only).
- Response envelope: `{ success, statusCode, message, data, meta? }`; error:
  `{ success:false, statusCode, name, message, error? }`.

### Deliberate deviations
1. **No `output: "export"`** (reference is static; we need cookies, dynamic `[id]`, `?payment=`).
2. Keep this repo's Tailwind-via-Turbopack config (no `postcss.config.*`).
3. `cacheComponents` + `partialPrefetching` exist here but not in the reference. We fetch data
   client-side with react-query so they don't fight us. If a route conflicts, disable
   `cacheComponents` in `next.config.ts` and document it (decide in Task 1).
4. Client-side guards only — Next middleware cannot verify the backend JWT secret.

---

## 1. Environment

`.env.local` / `.env.example`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same client id as backend GOOGLE_CLIENT_ID>
```
Backend CORS is `origin: FRONTEND_URL` with credentials → dev frontend must run on
`http://localhost:3000`. Default backend port is `5000`.

---

## 2. Verified backend endpoint reference (main @ 1ce7b01)

- Auth: `POST /auth/{register,verify-email,login,google,refresh-token,forgot-password,reset-password,logout}`, `GET /auth/me`
- User: `PATCH /user/profile-image` (multipart `profileImage`)
- Client: `PATCH /client/my-profile`
- Professional: `POST /professional/apply-as-professional` (multipart `data`,`resume`,`additionalFiles`), `POST /professional/apply-as-professional/verify-email`, `POST /professional/approve-professional` (admin), `GET /professional/all-professionals` (admin), `PATCH /professional/update-my-profile`, `GET /professional/public/all-Professionals`, `GET /professional/public/:professionalId`, `POST /professional/service`, `GET /professional/me/services`, `PATCH|DELETE /professional/service/:id`, `POST|DELETE /professional/skill`, `POST|PATCH|DELETE /professional/experience`, `POST|GET|PATCH|DELETE /professional/portfolio`
- Event: `POST /event`, `POST /event/services/:eventId`, `GET /event/all-events` (admin/pro only), `GET /event/my-events` (client), `PATCH /event/update/:eventId`, `GET /event/:eventId/required-services`, `PATCH /event/update/:eventId/services/:serviceId`, `DELETE /event/:eventId/services/:serviceId`, `GET /event/:eventId`, `PATCH /event/publish-event/:eventId`, `DELETE /event/:eventId`
- Proposal: `POST /proposal/events/:eventId`, `GET /proposal/requirements/:requirementId`, `GET /proposal/me` (professional), `GET /proposal/:id`, `PATCH /proposal/:proposalId/{accept,reject,withdraw}`
- Contract: `GET /contract`, `GET /contract/:id`, `PATCH /contract/:id/cancel`, `POST /contract/:id/deliverable`, `GET /contract/:id/deliverable`, `PATCH /contract/:id/complete`
- Payment: `POST /payment/contracts/:id/{initial,final}`, `GET /payment/contracts/:id`, callback is server-side
- Review: `POST /review/contracts/:id`, `GET /review/professionals`, `GET /review/clients`
- Dispute: `POST /dispute/contracts/:id` (multipart `evidence`), `GET /dispute` (admin), `GET /dispute/:id`, `PATCH /dispute/:id/status`, `PATCH /dispute/:id/resolve`
- Notification: `GET /notification?isRead=`, `PATCH /notification/read-all`, `PATCH /notification/:id/read`
- Admin: `GET /admin/{users,events,contracts,payments}`, `PATCH /admin/users/:id/status`
- Analytics: `GET /analytics/{client,professional,admin}-analytics`

Payment flow note: `POST /payment/contracts/:id/{initial,final}` returns `{ paymentUrl }`; redirect the
browser to it. Backend callback then redirects to
`${FRONTEND_URL}/dashboard/contracts/:id?payment=success|failure|cancel|error`.

Proposal note: one `Proposal` has many `ProposalItem`s (one per requirement). `accept|reject|withdraw`
act on the whole proposal and cascade to its pending items (accept also rejects competing pending items
and flips the requirement to `FILLED`). A `Contract` is created per accepted item.

Admin professional review note: `GET /professional/all-professionals` returns full professional rows
(incl. `resume`, `additionalFiles`, `status`, `rejectionReason`) plus `services`, `skills`, `reviews`,
`contracts`, `proposals` — enough to approve/reject. (No `experience`/`portfolio` nested; use the public
profile endpoint if needed.)

### 2.1 Backend gaps — RESOLVED (committed `1ce7b01`)

The two missing list endpoints were added to `C:\projects\AyojanPro`, committed as
`1ce7b01 "myevent and myproposal view added"`, and documented in the backend `README.md`
and `AyojanPro.postman_collection.json`. Both compile (`tsc --noEmit` clean).

- `GET /api/v1/event/my-events` — `auth(CLIENT)`, returns own non-deleted events
  (all statuses) incl. `serviceRequirements`, `orderBy: createdAt desc`. Response
  `data` is a **plain array** (no pagination `meta`). 404 if the caller has no
  client profile.
- `GET /api/v1/proposal/me` — `auth(PROFESSIONAL)`, returns own proposals incl.
  `professional`, `event` and `items` (each item with `eventServiceRequirement` +
  `professionalService`), `orderBy: submittedAt desc`. Response `data` is a **plain
  array** (no pagination `meta`). 404 if the caller has no professional profile.

Because neither endpoint paginates, the client `useQuery` hooks in Tasks 14 and 19
should treat `data` as `Event[]` / `Proposal[]` and do any filtering/sorting client-side.

Original audit (for the record): `GET /event/all-events` is gated `ADMIN, PROFESSIONAL`
and returns only `PUBLISHED` events, and no proposal list existed.

### 2.2 Other minor gaps / workarounds
- Own skills/experience have no GET → read them from `GET /professional/public/:ownProfessionalId`.
- Professionals get a random password at apply time; no set/change-password endpoint → after email
  verification direct them to `/forgot-password` to set a password, then log in.

---

## 3. Definition of done (every task)
- `bun run lint` clean (run `biome check --write` to fix formatting/imports).
- `bunx tsc --noEmit` clean (run `bun run dev` once if `.next/types` is missing).
- No `any` leaks into public component props; types come from `src/types`.
- Loading, empty and error states handled for each screen.
- One commit / PR per task.

---

## 4. Tasks

### Phase 0 — Foundation

- [x] **T1 — Project foundation & design tokens**
  - Installed: `ofetch @tanstack/react-query @tanstack/react-form zod @react-oauth/google input-otp lucide-react class-variance-authority cn tw-animate-css shadcn @base-ui/react`.
  - Added `components.json` (shadcn style `base-nova` — confirmed against the reference repo, `src/app/globals.css`, aliases as reference), `.env.local` + committed `.env.example`.
  - `src/lib/utils.ts` (`cn`); rewrote `src/app/globals.css` with the reference's shadcn CSS vars + `@theme inline`.
  - `src/app/layout.tsx`: Inter + Geist fonts, `<Providers>`, `<Toaster>`, metadata `AyojanPro`.
  - `src/providers/*` (query, Google OAuth, tooltip) — pulled forward from T4 so the shell renders.
  - `next.config.ts`: `images.remotePatterns` for Cloudinary; `cacheComponents` kept (works with the client-side react-query approach).
  - Also added `.gitattributes` (LF normalization) as a separate chore commit.
  - **DoD met:** `bun run build` clean, `/` prerendered with the themed placeholder.
  - **Committed:** `5b64497` (chore `.gitattributes` = `b4aa2e3`).

- [ ] **T2 — UI kit & shared components**
  - shadcn: `button input label textarea card field table tabs sheet sidebar separator skeleton spinner pagination checkbox input-otp tooltip toast dialog select badge`.
  - Shared: `PageHeader`, `EmptyState`, `ErrorState`, `StatusBadge` (all enums → color), `CurrencyText`, `DateText`, `ConfirmDialog`, `DataTable`, `FileUpload`, `SearchInput`, `PaginationBar`.
  - Temp `/style-guide` page (removed in T22).

- [ ] **T3 — Types, enums & constants**
  - `src/types/enums.ts` mirroring backend enums; entities (`User, Client, Professional, ProfessionalService, Skill, Experience, PortfolioItem, Event, EventServiceRequirement, Proposal, ProposalItem, Contract, Payment, Deliverable, Review, Dispute, Notification`); analytics payloads; `src/types/api.ts` (`ApiResponse<T>`, `ApiError`, `TMeta`, `IQuery`); barrels.
  - `src/lib/constants.ts`: enum option/label/color maps shared by forms and badges.

### Phase 1 — Data & access layer

- [ ] **T4 — API client & query layer**
  - `src/lib/apiClient.ts`: ofetch + `credentials:"include"`, typed error class, **401 → `POST /auth/refresh-token` retry once**.
  - `src/lib/queryKeys.ts`; `src/lib/queryClient.ts` (providers/toaster already created in T1).
  - Global API-error → toast helper; `useApiQuery`/`useApiMutation` thin wrappers.

- [ ] **T5 — Auth API, hooks & zod validation**
  - `src/api/auth.api.ts` + `src/api/user.api.ts`; `src/hooks/auth.hook.ts` (`useLogin`, `useRegistration`, `useVerifyAccount`, `useGoogleOAuth`, `useForgotPassword`, `useResetPassword`, `useLogout`, `useGetMe`); barrels.
  - `src/validation/auth.validation.ts`: password (8+, upper, lower, digit, special), email, OTP 6-digit, confirm refine, BD phone.

- [ ] **T6 — Guards, access control & route config**
  - `components/auth/{auth-guard,role-guard,auth-loading,access-denied,professional-status-guard}.tsx`.
  - `src/routes/{client,professional,admin,index}.routes.ts`.
  - **DoD:** logged-out dashboard route → `/login`; wrong role → AccessDenied; PENDING/REJECTED pro blocked.

### Phase 2 — Public site & auth flows

- [ ] **T7 — Public shell & landing page**
  - `(public)/(marketing)/layout.tsx`; `layout/public/{Header,Footer}.tsx` (Home, Browse Professionals, Login/Register).
  - Landing: hero, how-it-works (client vs professional), service categories, featured professionals (public API), CTA, SEO metadata.

- [ ] **T8 — Browse professionals & public profile**
  - `/professionals` → `GET /professional/public/all-Professionals` (`searchTerm`, `professionalTitle`, pagination).
  - `/professionals/[professionalId]` → `GET /professional/public/:professionalId`: services, skills, experience, portfolio, rating.

- [ ] **T9 — Client registration, OTP verification & Google**
  - `/register` → `POST /auth/register`; `/register/verify-account` (`input-otp`) → `POST /auth/verify-email` (sets cookies) → dashboard.
  - Google button (`@react-oauth/google`) → `POST /auth/google { idToken }`.

- [ ] **T10 — Login, forgot/reset, logout**
  - `/login` (credentials + Google) → `POST /auth/login`; role-based redirect.
  - `/forgot-password` → `/reset-password` (OTP + new password) → `POST /auth/reset-password`.
  - `useLogout` → `POST /auth/logout` + invalidate `["me"]`.

### Phase 3 — Dashboard shell & shared screens

- [ ] **T11 — Dashboard shell, sidebars & notifications**
  - `(dashboard)/layout.tsx` = `AuthGuard` + shell (collapsible sidebar from `src/routes/*`, topbar w/ user menu, notification bell, logout); `(dashboard)/{client,professional,admin}/layout.tsx` = `RoleGuard`.
  - `/dashboard/notifications`: `GET /notification` (+`isRead`), `PATCH /notification/:id/read`, `PATCH /notification/read-all`, unread badge.

- [ ] **T12 — Analytics overview pages**
  - Role-aware `/dashboard` from `/analytics/{client,professional,admin}-analytics`; stat cards, light bar visuals sans chart lib, recent activity.

### Phase 4 — Client features

- [ ] **T13 — Client profile**
  - `/dashboard/profile`: `PATCH /client/my-profile`, `PATCH /user/profile-image` (multipart).

- [ ] **T14 — Client events & service requirements**
  - `/dashboard/events` list (**needs `GET /event/my-events`, see 2.1**), `/dashboard/events/new` → `POST /event`, `/dashboard/events/[eventId]` → `GET /event/:eventId`.
  - Requirements: `POST /event/services/:eventId`, `GET /event/:eventId/required-services`, `PATCH|DELETE /event/update/:eventId/services/:serviceId`; publish `PATCH /event/publish-event/:eventId`; delete `DELETE /event/:eventId`.
  - Mirror `startAt < endAt` + positive-budget validation.

- [ ] **T15 — Client proposals → contracts**
  - `GET /proposal/requirements/:requirementId`, `GET /proposal/:id`, `PATCH /proposal/:proposalId/{accept,reject}`; render `ProposalItem`s; explain cascade on accept.

- [ ] **T16 — Client contracts, payments, deliverable, reviews**
  - `GET /contract`, `GET /contract/:id`, `PATCH /contract/:id/cancel`, `GET /contract/:id/deliverable`, `PATCH /contract/:id/complete`.
  - Payments: `POST /payment/contracts/:id/{initial,final}` → redirect `paymentUrl`; handle `?payment=` on `/dashboard/contracts/[id]`; `GET /payment/contracts/:id` history.
  - `POST /review/contracts/:id` (unlocked at `COMPLETED`).

### Phase 5 — Professional features

- [ ] **T17 — Professional application & status gating**
  - `/apply-as-professional` multipart (`data` JSON + `resume` required + `additionalFiles[]`) → `POST /professional/apply-as-professional`; verify `POST /professional/apply-as-professional/verify-email`; then `/forgot-password` to set password.
  - Status gate: PENDING "under review", REJECTED shows `rejectionReason`, APPROVED unlocks workspace.

- [ ] **T18 — Professional profile management**
  - `PATCH /professional/update-my-profile` (incl. `acceptingBookings`).
  - Services `POST|GET /professional/me/services`, `PATCH|DELETE /professional/service/:id`; skills `POST|DELETE /professional/skill`; experience `POST|PATCH|DELETE /professional/experience`; portfolio `POST`(multipart `mediaFile`+`data`)|`GET /me/portfolio`|`PATCH`|`DELETE`. Read skills/experience via public profile (2.2).

- [ ] **T19 — Professional workspace**
  - Browse `GET /event/all-events` (`searchTerm`,`status`) → requirements `GET /event/:eventId/required-services`.
  - Submit `POST /proposal/events/:eventId` (multi-item), withdraw `PATCH /proposal/:proposalId/withdraw`; list needs `GET /proposal/me` (2.1).
  - Contracts: `GET /contract`, `POST /contract/:id/deliverable`, `GET /contract/:id/deliverable`, `POST /review/contracts/:id`.

### Phase 6 — Admin & disputes

- [ ] **T20 — Admin console**
  - Approvals: `GET /professional/all-professionals`, review `resume`/`additionalFiles`, `POST /professional/approve-professional`.
  - `GET /admin/{users,events,contracts,payments}`, `PATCH /admin/users/:id/status` (reuse `DataTable`+`StatusBadge`).

- [ ] **T21 — Disputes**
  - Raise: `/dashboard/contracts/[id]` → multipart `evidence` (≥1) + `reason`(≥3) + `description`(≥10) → `POST /dispute/contracts/:id`; party view `GET /dispute/:id`.
  - Admin: `GET /dispute` (`status`), `GET /dispute/:id`, `PATCH /dispute/:id/status`, `PATCH /dispute/:id/resolve`.

### Phase 7 — Wrap-up

- [ ] **T22 — Polish, docs & hardening**
  - Loading/error/empty passes, responsive review, metadata, remove `/style-guide`.
  - `README` (setup, env, architecture, 2.1 gaps); final `biome check --write`, `bunx tsc --noEmit`, `bun run build`.

---

## 5. Open items to confirm before T14 / T19
1. ~~Exact paths of the client "my events" and professional "my proposals" endpoints.~~
   **Resolved:** `GET /event/my-events` and `GET /proposal/me` (backend `1ce7b01`, see 2.1).
2. Whether admin professional review needs nested `experience`/`portfolio` (currently not returned by
   `/professional/all-professionals`).

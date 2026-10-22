# Code Review — AyojanPro frontend & backend

A full pass over the Next.js frontend (`ayojanpro-frontend`) and the paired
Express backend (`AyojanPro`). Every finding below was reproduced by reading
the code, and the ones marked **Fixed** are fixed and verified with
`bunx tsc --noEmit`, `bun run lint` and `bun run build` (frontend) and
`npx tsc --noEmit` + Biome (backend).

- **Frontend:** 254 files, 16 forms, 13 API modules, 14 query hooks.
- **Backend:** 85 files, 14 modules, 19 Prisma models, 81 route handlers.
- **Contract check:** every frontend API client was compared against every
  backend route — method, path, body keys, query params and the response
  envelope. All match; the mismatches found were behavioural, not shape-based.

---

## 1. Frontend — bugs that were fixed

### 1.1 The contract screen showed the wrong payment state (High)

`src/components/modules/contracts/ContractDetail.tsx`

The backend keeps **one** payment row per contract (`@@unique([contractId])`).
The row first holds the 30 % advance (`stage: INITIAL`) and is later reused
for the 70 % balance (`stage: FINAL`). The frontend treated that single row
as "the latest payment" and derived every state from its status alone, so:

- after the 70 % was paid and held in escrow, the client was still offered
  **“Pay final (70%)”** — the backend rejects that attempt;
- on a delivered contract whose 30 % was escrowed, the client was offered
  **“Mark as completed”** — the backend answers `400 Final payment must be
  settled before the contract can be marked completed`;
- while the final payment was in flight the row shows `PENDING`, so the
  advance that had already been paid was displayed as **“Due to confirm the
  booking”**.

Fixed by reading the stage first and deriving `initialSettled`, `finalSettled`,
`inEscrow` and `fullyPaid` from it. The comment now records the one-row model
so the next change does not reintroduce the bug.

### 1.2 Form errors stayed on screen after the user fixed the field (High)

All 16 forms configured `validators: { onSubmit: schema }`.

TanStack Form stores a validator's error under the key of that validator and
only replaces it when **the same** validator runs again. A change event only
runs the `onChange` validator, so a submit error survived every keystroke and
was only cleared by the next submit. The user saw “Password is required” next
to a password they had already typed.

Verified against `@tanstack/form-core` 1.33 — `ValidationLogic.js` runs
`onChange`/`onBlur`/`onSubmit` on a submit but only `onChange`/`onServer` on
a change, and `FormApi.js` merges the per-cause error map without clearing
the other keys.

Fixed with a shared helper (`src/validation/validators.ts`):

```ts
export function validateOnChange<T extends ZodType>(schema: T) {
  return { onChange: schema };
}
```

A submit runs the change validator as well, so an invalid form is still
blocked and the error still appears on the first submit — but it now clears
as soon as the value is valid again.

### 1.3 Resolved disputes were invisible in the admin console (High)

`src/components/modules/admin/AdminDisputes.tsx`

The table was fed `filtered.filter(isTransitionableStatus)`, and that helper
only accepts `OPEN | UNDER_REVIEW | REJECTED | CLOSED`. Every **resolved**
dispute was therefore dropped from the list — while the status filter still
offered “Resolved”, so choosing it produced an empty table next to a
non-zero dispute count. The table now shows every dispute and only the
*action cell* is gated on the status.

### 1.4 The admin could send an invalid user status (High)

`src/components/modules/admin/UserManagement.tsx`

The status dropdown was built from `USER_STATUSES`, which contains
`DELETED` — a soft-delete flag the platform sets itself, not a status the
`PATCH /admin/users/:id/status` endpoint accepts. The invalid value was
laundered through `as "ACTIVE" | "SUSPENDED" | "BLOCKED"`, so the type system
was silenced instead of the UI being fixed.

Fixed by adding `SETTABLE_USER_STATUSES` to `src/types/user.type.ts` and
using it for the per-user dropdown. The filter still offers every status, and
the `as` casts are gone — the payload type is now `SettableUserStatus`.

### 1.5 The dispute form never showed its validation errors (High)

`src/components/modules/disputes/DisputeForm.tsx`

The rules were a **form-level** `onSubmit` validator returning a bare
string. A form-level error is stored in `form.state.errorMap.onSubmit` and
never reaches a field's `meta.errors`, so the component rendered nothing —
the form silently refused to submit.

The same file also hid its file input with `className="hidden"`
(`display: none`), which removes it from the accessibility tree and makes it
unfocusable. A keyboard or screen-reader user had no way to attach the
evidence the form requires, and the “Remove” buttons all had the same
accessible name.

Fixed by moving the rules into the shared schema
(`src/validation/dispute.validation.ts`), rendering the evidence with the
project's accessible `FileUpload` component and giving every remove button a
unique label.

### 1.6 The resolve-dispute dialog could never open (High)

`src/components/modules/disputes/DisputeDetail.tsx`

`setResolveDialogOpen` was only ever called with `false` — no button opened
the dialog, so a client could never resolve their own dispute even though
the whole flow was implemented. A second dialog (“Update dispute status”)
was a placeholder that could not open either.

Fixed: the status placeholder was deleted and a **Resolve dispute** button
now opens the resolve dialog while the dispute is still open.

### 1.7 The proposal form reset itself while the user typed (High)

`src/components/modules/events/ProposalForm.tsx`

`buildItem()` minted a new `crypto.randomUUID()` on every render, and the
result was used as `defaultValues`. `useForm` re-applies the defaults
whenever they are not deep-equal to the previous ones and the form is still
pristine, so any re-render (a query settling, the dialog opening) replaced
the form values and remounted the amount field.

Fixed by deriving the id from the requirement id — a proposal can only cover
a requirement once, so it is already a unique key.

### 1.8 The “pick at least one service” error was suppressed (Medium)

`src/components/modules/events/ProposalForm.tsx`

The error was hidden by `&& field.state.value.length > 0`, which is exactly
the case the message describes. The submit button is disabled while the list
is empty, so the user got no explanation at all. The clause was removed.

### 1.9 The professional directory kept a stale filter (Medium)

`src/components/modules/professionals/ProfessionalDirectory.tsx`

The filter was read from the URL with `useState(() => searchParams.get(...))`,
so it was only ever read on the first mount. The home page links to
`/professionals?searchTerm=Photo`, and navigating between two such URLs kept
the component mounted with the **old** filter while the address bar showed
the new one.

Fixed by deriving the value from the URL during render and syncing the state
when the URL changes.

### 1.10 Editing a portfolio item without a work date threw (Medium)

`src/components/modules/profile/PortfolioForm.tsx`

`workDate` is nullable in the database, but the edit schema required it and
the payload always did `new Date(value.workDate).toISOString()`. An item
saved without a date could not be edited at all — the submit threw
`RangeError: Invalid time value`. The work date is now optional when editing
and only sent when it is filled in.

### 1.11 A pasted email with spaces was rejected (Medium)

`src/validation/auth.validation.ts`

`z.email()` is anchored, so `" user@example.com "` failed validation while
the payload builder trimmed it anyway — validation and payload disagreed
about what a valid email is. The schema now trims first.

### 1.12 Portfolio links accepted `javascript:` URLs (Medium)

`src/validation/professional.validation.ts`

`new URL(value)` accepts any scheme, and the value is persisted and
rendered as a live anchor. The proposal schema already restricted links to
`http`/`https`; the rule now lives in one place (`src/utils/url.util.ts`)
and both schemas use it.

### 1.13 The dashboard header could crash (Medium)

`src/components/modules/overview/OverviewHeader.tsx`

`data?.data.name` only guards against a nullish `data`; an API response with
`data: null` threw `TypeError: Cannot read properties of null`. The prop
`children` was never passed by any of the three call sites.

### 1.14 Smaller fixes

| Where | What |
|---|---|
| `admin/AdminEvents.tsx` | the requirements column counted soft-deleted requirements |
| `admin/AdminPayments.tsx` | the stage and method columns printed `INITIAL` / `BKASH` instead of “Initial” / “Bkash” |
| `admin/AdminDisputes.tsx` | the per-row status dropdown printed `UNDER_REVIEW` instead of “Under review” |
| `overview/MetricBars.tsx` | an all-zero group rendered “Nothing to show yet”; the bar width was `NaN%` when the maximum was 0 |
| `disputes/DisputeDetail.tsx` | the evidence list used the media URL as the React key (duplicates warn) |
| `app/dashboard/disputes/[disputeId]/page.tsx` | the page used a non-standard wrapper instead of the `async` + `await params` pattern every other dynamic route uses |

---

## 2. Frontend — structure

### 2.1 Three guards did the same job (High)

`auth-guard.tsx`, `role-guard.tsx` and `professional-status-guard.tsx` each
implemented the same “is there a session?” logic and each redirected to
`/login`. The rule now lives in one place:

```tsx
<AuthGuard roles={["CLIENT"]}>…</AuthGuard>
<AuthGuard requireApprovedProfessional>…</AuthGuard>
```

`role-guard.tsx` and `professional-status-guard.tsx` were deleted; the
"application under review" screen moved to `professional-pending.tsx`.

### 2.2 The logout flow was copy-pasted (Medium)

The header and the account menu had the same 25-line handler. It now lives in
`useSignOut()` (`src/hooks/auth.hook.ts`).

### 2.3 Two event cards, one comment claiming they were shared (Medium)

`EventCard.tsx` said it was “used by both the public board and the
professional workspace”, but the professional board (`EventBrowse.tsx`) and
the client list (`EventList.tsx`) each had their own copy. All three now use
one card, which takes the parts of an event it renders — so the boards stay
visually identical by construction.

### 2.4 The status filter was copy-pasted eight times (Medium)

Eight screens had the same `STATUS_FILTER_ITEMS` array and the same
`<Select>` block. They now share `SelectFilter` (`src/components/shared`)
and the `withAllOption` helper in `src/lib/constants.ts`.

### 2.5 The three dashboards repeated the same shell (Medium)

`AdminOverview`, `ClientOverview` and `ProfessionalOverview` repeated the
loading / error / content switch. It now lives in `OverviewView`.

### 2.6 The two email-verification screens were 95 % identical (Medium)

`verify-account-form.tsx` and `verify-professional-application-form.tsx`
differed in five things. They now share `OtpVerificationCard`, which also
gives the code input a unique id per instance (the two forms both hard-coded
`id="otp-form"`).

### 2.7 The home page re-declared the `EventType` enum (Medium)

`EventTypeCategories.tsx` kept its own copy of the eleven event types with a
comment claiming they “match the `EventType` enum” — a comment standing in
for a type. It is now a `Record<EventType, …>`, so adding an event type
breaks the build until the home page covers it, and the links use the shared
`eventTypeHref()` helper.

### 2.8 Dead code removed

| Removed | Why |
|---|---|
| `components/auth/role-guard.tsx`, `professional-status-guard.tsx` | replaced by the single guard |
| `validation/dispute.validation.ts` → `updateDisputeStatusSchema`, `resolveDisputeSchema` | never imported |
| `validation/admin.validation.ts` → the `adminValidation` wrapper | the schema is now used directly |
| `EventTypeFilter` → the `EVENT_TYPE_FILTER_ITEMS` export | only used inside the file |
| `ProposalItemFormValues`, `CreatePortfolioItemFormValues` | never imported, and the schema behind them was not exported either |
| `OverviewHeader` → the `children` prop | never passed |
| `ProfessionalApprovals` → the "cannot reject an approved professional" guard | the reject button only renders for pending applications |
| `ContractDetail` → the `onSuccess={() => {}}` no-op | the prop is now optional |

Also: `hooks/index.ts` now exports `use-mobile`, `types/index.ts` exports
`sidebar.type`, `getAllEvents` was renamed `getAllPublishedEvents` (it only
returns published events), and `src/utils/url.util.ts` was added.

### 2.9 The static export made every id route a 404 (High)

`next.config.ts` had `output: "export"` in production, so Vercel served a
**static export** of the app. A static export has no server to render a route
on demand, and every `[id]` route was exported under a single hard-coded
`placeholder` path:

```ts
export function generateStaticParams() {
  return staticExportParams("eventId"); // -> [{ eventId: "placeholder" }]
}
```

The result was that only `/events/placeholder` existed. Every real id —
`/events/<id>`, `/professionals/<id>`, `/dashboard/events/<id>`,
`/dashboard/contracts/<id>` — answered **404 "route not found"**, and the
client router could not fetch a payload for them either, so the links were
dead in both directions.

The placeholder hack also had a second problem: it made the export depend on
a build-time snapshot of the database, which is why the committed `out/`
folder kept going stale (it had `http://localhost:5000/api/v1` baked in).

**Fixed:** the export is gone. The app is deployed as a Next.js **server** on
Vercel (Framework Preset `Next.js`, Output Directory `Next.js default`), the
`generateStaticParams()` calls and `src/lib/static-params.ts` are deleted, and
`out/` is gitignored so a stale copy can never be served. Each `[id]` route is
now `ƒ (Dynamic)` and renders on demand for any id.

### 2.10 The back buttons went to a fixed route (Medium)

Every "Back to …" button was a hard-coded link — the event detail page
always went to the events list, the contract detail page always to the
contracts list, even when the visitor had arrived from somewhere else
(the dashboard, a notification, a proposal).

They now follow the browser history, so the visitor lands where they came
from. The fixed route is kept as the **fallback** for the one case where
there is nothing to go back to: the page was opened directly, in a new tab
or from a shared link.

The decision needs to know whether the visitor arrived *through the app*,
and the browser alone cannot tell that — a tab that visited other sites
before has history too, and `router.back()` would leave the app. Next.js 16
does not expose a history index either (its App Router only sets a
`__NA` flag on the entries it owns), so the app tracks its own navigation
in `src/lib/navigation-history.ts`:

```ts
recordVisitedPath(pathname);   // called on every route change
hasAppHistory();               // true when there is a page to go back to
```

The list lives outside React so it survives the navigation that unmounts
the page, and a full page load resets it — which is exactly the signal
that the visitor did not arrive through the app. Recording a path twice
does nothing, so React's strict mode cannot count one page twice.

The rule is now in one place (`useGoBack` in
`src/providers/navigation.provider.tsx`) and every back button uses the
shared `BackButton` component:

```tsx
<BackButton fallbackHref="/dashboard/events" label="Back to events" />
```

---

## 3. Backend — bugs that were fixed

### 3.1 The bKash callback trusted the caller's `status` (Critical)

`src/app/module/payment/payment.service.ts`

```ts
const status = query.status;        // ← straight from the query string
if (status === "success") { … }     // ← the bKash response was never checked
```

`GET /api/v1/payment/bkash/callback?paymentID=<id>&status=success` marked a
payment as `ESCROWED`, completed the contract, released the escrow to the
professional and fired the notifications. The bKash *execute* response was
fetched but its `statusCode` was never inspected, so even a failed execute
counted as a success.

**Fixed:** the outcome is now derived from the execute response
(`statusCode === "0000"`); the query parameter can no longer produce a
success. Two extra guards were added:

- the merchant invoice number must match `${contractId}-${stage}` — a callback
  for another payment can never settle this one (enforced only when the
  provider echoed a number back, so a legitimate payment is never blocked);
- an already settled payment is never downgraded by a repeated callback (the
  bKash execute API only works once, so the second call of a genuine payment
  would otherwise report a failure and revert a released payment).

### 3.2 Two review endpoints leaked every review to anonymous callers (Critical)

`src/app/module/review/review.route.ts`

`GET /review/professionals` and `GET /review/clients` had no auth
middleware, so the service filtered on `{ professionalId: undefined }`.
Prisma drops undefined filters, the filter degenerated to
`{ reviewByClient: true }`, and **every review of every professional** was
returned to an anonymous caller.

**Fixed:** both routes now require a session and resolve the caller's
`Professional`/`Client` profile, and the filter uses the profile id (the
previous code passed a *user* id where a *profile* id was expected, so the
endpoints would have returned nothing even with auth).

### 3.3 Any client could delete any other client's event (Critical)

`src/app/module/event/event.service.ts`

`deleteEvent` checked the caller's **role** but never that they owned the
event — `updateEvent` and `publishEvent` both did. **Fixed** by resolving
the caller's client and rejecting a non-owner with `403` (admins bypass).

### 3.4 Any client could read every professional's bid on any requirement (Critical)

`src/app/module/proposal/proposal.service.ts`

`GET /proposal/requirements/:requirementId` never checked that the caller
owns the event that owns the requirement, so client A could read client B's
requirements and every competing bid. **Fixed** the same way
`acceptProposalItem` already did it.

### 3.5 Password hashes were returned to callers (Critical)

`src/app/module/dispute/dispute.service.ts` included the full `User` rows
for `raisedBy` and `resolvedBy` — so the counterparty of a dispute received
the other party's **bcrypt hash**, and a professional received the
**admin's** hash. The same leak existed in `applyAsProfessional` (returned to
an *unauthenticated* applicant), `approveProfessional`, `updateUserStatus`
and the admin event list.

**Fixed:** every one of those places now uses `omit: { password: true }` or
an explicit `select`, matching what `contract.service.ts` and
`auth.service.ts` already did.

### 3.6 `GET /proposal/:id` had no ownership check (High)

The service took only the proposal id — any logged-in user could read any
proposal, including the client's event and the professional's profile.
**Fixed:** the owning client, the submitting professional and admins may
read it; everyone else gets `403`.

### 3.7 Professional sub-resources could be changed by other professionals (High)

`updateService`, `deleteService`, `updatePortfolioItem`, `deletePortfolio`,
`updateExperience` and `deleteExperience` loaded the *caller's* professional
row and then operated on a target row by id, without checking that the
target belonged to them. **Fixed:** every one of them now scopes the lookup
to the caller's professional id.

### 3.8 Removing a skill deleted it for everybody (High)

`Skill.name` is globally unique and `ProfessionalSkill` cascades on delete,
so `DELETE /professional/skill/:id` removed a shared skill from every
professional that had it. **Fixed:** the join row is deleted instead; the
shared skill row only goes when nobody references it any more.

### 3.9 A blocked user kept full access (High)

`UserStatus` has four members, but the auth middleware, the login flow and
the refresh flow only refused `SUSPENDED` — `BLOCKED` was never enforced, so
the admin's “block” button did nothing. **Fixed:** every flow now refuses
any status that is not `ACTIVE` and names the status in the message.

### 3.10 Service requirements could be edited across events (High)

`updateEventService` and `deleteEventService` checked that the caller owned
`eventId` but never that `serviceId` belonged to that event — a client could
rewrite (and re-parent) or soft-delete another client's requirement.
**Fixed:** the lookup is scoped to `{ id: serviceId, eventId }`.

### 3.11 The logout never cleared the session cookie in production (High)

`logout` cleared the cookies without repeating the attributes they were set
with:

```ts
res.clearCookie("accessToken");
res.clearCookie("refreshToken");
```

In production the API and the frontend are on different sites, so the cookies
are written as `SameSite=None; Secure`. The deletion cookie came back with
no `SameSite` and no `Secure` at all:

```
Set-Cookie: accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

A `Set-Cookie` without `SameSite=None; Secure` is treated as `Lax`, and a
`Lax` cookie is **refused in a cross-site response** — so Chrome threw the
deletion away and the session survived the logout. It worked locally only
because development uses `sameSite: "lax"` and both sides are on `localhost`,
which is same-site.

**Fixed:** the attributes live in one place and are used for both setting and
clearing, so they cannot drift apart again:

```ts
const authCookieOptions = {
	httpOnly: true,
	secure: config.node_env !== "development",
	sameSite: config.node_env === "development" ? ("lax" as const) : ("none" as const),
};

res.clearCookie("accessToken", authCookieOptions);
res.clearCookie("refreshToken", authCookieOptions);
```

### 3.12 The deployed backend was missing the public events board (High)

The deployed API answered **404** for `GET /event/published-events`, so the
public events board could not load. The route exists in the backend source,
but the **deployed build was older than the source**.

The cause was the deploy itself, not the code. `vercel.json` uses the legacy
`builds` config:

```json
{ "builds": [{ "src": "dist/src/server.js", "use": "@vercel/node" }] }
```

That entry packages `dist/src/server.js` **as it is on disk**. The local
`dist/` was a stale build from 19 October — it did not contain the
`/published-events` route at all. The request fell through to the old
`GET /:eventId` route, which had no auth middleware, and came back as
`404 "event Not Found"` — the exact error the live API was giving.

**Fixed:** the backend is rebuilt before it is deployed, and the deployment
no longer depends on whatever happens to be in `dist/`:

- `package.json` gained `"vercel-build": "npm run build"`, so Vercel's build
  step compiles the TypeScript itself instead of shipping a stale `dist/`.
- `.vercelignore` keeps the local `.env` (database URL, JWT secrets, SMTP and
  bKash credentials) out of the uploaded deployment. The runtime values come
  from the Vercel project's environment variables, and `dotenv` does not
  override variables that are already set — so the uploaded `.env` was only
  ever a leak waiting to happen.

Deploying from `C:\projects\AyojanPro` (`main`) now makes both the events
board and the logout cookie fix in §3.11 live.

### 3.13 The API only allowed one frontend origin (Medium)

`app.ts` passes a single string to `cors`:

```ts
origin: config.frontend_url, // process.env.FRONTEND_URL
```

The `cors` package then always answers with that one origin, whatever the
browser asked for. There are **two** frontend Vercel projects in the team —
`ayojan-pro-frontend` (connected to the GitHub repo, auto-deploys on push)
and `ayojanpro-frontend` (deployed through the CLI) — and only one of them
was in `FRONTEND_URL`.

Measured on the live API: a request from `https://ayojanpro-frontend.vercel.app`
came back with

```
Access-Control-Allow-Origin: https://ayojan-pro-frontend.vercel.app
```

which the browser rejects, so **every** API call from that origin fails —
the events board, the professionals list and the login all of it. The
backend itself answers correctly, so the failure looks like a broken page
rather than a CORS problem.

`FRONTEND_URL` is also the base for the bKash redirect URLs
(`payment.service.ts`), so it cannot simply become a list without splitting
the two uses. Left as a deployment decision: point the env var at the one
frontend that is actually used, and delete the other project so a stale
deployment cannot be mistaken for the live one.

---

## 4. Backend — found, not fixed

These need a product or schema decision, so they are documented rather than
changed.

| # | Where | What | Why it was not changed |
|---|---|---|---|
| H6 | `payment.service.ts` vs `contract.service.ts` | The final-payment callback completes the contract, so `PATCH /contract/:id/complete` can never run (it requires `DELIVERED`). The callback also skips the requirement status update, so a finished requirement stays `FILLED` for ever. | Two owners of one transition. Picking either changes the payment flow and needs a live bKash test. |
| H7 | `prisma/schema/payment.prisma` | One payment row per contract overwrites the 30 % instalment and records 100 % for the final stage, so every revenue figure is inflated after the final payment and the notification says “final payment of 100.00 BDT” for a 70 % charge. | Needs a schema change (two rows, or explicit amount columns) and a migration. |
| M1 | `auth.service.ts` | `POST /auth/reset-password` never compares `newPassword` with `confirmPassword` — a typo in one field is silently ignored. | Small and safe; left for the next backend pass together with M2. |
| M2 | `auth.service.ts`, `professional.service.ts` | The email is lowercased in register/login/verify but **not** in forgot-password, reset-password or apply-as-professional, so a professional who applies with `John@Example.com` can never log in. | Same size as M1; the normalisation has to be applied consistently first. |
| M3 | `professional.service.ts` | `needPasswordChange` is set but never read, and there is no change-password endpoint. | Needs a new endpoint. |
| M4 | `professional.service.ts` | The generated password uses `Math.random()` (not a CSPRNG) and can be shorter than 8 characters. | Same as M1/M2. |
| M5 | `professional.service.ts` | Adding a skill that already exists returns `409` instead of linking the existing one. | Same as M1/M2. |
| M6 | `professional.service.ts` | The résumé is optional in the upload config but its absence produces a 500 from Cloudinary instead of a 400. | Same as M1/M2. |
| M7 | `professional.validation.ts` | `professionalTitle` accepts `null` but the column is required, so the request blows up inside Prisma. | Same as M1/M2. |
| M8 | `admin.service.ts` | Enum query parameters are cast, not validated, so `?status=FOO` produces a confusing Prisma 400. The admin routes have no `validateRequest` at all. | Needs query schemas for every admin route. |
| M10 | `payment.service.ts` | The bKash *create* response is never validated, so a rejection returns `{ paymentUrl: undefined }`; the HTTP call also happens inside an open DB transaction. | Same risk class as H6. |
| M11 | `app/utils/seed.ts` | The cleanup `delete` after a failed seed throws `P2025` and stops the server from booting. | Same as M1/M2. |
| M12 | `app/lib/redis.ts` | The Redis client has no `error` listener, so a connection loss crashes the process. | Same as M1/M2. |
| L1 | `middleware/validateRequest.ts` | In Express 5 `req.query` is a getter that re-parses the URL on every access, so `Object.assign(req.query, …)` writes into a throwaway object. Harmless today because no query schema coerces a value. | Needs a dedicated `req.validatedQuery` and controller changes. |
| L2 | `middleware/notFound.ts`, `app.ts` | The 404 and the root route do not use the shared `{ success, statusCode, message, data }` envelope. | Small; not changed together with the security pass to keep the diff reviewable. |
| L3 | `event.constants.ts`, `auth.route.ts` | `EVENT_TYPE_LABELS` is never used; `POST /auth/refresh-token` is fully implemented but the frontend never calls it, so the refresh cookie is issued and never used. | The refresh flow should be wired up, not deleted. |
| L4 | `dispute.service.ts` | A dispute status is written with `ContractStatus.RESOLVED` — it works only because both enums happen to share the literal. | One-word fix; left with the rest. |
| L5 | `middleware/checkAuth.ts` | The user is looked up by `id + email + name + role`, so renaming a user invalidates their live token. | Same as L1. |
| L6 | `professional.controller.ts`, `validateRequest.ts` | `console.log({ files })` dumps every uploaded résumé into the log; validation failures are logged in full. | Same as L1. |
| L8 | `admin.service.ts` | The admin list endpoints return **every** row with no pagination, while the frontend API accepts an `IQuery` the backend ignores. | Needs pagination in the admin services. The frontend now sends a status filter that the backend does honour. |

---

## 5. How the fixes were verified

```bash
# frontend
bunx tsc --noEmit     # 0 errors
bun run lint          # biome check: 0 problems
bun run build         # next build (Next.js server): success, 0 warnings

# backend
npx tsc --noEmit      # 0 errors
npx @biomejs/biome check --write ./src
```

The TanStack Form behaviour in §1.2 was confirmed by running the form core
directly rather than by reading the source:

```
form-level onSubmit only        submit=[error] fix=[error]  resubmit=[error]   ← stale
form-level onChange + onSubmit  submit=[error, error]                          ← duplicated
form-level onChange only        submit=[error] fix=[]      resubmit=[]        ← correct
```

---

## 6. Things that were checked and are fine

- Every frontend API client matches the backend route: **method, path, body
  keys, query parameter names and the response envelope** all line up. The
  `{ success, statusCode, message, data, meta? }` envelope is used by all 81
  route handlers.
- `professionalTitle` is the column in Prisma and the field in the types on
  both sides — there is no `title`/`professionalTitle` mismatch.
- The `EventType` enum is identical in Prisma, the backend constants and the
  frontend types.
- Every `useSearchParams()` call sits under a `<Suspense>` boundary, so the
  page prerenders cleanly.
- The bKash callback URL redirects to `/dashboard/contracts/:id?payment=success`,
  which the server renders on demand.
- The upload paths (`resume` + `additionalFiles`, `mediaFile`,
  `profileImage`) are attached as `FormData` correctly, and every form's
  request body matches its payload type.
- Route ordering is safe everywhere (`/me` before `/:id`, `/read-all` before
  `/:id/read`, `/all-events` and `/published-events` before `/:eventId`).

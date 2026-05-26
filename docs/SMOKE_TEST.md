# PlannerDesk MVP Smoke Test

This document describes the lightweight smoke test for the static PlannerDesk MVP.

## Scope

Smoke test these public routes:

- `/`
- `/directory`
- `/claim-documents`
- `/disclosure-links`
- `/message-templates`

The smoke test must confirm that the MVP remains static and DB-free. It must not add Neon, Prisma, database migrations, auth, file upload, customer medical document processing, AI generation, saved user data, BOA CRM, Aiven, or production secrets.

## Commands

Run from the repository root:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Then run the production server:

```powershell
npm.cmd run start
```

If port `3000` is already in use, set another port before starting:

```powershell
$env:PORT = "3001"
npm.cmd run start
```

In another shell, check the public routes:

```powershell
$baseUrl = "http://localhost:3000"
$routes = @("/", "/directory", "/claim-documents", "/disclosure-links", "/message-templates")

foreach ($route in $routes) {
  $response = Invoke-WebRequest -Uri "$baseUrl$route" -UseBasicParsing -TimeoutSec 10
  "$route $($response.StatusCode)"
}
```

Expected result: every route returns `200`.

## Manual QA Pass

For each route, verify:

- Page title is visible.
- Shared navigation links are visible and usable.
- Mobile layout is readable.
- Safety, draft, or verification notice is visible where relevant.
- No auth prompt appears.
- No upload flow appears.
- No database or secret configuration is required.
- No raw `null`, `undefined`, or broken placeholder value appears in the UI.

## Link Safety Check

Search external links:

```powershell
rg -n 'target="_blank"' app components
```

Any external link that opens in a new tab must include:

```tsx
rel="noopener noreferrer"
```

## Boundary Check

Search for integration-sensitive terms:

```powershell
rg -n "DATABASE_URL|Neon|Aiven|BOA|Prisma" app components lib docs .env.example
```

Expected interpretation:

- `DATABASE_URL` may appear as a future placeholder in `.env.example` or deployment documentation only.
- Neon, Aiven, BOA CRM, and Prisma may appear in boundary documentation only.
- Claim payout, loss-adjusting, and customer medical document terms should appear only as safety boundaries, not as implemented workflows. Verify the Korean boundary copy listed in `docs/MVP_QA_CHECKLIST.md`.

## PR-11 Observed Result

Recorded on 2026-05-26:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed. Next.js prerendered `/`, `/directory`, `/claim-documents`, `/disclosure-links`, and `/message-templates` as static routes.
- `npm.cmd run start` route smoke: passed on local port `3001`.
- Route smoke result: `/`, `/directory`, `/claim-documents`, `/disclosure-links`, and `/message-templates` returned `200 text/html`.
- Neon status: not connected and not required.
- Railway deployment expectation: should deploy without `DATABASE_URL`.
- Admin-facing changes: none.
- Recommended next PR: prepare verified content/admin planning only after static MVP approval.

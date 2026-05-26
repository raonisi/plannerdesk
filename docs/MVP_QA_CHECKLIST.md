# PlannerDesk MVP QA Checklist

This checklist is for the static PlannerDesk MVP before Neon, Prisma, auth, admin CRUD, or database-backed features begin.

## A. Build and Deployment

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run start` and smoke test public routes.
- [ ] Confirm Railway can deploy without `DATABASE_URL`.
- [ ] Confirm `.env.example` uses placeholders only.
- [ ] Confirm no production secrets, API keys, customer data, or database credentials are committed.

## B. Route Checks

Check each public route:

- [ ] `/`
- [ ] `/directory`
- [ ] `/claim-documents`
- [ ] `/disclosure-links`
- [ ] `/message-templates`

For every route, confirm:

- [ ] Page renders without runtime errors.
- [ ] Clear page title is visible.
- [ ] Navigation links to other MVP pages are available.
- [ ] Mobile layout is readable.
- [ ] Relevant safety or draft notices are visible.
- [ ] Route does not require `DATABASE_URL`.
- [ ] Route does not require auth, login, file upload, or user-specific data.
- [ ] Route does not rely on BOA CRM, Aiven, Neon, Prisma, or external secrets.

## C. Mobile UX Checks

- [ ] Header and navigation have readable labels and comfortable tap targets.
- [ ] Cards remain readable on narrow screens.
- [ ] Search and filter controls do not feel cramped.
- [ ] CTA buttons are easy to tap.
- [ ] Safety notices are calm, readable, and not visually overwhelming.
- [ ] Long Korean text does not create awkward or broken layout.
- [ ] Badges for verification and draft status remain legible.
- [ ] Empty states are clear and helpful.

## D. Safety and Compliance Checks

- [ ] No claim payout judgment feature is present.
- [ ] No claim amount estimation feature is present.
- [ ] No loss-adjusting workflow is present.
- [ ] No customer medical document processing is present.
- [ ] No guarantee language is used.
- [ ] No fear marketing or pressure-based sales copy is used.
- [ ] No final legal, medical, tax, financial, or claim advice is implied.

Required Korean boundary copy to verify where relevant:

- &#54540;&#47000;&#45320;&#45936;&#49828;&#53356;&#45716; &#48372;&#54744;&#44552; &#51648;&#44553; &#50668;&#48512;&#47484; &#54032;&#45800;&#54616;&#51648; &#50506;&#49845;&#45768;&#45796;.
- &#54540;&#47000;&#45320;&#45936;&#49828;&#53356;&#45716; &#48372;&#54744;&#44552; &#51648;&#44553; &#44552;&#50529;&#51012; &#49328;&#51221;&#54616;&#51648; &#50506;&#49845;&#45768;&#45796;.
- &#54540;&#47000;&#45320;&#45936;&#49828;&#53356;&#45716; &#49552;&#54644;&#49324;&#51221; &#50629;&#47924;&#47484; &#49688;&#54665;&#54616;&#51648; &#50506;&#49845;&#45768;&#45796;.
- &#54788;&#51116; MVP&#50640;&#49436;&#45716; &#44256;&#44061; &#51032;&#47308;&#49436;&#47448;&#47484; &#52376;&#47532;&#54616;&#51648; &#50506;&#49845;&#45768;&#45796;.
- &#44277;&#49885; &#47553;&#53356;, &#50672;&#46973;&#52376;, &#49436;&#47448; &#44592;&#51456;&#51008; &#44277;&#44060; &#51204; &#44277;&#49885; &#52636;&#52376; &#54869;&#51064;&#51060; &#54596;&#50836;&#54633;&#45768;&#45796;.
- &#48376; &#51088;&#47308;&#45716; &#49892;&#47924; &#52280;&#44256;&#50752; &#50629;&#47924; &#51221;&#47532;&#47484; &#50948;&#54620; &#50857;&#46020;&#51077;&#45768;&#45796;.

## E. Data Checks

- [ ] Placeholder data is clearly labeled.
- [ ] Verification status is visible where relevant.
- [ ] Last verified fields are displayed safely.
- [ ] Missing data uses calm fallback text such as `&#44277;&#49885; &#54869;&#51064; &#54980; &#50629;&#45936;&#51060;&#53944; &#50696;&#51221;`, `&#46321;&#47197; &#50696;&#51221;`, or `&#44160;&#49688; &#54980; &#44277;&#44060; &#50696;&#51221;`.
- [ ] Raw `null`, `undefined`, or empty strings are not shown in the public UI.
- [ ] No fake dates are introduced.
- [ ] No real unverified insurer, contact, document, disclosure, or message data is added.

## F. Security and Privacy Checks

- [ ] No secrets are committed.
- [ ] No `.env` file is committed.
- [ ] `.env.example` contains placeholders only.
- [ ] No customer data is committed.
- [ ] No database connection is required.
- [ ] No Neon, Aiven, or BOA CRM connection is present.
- [ ] External links opened in a new tab use `rel="noopener noreferrer"`.

## G. Ready for Next Phase

- [ ] Static MVP routes are stable.
- [ ] Static content structures are approved for the next phase.
- [ ] Neon is not connected and is not required yet.
- [ ] Admin CRUD is not started yet.
- [ ] Recommended next PR is documented before database-backed work begins.

## PR-11 Result Log

Use this area during review:

- Typecheck: passed with `npm.cmd run typecheck`.
- Lint: passed with `npm.cmd run lint`.
- Build: passed with `npm.cmd run build`; MVP routes were prerendered as static content.
- Start smoke test: passed with `npm.cmd run start` on local port `3001`.
- Route smoke result: `/`, `/directory`, `/claim-documents`, `/disclosure-links`, and `/message-templates` returned `200 text/html`.
- Security/privacy result: no database, auth, file upload, Neon, Aiven, BOA CRM, or production secret dependency was required for build or route smoke.
- Follow-up recommendation: approve static MVP content and UX before planning verified content management, Neon, Prisma, admin CRUD, or auth.

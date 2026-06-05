# PR-155 — Admin 데이터 public 미노출

운영 이슈·변경 이력·리포트·리마인더·bulk 상태·usage audit·role/allowlist·secret — public **미노출**.

증거: admin panels in `AdminShell.tsx` only; `lib/search/public.ts`; `tests/public/public-visibility.test.ts`.

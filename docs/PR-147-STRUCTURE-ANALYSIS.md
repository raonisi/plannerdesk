# PR-147 — 구조 분석

## 기존

- PR-142 데이터 책임 표 (요약)
- PR-144 landing/footer 안전 문구
- claim `ClaimPracticeNotice`, knowledge safety aside, disclosure `CollapsibleNotice`
- `lib/public/*` + visibility guard
- PR-122 freshness ops, PR-134 link status ops (운영 문서)

## PR147 추가

- `lib/ops/data-responsibility-notice.ts` — matrices, checklist, inline copy
- `AdminDataResponsibilityNoticePanel`
- `DataResponsibilityInlineNotice` on 5 public routes
- docs/PR-147-* hub

## 미변경

- Prisma schema · migration · crawlers · source verification table
- Auth/RBAC · allowlist · AA gate

# PR-168 — 구현 계획 (PR168-A)

## 완료 범위

1. 진입 조건 (PR161·PR162·PR167·Critical 0)
2. workflow 대상 분석
3. 10 workflow 원칙
4. 접수·공식 출처·등급 기준
5. 5 도메인 workflow
6. 요청 템플릿·검수·후속 PR
7. PR169 이후 방향
8. `lib/ops/data-correction-workflow.ts` SSOT
9. `AdminDataCorrectionWorkflowPanel`
10. `tests/ops/pr168-data-correction-workflow.test.ts`
11. docs/PR-168-* 허브·서브문서

## 수정 파일

- `lib/ops/data-correction-workflow.ts`
- `components/admin/AdminDataCorrectionWorkflowPanel.tsx`
- `components/admin/AdminShell.tsx`
- `lib/ops/beta-metrics-review.ts` (PR168 연결 met)
- `docs/PR-168-*`
- `docs/OPERATING_QA_CHECKLIST.md`
- `docs/PR-140-DEFERRED-PR-ROADMAP.md`
- `lib/ops/external-release-readiness.ts`

## 수정하지 않음

- prisma/schema · migration
- Auth/RBAC · allowlist
- `lib/public/visibility.ts` (약화 없음)
- package.json · lockfile
- 운영 DB · bulk · crawl · API

## 영향

| 영역 | PR168-A |
| --- | --- |
| DB/Migration | 없음 |
| Auth/RBAC | 없음 |
| public visibility | 문서만 (guard 변경 없음) |
| PII/secret | 기록 금지 정책만 |
| crawl/API | 없음 |
| 결제/회원가입 | 없음 |
| package | 없음 |

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/ops/pr168-*.test.ts
npm run build
```

## Codex

**조건부** — correction workflow·public visibility·청구 책임 기준

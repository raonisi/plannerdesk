# PR-129 — 구현 계획

## 1. 수정·신규 문서

| 신규 | 용도 |
| --- | --- |
| `PR-129-OPERATIONAL-ISSUES-OPS.md` | 허브 |
| `PR-129-ISSUE-*.md` | 구조·접수·유형·심각도·워크플로·라우팅 |
| `PR-129-PII-AND-SENSITIVE-DATA-RULES.md` | PII |
| `PR-129-ISSUE-REPORT-TEMPLATE.md` | 템플릿 |
| `tests/ops/pr129-operational-issues.test.ts` | 정적 smoke |

| 수정 | 용도 |
| --- | --- |
| `OPERATING_QA_CHECKLIST.md` | PR129 링크 |
| `PR-121-FEEDBACK-TO-PR-ROUTING.md` | PR129/130 라우팅 |
| `PR-121-USER-FEEDBACK-OPS.md` | OPS 승격 안내 |

## 2. 수정하지 않음

- `prisma/`, `lib/public/*`, Auth, allowlist, fixture 데이터, `package.json`

## 3. 이슈 접수·유형·심각도·상태

요청서 3~7단계 표 — 각 전용 문서에 반영 완료.

## 4. DB/Auth/Migration · visibility

| 항목 | 영향 |
| --- | --- |
| DB/schema | **없음** |
| Auth/RBAC | **없음** |
| public visibility guard | **없음** (이슈 **분류**만) |

## 5. 테스트

- `npx tsx --test tests/ops/pr129-operational-issues.test.ts`
- `npm run lint` / `typecheck` / `test` / `build`

## 6. Codex

**생략** — 문서만. 권한·visibility·운영 DB 이슈 **처리 PR** 시 제한검수.

## 7. 보류

- 이슈 DB 테이블·인앱 제보 폼
- PR130 월간 리포트 본문 (별도 PR)

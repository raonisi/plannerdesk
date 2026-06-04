# PR-114 — 제한 배포 운영 체계 (PR105~PR113 통합)

**목적:** 기능 추가 없이, PR105~PR113에서 정리된 배포·안전·운영 기준을 **제한 배포 전** 운영자가 따라갈 수 있는 문서 세트로 묶는다.

**금지:** product code 수정, 운영 DB/데이터/allowlist 접촉, 배포 명령 실행, secret/.env 변경.

---

## 문서 세트

| 문서 | 용도 |
| --- | --- |
| [PR-114-LIMITED-RELEASE-PRE-DEPLOY-CHECKLIST.md](./PR-114-LIMITED-RELEASE-PRE-DEPLOY-CHECKLIST.md) | 배포 전 필수 확인표 (A~I) |
| [PR-114-RELEASE-NOTES-TEMPLATE.md](./PR-114-RELEASE-NOTES-TEMPLATE.md) | 운영자용 릴리즈 노트 템플릿 |
| [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md) | Rollback 기준 + Codex 제한검수 조건 |

---

## PR105~PR113 매핑

| PR | 주제 | 운영 문서 |
| --- | --- | --- |
| PR105 | build / migration 분리 | [PR-105-BUILD-MIGRATION-SEPARATION.md](./PR-105-BUILD-MIGRATION-SEPARATION.md), [DEPLOYMENT.md](./DEPLOYMENT.md) |
| PR106 | lint / typecheck 안정화 | CI `.github/workflows/ci.yml`, `npm run verify` |
| PR107 | Admin bulk safety | [PR-107-ADMIN-BULK-SAFETY-QA.md](./PR-107-ADMIN-BULK-SAFETY-QA.md), [ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md) |
| PR108 | GitHub PR 기록 감사 | `docs/review-pr-108.md` (감사 기록) |
| PR109 | Answer Assistant beta ops | [PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md), [PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md](./PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md) |
| PR110 | Public route smoke | [PR-110-PUBLIC-ROUTE-SMOKE.md](./PR-110-PUBLIC-ROUTE-SMOKE.md), [SMOKE_TEST.md](./SMOKE_TEST.md) |
| PR111 | Admin UI QA | [PR-111-ADMIN-UI-QA.md](./PR-111-ADMIN-UI-QA.md) |
| PR112 | 보험사/청구서류 UX | [PR-112-DIRECTORY-CLAIM-UX.md](./PR-112-DIRECTORY-CLAIM-UX.md) |
| PR113 | 지식 아카이브 검수 | [PR-113-KNOWLEDGE-ARCHIVE-OPS.md](./PR-113-KNOWLEDGE-ARCHIVE-OPS.md) |

**기존 통합 QA:** [OPERATING_QA_CHECKLIST.md](./OPERATING_QA_CHECKLIST.md) — MVP/Railway smoke. PR114는 **제한 배포( PR105~113 묶음)** 전용 보조 체크리스트이다.

---

## Build / Migration 책임 경계 (요약)

| 명령 | DB 접촉 | 배포 파이프라인 |
| --- | --- | --- |
| `npm run build` | **No** (`prisma generate` only) | Railway build, CI |
| `npm run release:migrate` | **Yes** | 운영자 별도 승인·실행 |
| `npm run smoke:public` | No (HTTP only) | 스테이징/로컬 서버 필요 |

상세: [PR-105-BUILD-MIGRATION-SEPARATION.md](./PR-105-BUILD-MIGRATION-SEPARATION.md).

---

## Antigravity 검수 (PR114)

- [ ] 체크리스트가 배포 당일 실제로 체크 가능한가
- [ ] build/migration 경계가 운영자에게 명확한가
- [ ] rollback 조건이 구체적인가
- [ ] bulk / Answer Assistant / public visibility가 빠지지 않았는가
- [ ] product code 변경이 없는가

**Codex:** 기본 생략. [PR-114-ROLLBACK-AND-CODEX-GATES.md](./PR-114-ROLLBACK-AND-CODEX-GATES.md) 조건 충족 시에만 제한검수 후보.

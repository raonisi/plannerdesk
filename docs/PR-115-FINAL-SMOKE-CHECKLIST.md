# PR-115 — 최종 Smoke Checklist (제한 배포 전)

**사용 순서:** PR114 pre-deploy 체크리스트 완료 → **본 문서** → [판단표](./PR-115-DEPLOY-DECISION-MATRIX.md) → [rollback drill](./PR-115-ROLLBACK-DRILL.md) → 릴리즈 노트.

**실행 금지:** 운영 DB migration, bulk apply, allowlist 변경, Railway deploy/rollback.

---

## A. 기본 검증 명령

저장소 루트에서 실행하고 결과를 판단표에 기록한다.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

| # | 확인 | Pass 기준 |
| --- | --- | --- |
| A1 | `npm run lint` | exit 0 |
| A2 | `npm run typecheck` | exit 0 |
| A3 | `npm run test` | exit 0 |
| A4 | `npm run build` | exit 0 |
| A5 | build ≠ migrate | `package.json` → `"build": "prisma generate && next build"` ([PR-105](./PR-105-BUILD-MIGRATION-SEPARATION.md)) |
| A6 | CI 정합 | `.github/workflows/ci.yml`에 `db:migrate:deploy` 없음 |

**실패 분류:** 이번 배포 / 기존 / 환경·의존성 / DB 접촉 방지 미실행.

**선택 통합:**

```bash
npm run verify
```

---

## B. 정적 Smoke (DB·서버 불필요)

PR110~113·107 회귀를 한 번에 돌린다.

```bash
npx tsx --test tests/public/public-visibility.test.ts
npx tsx --test tests/public/public-routes-smoke.test.ts
npx tsx --test tests/public/directory-claim-ux.test.ts
npx tsx --test tests/admin/bulk-safety.test.ts
npx tsx --test tests/admin/admin-ui-qa.test.ts
npx tsx --test tests/admin/knowledge-workflow-qa.test.ts
```

| # | 영역 | Pass 기준 |
| --- | --- | --- |
| B1 | Public visibility | `PUBLIC_*_WHERE`, draft 미포함 |
| B2 | Public routes | `app/*/page.tsx` 존재, smoke script 경로 |
| B3 | Directory/claim UX | PR112 링크·guard 정적 assert |
| B4 | Admin bulk | forbidden op·5 domain guard |
| B5 | Admin UI | public surface label·bulk notice |
| B6 | Knowledge workflow | `PUBLIC_KNOWLEDGE_WHERE`·운영 라벨 |

참고: [PR-110-PUBLIC-ROUTE-SMOKE.md](./PR-110-PUBLIC-ROUTE-SMOKE.md)

---

## C. Public Route Smoke (런타임)

**전제:** 로컬 또는 **스테이징** URL. 운영 production URL은 승인 없이 사용하지 않는다.

```bash
BASE_URL=http://localhost:3000 npm run smoke:public
```

| # | Route / 항목 | 확인 |
| --- | --- | --- |
| C1 | `/` 랜딩 | 200, 로그인 불필요 |
| C2 | `/directory` | 200, 목록·검색 |
| C3 | `/directory?insurer=` (선택) | 딥링크·배너 (PR112) |
| C4 | `/claim-documents` | 200, 보험사별 그룹 |
| C5 | `/claim-documents?insurer=` (선택) | 필터·디렉터리 역링크 |
| C6 | `/knowledge` | 200, 필터·목록 |
| C7 | `/knowledge/[slug]` (공개 slug 1건) | 200 또는 404(미공개) |
| C8 | `/search` | 200 |
| C9 | `/disclosure-links` | 200 |
| C10 | `/message-templates` | 200 |
| C11 | `/community` | 200 (placeholder 허용) |
| C12 | not-found | 존재하지 않는 slug → 404 |
| C13 | empty state | 필터 결과 0건 시 안내 문구 |
| C14 | 미검수/비공개 | draft·비게시 샘플 public 미노출 (스테이징 spot-check) |
| C15 | admin 메타 | 검수 내부값·`createdById` 등 미노출 |

문구: 지급 단정·가입 유도·공포 조장 없음 ([PR-112](./PR-112-DIRECTORY-CLAIM-UX.md), [PR-113](./PR-113-KNOWLEDGE-ARCHIVE-OPS.md)).

---

## D. Admin Route Smoke (런타임)

**전제:** 테스트용 admin 계정 또는 스테이징. **운영 bulk·import 실행 금지.**

| # | 항목 | 확인 |
| --- | --- | --- |
| D1 | 비로그인 `/admin` | redirect/deny |
| D2 | `super_admin` / `content_admin` | 허용 범위 내 접근 |
| D3 | `verified_planner` 등 | admin CRUD deny |
| D4 | `/admin/insurers` | 목록·필터·빈 상태 |
| D5 | `/admin/claim-documents` | 목록·보험사 필터 (PR111) |
| D6 | `/admin/knowledge` | 워크플로 가이드·빠른 필터 (PR113) |
| D7 | 일괄 UI | 선택 수·확인·취소 (실행 안 함) |
| D8 | 오류 URL `?error=` | 안내 표시 (해당 route) |

참고: [PR-111-ADMIN-UI-QA.md](./PR-111-ADMIN-UI-QA.md), [AUTH_RBAC_PRODUCTION.md](./AUTH_RBAC_PRODUCTION.md)

---

## E. Admin Bulk Safety (정적 + UI)

| # | 항목 | 확인 |
| --- | --- | --- |
| E1 | forbidden operation | 코드·테스트 ([PR-107](./PR-107-ADMIN-BULK-SAFETY-QA.md)) |
| E2 | 대상 수 표시 | selection bar |
| E3 | 빈 선택 | 실행 불가 |
| E4 | confirm override | knowledge 등 도메인별 문구 |
| E5 | 서버 권한 | action 진입 전 RBAC |
| E6 | **실행** | 이번 검증에서 bulk **미실행** |

---

## F. Answer Assistant Beta

정적:

```bash
npx tsx --test tests/answer-assistant/beta-ops-checklist.test.ts
npx tsx --test tests/answer-assistant/allowlist-beta.test.ts
```

| # | 항목 | 확인 |
| --- | --- | --- |
| F1 | verified planner only | |
| F2 | allowlist only | env **변경 없음** |
| F3 | gate 기본 OFF / beta 자동 확대 없음 | |
| F4 | rate limit·output safety | 테스트·문서 |
| F5 | usage audit metadata-only | |
| F6 | retention / rollback 절 | [PR-109](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md) |
| F7 | public route 없음 | `/planner/answer-assistant` 인증 필요 |

---

## G. 보험사/청구서류 + 지식 아카이브 (spot-check)

| # | 영역 | 확인 | 문서 |
| --- | --- | --- | --- |
| G1 | 보험사별 청구서류 그룹 | C4~C5 | PR-112 |
| G2 | 청구안내·전산·팩스 링크 | 디렉터리 카드 | PR-112 |
| G3 | 지식 등록·검수·게시 | D6 | PR-113 |
| G4 | 지식 public 미노출 | B6, C6 | PR-113 |

---

## 최종 Smoke 서명

| 실행자 | 일시 | A~B 정적 | C public runtime | D admin runtime | 비고 |
| --- | --- | --- | --- | --- | --- |
| | | | skip / pass | skip / pass | |

**다음:** [PR-115-ROLLBACK-DRILL.md](./PR-115-ROLLBACK-DRILL.md) → [PR-115-DEPLOY-DECISION-MATRIX.md](./PR-115-DEPLOY-DECISION-MATRIX.md)

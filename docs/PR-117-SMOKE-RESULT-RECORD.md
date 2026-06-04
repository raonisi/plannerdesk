# PR-117 — 제한 배포 후 Smoke 결과 기록

**허브:** [PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md](./PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md)

**판단 범례:** 정상 · 조건부 · 보류 · 중단 · **미실행** · **정보 부족**

---

## Smoke 대상 환경

| 필드 | 값 |
| --- | --- |
| 배포 환경 | **정보 부족** (운영자 기입: production / staging / preview) |
| 배포 URL (`BASE_URL`) | **정보 부족** — Cursor PR117에서 미제공 |
| 배포 대상 commit | **정보 부족** (예: `git log -1` on deployed revision) |
| Rollback 대상 commit | **정보 부족** (PR-116 A4) |
| Smoke 수행자 | Cursor (문서·정적 검증) / 운영자 (런타임) |
| Smoke 수행 일시 | 2026-06-03 (문서·정적 검증) — 런타임 TBD |
| 관리자 계정 확인 가능 여부 | **정보 부족** — 절차만 아래 기록 |
| Answer Assistant beta 확인 가능 여부 | **정보 부족** — allowlist·verified 계정 필요 |

**런타임 smoke 전제:** `BASE_URL`에 배포된 앱이 기동 중이어야 함. 명령:

```bash
BASE_URL=https://<approved-host> npm run smoke:public
```

비밀번호·OAuth secret·allowlist 값은 이 문서에 **기록하지 않음**.

---

## PR117 Cursor 세션 — 정적 검증 (URL 없음)

배포 URL 미제공으로 HTTP/admin 런타임 smoke는 **미실행**. 아래만 완료:

| 검증 | 결과 |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run test` | pass (169) |
| `npm run build` | pass (migrate deploy 없음) |
| `tests/public/*.test.ts` + admin/ops tests | pass (정적) |
| `npm run smoke:public` | **미실행** (서버·URL 없음) |

---

## 1. Public Route Smoke

| 항목 | URL/경로 | 결과 | 판단 | 비고 |
| --- | --- | --- | --- | --- |
| 홈/랜딩 | `/` | 미실행 | 정보 부족 | smoke script 대상 |
| 보험사 디렉터리 | `/directory` | 미실행 | 정보 부족 | PR112 `?insurer=` spot-check 권장 |
| 보험사 상세/청구안내 | `/directory?insurer=<id>` | 미실행 | 정보 부족 | 카드·딥링크 |
| 청구서류 목록 | `/claim-documents` | 미실행 | 정보 부족 | |
| 청구서류 필터 | `/claim-documents?insurer=<id>` | 미실행 | 정보 부족 | |
| 지식 아카이브 목록 | `/knowledge` | 미실행 | 정보 부족 | |
| 지식 상세 | `/knowledge/<공개-slug>` | 미실행 | 정보 부족 | 승인 slug 1건 |
| 검색 | `/search`, `/search?q=test` | 미실행 | 정보 부족 | |
| 공시/약관 | `/disclosure-links` | 미실행 | 정보 부족 | |
| 고객문구 | `/message-templates` | 미실행 | 정보 부족 | |
| not-found | `/knowledge/nonexistent-fixture-slug-pr110` | 미실행 | 정보 부족 | 기대 404 |
| empty state | 필터 0건 UI | 미실행 | 정보 부족 | 수동 |
| 미검수/비공개 public 미노출 | draft·비게시 샘플 | 미실행 | 정보 부족 | **Critical** if fail |
| 관리자 전용 public 미노출 | `createdById` 등 | 정적 pass | 정상 | `public-visibility.test.ts` |

**운영자 기입 예시 (PASS 시):** `정상`, HTTP 200, 치명적 오류 없음.

---

## 2. Admin Route Smoke

**주의:** bulk·일괄공개·상태변경 **실행 금지**. UI·경고·대상 수·확인 단계만.

| 항목 | 결과 | 판단 | 비고 |
| --- | --- | --- | --- |
| admin 접근 제어 (비로그인) | 미실행 | 정보 부족 | `/admin` → login |
| 권한 없는 사용자 차단 | 미실행 | 정보 부족 | verified_planner 등 |
| super_admin 접근 | 미실행 | 정보 부족 | 절차: OAuth 로그인 후 `/admin` |
| content_admin 접근 | 미실행 | 정보 부족 | insurers·claims·knowledge |
| 관리자 대시보드 | 미실행 | 정보 부족 | |
| 보험사 관리자 | `/admin/insurers` | 미실행 | 정보 부족 | |
| 청구서류 관리자 | `/admin/claim-documents` | 미실행 | 정보 부족 | insurer 필터 |
| 지식 아카이브 관리자 | `/admin/knowledge` | 미실행 | 정보 부족 | 워크플로 가이드 |
| 일괄등록 UI | starter import 등 | 미실행 | 정보 부족 | **실행 안 함** |
| 일괄검수 UI | bulk panel | 미실행 | 정보 부족 | confirm 문구만 |
| 일괄상태변경 UI | bulk panel | 미실행 | 정보 부족 | 선택 수 표시 |
| 빈/오류/로딩 상태 | `?error=` 등 | 미실행 | 정보 부족 | |

**정적:** `admin-ui-qa.test.ts`, `bulk-safety.test.ts` — layout·guard·forbidden op **pass** (코드 기준).

---

## 3. Answer Assistant Beta Smoke

| 항목 | 결과 | 판단 | 비고 |
| --- | --- | --- | --- |
| verified planner 제한 | 정적 pass | 정상 | `verified-access` tests |
| allowlist 제한 | 정적 pass | 정상 | PR117에서 env **미변경** |
| allowlist 밖 접근 차단 | 미실행 | 정보 부족 | NOT_ALLOWLISTED |
| rate limit | 정적 pass | 정상 | config tests |
| output safety | 정적 pass | 정상 | `output-safety.test.ts` |
| usage audit metadata-only | 정적 pass | 정상 | no prompt in DB |
| retention cleanup | 정적 pass | 정상 | execute disabled default |
| gate OFF / rollback 절 | 문서화 | 정상 | PR-109 |

**런타임:** `/planner/answer-assistant` — allowlist 내·외 계정 각 1회, **가상 질문만**, 고객 PII 금지.

---

## 4. Admin Bulk Safety (실행 없음)

| 항목 | 결과 | 판단 | 비고 |
| --- | --- | --- | --- |
| forbidden operation 차단 | 정적 pass | 정상 | PR-107 |
| 대상 수 표시 | 정적 pass | 정상 | selection bar |
| 빈 선택 실행 방지 | 정적 pass | 정상 | parseBulkIds |
| 확인 문구·override | 정적 pass | 정상 | knowledge 등 |
| 서버 권한 체크 | 정적 pass | 정상 | actions + validateServerBulkAction |
| **실제 bulk 실행** | **미실행** | N/A | **금지** |

---

## Smoke 서명 (런타임 완료 후)

| 역할 | 이름 | 일시 | public | admin | AA |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

**다음:** [PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md](./PR-117-SMOKE-FAILURE-AND-DEPLOY-DECISION.md)

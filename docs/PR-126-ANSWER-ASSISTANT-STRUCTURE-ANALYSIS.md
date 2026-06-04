# PR-126 — Answer Assistant 구조 분석

**범위:** 코드·문서·tests 정적 분석. 운영 DB·allowlist env **미접근**.

---

## action

| 경로 | 역할 |
| --- | --- |
| `app/planner/answer-assistant/actions.ts` | verified planner 초안 생성 — access → rate limit → generate |
| `app/admin/answer-assistant/actions.ts` | admin 초안 (별도 audience) |
| `lib/answer-assistant/generate-draft.ts` | gate → retrieval → output safety 파이프라인 |

---

## verified planner 제한

| 항목 | 구현 |
| --- | --- |
| 역할 | `user.role === verified_planner` |
| 계정 | `status === active` |
| 검증 | `PlannerVerification` approved, 미정지 |
| 서버 | `getVerifiedAnswerAssistantAccess()` / `requireVerifiedAnswerAssistantAccess()` |

**파일:** `lib/answer-assistant/verified-access.ts`

---

## allowlist / beta access

| 항목 | 구현 |
| --- | --- |
| env | `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST` (userId 목록) |
| gate | `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED` (기본 **false**) |
| operational | gate ON + allowlist 비어있지 않음 → `operational` |
| 생성 | `isUserOnVerifiedAnswerAssistantAllowlist(userId)` |

**파일:** `allowlist.ts`, `allowlist-beta.ts`, `feature-gate.ts`

---

## beta 자동 확대 여부

| 항목 | 상태 |
| --- | --- |
| 코드 자동 apply | **없음** — `allowlist-expansion-plan.ts` 주석 |
| decision 자동 ON | **없음** — `beta-expansion-decision.ts` |
| 확대 경로 | PR-103/104-C **수동** env·allowlist만 |

**테스트:** `beta-ops-checklist.test.ts`, `allowlist-beta.test.ts`

---

## rate limit

| 항목 | 구현 |
| --- | --- |
| config | `rate-limit-config.ts` (분당·일당·abuse) |
| backend | `ANSWER_ASSISTANT_RATE_LIMIT_BACKEND` memory/durable |
| planner | `checkVerifiedAnswerAssistantRateLimit` → `RATE_LIMIT_EXCEEDED` |

---

## output safety

| 항목 | 구현 |
| --- | --- |
| 입력 | `validation.ts` — Safety Gate |
| 출력 | `output-safety.ts` — 지급 단정·PII·권유 등 |
| 테스트 | `safety-gate.test.ts`, `output-safety.test.ts` |

---

## usage audit

| 항목 | 구현 |
| --- | --- |
| log | `usage-log.ts` — metadata only |
| 금지 필드 | `FORBIDDEN_USAGE_AUDIT_FIELDS` |
| durable | `usage-audit-durable.ts` |
| admin | `/admin/answer-assistant/audit` |

---

## retention cleanup

| 항목 | 구현 |
| --- | --- |
| policy | `retention-config.ts` — audit 180d, feedback 365d 등 |
| execute | `ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED` 기본 **false** |
| UI | `/admin/answer-assistant/cleanup` preview + confirm phrase |
| job | `retention-cleanup.ts` |

---

## rollback / disable

| 항목 | 구현 |
| --- | --- |
| steps | `ALLOWLIST_BETA_ROLLBACK_STEPS` |
| operator | `ALLOWLIST_BETA_OPERATOR_CHECKLIST` |
| 메시지 | `constants.ts` — FEATURE_DISABLED, NOT_ALLOWLISTED |

---

## 테스트

| suite | 용도 |
| --- | --- |
| `tests/answer-assistant/*.test.ts` | allowlist, safety, audit, rate, retention |
| `tests/ops/pr126-answer-assistant-beta-ops.test.ts` | PR126 문서·정적 관찰 |

---

## 문서

| PR | 문서 |
| --- | --- |
| 109 | [PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md) |
| 99B | [PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md](./PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md) |
| 117 | [PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md](./PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md) |
| 120 | [PR-120-PR105-119-SUMMARY.md](./PR-120-PR105-119-SUMMARY.md) |

---

## 정보 부족 항목

| 항목 | 비고 |
| --- | --- |
| 프로덕션 런타임 smoke | PR117 `SMOKE-RESULT` 미기입 시 운영자 실행 |
| 실제 allowlist userId 수 | env 미열람 |
| usage audit row 샘플링 | DB 미조회 |
| provider 장애율 | 운영 메트릭 미수집 (본 세션) |

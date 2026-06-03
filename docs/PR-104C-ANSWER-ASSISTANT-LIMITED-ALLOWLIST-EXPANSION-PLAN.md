# PR-104-C: Answer Assistant Limited Allowlist Expansion Plan

**Branch:** `pr-104c-answer-assistant-limited-allowlist-expansion-plan`

## Purpose

PR-103 `LIMITED_EXPANSION_CANDIDATE`일 때만, allowlist beta를 **소폭** 확대하기 위한 **운영 계획·관리자 검토 구조**를 제공합니다.

**이 PR은 확대 실행 PR이 아닙니다.** allowlist 자동 확대, env 자동 저장, feature gate 자동 ON, 전체 VERIFIED 공개는 구현하지 않습니다.

## Route

| Route | Access |
| --- | --- |
| `/admin/answer-assistant/expansion-plan` | ADMIN only (`getAdminAccess`) |
| `/admin/answer-assistant/beta-decision` | PR-103 연동 |

## PR-103 연동

- `loadBetaExpansionDecisionReport` 재사용
- 전제 조건·No-Go·모니터링 지표 동기화
- PR-103 decision ≠ `LIMITED_EXPANSION_CANDIDATE` → expansion plan **보류**

## Expansion plan decision types

| Value | Meaning |
| --- | --- |
| `EXPANSION_BLOCKED` | 전제 미충족·확대 불가 |
| `KEEP_CURRENT_ALLOWLIST` | 현 allowlist 유지 |
| `READY_FOR_WAVE_1_PLAN` | Wave 1 소폭 추가 계획 검토 |
| `READY_FOR_WAVE_2_PLAN` | Wave 2 / 재검토 단계 |
| `EXPANSION_REQUIRES_IMPROVEMENT` | 개선 후 재검토 |
| `PAUSE_AND_FIX_REQUIRED` | 중단·safety fix (PR-104-A) |

## Waves

| Wave | 규모 (기본) | 기간 |
| --- | --- | --- |
| 0 | 현 allowlist 유지 | — |
| 1 | min(3명, 현 인원 20%) | 7~14일 |
| 2 | +5명, 누적 10명 이하 | 14일+ |
| 3 | 장기 재검토 (전체 공개 아님) | 30일+ |

## Candidate criteria

**포함 후보 (DB 미리보기):**

- `PlannerVerification.status = approved`, `deletedAt = null`
- `User.role = verified_planner`, `User.status = active`
- allowlist 미포함
- abuse 신호 없음 (prompt injection / rate limit / 차단 반복)

**제외:** suspended/rejected/expired, abuse 반복, 운영자 미승인

동의 체크 UI는 후속 PR — 기준만 문서화.

## Rollback (manual)

- feature gate OFF 권고
- 신규 allowlist 추가 보류
- PR-104-A beta pause / safety fix

자동 rollback 없음.

## Config (optional env)

| Env | Default |
| --- | --- |
| `ANSWER_ASSISTANT_EXPANSION_WAVE1_MAX_ADD` | 3 |
| `ANSWER_ASSISTANT_EXPANSION_WAVE2_CUMULATIVE_CAP` | 10 |
| `ANSWER_ASSISTANT_EXPANSION_CANDIDATE_PREVIEW_LIMIT` | 25 |

## Modules

| Path | Role |
| --- | --- |
| `lib/answer-assistant/allowlist-expansion-plan-config.ts` | Wave thresholds |
| `lib/answer-assistant/allowlist-expansion-plan.ts` | Plan load + evaluate |
| `app/admin/answer-assistant/expansion-plan/` | ADMIN UI |

## Next PR candidates

- **PR-104-C-EXECUTE** (or ops runbook): env allowlist 수동 반영 + sign-off
- **PR-104-A**: pause / safety fix
- **PR-103-QA**: decision + plan QA

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

No schema migration.

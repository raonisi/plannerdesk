# PR-103: Answer Assistant Beta Expansion Decision

**Branch:** `pr-103-answer-assistant-beta-expansion-decision`

## Purpose

PR-99-B allowlist beta 운영, PR-100 usage audit, PR-101 feedback safety review, PR-102 retention/cleanup 집계를 **종합**하여 다음 운영 방향을 판단할 수 있는 **ADMIN-only decision framework**를 제공합니다.

**이 PR은 beta 확대 실행 PR이 아닙니다.** (decision PR — 집계·권고만.) allowlist 자동 확대, feature gate 자동 ON, beta 자동 중단, 사용자 자동 제재, GENERAL_USER/public chatbot 공개는 구현하지 않습니다.

## Route

| Route | Access |
| --- | --- |
| `/admin/answer-assistant/beta-decision` | ADMIN only (`getAdminAccess`) |

## Decision types

| Value | Meaning |
| --- | --- |
| `CONTINUE_CURRENT_BETA` | 현 allowlist beta 유지·추가 데이터 수집 |
| `PAUSE_BETA` | 치명적 안전 신호 — beta 중단 검토 (수동) |
| `IMPROVE_BEFORE_EXPANSION` | 확대 전 개선 필요 |
| `EXPANSION_NOT_READY` | 운영·기간·지표 미충족 |
| `LIMITED_EXPANSION_CANDIDATE` | allowlist **소폭** 확대 계획 후보만 (자동 확대 없음) |

## Indicators used

- **Usage audit:** verified_planner 집계 — success/blocked, rate limit, prompt injection, output safety, provider error, insufficient evidence, permission denied, not allowlisted
- **Feedback:** structured safety signals (privacy_risk, output_too_assertive, linked audit blockedReason, review backlog)
- **Retention:** cleanup last run, overdue, old audit/feedback candidates, protected critical/linked rows

## Data not used / not shown

- raw prompt, raw output, generated answer, provider raw response
- customer/contract/medical/claim document payloads
- shortNote/adminMemo bulk export
- CorrectionRequest / CommunityReport 원문

## No-Go (immediate expansion block)

Any of:

- `CRITICAL_STOP` (high severity / incident_candidate feedback)
- `FIELD_EXPOSURE_RISK` (privacy_risk)
- `OUTPUT_SAFETY_MISS`
- `CLAIM_JUDGMENT_RISK` / `MEDICAL_INTERPRETATION_RISK` / `LOSS_ADJUSTMENT_RISK` (linked audit or feedback)
- Rate limit or usage audit not durable in production
- Retention cleanup seriously overdue
- Permission denied attempts in period
- Audit schema forbidden payload fields

When No-Go: decision must **not** be `LIMITED_EXPANSION_CANDIDATE`.

## Improve before re-review

Accumulation of: evidence/UI/blocking feedback, provider errors, insufficient evidence rate, not allowlisted attempts, rate limits, feedback review backlog, cleanup overdue.

## Continue current beta

Critical signals clear, rate limit/audit/retention healthy, backlog manageable, provider errors low, no permission denied.

## Limited expansion candidate (all required)

Min operation days & min beta requests, all safety signals clear, operational backends healthy, retention OK, allowlist beta operational, feedback backlog low — **still manual allowlist expansion in PR-104-C only**.

## Auto actions forbidden

- allowlist auto expand
- feature gate auto ON
- beta auto pause
- user auto sanction
- customer/community auto send

## Next PR branches

| PR | When |
| --- | --- |
| PR-104-A | Pause / safety fix (critical No-Go) |
| PR-104-B | Improvement (non-critical issues) |
| PR-104-C | Limited allowlist expansion **plan** (candidate only) |
| PR-104-D | Continue current beta |
| PR-103-QA | Dashboard QA |

## Config (optional env)

| Env | Default |
| --- | --- |
| `ANSWER_ASSISTANT_BETA_DECISION_MIN_OPERATION_DAYS` | 14 |
| `ANSWER_ASSISTANT_BETA_DECISION_MIN_REQUESTS` | 20 |
| `ANSWER_ASSISTANT_BETA_DECISION_CLEANUP_OVERDUE_DAYS` | 90 |
| `ANSWER_ASSISTANT_BETA_DECISION_FEEDBACK_BACKLOG_MAX` | 15 |

## Modules

| Path | Role |
| --- | --- |
| `lib/answer-assistant/beta-expansion-decision-config.ts` | Thresholds |
| `lib/answer-assistant/beta-expansion-decision.ts` | Aggregate + rule engine |
| `app/admin/answer-assistant/beta-decision/` | ADMIN UI |

## Validation

```bash
npx prisma format
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run build
npm test
```

No schema migration in PR-103 (report-only).

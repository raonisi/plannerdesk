# PR-101: Answer Assistant Beta Feedback Safety Review

**Branch:** `pr-101-answer-assistant-beta-feedback-safety-review`

## Purpose

allowlist beta 운영 중 **안전 신호**를 structured 피드백으로 수집하고, 관리자가 usage audit 메타데이터와 함께 **수동 검토**합니다. beta 확대·전체 공개·자동 제재 PR이 아닙니다.

## Routes

| Route | Access |
| --- | --- |
| `/planner/answer-assistant` | allowlist beta 파일럿 — 피드백 제출 UI |
| `/admin/answer-assistant/feedback` | ADMIN only — 검토 대시보드 |
| `/admin/answer-assistant/audit` | PR-100 usage audit (연동 참고) |

## Feedback policy

- **목적:** 차단 적절성, 근거 부족, output safety, UI 고지 이해, beta 유지/중단 판단 자료
- **금지:** 상담 원문, 생성 초안, raw prompt/output, PII, 의료·계약 정보
- **형식:** 선택형 필드 중심 + `shortNote` 최대 120자 + 민감정보 validation
- **연결:** `usageAuditId` (durable audit row) — 본인 audit만 연결

## Data model

`AnswerAssistantBetaFeedback` + enums (`AnswerAssistantFeedbackType`, `AnswerAssistantSafetySignal`, …).  
Migration: `20260603140000_add_answer_assistant_beta_feedback`.

## Admin review

- 상태: `new` · `triaged` · `incident_candidate` · `dismissed` · `resolved` (**수동 변경만**)
- **인시던트 힌트:** HIGH severity, `safety_concern`, 특정 safety signal — 자동 상태 변경 없음
- **판단 기준:** `BETA_SAFETY_REVIEW_DECISION_CRITERIA` (maintain / pause / improve / hold_expansion)

## Explicitly not implemented

- 자동 제재, 자동 allowlist 제거, 자동 feature gate OFF
- 전체 VERIFIED_PLANNER / GENERAL_USER / public chatbot
- CSV export, raw payload 조회

## Modules

| Path | Role |
| --- | --- |
| `lib/answer-assistant/beta-feedback-validation.ts` | Submit validation |
| `lib/answer-assistant/beta-feedback-persist.ts` | DB persist |
| `lib/answer-assistant/beta-feedback-dashboard.ts` | Admin aggregates |
| `app/planner/answer-assistant/feedback-actions.ts` | Pilot submit |
| `app/admin/answer-assistant/feedback/actions.ts` | Manual review update |

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

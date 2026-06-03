# PR-102: Answer Assistant Dashboard Retention / Cleanup

**Branch:** `pr-102-answer-assistant-dashboard-retention-cleanup`

## Purpose

usage audit, rate limit state, beta feedback, cleanup log를 **필요 최소 기간**만 보관하고, ADMIN이 **preview(dry-run) 후** 수동으로 만료 데이터를 삭제합니다.

## Retention defaults (configurable)

| Data | Env | Default |
| --- | --- | --- |
| Rate limit state | `ANSWER_ASSISTANT_RATE_LIMIT_BUCKET_RETENTION_DAYS` or `_STATE_` | 30일 |
| Usage audit | `ANSWER_ASSISTANT_USAGE_AUDIT_RETENTION_DAYS` | 180일 |
| Beta feedback (일반) | `ANSWER_ASSISTANT_FEEDBACK_RETENTION_DAYS` | 365일 |
| Beta feedback (incident_candidate / HIGH) | `ANSWER_ASSISTANT_FEEDBACK_CRITICAL_RETENTION_DAYS` | 730일 |
| Cleanup log | `ANSWER_ASSISTANT_CLEANUP_LOG_RETENTION_DAYS` | 365일 |

## Execute safeguards

1. `ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED=true` (default **false**)
2. ADMIN session (`requireAdminAccess`)
3. 확인 문구: `DELETE-EXPIRED-DATA`
4. Execute 시점 preview 건수가 form hidden 값과 **일치**해야 함
5. 삭제 순서: feedback → usage audit → rate limit state → cleanup log (transaction)
6. `AnswerAssistantCleanupLog`에 mode·건수·retention config snapshot 기록

## Route

`/admin/answer-assistant/cleanup` — preview, execute, recent cleanup logs

Audit / Feedback 대시보드에 **RetentionStatusPanel** (삭제 후보 건수만).

## Never stored / never deleted blindly

- raw prompt, raw output, generated answer, PII, medical/contract data
- No cron auto-delete in this PR
- No auto allowlist removal, auto gate OFF, auto sanctions

## Modules

| Path | Role |
| --- | --- |
| `lib/answer-assistant/retention-config.ts` | Env retention days |
| `lib/answer-assistant/retention-cleanup.ts` | Preview + execute |
| `app/admin/answer-assistant/cleanup/` | Admin UI |

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

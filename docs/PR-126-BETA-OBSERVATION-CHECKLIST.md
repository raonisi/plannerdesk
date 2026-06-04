# PR-126 — Answer Assistant 베타 관찰 항목

**관찰 방식:** PR126 Cursor 세션 = **코드·tests 정적 pass**. 운영 주기 관찰 = 리포트 양식 + PR109 수동 항목.

---

## PR126 Answer Assistant 베타 관찰 항목

| 항목 | 확인 기준 | 위험도 | 정적 결과 | 운영 런타임 |
| --- | --- | ---: | --- | --- |
| verified planner 제한 | 인증·approved 설계사만 | **Critical** | **pass** | 수동 |
| allowlist 제한 | allowlist userId만 생성 | **Critical** | **pass** | 수동 |
| beta 자동 확대 금지 | 자동 apply 없음 | **High** | **pass** | — |
| rate limit | 과다 사용 차단 | **High** | **pass** | 수동 |
| output safety | 위험 답변 차단 | **High** | **pass** | 샘플 질의 |
| usage audit | metadata-only | **High** | **pass** | DB row spot |
| retention cleanup | 보존·execute 기준 | **Medium** | **pass** | preview only |
| 민감정보 입력 방지 | PII 유도 없음 | **High** | **pass** | UI 확인 |
| rollback/disable | 즉시 중단 절차 | **High** | **pass** | drill(선택) |

---

## 정적 pass 근거 (요약)

| 항목 | 근거 |
| --- | --- |
| verified planner | `verified-access.ts` role·verification checks |
| allowlist | `canVerifiedPlannerUseAllowlistBeta`, `not_allowlisted` in actions |
| 자동 확대 | expansion/decision modules + tests |
| rate limit | `ANSWER_ASSISTANT_RATE_LIMIT_CONFIG`, action order |
| output safety | `output-safety.ts`, `safety-gate.test.ts` |
| audit | `FORBIDDEN_USAGE_AUDIT_FIELDS`, `usage-log.ts` header |
| retention | `cleanupExecuteEnabled === false` default |
| PII | validation + forbidden audit fields + UI tests |
| rollback | `ALLOWLIST_BETA_ROLLBACK_STEPS` |

---

## 실패 시 등급 ([PR-126-ACCESS-OUTPUT-AUDIT-STANDARDS.md](./PR-126-ACCESS-OUTPUT-AUDIT-STANDARDS.md) §리스크)

| 등급 | 예시 |
| --- | --- |
| **Critical** | allowlist 우회, audit에 query/draft 저장 |
| **High** | rate limit 우회, safety 우회 |
| **Medium** | 문서·관찰 주기 미흡 |
| **Low** | 리포트 양식 개선 |

---

## PR109 · PR117 연계

- 일상 운영: [PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md](./PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md)
- 배포 후 smoke: [PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md](./PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md)
- PR126 리포트: [PR-126-BETA-OBSERVATION-REPORT-TEMPLATE.md](./PR-126-BETA-OBSERVATION-REPORT-TEMPLATE.md)

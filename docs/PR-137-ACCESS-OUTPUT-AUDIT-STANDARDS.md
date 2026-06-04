# PR-137 — 접근·입력·출력·audit 기준

## 접근 제한

| 항목 | 구현 |
| --- | --- |
| verified planner | `getVerifiedAnswerAssistantAccess` · role + verification |
| allowlist | `isUserOnVerifiedAnswerAssistantAllowlist` · env userId set |
| gate | `isAnswerAssistantVerifiedPreviewEnabled` · gate without allowlist = OFF |
| public | `/planner/answer-assistant` only · 홈은 안내 링크만 |
| admin tester | `canAdminTestVerifiedAnswerAssistant` · 우회 없음 |

## 위험 입력 (PR137 보강)

- 보험금 확정·무조건 지급 → `CLAIM_JUDGMENT`
- 투자 매수·매도·수익 보장 → `PRODUCT_SOLICITATION`
- 고지 회피·고객 설득 멘트 → `PRODUCT_SOLICITATION`

## Output safety (PR137 보강)

- `무조건 지급`, `보험금 확정`, `수익 보장`, `지금 매수`, `고지를 안 해도` 등

## Usage audit

- `usage-log.ts` · `FORBIDDEN_USAGE_AUDIT_FIELDS`
- persist: metadata only (`usage-audit-durable.ts`)

## Rate limit

- `ANSWER_ASSISTANT_RATE_LIMIT_CONFIG` — PR137에서 기본값·완화 없음

## Retention

- `retention-config.ts` · admin cleanup UI — 완화 없음

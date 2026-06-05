# PR-148 — 제한 베타 운영 범위

코드: `AA_LIMITED_BETA_SCOPE` in `lib/ops/ai-limited-beta-policy.ts`.

| 항목 | 기준 |
| --- | --- |
| 제공 대상 | verified planner + allowlist |
| public | 접근 금지 |
| 일반 planner | 기본 차단 |
| 제한 베타 사용자 | AA 자동 허용 없음 |
| 사용 목적 | 상담 준비·기준 정리·문구 초안 보조 |
| 금지 | 보험금 확정·가입/해지 유도·투자·법률·의료 확정 |

접근 구현: `lib/answer-assistant/verified-access.ts`, `allowlist.ts`, `feature-gate.ts`.

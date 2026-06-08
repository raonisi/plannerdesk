# PR-158 — Beta Feedback Loop (PR158-A)

**위험도:** High · **성격:** 피드백 **운영 기준** — 폼·발송·DB·provider 없음

## 목적

제한 베타 운영 중 피드백·오류 제보를 고객정보·민감정보·secret 없이 **metadata 중심**으로 수집·분류·후속 PR 연결 기준을 정리한다.

## 범위 (PR158-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-158-ENTRY-CONDITIONS.md](./PR-158-ENTRY-CONDITIONS.md) |
| 수집 원칙 | [PR-158-COLLECTION-PRINCIPLES.md](./PR-158-COLLECTION-PRINCIPLES.md) |
| 허용/금지 | [PR-158-RECORD-ALLOW-DENY.md](./PR-158-RECORD-ALLOW-DENY.md) |
| 유형 분류 | [PR-158-TYPE-CLASSIFICATION.md](./PR-158-TYPE-CLASSIFICATION.md) |
| Critical | [PR-158-CRITICAL-RESPONSE.md](./PR-158-CRITICAL-RESPONSE.md) |
| High | [PR-158-HIGH-RESPONSE.md](./PR-158-HIGH-RESPONSE.md) |
| Medium/Low | [PR-158-MEDIUM-LOW-RESPONSE.md](./PR-158-MEDIUM-LOW-RESPONSE.md) |
| AA | [PR-158-AA-FEEDBACK.md](./PR-158-AA-FEEDBACK.md) |
| 데이터 오류 | [PR-158-DATA-ERROR-FEEDBACK.md](./PR-158-DATA-ERROR-FEEDBACK.md) |
| 처리 흐름 | [PR-158-WORKFLOW.md](./PR-158-WORKFLOW.md) |
| Checklist | [PR-158-CHECKLIST.md](./PR-158-CHECKLIST.md) |
| 후속 PR | [PR-158-FOLLOW-UP-PRS.md](./PR-158-FOLLOW-UP-PRS.md) |
| PR159+ | [PR-158-FOLLOW-UP-ROADMAP.md](./PR-158-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-158-CODEX-REVIEW-SCOPE.md](./PR-158-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-158-STRUCTURE-ANALYSIS.md](./PR-158-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-158-IMPLEMENTATION-PLAN.md](./PR-158-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaFeedbackLoopPanel` |
| 코드 | `lib/ops/beta-feedback-loop.ts` |

## 테스트

| 파일 | 실행 |
| --- | --- |
| `tests/ops/pr158-beta-feedback-loop.test.ts` | `npx tsx --test tests/ops/pr158-*.test.ts` |

**피드백 폼·외부 발송·운영 DB·provider 없음** · `test:e2e` · `test:smoke` **명령 부재**

## 연계

| PR | 문서 |
| --- | --- |
| PR157 | [PR-157-BETA-LAUNCH-DECISION-OPS.md](./PR-157-BETA-LAUNCH-DECISION-OPS.md) |
| PR153 | [PR-153-BETA-USER-NOTICE-PACK-OPS.md](./PR-153-BETA-USER-NOTICE-PACK-OPS.md) |
| PR143 | [PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md](./PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md) |
| PR147 | [PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md](./PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md) |

## 판단 (PR158-A)

| 구분 | 판단 |
| --- | --- |
| Beta Feedback Loop | **Conditional Ready** |
| 비식별화 안전성 | **Ready** |
| 실제 수집 채널(inbox) | **Not Ready** (PR162 후보) |
| Critical(정적) | **0** |

## Codex

**조건부 권장** — Critical/High 피드백 분류·PII·AA metadata-only

# PR-159 — Beta Incident Drill (PR159-A)

**위험도:** High · **성격:** 장애 대응 **리허설 기준** — rollback·공지 발송·DB·provider 없음

## 목적

제한 베타 운영 중 Critical/High 장애 발생 시 운영자 대응 순서·중단·격리·안내·후속 PR 기준을 문서화한다.

## 범위 (PR159-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-159-ENTRY-CONDITIONS.md](./PR-159-ENTRY-CONDITIONS.md) |
| 원칙 | [PR-159-DRILL-PRINCIPLES.md](./PR-159-DRILL-PRINCIPLES.md) |
| 등급표 | [PR-159-SEVERITY-GRADES.md](./PR-159-SEVERITY-GRADES.md) |
| Critical | [PR-159-CRITICAL-SCENARIOS.md](./PR-159-CRITICAL-SCENARIOS.md) |
| High | [PR-159-HIGH-SCENARIOS.md](./PR-159-HIGH-SCENARIOS.md) |
| 대응 흐름 | [PR-159-RESPONSE-FLOW.md](./PR-159-RESPONSE-FLOW.md) |
| 기록 허용/금지 | [PR-159-RECORD-ALLOW-DENY.md](./PR-159-RECORD-ALLOW-DENY.md) |
| 사용자 안내 | [PR-159-USER-NOTICE.md](./PR-159-USER-NOTICE.md) |
| Checklist | [PR-159-DRILL-CHECKLIST.md](./PR-159-DRILL-CHECKLIST.md) |
| 후속 PR | [PR-159-FOLLOW-UP-PRS.md](./PR-159-FOLLOW-UP-PRS.md) |
| PR160+ | [PR-159-FOLLOW-UP-ROADMAP.md](./PR-159-FOLLOW-UP-ROADMAP.md) |
| Codex | [PR-159-CODEX-REVIEW-SCOPE.md](./PR-159-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-159-STRUCTURE-ANALYSIS.md](./PR-159-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-159-IMPLEMENTATION-PLAN.md](./PR-159-IMPLEMENTATION-PLAN.md) |
| UI | `AdminBetaIncidentDrillPanel` |
| 코드 | `lib/ops/beta-incident-drill.ts` |

## 테스트

`npx tsx --test tests/ops/pr159-*.test.ts`

**rollback·공지 발송·운영 DB 없음** · `test:e2e` · `test:smoke` **명령 부재**

## 연계

PR158 · PR157 · PR143 · PR154 · PR155 · PR156

## 판단 (PR159-A)

| 구분 | 판단 |
| --- | --- |
| Incident Drill | **Conditional Ready** |
| Critical 대응 | **Ready** |
| Live drill 실행 | **Not Ready** |
| Critical(정적) | **0** |

## Codex

**조건부 권장**

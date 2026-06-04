# PR-143 — Support & Incident Playbook (PR143-A)

**위험도:** High · **성격:** 운영 기준 — **문의 폼·티켓 DB·외부 발송 없음**

## 목적

[PR-141](./PR-141-LIMITED-BETA-OPS.md) 제한 베타·[PR-142](./PR-142-TERMS-PRIVACY-PLAN-OPS.md) 약관·개인정보 준비 이후, 외부 사용자가 문제를 발견했을 때 **접수·분류·대응·중단·rollback·공지** 기준을 문서화한다.

## 범위 (PR143-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 지원 범위 | [PR-143-SUPPORT-SCOPE.md](./PR-143-SUPPORT-SCOPE.md) |
| 심각도·대응 단계 | [PR-143-SEVERITY-AND-RESPONSE.md](./PR-143-SEVERITY-AND-RESPONSE.md) |
| Critical 즉시 조치 | [PR-143-CRITICAL-RESPONSE.md](./PR-143-CRITICAL-RESPONSE.md) |
| 사용자 공지 문구 | [PR-143-USER-NOTICE-COPY.md](./PR-143-USER-NOTICE-COPY.md) |
| 오류 제보 양식 후보 | [PR-143-REPORT-FORM-TEMPLATE.md](./PR-143-REPORT-FORM-TEMPLATE.md) |
| Rollback / Disable | [PR-143-ROLLBACK-DISABLE.md](./PR-143-ROLLBACK-DISABLE.md) |
| 운영 기록 | [PR-143-OPS-RECORD-RULES.md](./PR-143-OPS-RECORD-RULES.md) |
| 구조 분석 | [PR-143-STRUCTURE-ANALYSIS.md](./PR-143-STRUCTURE-ANALYSIS.md) |
| 구현 계획 | [PR-143-IMPLEMENTATION-PLAN.md](./PR-143-IMPLEMENTATION-PLAN.md) |
| UI | `AdminSupportIncidentPlaybookPanel` |
| 코드 | `lib/ops/support-incident-playbook.ts` |

## 비범위 (구현 금지)

- 문의/티켓 폼 UI · `Ticket`/`Incident` Prisma model · DB migration
- 이메일·SMS·카카오·Slack·webhook · cron/queue/scheduler
- 외부 헬프데스크 · 운영 DB·role·allowlist·bulk 실제 변경

## 연계 (기존 심각도·이슈)

- [PR-129-OPERATIONAL-ISSUES-OPS.md](./PR-129-OPERATIONAL-ISSUES-OPS.md) — OPS Registry·워크플로
- [PR-129-ISSUE-SEVERITY.md](./PR-129-ISSUE-SEVERITY.md) — 심각도 **정본**
- [PR-129-PII-AND-SENSITIVE-DATA-RULES.md](./PR-129-PII-AND-SENSITIVE-DATA-RULES.md)
- [PR-141-BETA-HALT-CRITERIA.md](./PR-141-BETA-HALT-CRITERIA.md)
- [PR-115-LIMITED-RELEASE-FINAL-OPS.md](./PR-115-LIMITED-RELEASE-FINAL-OPS.md)
- [PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md](./PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md)

## 연계 (후속)

- [PR-144-PUBLIC-LANDING-SAFETY-OPS.md](./PR-144-PUBLIC-LANDING-SAFETY-OPS.md) — public landing 문구·CTA 검수

## Codex

public visibility·권한·개인정보·Answer Assistant·rollback — **제한검수 권장** (본 PR은 문서·관리자 안내만).

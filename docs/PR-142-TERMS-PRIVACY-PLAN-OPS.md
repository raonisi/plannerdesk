# PR-142 — Terms & Privacy Drafting Plan (PR142-A)

**위험도:** High · **성격:** 준비 계획 — **약관/개인정보 확정·동의·수집 없음**

## 목적

[PR-141](./PR-141-LIMITED-BETA-OPS.md) 제한 베타 전 **약관·개인정보·책임 고지** 준비 항목을 정리하고, **법무 검토**와 **개발 구현**을 분리한다.

## 범위 (PR142-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 약관 준비 | [PR-142-TERMS-PREP-SCOPE.md](./PR-142-TERMS-PREP-SCOPE.md) |
| 개인정보 준비 | [PR-142-PRIVACY-PREP-SCOPE.md](./PR-142-PRIVACY-PREP-SCOPE.md) |
| 제한 베타 고지 | [PR-142-LIMITED-BETA-NOTICE.md](./PR-142-LIMITED-BETA-NOTICE.md) |
| 데이터 책임 | [PR-142-DATA-LIABILITY-NOTICE.md](./PR-142-DATA-LIABILITY-NOTICE.md) |
| 법무 검토 | [PR-142-LEGAL-REVIEW-ITEMS.md](./PR-142-LEGAL-REVIEW-ITEMS.md) |
| 구조 | [PR-142-STRUCTURE-ANALYSIS.md](./PR-142-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-142-IMPLEMENTATION-PLAN.md](./PR-142-IMPLEMENTATION-PLAN.md) |
| UI | `AdminTermsPrivacyPlanPanel` |
| 코드 | `lib/ops/terms-privacy-plan.ts` |

## 비범위 (PR142-B)

- 확정 약관·확정 개인정보처리방침 · 동의 플로우 → [PR-142-B-LEGAL-PUBLICATION-DESIGN.md](./PR-142-B-LEGAL-PUBLICATION-DESIGN.md)

## 연계

- [PR-140-EXTERNAL-RELEASE-READINESS-OPS.md](./PR-140-EXTERNAL-RELEASE-READINESS-OPS.md)
- [PR-141-BETA-USER-COPY.md](./PR-141-BETA-USER-COPY.md)
- [PR-133-PII-STORAGE-RULES.md](./PR-133-PII-STORAGE-RULES.md)
- [PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md](./PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md)

## 연계 (후속)

- [PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md](./PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md) — 고객지원·장애 대응 (문의 폼·티켓 DB 없음)

## Codex

개인정보·약관·외부 공개·AA·결제 — **제한검수 권장**.

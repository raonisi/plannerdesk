# PR-147 — Data Responsibility Notice (PR147-A)

**위험도:** High~Critical · **성격:** 데이터 책임 고지 **기준·문서·안전 문구 보완** — 데이터 대량 수정·자동 검증·크롤러 없음

## 목적

외부 제한 베타 전, 보험사·청구서류·업무 링크·지식·검색·Answer Assistant에 대한 **최신성·공식 출처·책임 범위**를 사용자에게 명확히 안내한다.

## 범위 (PR147-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 보험사 | [PR-147-DIRECTORY-NOTICE.md](./PR-147-DIRECTORY-NOTICE.md) |
| 청구서류 | [PR-147-CLAIM-NOTICE.md](./PR-147-CLAIM-NOTICE.md) |
| 업무 링크 | [PR-147-WORK-LINKS-NOTICE.md](./PR-147-WORK-LINKS-NOTICE.md) |
| 지식 | [PR-147-KNOWLEDGE-NOTICE.md](./PR-147-KNOWLEDGE-NOTICE.md) |
| 검색 | [PR-147-SEARCH-NOTICE.md](./PR-147-SEARCH-NOTICE.md) |
| Answer Assistant | [PR-147-ANSWER-ASSISTANT-NOTICE.md](./PR-147-ANSWER-ASSISTANT-NOTICE.md) |
| 공통 문구 | [PR-147-COMMON-NOTICE-PHRASES.md](./PR-147-COMMON-NOTICE-PHRASES.md) |
| 오류 제보 | [PR-147-ERROR-REPORT-LINK.md](./PR-147-ERROR-REPORT-LINK.md) |
| 체크리스트 | [PR-147-DATA-RESPONSIBILITY-CHECKLIST.md](./PR-147-DATA-RESPONSIBILITY-CHECKLIST.md) |
| 구조 | [PR-147-STRUCTURE-ANALYSIS.md](./PR-147-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-147-IMPLEMENTATION-PLAN.md](./PR-147-IMPLEMENTATION-PLAN.md) |
| UI | `AdminDataResponsibilityNoticePanel` |
| 코드 | `lib/ops/data-responsibility-notice.ts` |
| public | `DataResponsibilityInlineNotice` (directory, claim, disclosure, knowledge, search) |

## 비범위

- 보험사·청구·링크·지식 **데이터 대량 수정**
- 자동 공식 출처 검증 · 크롤러 · 외부 API · source verification DB
- DB migration · Prisma schema 변경
- 법적 책임 제한 문구 **확정** (법무 검토 필요로 표시)
- 오류 제보 폼 신규 구현
- Answer Assistant 공개 범위·allowlist 확대
- public visibility guard 약화

## 연계

- [PR-140](./PR-140-EXTERNAL-RELEASE-READINESS-OPS.md) 외부 공개/유료화 분리
- [PR-141](./PR-141-LIMITED-BETA-OPS.md) 제한 베타 범위
- [PR-142](./PR-142-DATA-LIABILITY-NOTICE.md) 데이터 책임 초안
- [PR-143](./PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md) 고객지원·장애·운영 이슈
- [PR-144](./PR-144-PUBLIC-LANDING-SAFETY-OPS.md) landing 안전성
- [PR-146](./PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md) 베타 신청 (PII 없음)

## 판단

- **Conditional Go** — public inline 고지 반영, 법무·UI polish는 후속

## Codex

보험금 문구·PII·public visibility·Answer Assistant — **제한검수 권장**.

# PR-161 — Data Freshness Review (PR161-A)

**위험도:** High · **성격:** 데이터 **최신성 점검 기준** — 운영 DB 수정·크롤·동기화·API 없음

## 목적

제한 베타 확대 전 보험사 디렉터리, 청구서류, 업무 링크, 지식 아카이브, public 검색의 최신성·공식 출처·검수 상태 점검 기준을 문서화한다.

## 범위 (PR161-A)

| 문서 | 내용 |
| --- | --- |
| 허브 | 본 문서 |
| 진입 | [PR-161-ENTRY-CONDITIONS.md](./PR-161-ENTRY-CONDITIONS.md) |
| 공식 출처 | [PR-161-OFFICIAL-SOURCE-PRIORITY.md](./PR-161-OFFICIAL-SOURCE-PRIORITY.md) |
| 보험사 | [PR-161-INSURER-DIRECTORY-CHECK.md](./PR-161-INSURER-DIRECTORY-CHECK.md) |
| 청구서류 | [PR-161-CLAIM-DOCUMENT-CHECK.md](./PR-161-CLAIM-DOCUMENT-CHECK.md) |
| 업무 링크 | [PR-161-WORK-LINK-CHECK.md](./PR-161-WORK-LINK-CHECK.md) |
| 지식 | [PR-161-KNOWLEDGE-ARCHIVE-CHECK.md](./PR-161-KNOWLEDGE-ARCHIVE-CHECK.md) |
| public 검색 | [PR-161-PUBLIC-SEARCH-CHECK.md](./PR-161-PUBLIC-SEARCH-CHECK.md) |
| 오류 등급 | [PR-161-DATA-ERROR-GRADES.md](./PR-161-DATA-ERROR-GRADES.md) |
| public 보류 | [PR-161-PUBLIC-HOLD-CRITERIA.md](./PR-161-PUBLIC-HOLD-CRITERIA.md) |
| 후속 PR | [PR-161-FOLLOW-UP-PRS.md](./PR-161-FOLLOW-UP-PRS.md) |
| PR162+ | [PR-161-FOLLOW-UP-ROADMAP.md](./PR-161-FOLLOW-UP-ROADMAP.md) |
| Checklist | [PR-161-FRESHNESS-CHECKLIST.md](./PR-161-FRESHNESS-CHECKLIST.md) |
| Codex | [PR-161-CODEX-REVIEW-SCOPE.md](./PR-161-CODEX-REVIEW-SCOPE.md) |
| 구조 | [PR-161-STRUCTURE-ANALYSIS.md](./PR-161-STRUCTURE-ANALYSIS.md) |
| 계획 | [PR-161-IMPLEMENTATION-PLAN.md](./PR-161-IMPLEMENTATION-PLAN.md) |
| UI | `AdminDataFreshnessReviewPanel` |
| 코드 | `lib/ops/data-freshness-review.ts` |

## 테스트

`npx tsx --test tests/ops/pr161-*.test.ts`

**운영 DB·크롤·동기화·대량 수정 없음** · metadata-only · `test:e2e` · `test:smoke` **명령 부재**

## 연계

PR160 · PR158 · PR159 · PR147 · PR154

## 판단 (PR161-A)

| 구분 | 판단 |
| --- | --- |
| Freshness Review | **Conditional Ready** |
| Live data audit | **Not Ready** |
| 공식 출처 정책 | **Ready** |
| public 보류 정책 | **Ready** |
| Critical(정적) | **0** |

## Codex

**조건부 권장**

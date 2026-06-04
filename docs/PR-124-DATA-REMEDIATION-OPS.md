# PR-124 — 보험사/청구서류 데이터 보완

**선행:** [PR-119](./PR-119-OPERATIONAL-DATA-QUALITY-OPS.md) → [PR-122](./PR-122-DATA-FRESHNESS-OPS.md) → [PR-123](./PR-123-ADMIN-OPERATIONS-MANUAL.md) → **PR124**

**목적:** 점검표·이슈표에서 **공식 출처 또는 운영자 확인이 완료된 항목만** fixture/seed/docs에 **최소 반영**. 운영 DB·bulk·guard 변경 **없음**.

| 문서 | 용도 |
| --- | --- |
| [PR-124-DATA-REMEDIATION-CLASSIFICATION.md](./PR-124-DATA-REMEDIATION-CLASSIFICATION.md) | 보완 후보 분류표 |
| [PR-124-DATA-CHANGE-LOG.md](./PR-124-DATA-CHANGE-LOG.md) | 반영 변경 기록 |
| [PR-124-PUBLIC-VISIBILITY-REVIEW.md](./PR-124-PUBLIC-VISIBILITY-REVIEW.md) | visibility 확인표 |
| [PR-122-PR124-HANDOFF-CRITERIA.md](./PR-122-PR124-HANDOFF-CRITERIA.md) | 이관 기준 |

**정적 검증:** `tests/ops/pr124-data-remediation.test.ts`

---

## PR124 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| 운영 DB | **미접근** |
| fixture 반영 | **1건** (`hanwha-general` systemUrl HTTPS) |
| bulk / migrate / Auth | **없음** |
| 공식 출처 미확인 항목 | **미수정** (보류·정보 부족 문서화) |

---

## 반영 요약

| # | 영역 | 항목 | 분류 |
| ---: | --- | --- | --- |
| 1 | 보험사 | `hanwha-general` systemUrl HTTPS | **반영** |
| 2–12 | 보험사·청구·링크·메타 | PR119/122 잔여 | **보류 / 정보 부족** |

---

## 금지 (재확인)

- 공식 출처 없는 URL·팩스·번호 수정
- `lastVerifiedAt` 임의 기입 (검수 완료 전)
- insurerId 일괄 연결 (공통서류 후보 35건)
- 중복 보험사 병합 (운영자 승인 전)
- visibility guard 약화

**Codex:** 기본 생략 — 대량 수정·visibility 변경 시 후보.

# PR-122 — 운영 데이터 최신성 점검 루틴

**목적:** 보험사·청구·링크·팩스·헬프데스크·지식 데이터가 **오래되거나 잘못된 채 방치되지 않도록** 운영자 **수동 점검 루틴**을 문서화한다. **데이터 수정·자동화·DB 접근 없음.**

**선행:** PR119 (품질 QA) → PR121 (피드백) → **PR122** → [PR123 (관리자 매뉴얼)](./PR-123-ADMIN-OPERATIONS-MANUAL.md) → PR124 (데이터 보완)

| 문서 | 용도 |
| --- | --- |
| [PR-122-DATA-OPERATIONS-STRUCTURE.md](./PR-122-DATA-OPERATIONS-STRUCTURE.md) | 기존 구조·PR119 연계 |
| [PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md](./PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md) | 점검 대상·주기 |
| [PR-122-DATA-STATUS-VALUES.md](./PR-122-DATA-STATUS-VALUES.md) | 상태값 6종 |
| [PR-122-OFFICIAL-SOURCE-CRITERIA.md](./PR-122-OFFICIAL-SOURCE-CRITERIA.md) | 공식 출처 기준 |
| [PR-122-FRESHNESS-CHECK-SHEET.md](./PR-122-FRESHNESS-CHECK-SHEET.md) | 운영자 점검표 |
| [PR-122-PR124-HANDOFF-CRITERIA.md](./PR-122-PR124-HANDOFF-CRITERIA.md) | PR124 이관 |

**후속 수정:** [PR-124-DATA-REMEDIATION-OPS.md](./PR-124-DATA-REMEDIATION-OPS.md)

---

## PR122 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| 운영 DB | **미접근** |
| 데이터 수정 | **없음** |
| fixture 기준 | 49 보험사 · 35 청구 후보 · visibility tests pass |
| 자동 URL 점검 | **없음** (후속 backlog) |

---

## 운영자 Quick Start

1. [주기](./PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md) 확인 (월/분기)
2. [점검표](./PR-122-FRESHNESS-CHECK-SHEET.md) 행 갱신
3. [상태값](./PR-122-DATA-STATUS-VALUES.md) 기입
4. 「수정 필요」→ [PR124 이관](./PR-122-PR124-HANDOFF-CRITERIA.md)

---

## 금지

- 공식 출처 없이 최신·정확 단정
- bulk·운영 DB 대량 수정

**Codex:** 기본 생략 — Critical(public visibility) 잔존 시만 후보.

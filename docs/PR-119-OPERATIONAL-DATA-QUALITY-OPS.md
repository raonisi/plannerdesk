# PR-119 — 운영 데이터 품질 QA

**목적:** 보험사·청구서류·지식·업무 링크·Answer Assistant 관련 **데이터 정확성·최신성·누락·중복·검수 상태**를 점검하고, 운영자가 안전하게 수정할 **이슈표**를 만든다. **운영 DB 접근·대량 수정 없음.**

**선행:** PR118 (사용자 피드백) → **PR119** → [PR-120-PRE-LAUNCH-FINAL-OPS.md](./PR-120-PRE-LAUNCH-FINAL-OPS.md) → [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md)

| 문서 | 용도 |
| --- | --- |
| [PR-119-DATA-STRUCTURE-ANALYSIS.md](./PR-119-DATA-STRUCTURE-ANALYSIS.md) | 스키마·fetch·guard·fixture 출처 |
| [PR-119-DATA-QUALITY-QA-CHECKLIST.md](./PR-119-DATA-QUALITY-QA-CHECKLIST.md) | 영역별 점검표·결과 |
| [PR-119-DATA-ISSUES-AND-SOURCES.md](./PR-119-DATA-ISSUES-AND-SOURCES.md) | 이슈 분류·공식 출처 확인 필요 |

**정적 점검:** `tests/ops/pr119-data-quality.test.ts` (`lib/content/insurers.ts` 등 fixture, DB 미연결)

---

## PR119 Cursor 세션 (2026-06-03)

| 항목 | 결과 |
| --- | --- |
| 운영 DB 조회 | **미실행** (금지) |
| fixture 정적 점검 | `insurerDirectoryEntries` 49건, `claimDocumentCandidateFallback` 35건, `KNOWLEDGE_SEED_ITEMS` 10건 |
| public visibility guard | 기존 `public-visibility.test.ts` **pass** |
| 운영 데이터 수정 | **없음** |

---

## 금지

- 운영 DB·대량 데이터 수정·공식 출처 없는 최신성 단정
- schema/migration·Auth·allowlist·bulk 실행·visibility 약화

---

## Antigravity 검수

- [ ] QA만 수행·데이터 미수정
- [ ] 공식 출처 확인 항목 분리
- [ ] Critical(public 노출) guard 유지 확인
- [ ] PR120 이관 명확

**Codex:** 기본 생략. [PR-119-DATA-ISSUES-AND-SOURCES.md](./PR-119-DATA-ISSUES-AND-SOURCES.md) 참조.

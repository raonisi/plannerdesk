# PR-124 — 보험사/청구서류 데이터 보완 (예정)

**선행:** [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md) · [PR-123-ADMIN-OPERATIONS-MANUAL.md](./PR-123-ADMIN-OPERATIONS-MANUAL.md) → [PR-122-PR124-HANDOFF-CRITERIA.md](./PR-122-PR124-HANDOFF-CRITERIA.md)

**목적:** 점검표에서 **「수정 필요」**로 확정된 항목만 **승인된 범위**로 수정한다.

---

## 범위 (예상)

- 보험사 링크·번호·`lastVerifiedAt`
- `claimPageUrl`·청구서류 insurer 연결
- import dry-run → apply (**별도 승인**)

---

## PR124에서 하지 않는 것 (기본)

- schema/migration (별도 PR)
- visibility guard 약화
- bulk 무검수 공개
- allowlist·Auth 변경

---

## 상태

**정보 부족** — PR122 점검표 PR124 티켓 확정 후 착수.

---

## Antigravity (PR124 시)

- [ ] 항목별 공식 출처 증빙
- [ ] diff 최소·public guard 유지
- [ ] bulk·migrate 분리 승인

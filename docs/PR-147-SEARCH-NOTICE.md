# PR-147 — 통합 검색 책임 고지

- 검수·**공개 완료** 정보만 검색 (`searchPublicContent` + visibility guard).
- 미검수·비공개·draft admin 데이터는 결과에 포함하지 않음.
- 보험금 지급 판단·개인정보 검색은 제공하지 않음.

public: `/search` — `PUBLIC_INLINE_NOTICE.search` + form 하단 PII 안내.

미검수 노출은 **Critical** → [PR-147-ERROR-REPORT-LINK.md](./PR-147-ERROR-REPORT-LINK.md) · PR-143.

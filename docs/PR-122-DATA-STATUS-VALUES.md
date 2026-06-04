# PR-122 — 데이터 최신성 상태값

운영자·점검표 전용. **public UI에 내부 상태값 과다 노출 금지** (PR112 힌트 수준 유지).

---

| 상태 | 의미 | 처리 기준 |
| --- | --- | --- |
| **정상** | 공식 출처 또는 내부 승인 기준으로 확인 완료 | 유지 · `lastVerifiedAt` 갱신 |
| **확인 필요** | 오래됨·출처 미확인·주기 경과 | 운영자 확인 (다음 주기 전) |
| **수정 필요** | 오류·만료·오탈자·누락 확인 | **PR124** 또는 별도 데이터 PR |
| **보류** | 공식 출처 불명·확인 불가 | public 유지 여부 내부 검토 |
| **비공개** | public 부적합 | `isPublished` false 유지 |
| **검수 대기** | 등록 후 미검수 | public 미노출 (guard) |

---

## PR119 fixture 초기 매핑 (정적)

| 대상 | PR122 초기 상태 | 비고 |
| --- | --- | --- |
| 보험사 49건 `lastVerifiedAt` | **확인 필요** | PR119 #2 |
| `sourceNote` 재검수 | **확인 필요** | PR119 #3 |
| `claimPageUrl` null | **확인 필요** | 정책·PR124 |
| `hanwha-general` HTTP systemUrl | **수정 필요** | PR124 후보 |
| 청구 fallback insurer null | **수정 필요** | PR124 #7 |
| public visibility guard | **정상** | tests pass |

---

## 상태 전이 (요약)

```text
검수 대기 → 확인 필요 → 정상
         ↘ 수정 필요 → PR124 → 정상
         ↘ 보류 / 비공개
```

**Critical(public 노출):** 즉시 **비공개** + 긴급 PR — PR124 아님.

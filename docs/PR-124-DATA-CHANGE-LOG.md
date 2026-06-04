# PR-124 — 데이터 변경 기록

**원칙:** 확인 근거 없는 변경 **금지**. 본 PR124 Cursor 세션 반영분만 기록.

---

| 번호 | 영역 | 변경 전 | 변경 후 | 확인 근거 | 영향 범위 |
| ---: | --- | --- | --- | --- | --- |
| 1 | 보험사 | `hanwha-general` `systemUrl`: `http://portal.hwgeneralins.com/` | `https://portal.hwgeneralins.com/` | 동일 호스트 HTTPS HEAD **200** (PR124 세션); `officialWebsiteUrl` 동일 조직 도메인 | fixture `lib/content/insurers.ts` only; visibility·publish **무변경** |

---

## 미반영 (근거 부족)

| 영역 | 항목 | 사유 |
| --- | --- | --- |
| 보험사 | claimPageUrl, lastVerifiedAt, sourceNote | 운영자·공식 출처 검수 미완 |
| 보험사 | 중복 5쌍 | 병합 승인 없음 |
| 보험사 | 팩스·CS·대부분 URL | 공식 CS/청구안내 미대조 |
| 청구서류 | insurerId 연결 | 공통서류 후보 — 보험사별 import 별도 |
| 청구서류 | 서류명·구분 | 보험사 공식 기준 미대조 |

---

## 후속 (운영자)

1. [PR-122-FRESHNESS-CHECK-SHEET.md](./PR-122-FRESHNESS-CHECK-SHEET.md) #4 `hanwha-general` → **확인 필요** 유지 (전산 외 항목)
2. 중복 보험사 쌍 — admin에서 canonical id 결정
3. `lina-life` claimFormUrl — 공식 경로 확인 후 PR124-R2 또는 별도 티켓

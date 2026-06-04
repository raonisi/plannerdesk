# PR-123 — 청구서류 운영 기준

**Admin 경로:** `/admin/claim-documents`  
**Public:** `/claim-documents`

---

## 단계별 기준

| 단계 | 기준 | 확인 항목 |
| --- | --- | --- |
| **등록** | 보험사와 연결된 서류 기준으로 등록 | `insurerId` 연결, 서류명, 상황 구분, 필요/선택 여부 |
| **검수** | 서류명·상황·공개 상태 확인 | 중복, 누락, 공식 청구안내와 대조 |
| **공개** | 공개 조건 충족 시 public | `isPublished` + `verificationStatus` (verified / needs_review) |
| **보류** | 출처 불명·누락 의심·중복 의심 | 보류 사유, **unpublished** 유지 |
| **수정** | 공식 출처 확인 후 | 변경 전후·확인일 기록 → PR124 |
| **비공개** | 부정확 또는 검수 전 | `isPublished=false`, public 재확인 |

---

## 문구 기준

**금지 표현 (예):**

- 「보험금 확정」, 「무조건 필요」, 「즉시 지급」, 「100% 청구 가능」
- 지급 여부·금액·면책 **확정**

**권장:**

- 「○○ 상황에서 **확인하는** 서류」
- 「보험사 **청구 안내 기준**으로 확인」
- 「상품·약관에 따라 **다를 수 있음**」

PlannerDesk는 **청구 가능성·지급 판단·손해사정을 하지 않음** — `lib/admin/safety-copy.ts`

---

## 보험사 연결

| 상황 | 처리 |
| --- | --- |
| `insurerId` null (fallback 후보) | Admin 등록 시 **반드시 연결** — PR119 #7 |
| 보험사 미공개 | 연결 청구서류도 public 노출 정책 재확인 |
| 상품별 차이 | `sourceNote`에 상품·상황 범위 명시 |

---

## 공개 전 체크

- [ ] 보험사 **공식 청구서류 안내**와 대조
- [ ] 서류명 오탈자·중복 없음
- [ ] payout·확정 문구 없음
- [ ] draft unpublished on public `/claim-documents`

**연계:** [PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md](./PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md) (청구서류 **High**)

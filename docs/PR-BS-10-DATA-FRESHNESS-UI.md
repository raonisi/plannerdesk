# PR-BS-10 Data Freshness UI Implementation

**위험도:** Medium · **성격:** PR-BS-02 설계 기준의 public UI 구현·정책 보정 — schema·데이터 수집 변경 없음

선행: [PR-BS-02 Data Freshness UX](./PR-BS-02-DATA-FRESHNESS-UX.md)

---

## 1. 목적

보험사 디렉터리, 청구서류, public 검색 결과에서 **최근 확인일·공식 출처·검수 상태**를 사용자가 오해 없이 확인할 수 있도록 UI를 구현한다.

---

## 2. 표시 정책 (PR-BS-10 확정)

| 조건 | 표시 |
| --- | --- |
| `lastVerifiedAt` 또는 `reviewedAt` 있음 | 최근 확인: YYYY.MM.DD |
| `officialSourceUrl` 있음 | 공식 출처 확인 (링크) |
| `officialSourceUrl` 없음 | 공식 출처 확인 필요 (링크 없음) |
| 확인일 없음 | 확인일 정보 부족 + 최신성 확인 필요 (non-compact) |
| invalid date | 확인일 정보 부족 |

**중요:** `claimFormUrl`, `claimPageUrl` 등 보조 URL은 **공식 출처 링크로 표시하지 않는다.** PDF 열기·청구안내 버튼 등 별도 액션으로만 사용한다.

---

## 3. 구현 위치

| 영역 | 파일 |
| --- | --- |
| Helper | `lib/public/data-freshness.ts` |
| UI | `components/content/data-freshness-meta.tsx` |
| 보험사 디렉터리 | `components/directory/insurer-action-card.tsx` |
| 청구서류 (DB + PDF) | `components/claim-documents/claim-form-list-item.tsx` |
| 검색 | `app/search/search-results.tsx`, `lib/search/public.ts` |
| 테스트 | `tests/public/data-freshness.test.ts` |

---

## 4. Public 노출 금지

- admin memo, private memo, internal review note
- raw `verificationStatus` admin 라벨
- secret, token, provider config
- 미검수·비공개 데이터 (기존 `lib/public/*` guard)

---

## 5. 검증

```bash
npm run lint
npm run typecheck
npm run test
npm run test:public
```

schema·migration·package 변경 **없음**.

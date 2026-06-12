# PR-BS-02 Data Freshness UX

**위험도:** Medium · **성격:** 기존 메타데이터의 public 표시 강화 — schema·데이터 수집 변경 없음

선행: [PR-BS-01 Feature Benchmark Report](./PR-BS-01-FEATURE-BENCHMARK-REPORT.md)

---

## 1. 목적

보험사 디렉터리, 청구서류, 검색 결과에서 **최신성·공식 출처·검수 상태**를 사용자가 오해 없이 확인할 수 있도록 UX를 개선한다.

- 새 외부 데이터 수집 **아님**
- `lastVerifiedAt`, `officialSourceUrl`, `sourceUrl` 등 **기존 필드**만 표시
- 날짜·URL **임의 생성 금지**

---

## 2. 표시 기준

| 상태 | 사용자 표시 |
| --- | --- |
| 공식 출처 URL 있음 | 공식 출처 확인 (링크) |
| 최근 검수일 있음 | 최근 확인: YYYY.MM.DD |
| 검수일 없음 | 확인일 정보 부족 |
| 출처 없음 | 공식 출처 확인 필요 |
| 공개 가능하지만 최신성 불명확 | 최신성 확인 필요 |
| 비공개 또는 검수 전 | public 노출 금지 (기존 visibility guard) |

### 금지 문구

`lib/public/data-freshness.ts`의 `DATA_FRESHNESS_FORBIDDEN_PHRASES` 참조.  
예: 최신 정보 100% 보장, 보험금 지급 확정, AI가 최종 판단 등.

---

## 3. 구현 위치

| 영역 | 파일 |
| --- | --- |
| Helper | `lib/public/data-freshness.ts` |
| UI | `components/content/data-freshness-meta.tsx` |
| 보험사 디렉터리 | `components/directory/insurer-action-card.tsx` |
| 청구서류 | `components/claim-documents/claim-form-list-item.tsx` |
| 검색 | `app/search/search-results.tsx`, `lib/search/public.ts` |
| 테스트 | `tests/public/data-freshness.test.ts` |

구현 완료: [PR-BS-10 Data Freshness UI](./PR-BS-10-DATA-FRESHNESS-UI.md)

---

## 4. Public 노출 금지

- admin memo, private memo, internal review note
- internal status raw value (`verificationStatus` 등 admin 라벨)
- secret, token, provider config
- 미검수·비공개 데이터 (기존 `lib/public/*` guard 유지)

---

## 5. Admin 검수 필요 항목

- `lastVerifiedAt` 갱신
- `officialSourceUrl` / 공식 링크 확인
- `verificationStatus` → verified 전환
- `isPublished` 공개 전 최종 검수

---

## 6. 후속 PR 후보

| PR | 목적 |
| --- | --- |
| PR-BS-03 | 통합 검색 필터·빈 상태 UX |
| PR-BS-04 | 보험사 업무 링크 검수 workflow |
| PR-BS-05 | 오류 제보·PII 차단 강화 |

---

## 7. 검증

```bash
npm run lint
npm run typecheck
npm run test
```

schema·migration·package 변경 **없음**.

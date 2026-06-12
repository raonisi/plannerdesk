# PR-BS-12 Correction Flow PII Guard Implementation

**위험도:** Medium · **성격:** 오류 제보·수정 요청 PII 차단 구현·보강 — schema 변경 없음

선행: [PR-BS-05 Correction Flow Hardening](./PR-BS-05-CORRECTION-FLOW-HARDENING.md), [PR-BS-10](./PR-BS-10-DATA-FRESHNESS-UI.md), [PR-BS-11](./PR-BS-11-PUBLIC-SEARCH-FILTER-UI.md)

---

## 1. 목적

오류 제보·수정 요청에서 **고객 PII·민감정보·상담 원문**이 입력·저장되지 않도록 UI·validation·테스트를 PR-BS-12 기준으로 정렬한다.

---

## 2. 구현 범위

| 포함 | 제외 |
| --- | --- |
| `CORRECTION_PII_BLOCKLIST` SSOT | schema·migration |
| Dialog 안내·compact PII notice | 첨부 업로드 |
| Client/server keyword validation 보강 | 제보 원문 public 노출 |
| Public visibility static tests | 완벽 PII 탐지기 |

---

## 3. 필수 안내

- 고객 PII·상담 원문 입력 금지
- 공식 출처 URL 권장
- 관리자 검수 후 반영
- 보험금·청구 가능성 **비확정**

`CORRECTION_COMPACT_PII_NOTICE` — 짧은 UI 요약.

---

## 4. Validation

| 계층 | 동작 |
| --- | --- |
| Client | `hasClientSensitiveSignal` → 제출 비활성 + 경고 |
| Server | `validateCorrectionSubmit` → reason metadata만 반환 |
| Form | `FORBIDDEN_FORM_FIELD_NAMES` → PII 필드명 거부 |

차단 시 **원문 로그 없음**.

---

## 5. Public 노출

- 제보 다이얼로그: public/planner ✅
- 제보 원문·admin memo: public ❌
- Admin 검수: `/admin/corrections` only

---

## 6. 파일

| 파일 | 역할 |
| --- | --- |
| `lib/correction-request/pii-guard.ts` | blocklist·topic·금지 UI |
| `lib/correction-request/validation.ts` | PII scan |
| `components/directory/correction-request-dialog.tsx` | public UX |
| `tests/public/correction-flow-*.test.ts` | PII·copy regression |
| `tests/public/correction-public-visibility.test.ts` | public 노출 guard |

---

## 7. 검증

```bash
npm run lint
npm run typecheck
npm run test
npm run test:public
```

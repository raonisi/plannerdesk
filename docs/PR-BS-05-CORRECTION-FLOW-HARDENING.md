# PR-BS-05 Correction Flow Hardening

**위험도:** Medium · **성격:** 오류 제보·수정 요청 UX·PII 차단 강화 — schema·데이터 수집 변경 없음

선행: [PR-BS-04 Official Work Link Review](./PR-BS-04-OFFICIAL-WORK-LINK-REVIEW.md), [PR-168 Data Correction Workflow](./PR-168-DATA-CORRECTION-WORKFLOW-OPS.md)

---

## 1. 목적

설계사·운영자가 **보험사 링크·청구서류·업무 정보 오류**를 제보할 수 있게 하되, **고객 PII·민감정보·상담 원문**이 입력·저장되지 않도록 1차 안전장치를 강화한다.

---

## 2. 이번 PR의 범위

| 포함 | 제외 |
| --- | --- |
| `CorrectionRequestDialog` 안내·PII 경고 copy | 고객지원 시스템 전체 구현 |
| Client/server PII keyword·pattern validation 보강 | 외부 사이트 데이터 수집 |
| `pii-guard.ts` topic·금지 UI 문구 SSOT | DB schema 변경 |
| `PublicErrorReportNotice` / PR-168 연계 copy | PR-177 운영 인박스 구현 |
| 단위·static 테스트 | 완벽한 PII 탐지기 |

---

## 3. 이번 PR에서 하지 않는 것

- 보험사 링크·번호·카드납 데이터 **추가**
- schema·migration·seed
- Auth/RBAC·public visibility 변경
- 첨부 파일 업로드 기능
- 제보 원문 public 노출

---

## 4. 허용 입력 항목

`CORRECTION_ALLOWED_REPORT_TOPICS` — 전산·고객센터·팩스·청구·공시·카드납·최신성 등 **운영 메타** 수준.

---

## 5. 입력 금지 항목

`CORRECTION_PROHIBITED_INPUT_TOPICS` 및 `validation.ts` 패턴 — 고객명·주민번호·연락처·계약·병력·진단·상담 원문·이미지·secret/token 등.

---

## 6. PII 차단 UX 기준

필수 안내 (`CORRECTION_SUBMIT_COPY`):

- 고객 PII·상담 원문 입력 금지
- 공식 출처 URL 권장
- 관리자 검수 후 반영
- 보험금·청구 가능성 **비확정**

금지 UI 문구: `CORRECTION_FORBIDDEN_UI_PHRASES`

---

## 7. Validation 기준

| 계층 | 파일 |
| --- | --- |
| Client | `hasClientSensitiveSignal` — 제출 버튼 비활성 |
| Server | `validateCorrectionSubmit` — pattern·keyword·URL spam |
| Form | `FORBIDDEN_FORM_FIELD_NAMES` — PII 필드명 거부 |

차단 시 **원문 로그 없음** — metadata reason만 반환.

---

## 8. 저장/처리 metadata 기준

`CorrectionRequest` 저장 필드(현행): `targetType`, `targetId`, `requestType`, `title`, `message`, `status`, `containsSensitiveData`, `redactionRequired`.

PII 원문·이미지·secret 저장 **금지**. 제보 본문은 운영 검수용 최소 텍스트만(비식별 전제).

---

## 9. Public / Planner / Admin 노출

| 정보 | Public | Planner | Admin |
| --- | --- | --- | --- |
| 제보 버튼/다이얼로그 | ✅ | ✅ | ✅ |
| 제보 원문 | ❌ | ❌/제한 | 검수 |
| PII 차단 상태 | ❌ | 제한 | ✅ |
| 내부 메모 | ❌ | ❌ | ✅ |

---

## 10. Admin 검수 workflow 연계

PR-168 · PR-BS-04 workflow: 공식 출처 대조 → 검수 → `lastVerifiedAt` → publish guard.

---

## 11. 보험 도메인 금지 표현

보험금 지급 확정, 청구 가능 확정, 100% 최신 보장, 손해사정·지급 판단 요청 — validation `payout_judgment` 차단.

---

## 12. No-Go 기준

- PII 원문 저장·public 노출
- 제보로 보험금/청구 확정 유도
- 첨부·이미지 업로드
- schema를 UX PR에 포함
- visibility guard 약화

---

## 13. 후속 PR 후보

| PR | 목적 |
| --- | --- |
| PR-BS-06 | Planner Favorites |
| PR-BS-12 | PII guard 구현·테스트 정렬 — [완료](./PR-BS-12-CORRECTION-FLOW-PII-GUARD.md) |
| PR-177 | Support Operations Design (조건부) |
| PR-168-B~H | Live correction 처리 |

---

## 14. 최종 결론

PR-BS-05는 기존 correction flow를 **재사용·강화**했다. 다음 단계는 운영 검수 SLA(PR-177) 또는 데이터 반영 PR(168 후속)이다.

---

## 구현 파일

| 파일 | 역할 |
| --- | --- |
| `lib/correction-request/pii-guard.ts` | topic·금지 UI SSOT |
| `lib/correction-request/validation.ts` | server/client PII guard |
| `lib/correction-request/constants.ts` | dialog copy |
| `components/directory/correction-request-dialog.tsx` | public UX |
| `app/correction-requests/actions.ts` | server action (기존) |
| `tests/public/correction-flow-*.test.ts` | regression |

# PR-BS-18 Code Search Safety Gate

## 1. 목적

Work Tools의 상병코드(KCD), 수술분류표, 인수예외질환 검색이 **보험금 지급·청구 가능성·보장 확정·Answer Assistant 자동 연결·public 노출**로 확장되지 않도록 정책 helper와 회귀 테스트로 경계를 고정한다.

선행 문서: [PR-BS-09 Code Search Boundary Review](./PR-BS-09-CODE-SEARCH-BOUNDARY-REVIEW.md), [PR-BS-17 Card Payment Info Policy Gate](./PR-BS-17-CARD-PAYMENT-INFO-POLICY-GATE.md).

## 2. 이번 PR의 범위

| 포함 | 비포함 |
| --- | --- |
| `lib/work-tools/code-search-safety.ts` 정책 helper | public 코드 검색 UI/API |
| 금지 표현·입력 유도 상수 보강 | 상병/수술 **코드 데이터 추가** |
| public/AA/Work Tools guard 회귀 테스트 | Answer Assistant 코드 검색 **연결** |
| archive proxy 비공식 출처 문서화 | DB schema/migration |
| `claim-boundary-copy` re-export 정리 | package.json 변경 |

## 3. 이번 PR에서 하지 않는 것

- public 상병·수술·질병 코드 검색
- public search 도메인 추가
- AA prompt에 코드 검색 결과 자동 주입
- 코드 기반 보험금/청구/보장 판단
- 진단서·병력·상담 원문 입력 유도
- Work Tools guard 약화
- Auth/RBAC 변경

## 4. Public 노출 금지 기준

- `isCodeSearchPublicAllowed()` → 항상 `false`
- public search 도메인: insurer, claim_document, knowledge, disclosure, message_template, work_link 만
- public home/directory: 코드 검색 실행 CTA·API 호출 없음
- `/api/work-tools/disease-codes*`, `surgery-codes*`, `diseases*` → `workToolsRouteGuard` (401/403)

## 5. Planner-only Work Tools 기준

- `getWorkToolsAccess` + `workToolsRouteGuard`
- `verified_planner` 또는 admin만 접근
- Tool ids: `disease-code`, `surgery-code`, `disease-search`

## 6. Answer Assistant 연결 No-Go

- AA 모듈에서 Work Tools 코드 API import/호출 금지
- retrieval에 code search 도메인 없음
- `OUTPUT_BLOCKED_PHRASES`로 청구·지급 확정 차단 유지
- usage audit에 prompt/response 원문 필드 없음

## 7. 보험금·청구 가능성 판단 금지 기준

`CODE_SEARCH_FORBIDDEN_PHRASES` — 예: “청구 가능합니다”, “이 코드는 보장됩니다”, “보험금 지급 가능” 등.

허용 안내 (`CODE_SEARCH_ALLOWED_NOTICES`):

- 코드 검색은 설계사 업무 참고용
- 보험금 지급 여부 미확정
- 약관·심사 기준 확인 필요
- 진단서·병력·상담 원문·고객정보 입력 금지

## 8. PII·민감정보 입력 금지 기준

`CODE_SEARCH_FORBIDDEN_INPUT_HINTS`: 진단서, 병력, 상담 원문, 고객명, 주민번호, 계약번호, 보험증권 번호 등 placeholder/유도 문구 금지.

## 9. 공식 출처 기준

| 정보 유형 | 공식 출처 |
| --- | --- |
| 질병분류 코드 | 통계청 KCD, HIRA 등 |
| 수술분류 | 보험사 약관·공시, 수술분류표 |
| 청구서류 | 보험사 공식 청구 안내 |
| 공시·약관 | 협회·보험사 공시 |

## 10. 외부 archive API 처리 기준

- `bohumschool-archive.onrender.com` proxy는 **조사·참고용**
- 공식 KCD/약관/심사 출처 **아님**
- public 또는 확정 근거로 표시하지 않음
- 후속 PR-BS-09A에서 공식 출처 전환 정책 검토

## 11. 테스트 기준

| 테스트 | 경로 |
| --- | --- |
| 정책 gate·guard·archive | `tests/ops/code-search-safety-gate.test.ts` |
| public visibility | `tests/public/code-search-public-visibility.test.ts` |
| Answer Assistant 경계 | `tests/ops/code-search-answer-assistant-boundary.test.ts` |
| copy·입력 유도 | `tests/ops/code-search-copy-safety.test.ts` |

```bash
npx tsx --test tests/ops/code-search-safety-gate.test.ts tests/ops/code-search-answer-assistant-boundary.test.ts tests/ops/code-search-copy-safety.test.ts
npm run test:public
```

## 12. 후속 PR 후보

- PR-BS-09A: KCD·수술분류 공식 출처·proxy 정책
- Admin 검수 후 planner 코드 참고 데이터 품질
- insurer directory와 코드 검색 경계 재검토

## 13. 최종 결론

PR-BS-18은 데이터·public 기능 추가 없이 **planner-only 코드 검색 경계**를 코드·테스트로 고정한다. Antigravity 검수 및 Codex 제한검수를 권장한다.

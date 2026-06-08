# PR-168 — 데이터 수정 workflow 대상 분석

## 도메인

| 영역 | 코드·경로 | workflow |
| --- | --- | --- |
| 보험사 디렉터리 | `lib/ops/data-freshness-review.ts` · `/directory` | 5단계 |
| 청구서류 | 동일 · `/claim-documents` | 5단계 |
| 업무 링크 | 동일 · `/disclosure-links` | 4단계 |
| 지식 아카이브 | 동일 · `/knowledge` | 4단계 |
| public 검색 | `lib/public/visibility.ts` · 검색 UI | 4단계 |

## public visibility

- `lib/public/visibility.ts` — published·검수 상태 기준
- 비공개·미검수 public 노출 → **Critical**

## admin bulk

- PR168에서 bulk policy 변경 없음
- 대량 수정은 별도 승인·후속 PR

## 공식 출처·검수 기록

- PR161 `OFFICIAL_SOURCE_PRIORITY` 재사용
- workflow 문서·요청 템플릿에 확인일·출처 후보만 기록 (PII·원문 금지)

## 실제 수정 필요 여부

| 항목 | PR168-A |
| --- | --- |
| 운영 DB 수정 | **없음** |
| live correction | **후속 PR만** |

**정보 부족:** 운영 환경 live audit 결과는 PR168에서 확정 근거로 사용하지 않음

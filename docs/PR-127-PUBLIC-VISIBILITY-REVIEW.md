# PR-127 — Public visibility 확인

**전제:** `lib/public/*` fetch·WHERE·`is*PubliclyVisible` **코드 변경 없음**. UI만 개선.

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 미검수 보험사 검색 결과 미노출 | 유지 | `isInsurerPubliclyVisible` — `lib/public/insurers.ts` (미변경) |
| 비공개 보험사 검색 결과 미노출 | 유지 | 동일 |
| 미검수 청구서류 검색 결과 미노출 | 유지 | `isClaimDocumentPubliclyVisible` — `lib/public/claim-documents.ts` |
| 비공개 청구서류 검색 결과 미노출 | 유지 | 동일 |
| 검수대기 지식 콘텐츠 검색 결과 미노출 | 유지 | `PUBLIC_KNOWLEDGE_WHERE` / `isKnowledgeArticlePubliclyVisible` |
| 보류/비공개 지식 콘텐츠 검색 결과 미노출 | 유지 | draft·archived·unpublished 차단 (기존 테스트) |
| 관리자 전용 상태값 public 과다 노출 없음 | 유지 | public claim filters에 `draft` 없음 (PR112 test) |
| visibility guard 우회 없음 | 유지 | `lib/search/public.ts` 미변경 |

**빈 결과 안내 문구:** “검수 전·비공개 항목은 표시되지 않습니다” — 노출을 **허용하지 않음**을 설명할 뿐, guard를 완화하지 않음.

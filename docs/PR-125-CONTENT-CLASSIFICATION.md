# PR-125 — 콘텐츠 품질 후보 분류표

**대상:** `KNOWLEDGE_SEED_ITEMS` 10건 + `knowledgeStarterDrafts` + 운영 DB(미조회)

---

| 번호 | 콘텐츠 | 현재 문제 | 처리 분류 | 위험도 | 근거 |
| ---: | --- | --- | --- | --- | --- |
| 1 | knowledge-1 전산 링크 | 제목·요약 다소 길음 | **제목·요약 개선** | Low | PR125 seed |
| 2 | knowledge-2 헬프데스크 | 검색 키워드 약함 | **제목·요약 개선** | Low | PR125 seed |
| 3 | knowledge-3 청구 경로 | 질문형 제목 | **제목·요약 개선** | Low | PR125 seed |
| 4 | knowledge-4 실손 서류 | 제목 일반화 | **제목·요약·태그** | Medium | PR125 seed |
| 5 | knowledge-5 약관 링크 | 양호 | slug 추가 | Low | PR125 seed |
| 6 | knowledge-6 고객 안내 | 태그 분산 | **제목·요약·태그** | Medium | PR125 seed |
| 7 | knowledge-7 지급 응대 | 태그 「보험금판단」 | **제목·요약·태그** | High | 단정 오인 방지 |
| 8 | knowledge-8 해지 | 「5가지」 고정 | **제목·요약·태그** | Medium | PR125 seed |
| 9 | knowledge-9 고지 | 「고지」→「고지의무」 태그 | **요약·태그** | High | PR125 seed |
| 10 | knowledge-10 검수 배지 | slug 없음 | **제목·요약·태그·slug** | Low | PR125 seed |
| 11 | starter `actual-expense-claim-basic-documents` | seed-4와 slug 동일 | **중복 후보** | Medium | 병합·import 시 판단 |
| 12 | starter drafts 30+건 | 일괄 품질 미점검 | **보류** | Medium | 별도 PR125-R2 |
| 13 | 운영 DB articles | 미조회 | **정보 부족** | Medium | 스테이징 QA |
| 14 | `sourceCheckedAt` null | 출처 확인일 없음 | **보류** | Medium | 운영자 검수 |
| 15 | 카테고리 enum vs 한글 8종 | 매핑 불일치 | **별도 PR** | Low | schema 유지 |

---

## 중복·유사 후보

| A | B | 관계 | 조치 |
| --- | --- | --- | --- |
| seed knowledge-4 | starter `actual-expense-claim-basic-documents` | 동일 slug·유사 주제 | import 시 **하나만** 선택 |
| seed knowledge-3 | seed knowledge-4 | 청구 영역 연관 | **유지** (경로 vs 서류) |
| detail insurance-claim-answer-boundary | seed knowledge-7 | 동일 slug | **유지** (detail 본문) |

---

## 처리 분류 정의

| 분류 | 의미 |
| --- | --- |
| 제목/요약/태그 개선 | 의미 유지, 검색성↑ |
| 중복 후보 | 병합·보류 판단 필요 |
| 보류 | 출처·최신성 미확인 |
| 정보 부족 | DB 미조회 |
| 별도 PR | 대량·schema·visibility |

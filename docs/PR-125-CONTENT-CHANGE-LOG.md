# PR-125 — 콘텐츠 변경 기록

**범위:** `app/knowledge/knowledge-seed.ts` — `KNOWLEDGE_SEED_ITEMS` 10건. **의미 왜곡 없음** · **status/isPublished 미변경**.

---

| 번호 | 영역 | 변경 전 (요약) | 변경 후 (요약) | 변경 이유 | 영향 |
| ---: | --- | --- | --- | --- | --- |
| 1 | 제목·요약·slug | 전산 접속 링크… | 전산 링크 확인 순서 + slug | 검색·실무형 | seed |
| 2 | 제목·요약·slug | 헬프데스크와 고객센터 차이 | 문의 구분 기준 + slug | 검색성 | seed |
| 3 | 제목·요약·slug | 청구서류는 어디서… | 확인 경로 + slug | 질문형→기준형 | seed |
| 4 | 제목·요약·태그·slug | 실손 기본서류 안내 | 실손 청구 전 기본 서류 + slug | PR125 제목 가이드 | seed |
| 5 | slug | slug 없음 | `official-terms-link-safety` | slug 일관성 | seed |
| 6 | 제목·요약·태그·slug | 청구서류 요청 안내 | 고객 문구 기준 + 태그 | 고객문구·민원예방 | seed |
| 7 | 제목·요약·태그 | 보험금 받을 수 있나요 | 「보험금…」응대 + 지급단정금지 태그 | 단정 오인 방지 | seed+detail |
| 8 | 제목·요약·태그 | 해지 전 5가지 | 해지 전 설명 기준 + 부활 태그 | 실무형 | seed+detail |
| 9 | 요약·태그 | 고지 전 확인 | 사실 확인형 요약 + 고지의무 태그 | 고지 기준 | seed+detail |
| 10 | 제목·요약·태그·slug | 검수 배지 어떻게 | 검수 배지 읽는 기준 + slug | 공개전확인 | seed |

---

## 미반영

| 항목 | 사유 |
| --- | --- |
| starter drafts 30+ | 보류 — 별도 PR |
| 운영 DB rows | 미접근 |
| category enum 변경 | schema 금지 |
| verified 전환 / publish | 검수·출처 미완 |
| 본문(body) 대량 수정 | 범위 초과 |

---

## 금지 표현 스캔 (seed 10건)

PR125 세션: 제목·요약에 「무조건」「확정」「반드시 지급」 등 **미발견**.

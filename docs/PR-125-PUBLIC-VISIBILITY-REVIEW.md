# PR-125 — Public visibility 확인표

**일시:** PR125 Cursor 세션 (코드·tests, 운영 DB 미연결)

---

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 검수대기(draft) public 미노출 | **pass** | `PUBLIC_KNOWLEDGE_WHERE` · draft ∉ allowed statuses |
| 보류(archived/rejected) public 미노출 | **pass** | `isKnowledgeArticlePubliclyVisible` false |
| 비공개(isPublished false) 미노출 | **pass** | `isPublished: true` required |
| 관리자 전용 상태값 과다 노출 없음 | **pass** | public cards use `publicKnowledgeTrustHint` only |
| visibility guard 우회 없음 | **pass** | PR125 **guard 파일 미변경** |
| 공개 콘텐츠만 public 노출 | **pass** | verified + needs_review when published |

---

## PR125 seed 변경 영향

| 변경 | visibility |
| --- | --- |
| seed title/summary/tags/slug | **없음** — seed는 public DB fetch **미사용** |
| status remains `needs_review` | DB publish 정책 **불변** |

**참고:** public `/knowledge`는 `getPublicKnowledgeArticles()` (DB). seed는 문서·테스트·admin 참고.

---

## 배포 전 (운영자)

- [ ] admin draft/archived 목록 public 미노출 spot check
- [ ] PR125 diff에 `PUBLIC_KNOWLEDGE_WHERE` **미포함**

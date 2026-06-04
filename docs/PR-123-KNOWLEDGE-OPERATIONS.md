# PR-123 — 지식 아카이브 운영 기준

**Admin 경로:** `/admin/knowledge`  
**Public:** `/knowledge`  
**정책:** [KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md)

---

## 단계별 기준

| 단계 | 기준 | 확인 항목 |
| --- | --- | --- |
| **등록** | 실무 활용 가능한 제목·요약·카테고리 | title, summary, category, tags, `sourceUrl`/`sourceNote` |
| **검수대기** | 공개 전 검수 상태 | `verificationStatus` draft/needs_review, 심의 안정성 |
| **공개** | 검수 완료 후 | `isPublished` + verified (또는 needs_review + 배지 정책) |
| **보류** | 정보 부족·출처 불명·표현 위험 | 보류 사유, unpublished |
| **수정 필요** | 문구·출처·카테고리 보완 | 수정 요청 Registry/메모 |
| **비공개** | public 부적합 | archived/rejected — bulk publish **차단** |

---

## 심의 안정성 기준

| 원칙 | 설명 |
| --- | --- |
| 과장 금지 | 「최고」「유일」「반드시」 등 |
| 단정 금지 | 지급·가입·해지 결과 확정 |
| 공포 조장 금지 | 해지·질병·사망 등 과도 자극 |
| 가입 유도 금지 | 특정 상품 권유 |
| 정보 부족 단정 금지 | 출처 없이 사실처럼 기술 |
| 사실 확인형 | 「확인 순서」「참고 기준」 중심 |

---

## 콘텐츠 타입 (요약)

FAQ · 실무 기준 · 안내문 샘플 · 체크리스트 · 링크 가이드 · 안전 경계 · 운영 가이드 — 상세는 [KNOWLEDGE_CONTENT_POLICY.md](./KNOWLEDGE_CONTENT_POLICY.md) §2.

---

## Answer Assistant 연계

- AI 근거 문서로 쓰이려면 **verified** + 안전 기준 충족
- `aiUsable` bulk true — **전역 금지** ([ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md))
- AA 문제 피드백 → PR126 또는 AA 전용 PR — allowlist·gate **임의 확대 금지**

---

## 공개 전 체크

- [ ] 제목·요약이 **확인 기준** 톤
- [ ] `sourceUrl` 또는 `sourceNote` (공식 출처 필요 시)
- [ ] archived/rejected 미 bulk publish
- [ ] public `PUBLIC_KNOWLEDGE_WHERE` 조건 충족

**연계:** [PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md](./PR-122-FRESHNESS-CHECK-SCOPE-AND-CADENCE.md) · [PR-125-KNOWLEDGE-QUALITY-OPS.md](./PR-125-KNOWLEDGE-QUALITY-OPS.md)

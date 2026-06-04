# PR-125 — 지식 아카이브 구조 분석

**범위:** 코드·문서·seed 정적 분석. 운영 DB 미접근.

---

## public route

| 항목 | 값 |
| --- | --- |
| 목록 | `/knowledge` — `getPublicKnowledgeArticles()` (Prisma, `PUBLIC_KNOWLEDGE_WHERE`) |
| 상세 | `/knowledge/[slug]` — `getPublicKnowledgeArticleBySlug()` |
| 필터 | `lib/knowledge/archive-filter.ts` — q, category, type, risk, review, sort |
| UI | `knowledge-archive-list.tsx`, PR113 workflow polish |

---

## admin route

| 항목 | 값 |
| --- | --- |
| 목록 | `/admin/knowledge` — RBAC `content_admin` / `super_admin` |
| 등록 | `/admin/knowledge/new` |
| 수정 | `/admin/knowledge/[id]/edit` |
| bulk | `lib/admin/knowledge-bulk-actions.ts` — confirm + RBAC |
| 가이드 | `KnowledgeAdminWorkflowGuide.tsx` (PR113) |

---

## 등록/수정·검수 화면

- `app/admin/knowledge/form.tsx` — `KNOWLEDGE_REGISTRATION_STEPS`, 검수 상태
- 상태 라벨: `lib/knowledge/workflow-labels.ts` (검수 대기, 공개 가능, 수정 필요, 보류)
- import 초안: `lib/content/knowledge-starter-drafts.ts` — **draft + unpublished**

---

## 카테고리 구조

**UI seed (`knowledge-seed.ts`):** 8개 한글 카테고리 — schema 변경 **없음**

| seed 카테고리 | PR125 권장 매핑 |
| --- | --- |
| 보험사 전산·업무 포털 | 업무 링크·전산 |
| 청구서류·접수 기준 | 보험금 청구 · 실손/의료비 |
| 공시·약관·공식 링크 | 공시/약관 |
| 고객 안내문·응대 문구 | 고객응대 |
| 계약관리·유지 실무 | 계약관리 |
| 고지·심사 전 확인 | 고지/심사 |
| 운영 안전·금지 영역 | 관리자 운영 |
| PlannerDesk 사용법 | Answer Assistant · 관리자 운영 |

**DB enum:** `KnowledgeArticleCategory` — starter drafts use `claim`, `disclosure`, etc.

---

## 태그 구조

- `tags: string[]` on seed and DB model
- public list/detail에 노출
- PR125: 검색 키워드 중심, 단정형 태그 금지 ([PR-125-CONTENT-QUALITY-STANDARDS.md](./PR-125-CONTENT-QUALITY-STANDARDS.md))

---

## 제목/요약 구조

- seed: `title`, `summary` (목록·참고용)
- public DB: `title`, `summary`, `content`
- detail seed (3건): `KNOWLEDGE_DETAIL_ITEMS` — body, checkSteps, safeCopy, forbiddenClaims

---

## review status

| status | public |
| --- | --- |
| `draft` | **미노출** |
| `needs_review` | published 시 노출 + 검수 배지 |
| `verified` | published 시 노출 |
| `archived` / `rejected` | **미노출** |

Seed 전건: `needs_review` (PR119)

---

## isPublished

- `PUBLIC_KNOWLEDGE_WHERE.isPublished: true` 필수
- starter import: `isPublished: false` 강제

---

## public visibility guard

- `lib/public/knowledge-articles.ts` — `PUBLIC_KNOWLEDGE_WHERE`
- `tests/public/public-visibility.test.ts` — draft/archived/rejected block
- `tests/admin/knowledge-workflow-qa.test.ts` — guard unchanged

---

## seed/sample/fixture

| 소스 | 건수 | 비고 |
| --- | ---: | --- |
| `KNOWLEDGE_SEED_ITEMS` | 10 | UI·문서 참고, PR125 개선 |
| `KNOWLEDGE_DETAIL_ITEMS` | 3 | slug 상세 샘플 |
| `knowledgeStarterDrafts` | 30+ | admin import, draft only |

---

## 정보 부족 항목

| 항목 | 비고 |
| --- | --- |
| 운영 DB 콘텐츠 품질 | 미조회 |
| `sourceCheckedAt` 기입률 | 미확인 |
| starter drafts 전건 품질 pass | PR125 seed 중심 |
| 카테고리 enum ↔ 한글 8분류 1:1 | 후속 import PR |

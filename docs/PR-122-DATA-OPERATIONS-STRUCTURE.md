# PR-122 — 기존 데이터 운영 구조 분석

---

## 보험사 데이터 기준

| 계층 | 경로 |
| --- | --- |
| Fixture/seed | `lib/content/insurers.ts` (49건) |
| Public | `lib/public/insurers.ts` — `isPublished` + verified/needs_review |
| Admin | `app/admin/insurers/*`, `visibility.ts` |
| 검수 메타 | `lastVerifiedAt`, `sourceNote`, `verificationStatus` |

**PR119:** 49/49 `lastVerifiedAt` null, `sourceNote` 재검수 필요.

---

## 청구서류 데이터 기준

| 계층 | 경로 |
| --- | --- |
| Schema | `ClaimDocument` + `insurerId` |
| Fallback | `claim-document-candidates.ts` (35, insurer null) |
| Public | `getPublicClaimDocuments` — DB 필요 |
| Import | `claim-documents:import:*` scripts |

---

## 업무 링크 기준

Insurer: `officialWebsiteUrl`, `plannerPortalUrl`, `systemUrl`, `claimPageUrl`, `claimFormUrl`, `termsUrl`.

---

## 팩스/헬프데스크 기준

`claimFaxNumber`, `faxNumber`, `helpdeskPhone`, `customerCenterPhone`, `callMonitoringPhone`.

**오류 시 High~Critical** — PR122 **월 1회** 점검 권장.

---

## 지식 아카이브 기준

`KnowledgeArticle`: `status`, `isPublished`, `sourceUrl`, `sourceCheckedAt`, `tags`, `category`.

Public: `PUBLIC_KNOWLEDGE_WHERE`. Seed: `knowledge-seed.ts` (10건, needs_review).

---

## 공식 출처 확인 기준

PR119 표 → [PR-122-OFFICIAL-SOURCE-CRITERIA.md](./PR-122-OFFICIAL-SOURCE-CRITERIA.md)로 **운영 루틴화**.

---

## 데이터 상태값 기준

PR119 이슈 등급 → [PR-122-DATA-STATUS-VALUES.md](./PR-122-DATA-STATUS-VALUES.md) **운영자용 6종**.

---

## PR119 이관 항목

| PR119 # | PR122 루틴 |
| ---: | --- |
| 2~6 | 보험사 점검표·월/분기 |
| 7,9 | 청구서류·출처 |
| 8,10,11 | 스테이징 QA (정보 부족) |

---

## PR121 연계

- 피드백 유형「데이터 오류/누락」→ 점검표 갱신 → PR124
- Registry ID를 점검표 `비고`에 교차 참조 가능 (`FB-2026-NNN`)

---

## 정보 부족

- 운영 DB 행별 `lastVerifiedAt`·링크 유효성
- 외부 HTTP 실시간 확인 (Cursor 미실행)
- 보험사별 상품·지점별 팩스 차이

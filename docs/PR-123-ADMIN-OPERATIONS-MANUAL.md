# PR-123 — 관리자 운영 매뉴얼

**목적:** 운영자가 보험사·청구서류·지식·업무 링크·피드백·데이터 최신성·일괄작업을 **등록·검수·공개·보류·수정**할 때 따를 기준을 확정한다. **기능 추가·운영 데이터 수정·권한 변경 없음.**

**선행:** PR119 (품질 QA) → PR121 (피드백) → PR122 (최신성 점검) → **PR123** → PR124 (데이터 보완)

| 문서 | 용도 |
| --- | --- |
| [PR-123-ADMIN-OPERATIONS-STRUCTURE.md](./PR-123-ADMIN-OPERATIONS-STRUCTURE.md) | 기존 운영 구조 분석 |
| [PR-123-ADMIN-ROLES.md](./PR-123-ADMIN-ROLES.md) | 역할별 책임·코드 RBAC 매핑 |
| [PR-123-INSURER-OPERATIONS.md](./PR-123-INSURER-OPERATIONS.md) | 보험사 디렉터리 운영 |
| [PR-123-CLAIM-DOCUMENT-OPERATIONS.md](./PR-123-CLAIM-DOCUMENT-OPERATIONS.md) | 청구서류 운영 |
| [PR-123-KNOWLEDGE-OPERATIONS.md](./PR-123-KNOWLEDGE-OPERATIONS.md) | 지식 아카이브 운영 |
| [PR-123-BULK-OPERATIONS.md](./PR-123-BULK-OPERATIONS.md) | 일괄작업 안전 기준 |
| [PR-123-FEEDBACK-AND-FRESHNESS-HANDLING.md](./PR-123-FEEDBACK-AND-FRESHNESS-HANDLING.md) | 피드백·최신성 결과 처리 |
| [PR-123-OPERATOR-MISTAKE-PREVENTION.md](./PR-123-OPERATOR-MISTAKE-PREVENTION.md) | 실수 방지 체크리스트 |

**연계:** [PR-122-DATA-FRESHNESS-OPS.md](./PR-122-DATA-FRESHNESS-OPS.md) · [PR-121-USER-FEEDBACK-OPS.md](./PR-121-USER-FEEDBACK-OPS.md) · [ADMIN_CRUD_OPERATIONS.md](./ADMIN_CRUD_OPERATIONS.md) · [ADMIN_BULK_ACTION_POLICY.md](./ADMIN_BULK_ACTION_POLICY.md)

---

## PR123 Cursor 세션

| 항목 | 결과 |
| --- | --- |
| 운영 DB | **미접근** |
| 데이터·권한·allowlist·bulk 실행 | **없음** |
| 코드 RBAC | `super_admin` · `content_admin` only (`lib/auth/rbac.ts`) |
| 운영 워크플로 역할 | reviewer · data_admin · viewer — **문서상 분업** (코드 미분리) |

---

## 운영자 Quick Start

1. [역할](./PR-123-ADMIN-ROLES.md) 확인 — 본인 계정이 `super_admin` / `content_admin` 중 어디에 해당하는지
2. 콘텐츠 등록 시 [보험사](./PR-123-INSURER-OPERATIONS.md) · [청구서류](./PR-123-CLAIM-DOCUMENT-OPERATIONS.md) · [지식](./PR-123-KNOWLEDGE-OPERATIONS.md) 단계별 기준 적용
3. [일괄작업](./PR-123-BULK-OPERATIONS.md) 전 대상 수·권한·확인 다이얼로그 필수
4. [월간 최신성 점검](./PR-122-FRESHNESS-CHECK-SHEET.md) 결과 → [처리 기준](./PR-123-FEEDBACK-AND-FRESHNESS-HANDLING.md)
5. [피드백 Registry](./PR-121-FEEDBACK-INTAKE-REGISTRY.md) → 후속 PR 라우팅
6. 배포·공개 전 [실수 방지 체크리스트](./PR-123-OPERATOR-MISTAKE-PREVENTION.md)

---

## public visibility (요약)

```
visible ⟺ isPublished === true AND verificationStatus ∈ { verified, needs_review }
```

- **draft** · **isPublished=false** → public **절대 미노출**
- 상세: `lib/public/visibility.ts` · [ADMIN_CRUD_OPERATIONS.md](./ADMIN_CRUD_OPERATIONS.md)

---

## 금지

- 공식 출처 없이 최신·정확 단정
- 무검수 대량 공개 · 운영 DB 직접 수정 · secret 노출
- Answer Assistant allowlist·gate 임의 확대

**Codex:** 기본 생략 — 권한·visibility·운영 데이터 리스크 잔존 시만 후보.

# PR-123 — 관리자 역할 기준

**주의:** 아래 표는 **운영 매뉴얼상 역할**이다. 코드 RBAC는 현재 `super_admin` · `content_admin` 두 가지만 admin으로 인정한다 (`lib/auth/rbac.ts`). `reviewer` · `data_admin` · `viewer`는 **분업 가이드**이며, 별도 계정 역할은 **후속 Auth PR**에서 검토한다.

---

## 역할별 책임

| 역할 | 주요 책임 | 허용 작업 | 금지 작업 | 코드 매핑 |
| --- | --- | --- | --- | --- |
| **super_admin** | 전체 운영 관리, 권한 관리, 최종 공개 판단 | 전체 운영 기준 확인, 최종 승인, 사용자/역할(향후) | 무검수 대량 공개, secret 노출, 운영 DB 직접 수정 | `ROLE_SUPER_ADMIN` |
| **content_admin** | 콘텐츠 등록·수정·검수 보조 | 보험사/청구/지식/링크/템플릿 CRUD·publish | 권한 변경, 사용자 관리, 운영 DB 직접 수정 | `ROLE_CONTENT_ADMIN` |
| **reviewer** *(워크플로)* | 검수·보류·수정 요청 | 검수 의견, 공개 가능 여부 **판단 제안** | 데이터 구조 변경, 권한 변경, 단독 bulk publish | super/content_admin이 수행 |
| **data_admin** *(워크플로)* | 데이터 품질·출처 확인 | 공식 출처 확인, 이슈 분류, PR124 후보 정리 | 공식 출처 없는 최신성 단정, DB 직접 수정 | super/content_admin + PR122/124 문서 |
| **viewer** *(워크플로)* | 조회·확인 | public/admin 화면 **읽기** (권한 있는 경우), 이슈 제보 | 등록·수정·상태변경·bulk | admin 미부여 시 public만 |

---

## 코드 권한 매트릭스 (현재)

| 작업 | super_admin | content_admin | 기타 |
| --- | --- | --- | --- |
| `/admin` 접근 | ✓ | ✓ | ✗ |
| 콘텐츠 CRUD | ✓ | ✓ | ✗ |
| publish / unpublish | ✓ | ✓ | ✗ |
| bulk (manageContent) | ✓ | ✓ | ✗ |
| bulk publish (high) | ✓ | ✓ | ✗ — 서버 `requirePublisherAccess` |
| 사용자/역할 관리 | ✓ (향후 UI) | ✗ | ✗ |
| Answer Assistant admin | ✓ | ✓ | ✗ — allowlist·gate 변경은 **별도 High-risk** |

---

## 역할 배정 원칙

1. **최소 권한:** 일상 등록·검수는 `content_admin`, 시스템·역할 변경은 `super_admin` only.
2. **검수 분리:** 등록자와 검수자가 동일인일 수 있으나, **공개 전** checklist·출처 확인은 필수.
3. **data_admin 워크플로:** PR122 점검표·PR119 이슈표 갱신 담당 — 계정 역할과 무관하게 **문서·Registry** 기록.
4. **viewer:** QA·경영 검토용 — admin 계정을 남용하지 않음.

---

## 정보 부족 · 후속 PR

| 항목 | 권장 |
| --- | --- |
| reviewer 전용 read-only admin | Auth PR — `canReviewContent` 등 |
| data_admin without publish | content_admin에서 publish 분리 |
| audit log viewer role | super_admin only 현행 유지 |

**참고:** [RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md) · [AUTH_RBAC_PRODUCTION.md](./AUTH_RBAC_PRODUCTION.md)

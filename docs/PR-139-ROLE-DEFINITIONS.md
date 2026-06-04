# PR-139 — 역할 후보 정의 (코드 기준)

**우선순위:** 아래 **코드 role**이 운영 매뉴얼 워크플로 역할보다 우선한다.

| 역할 (코드) | 목적 | 기본 접근 | 금지 |
| --- | --- | --- | --- |
| `anonymous_public` | 공개 탐색 | `getPublic*` 콘텐츠 | `/admin`, 검수·이슈·bulk |
| `verified_planner` | 인증 설계사 | planner 화면 + AA **allowlist 조건부** | admin CRUD, allowlist 밖 AA 생성 |
| `content_admin` | 콘텐츠 운영 | `/admin`, CRUD, publish, bulk(정책 범위) | `canManageUsers`, importDrafts |
| `super_admin` | 전체 운영 | content_admin + `canManageUsers` | secret 노출, 운영 DB 직접 수정 |
| `moderator` | *(예약)* | 현재 admin **아님** | 커뮤니티 미구현 |

## 운영 매뉴얼 워크플로 (계정 role 아님)

`reviewer` · `data_admin` · `viewer`는 [PR-123-ADMIN-ROLES.md](./PR-123-ADMIN-ROLES.md) **분업 가이드**이며, 별도 Prisma role이 **없다**.

## planner vs public user

로그인 없이 public과 동일하게 공개 데이터만 본다. `/planner`·즐겨찾기 등은 세션·기능별 guard. **관리자 큐·리포트·리마인더는 planner에 노출하지 않는다** (PR131·PR138).

## 정보 부족

| 항목 | 후속 |
| --- | --- |
| reviewer read-only admin | PR139-B |
| content_admin bulk publish 분리 | 별도 High-risk PR |

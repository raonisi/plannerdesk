# PR-135-B — Planner Favorite DB Foundation (설계만 · High-risk)

**상태:** 보류 · **PR135-A와 분리**

## 왜 분리하는가

사용자별 즐겨찾기 서버 저장은 다음에 해당한다.

- Prisma schema / migration
- 인증·사용자 식별
- 개인정보·동기화 정책
- RBAC (planner vs public)

AGENTS.md **High-risk** — 승인·제한검수 없이 착수 금지.

## PR135-A가 제공하는 것

- client-only id 저장·공개 카탈로그 필터 UX
- 운영 문서·정적 테스트·Antigravity 검수 기준

## PR135-B 착수 전 결정 사항

1. 로그인 필수 여부 (현재 public MVP)
2. 저장 필드: `(userId, resourceType, resourceId, sortOrder, createdAt)` — **메모·검색어 제외**
3. 삭제·GDPR·기기 이전 정책
4. public visibility: 서버가 resolve 시 `PUBLIC_*_WHERE` 재사용 (중복 금지)
5. work_link favorite: URL 스냅샷 vs insurer link id

## Codex 제한검수

PR135-B 구현 PR에서는 **필수**: security-auditor, gdpr-ccpa-compliance, postgres-pro, reviewer.

## 금지 (135-B에서도)

- visibility guard 약화
- 미검수 데이터 favorite 노출
- Answer Assistant allowlist 확대

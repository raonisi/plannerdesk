# PR-111 — Admin UI 실사용 QA

**목적:** 관리자 화면 실무 사용성·실수 방지·정보 구조 정리. 신규 대형 기능·DB/auth 변경 없음.

## 대상 화면

| Route | 목록 컴포넌트 |
| --- | --- |
| `/admin` | `AdminShell` (대시보드) |
| `/admin/insurers` | `insurers-admin-list.tsx` |
| `/admin/claim-documents` | `claim-documents-admin-list.tsx` |
| `/admin/knowledge` | `knowledge-admin-list.tsx` |

## PR111 변경 요약

| 영역 | 변경 |
| --- | --- |
| 상태 배지 | `게시 중` + `공개 화면 표시` → **`공개 중` / `게시 중·공개 전 확인 필요` / `비공개`** (`getAdminPublicSurfaceLabel`) |
| 특별 표기 | `특별 표기` → **`목록 강조`** (tooltip) |
| 빈 상태 | `AdminListEmptyState` — 다음 행동 링크 + 필터 초기화 |
| 일괄 작업 | `AdminBulkSelectionBar` — 선택 시 대상 수 경고, `현재 목록 선택` |
| 청구서류 | **보험사 필터** 추가 |
| 문구 | PR-30/PR-39 개발자 문구 제거, 행동 중심 설명 |

## 일괄작업 안전성 (PR107 유지)

- 서버 `validateServerBulkAction` **미변경**
- confirm dialog + high-risk 버튼 스타일 **유지**
- UI는 선택 수 확인을 **강화**만 함

## UI 문구 원칙 (PR111)

**사용:** 검수 대기, 공개 전 확인, 대상 수 확인, 보험사별 필터  
**금지:** 즉시 공개, 자동 승인, 전체 일괄 처리, 검수 없이 공개

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/admin/admin-ui-qa.test.ts
npm run build
```

## Antigravity 수동 QA

1. `/admin/insurers` — 배지 3~4개 이하, 빈 필터 시 CTA
2. `/admin/claim-documents` — 보험사 필터 동작
3. `/admin/knowledge` — 분류·검수·공개 상태만 강조
4. 일괄 선택 → 경고 문구 → confirm → (실행하지 않고 취소)
5. 비관리자 `/admin` — locked/denied

## Codex

기본 생략. bulk server guard·RBAC 변경 없음.

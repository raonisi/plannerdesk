# PR-113 — 지식 아카이브 등록·검수 플로우 Polish

## 목적

지식 아카이브의 관리자 등록·검수·게시 흐름과 public 탐색 UX를 실무 운영 기준으로 정리합니다. DB·Auth·Migration·운영 데이터는 변경하지 않습니다.

## 변경 요약

| 영역 | 변경 |
| --- | --- |
| Admin 상태 라벨 | 검수 대기 · 공개 가능 · 수정 필요 · 보류 |
| Admin 목록 | 운영 흐름 안내 + 빠른 필터(검수 대기, 공개 가능·미게시 등) |
| 등록/수정 폼 | 등록·검수 순서 안내, 검수 상태 라벨 |
| Public 목록/상세 | admin형 검수 배지 축소, 공식 확인 진행 중 힌트만 |
| Public fetch | `PUBLIC_KNOWLEDGE_WHERE` **미변경** |

## Antigravity 검수 체크리스트

- [ ] 등록 → 검수 대기 → 공개 가능 → 게시 흐름이 직관적인가
- [ ] draft·보류·수정 필요 문서가 public에 보이지 않는가
- [ ] 일괄 상태 변경 전 대상 수·확인 문구가 충분한가
- [ ] public에 내부 검수 메타가 과다 노출되지 않는가
- [ ] 보험·금융 문구에 과장·단정·공포 조장이 없는가

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/admin/knowledge-workflow-qa.test.ts
npm run build
```

## Codex 제한검수

기본 생략. `PUBLIC_KNOWLEDGE_WHERE` 또는 bulk guard 변경 시 제한검수 후보.

# PR-112 — 보험사 디렉터리 / 청구서류 UX 단순화

## 목적

보험설계사가 보험사별 청구 정보를 더 빠르게 찾도록 public `/directory`와 `/claim-documents` 탐색 흐름을 정리합니다. DB·Auth·Migration·운영 데이터는 변경하지 않습니다.

## 변경 요약

| 영역 | 변경 |
| --- | --- |
| 보험사 카드 | 카드 상단에 **청구안내 보기** / **필요서류 확인** 바로가기 추가 |
| 디렉터리 | `?insurer={id}` 딥링크 지원, 선택 보험사 컨텍스트 배너 |
| 청구서류 | 보험사 선택 시 디렉터리 역링크, 빈 상태 문구 개선 |
| 보험사 그룹 | `directoryInsurerId`로 디렉터리 id 링크, **청구안내 보기** 라벨 |
| Public 표기 | admin형 검수 배지 대신 **공식 확인 진행 중** 힌트, draft 필터 옵션 제거 |

## Public visibility

- `lib/public/insurers.ts`, `lib/public/claim-documents.ts` WHERE 절 **미변경**
- 미검수(draft)·비공개 항목 public 미노출 유지
- 관리자 전용 필드 public select 미포함 유지

## Antigravity 검수 체크리스트

- [ ] 보험사 카드에서 청구안내·필요서류가 아코디언 없이 보이는가
- [ ] `/directory?insurer=` ↔ `/claim-documents?insurer=` 상호 이동이 자연스러운가
- [ ] 보험사별 청구서류 그룹이 직관적인가
- [ ] public 화면에 admin형 검수 상태가 과다 노출되지 않는가
- [ ] 모바일/좁은 화면에서 카드·그룹 레이아웃이 깨지지 않는가
- [ ] DB/Auth/Migration 변경이 없는가

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/public/directory-claim-ux.test.ts
npm run build
```

## Codex 제한검수

기본 생략. public visibility guard 또는 fetch WHERE 변경 시에만 제한검수 후보.

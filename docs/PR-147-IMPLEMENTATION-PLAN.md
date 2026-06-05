# PR-147 — 구현 계획 (PR147-A 완료)

1. PR140~146 진입 조건 확인 — 문서·패널 존재, Critical 미해결 항목은 PR148~150으로 분리
2. `lib/ops/data-responsibility-notice.ts` + admin panel
3. docs/PR-147-* + OPERATING_QA_CHECKLIST 링크
4. public inline notice (directory, claim, disclosure, knowledge, search)
5. static tests `tests/ops/pr147-data-responsibility-notice.test.ts`
6. lint / typecheck / test / build

## 보류

- 법적 책임 문구 확정 (법무 검토 필요)
- 자동 출처 검증 (PR147-B)
- 링크 점검 자동화 (PR147-C)
- public notice UI polish (PR147-D)
- 오류 제보 전용 폼

## Codex 제한검수

- 보험금·가입 유도 문구
- PII 입력 유도
- public visibility
- Answer Assistant 범위

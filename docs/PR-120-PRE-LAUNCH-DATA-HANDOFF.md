# PR-120 — 정식 운영 전 데이터 보완 (예정)

**선행:** [PR-119-OPERATIONAL-DATA-QUALITY-OPS.md](./PR-119-OPERATIONAL-DATA-QUALITY-OPS.md)

PR119에서 **문서화·분류만** 한 항목 중, 정식 운영 전에 완료할 작업을 모읍니다.

---

## PR120 이관 항목

| 항목 | 이유 | 필요한 확인 자료 |
| --- | --- | --- |
| 보험사 `lastVerifiedAt` 기입 | 검수 추적 | 검수 일지·승인자 |
| 공식 출처 재검수 (49 보험사) | High 이슈 #3 | 보험사 공식 안내·콜센터 |
| `claimPageUrl` 정책·채움 | 청구안내 UX | 보험사별 청구 허브 URL |
| HTTP 전산 URL 정리 | 보안·신뢰 | 한화손해 공식 HTTPS |
| 청구서류 `insurerId` 연결 import | 보험사별 탐색 | import 스크립트 dry-run |
| 운영 DB 청구·지식 중복/초안 점검 | 미조회 | 스테이징 admin 목록 |
| 보험사별 필수 서류 completeness | 실무 누락 | 보험사 청구 가이드 |
| 지식 카테고리·태그 정리 | 검색성 | 운영 분류 회의 |
| PR117 런타임 smoke 완료 | 배포 검증 | `BASE_URL` smoke 표 |
| PR118 사용자 피드백 반영 | UX | intake 원문 |

---

## PR120에서 하지 않는 것 (기본)

- 무승인 bulk publish·migrate
- visibility guard 약화
- Answer Assistant allowlist 확대

---

## 상태

**정보 부족** — PR119 운영자 수동 QA·공식 출처 표 진행 후 일정 확정.

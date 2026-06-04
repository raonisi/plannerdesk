# PR-130 — 운영 데이터 품질 요약

**근거:** PR122 루틴 · PR124 변경 로그 · fixture 정적 테스트 · visibility 문서.

---

## 운영 데이터 품질 요약표

| 영역 | 상태 | 남은 이슈 | 심각도 | 다음 조치 |
| --- | --- | --- | --- | --- |
| 보험사 디렉터리 | **부분 안정** | 49건 전건 출처 재검수 미완(문서); PR124 1건 HTTPS만 반영 | Medium~High | PR122 월간 점검표 |
| 청구서류 | **부분 안정** | fixture `insurerId` null 설계·PR119 이슈 잔여 | Medium | PR124 import (승인 후) |
| 업무 링크 | **UI 개선·데이터 보류** | URL 최신성·partial 공시 | Medium | PR128 + PR134 |
| 팩스/헬프데스크 | **확인 필요 다수** | 공식 출처 미확인 시 missing 표시 | Medium | 점검표 상태값 |
| 지식 아카이브 | **seed 10건 개선** | 운영 DB·starter 30+ 미동기 | Low~Medium | PR125 유지·검수 후 공개 |
| public visibility | **guard 유지** | 운영 DB 미검증 | High (잠재) | smoke·OPS visibility 유형 |

---

## 판단 기준 적용

- 공식 출처 미확인 → **「확인 필요」** (정상 단정 금지)
- PR124: **확인 완료 1건만** 반영 — 나머지 보류 유지
- visibility 이슈 > 일반 데이터 오탈자

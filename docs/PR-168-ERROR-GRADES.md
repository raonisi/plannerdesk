# PR-168 — 데이터 오류 등급표

PR161 `DATA_ERROR_GRADES` 재사용.

| 등급 | 기준 | 예시 | 조치 |
| --- | --- | --- | --- |
| Critical | public·권한·PII·secret·지급 확정 | 미검수 노출·지급 확정 문구·secret URL | 즉시 보류 또는 hotfix PR |
| High | 업무 판단 영향 | 청구서류·연락처·출처 불명 | 공식 확인 후 수정 PR |
| Medium | 링크·검색·사용성 | 404·검색 누락 | 개선 PR 또는 backlog |
| Low | 문구·오탈자 | 띄어쓰기 | polish PR |

**Critical 분류 필수:**

- 비공개·미검수 데이터 public 노출
- 보험금 지급 확정 표현
- 개인정보·secret 노출

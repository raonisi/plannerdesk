# PR-136 — 운영 이슈 리포트 기준

**연계:** [PR-129-OPERATIONAL-ISSUES-OPS.md](./PR-129-OPERATIONAL-ISSUES-OPS.md) · [PR-129-ISSUE-SEVERITY.md](./PR-129-ISSUE-SEVERITY.md)

| 등급 | 기준 | 처리 |
| --- | --- | --- |
| **Critical** | visibility 우회·secret·운영 DB 위험·민감정보 저장 | 즉시 중단·긴급 PR |
| **High** | 핵심 route·관리자 기능·청구 오정보·AA safety | 빠른 분리 PR |
| **Medium** | 검색·일부 누락·링크 확인 필요 | 운영 개선 PR |
| **Low** | 문구·여백·오탈자 | backlog |

## 리포트 규칙

- Critical/High는 월간 템플릿 **상단**에 반드시 기록
- public·planner 화면에 이슈 원문·내부 상태 **노출 금지**
- Registry: [PR-129-ISSUE-INTAKE-REGISTRY.md](./PR-129-ISSUE-INTAKE-REGISTRY.md) (수동)

## PR136에서 하지 않는 것

- 이슈 DB 테이블 생성
- 자동 알림·슬랙 연동

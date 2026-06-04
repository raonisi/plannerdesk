# PR-140 — 외부 공개 리스크 평가

| 리스크 | 등급 | 상태 | 대응 |
| --- | --- | --- | --- |
| public visibility 노출 | Critical | 완화 | guard·테스트 |
| 권한 우회 | Critical | 완화 | getAdminAccess |
| 미검수 데이터 노출 | Critical | 부분 | Registry·수동 검수 |
| 개인정보 저장 | Critical | 완화 | 수집 구조 없음 |
| Answer Assistant 확대 | Critical | 완화 | allowlist |
| 잘못된 청구정보 | High | 부분 | PR124·정정 |
| 링크 오류 | High | 부분 | PR134 |
| 문구·심의 | High | 부분 | 검수 |
| 모바일 | Medium | 부분 | 실기기 |
| 운영 프로세스 | Medium | 완화 | PR129~138 |
| 고객지원 부재 | High | **열림** | PR143 |
| 결제/환불 부재 | High | **열림** | 유료화 No-Go |

**Critical 열림 0건(코드)** → 외부 **Conditional Go** 가능. **운영 Critical**은 Registry로 별도 No-Go.

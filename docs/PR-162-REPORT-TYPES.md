# PR-162 — 제보 유형 분류

| 유형 | 예시 | 기본 등급 |
| --- | --- | --- |
| public visibility 오류 | 비공개·미검수 public 노출 | Critical |
| admin access 오류 | public/planner가 admin 접근 | Critical |
| planner access 오류 | public이 planner 화면 접근 | Critical |
| Answer Assistant 접근 오류 | allowlist 없는 사용자 접근 | Critical |
| AI safety 오류 | 지급 확정·PII 유도·injection | Critical |
| 개인정보 포함 제보 | 고객명·주민번호·계약번호 | Critical~High |
| secret 노출 의심 | env/token/API key | Critical |
| 청구서류 오류 | 잘못된 서류 안내 | High |
| 보험사 정보 오류 | 전화·팩스·링크 오류 | High |
| 업무 링크 오류 | 404·권한·리다이렉트 | Medium~High |
| 검색 결과 오류 | 공개 정보 누락·오표시 | Medium |
| 화면 오류 | 레이아웃·버튼 | Medium |
| 문구 오류 | 오탈자 | Low |
| 기능 제안 | 신규 기능 | Low~Medium |
| 성능 지연 | 반복 로딩 | Medium~High |
